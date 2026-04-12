import os
import json
import boto3
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
                "body": json.dumps({"children": []})
            }
            
        children = []
        for child_id in user["childIds"]:
            child_resp = students_table.get_item(Key={'id': child_id})
            if 'Item' in child_resp:
                children.append(child_resp['Item'])
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"children": children})
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
        
        if not classes:
            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"students": []})
            }
            
        cls = classes[0]
        students = []
        for student_id in cls.get("studentIds", []):
            student_resp = students_table.get_item(Key={'id': student_id})
            if 'Item' in student_resp:
                students.append(student_resp['Item'])
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"students": students, "classId": cls["id"]})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}


def add_student_handler(event, context):
    """Create a student + parent user with login credentials."""
    try:
        body = json.loads(event.get("body", "{}"))

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
                classes_table.update_item(
                    Key={"id": class_id},
                    UpdateExpression="SET studentIds = :s",
                    ExpressionAttributeValues={":s": student_ids}
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


def get_classes_handler(event, context):
    try:
        response = classes_table.scan()
        classes = response.get('Items', [])
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"classes": classes})
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def add_class_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
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
                body = json.loads(event.get("body", "{}"))
                class_id = body.get("id")
            except:
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
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    action = event.get('queryStringParameters', {}).get('action') if event.get('queryStringParameters') else None

    # Check POST body for action as well
    if not action and event.get("httpMethod") == "POST":
        try:
            body = json.loads(event.get("body", "{}"))
            action = body.get("action")
        except:
            pass

    if action == 'get_children':
        return get_children_for_parent_handler(event, context)
    elif action == 'get_students':
        return get_students_for_teacher_handler(event, context)
    elif action == 'add_student':
        return add_student_handler(event, context)
    elif action == 'get_classes':
        return get_classes_handler(event, context)
    elif action == 'add_class':
        return add_class_handler(event, context)
    elif action == 'delete_class':
        return delete_class_handler(event, context)
    else:
        return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Missing or unknown query parameter 'action'"})}
