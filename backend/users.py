import os
import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

def ensure_table_exists(table_name, key_schema, attribute_definitions):
    try:
        table = dynamodb.Table(table_name)
        table.table_status  # Force a describe call to check existence
        return table
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            logger.info(f"Creating table {table_name}...")
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=key_schema,
                AttributeDefinitions=attribute_definitions,
                BillingMode='PAY_PER_REQUEST'
            )
            table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
            return table
        raise e

# Initialize tables — uses lazy references if tables already exist (fast cold start)
users_table = dynamodb.Table('Playschool_Users')
students_table = dynamodb.Table('Playschool_Students')
classes_table = dynamodb.Table('Playschool_Classes')

def get_children_for_parent_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        parent_id = query_params.get("parentId")
        
        if not parent_id:
            return {"statusCode": 400, "body": json.dumps({"error": "parentId is required"})}
            
        user_resp = users_table.get_item(Key={'id': parent_id})
        user = user_resp.get('Item')
        
        if not user or not user.get("childIds"):
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"children": []}, default=_json_default)
            }
            
        children = []
        for child_id in user["childIds"]:
            child_resp = students_table.get_item(Key={'id': child_id})
            if 'Item' in child_resp:
                children.append(child_resp['Item'])
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"children": children}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def get_students_for_teacher_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        teacher_id = query_params.get("teacherId")
        
        if not teacher_id:
            return {"statusCode": 400, "body": json.dumps({"error": "teacherId is required"})}
            
        # Scan classes for the teacher (replace with GSI query in prod)
        response = classes_table.scan(
            FilterExpression="teacherId = :t",
            ExpressionAttributeValues={":t": teacher_id}
        )
        classes = response.get('Items', [])

        # Backward-compat fallback for older data where class.teacherId may be empty.
        # If teacher profile has classId, use that class.
        if not classes:
            user_resp = users_table.get_item(Key={"id": teacher_id})
            teacher = user_resp.get("Item") or {}
            class_id = teacher.get("classId")
            if class_id:
                cls_resp = classes_table.get_item(Key={"id": class_id})
                cls = cls_resp.get("Item")
                if cls:
                    classes = [cls]

        if not classes:
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"students": []}, default=_json_default)
            }

        cls = classes[0]
        students = []
        for student_id in cls.get("studentIds", []):
            student_resp = students_table.get_item(Key={'id': student_id})
            if 'Item' in student_resp:
                students.append(student_resp['Item'])

        # Backward-compat fallback: if class.studentIds is stale, derive roster by classId.
        if not students:
            try:
                scan_resp = students_table.scan(
                    FilterExpression="classId = :c",
                    ExpressionAttributeValues={":c": cls["id"]}
                )
                students = scan_resp.get("Items", [])
            except Exception as scan_err:
                logger.warning(f"Could not scan students by classId fallback: {scan_err}")
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"students": students, "classId": cls["id"]}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def _http_method(event):
    """REST API (v1) uses httpMethod; HTTP API (v2) uses requestContext.http.method."""
    m = event.get("httpMethod")
    if m:
        return m
    ctx = event.get("requestContext") or {}
    http = ctx.get("http") or {}
    return (http.get("method") or "").upper()


def _parse_json_body(event):
    raw = event.get("body") or "{}"
    if isinstance(raw, str) and raw.strip() == "":
        raw = "{}"
    return json.loads(raw)


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def add_student_handler(event, context):
    """Create a student + parent user with login credentials."""
    try:
        body = _parse_json_body(event)

        # Student fields
        student_name = body.get("studentName")
        age = body.get("age")
        class_id = body.get("classId")
        section = body.get("section", "A")
        gender = body.get("gender", "male")

        # Parent login fields
        parent_name = body.get("parentName")
        parent_email = body.get("parentEmail")
        parent_password = body.get("parentPassword")
        teacher_id = body.get("teacherId")

        if not student_name or not age or not class_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "studentName, age, classId are required"})}
        if not parent_email or not parent_password:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "parentEmail and parentPassword are required"})}

        import time
        ts = int(time.time() * 1000)
        student_id = f"s{ts}"
        parent_id = f"p{ts}"

        # Check if parent email already exists
        scan_res = users_table.scan(
            FilterExpression="email = :e",
            ExpressionAttributeValues={":e": parent_email}
        )
        existing_parents = scan_res.get("Items", [])

        if existing_parents:
            # Parent already exists — link student to existing parent
            parent = existing_parents[0]
            parent_id = parent["id"]
            existing_child_ids = parent.get("childIds", [])
            existing_child_ids.append(student_id)
            users_table.update_item(
                Key={"id": parent_id},
                UpdateExpression="SET childIds = :c",
                ExpressionAttributeValues={":c": existing_child_ids}
            )
        else:
            # Create new parent user
            parent_user = {
                "id": parent_id,
                "name": parent_name or f"Parent of {student_name}",
                "role": "parent",
                "email": parent_email,
                "password": parent_password,
                "childIds": [student_id]
            }
            users_table.put_item(Item=parent_user)

        # Create student record
        student = {
            "id": student_id,
            "name": student_name,
            "age": int(age),
            "classId": class_id,
            "section": section,
            "parentId": parent_id,
            "gender": gender,
            "enrollmentDate": body.get("enrollmentDate", "")
        }
        students_table.put_item(Item=student)

        # Add student to class's studentIds
        try:
            cls_resp = classes_table.get_item(Key={"id": class_id})
            cls = cls_resp.get("Item")
            if cls:
                student_ids = cls.get("studentIds", [])
                student_ids.append(student_id)
                update_expr = "SET studentIds = :s"
                expr_values = {":s": student_ids}
                # If teacher creates first data on an unassigned class, link class to that teacher.
                if teacher_id and not cls.get("teacherId"):
                    update_expr += ", teacherId = :t"
                    expr_values[":t"] = teacher_id
                classes_table.update_item(
                    Key={"id": class_id},
                    UpdateExpression=update_expr,
                    ExpressionAttributeValues=expr_values
                )
        except Exception as cls_err:
            logger.warning(f"Could not update class studentIds: {cls_err}")

        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "message": "Student and parent created successfully",
                "student": student,
                "parentId": parent_id,
                "parentEmail": parent_email
            })
        }
    except Exception as e:
        logger.error(f"Error adding student: {e}")
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def delete_student_handler(event, context):
    """Remove student from DynamoDB, class roster, and parent's childIds."""
    try:
        body = _parse_json_body(event)
        student_id = body.get("id") or body.get("studentId")
        if not student_id:
            qp = event.get("queryStringParameters") or {}
            student_id = qp.get("id") or qp.get("studentId")
        if not student_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "id or studentId is required"})}

        st_resp = students_table.get_item(Key={"id": student_id})
        student = st_resp.get("Item")
        if not student:
            return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Student not found"})}

        class_id = student.get("classId")
        parent_id = student.get("parentId")

        students_table.delete_item(Key={"id": student_id})

        if class_id:
            try:
                cls_resp = classes_table.get_item(Key={"id": class_id})
                cls = cls_resp.get("Item")
                if cls:
                    raw_ids = cls.get("studentIds", []) or []
                    sid_str = str(student_id)
                    new_ids = [str(x) for x in raw_ids if str(x) != sid_str]
                    classes_table.update_item(
                        Key={"id": class_id},
                        UpdateExpression="SET studentIds = :s",
                        ExpressionAttributeValues={":s": new_ids},
                    )
            except Exception as cls_err:
                logger.warning(f"Could not update class after student delete: {cls_err}")

        if parent_id:
            try:
                u_resp = users_table.get_item(Key={"id": parent_id})
                user = u_resp.get("Item")
                if user and user.get("childIds"):
                    sid_str = str(student_id)
                    new_children = [str(x) for x in user["childIds"] if str(x) != sid_str]
                    users_table.update_item(
                        Key={"id": parent_id},
                        UpdateExpression="SET childIds = :c",
                        ExpressionAttributeValues={":c": new_children},
                    )
            except Exception as par_err:
                logger.warning(f"Could not update parent childIds: {par_err}")

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Student deleted", "id": student_id}, default=_json_default),
        }
    except Exception as e:
        logger.error(f"Error deleting student: {e}")
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def get_classes_handler(event, context):
    try:
        response = classes_table.scan()
        classes = response.get('Items', [])
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"classes": classes}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def add_class_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("id")
        name = body.get("name")
        teacher_id = body.get("teacherId", "")
        student_ids = body.get("studentIds", [])

        if not name:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Class name is required"})}

        if not class_id:
            import time
            class_id = f"c{int(time.time() * 1000)}"

        cls = {
            "id": class_id,
            "name": name,
            "teacherId": teacher_id,
            "studentIds": student_ids,
            "sections": [] # Preserving schema but empty as per user rule to remove sections
        }
        classes_table.put_item(Item=cls)

        # Keep teacher profile aligned to this class to support fallback queries.
        if teacher_id:
            try:
                users_table.update_item(
                    Key={"id": teacher_id},
                    UpdateExpression="SET classId = :c",
                    ExpressionAttributeValues={":c": class_id}
                )
            except Exception as user_err:
                logger.warning(f"Could not update teacher classId: {user_err}")

        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Class saved successfully", "class": cls})
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def delete_class_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        class_id = query_params.get("id")

        if not class_id:
            # Try body if not in query params
            try:
                body = _parse_json_body(event)
                class_id = body.get("id")
            except Exception:
                pass

        if not class_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "id is required"})}

        classes_table.delete_item(Key={"id": class_id})

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Class deleted successfully"})
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def lambda_handler(event, context):
    # CORS preflight — must run first; HTTP API (v2) has no top-level httpMethod
    if _http_method(event) == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    action = event.get('queryStringParameters', {}).get('action') if event.get('queryStringParameters') else None

    # Check POST body for action as well
    if not action and _http_method(event) == "POST":
        try:
            body = _parse_json_body(event)
            action = body.get("action")
        except Exception:
            pass

    if action == 'get_children':
        res = get_children_for_parent_handler(event, context)
    elif action == 'get_students':
        res = get_students_for_teacher_handler(event, context)
    elif action == 'add_student' or action == 'create_student':
        res = add_student_handler(event, context)
    elif action == 'delete_student':
        res = delete_student_handler(event, context)
    elif action == 'get_classes':
        res = get_classes_handler(event, context)
    elif action == 'add_class':
        res = add_class_handler(event, context)
    elif action == 'delete_class':
        res = delete_class_handler(event, context)
    else:
        res = {"statusCode": 400, "body": json.dumps({"error": f"Missing or unknown action: {action}"})}

    # Ensure CORS headers are attached to every response if not already
    if "headers" not in res:
        res["headers"] = CORS_HEADERS
    else:
        # Merge CORS_HEADERS into existing headers
        res["headers"].update(CORS_HEADERS)

    return res
