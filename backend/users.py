import os
import json
import boto3
from decimal import Decimal
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

# Initialize tables — uses lazy references if tables already exist (fast cold start)
users_table = dynamodb.Table('Playschool_Users')
students_table = dynamodb.Table('Playschool_Students')
classes_table = dynamodb.Table('Playschool_Classes')
branches_table = dynamodb.Table('Playschool_Branches')

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


def get_children_for_parent_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        parent_id = query_params.get("parentId")
        branch_id = query_params.get("branchId")

        if not parent_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "parentId is required"})}
        if not branch_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "branchId is required"})}

        user_resp = users_table.get_item(Key={'id': parent_id})
        user = user_resp.get('Item')

        if not user or not user.get("childIds"):
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"children": []}, default=_json_default)
            }

        children = []
        for child_id in user["childIds"]:
            child_resp = students_table.get_item(Key={'id': child_id})
            if 'Item' not in child_resp:
                continue
            st = child_resp["Item"]
            if st.get("branchId") and st.get("branchId") != branch_id:
                continue
            children.append(st)

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"children": children}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def get_students_for_teacher_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        teacher_id = query_params.get("teacherId")
        branch_id = query_params.get("branchId")

        if not teacher_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "teacherId is required"})}
        if not branch_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "branchId is required"})}

        response = classes_table.scan(
            FilterExpression="teacherId = :t AND branchId = :b",
            ExpressionAttributeValues={":t": teacher_id, ":b": branch_id}
        )
        classes = response.get('Items', [])
        while "LastEvaluatedKey" in response:
            response = classes_table.scan(
                ExclusiveStartKey=response["LastEvaluatedKey"],
                FilterExpression="teacherId = :t AND branchId = :b",
                ExpressionAttributeValues={":t": teacher_id, ":b": branch_id},
            )
            classes.extend(response.get("Items", []))

        if not classes:
            user_resp = users_table.get_item(Key={"id": teacher_id})
            teacher = user_resp.get("Item") or {}
            class_id = teacher.get("classId")
            if class_id:
                cls_resp = classes_table.get_item(Key={"id": class_id})
                cls = cls_resp.get("Item")
                if cls and cls.get("branchId") == branch_id:
                    classes = [cls]

        if not classes:
            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({"students": []}, default=_json_default)
            }

        cls = classes[0]
        students = []
        for student_id in cls.get("studentIds", []):
            student_resp = students_table.get_item(Key={'id': student_id})
            if 'Item' in student_resp:
                students.append(student_resp['Item'])

        if not students:
            try:
                scan_resp = students_table.scan(
                    FilterExpression="classId = :c AND branchId = :b",
                    ExpressionAttributeValues={":c": cls["id"], ":b": branch_id}
                )
                students = scan_resp.get("Items", [])
            except Exception as scan_err:
                logger.warning(f"Could not scan students by classId fallback: {scan_err}")

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"students": students, "classId": cls["id"]}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


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

        cls_resp = classes_table.get_item(Key={"id": class_id})
        cls_item = cls_resp.get("Item")
        if not cls_item:
            return {"statusCode": 404, "headers": CORS_HEADERS, "body": json.dumps({"error": "Class not found"})}
        branch_id = cls_item.get("branchId")
        if not branch_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Class must belong to a branch (branchId)"})}

        import time
        ts = int(time.time() * 1000)
        student_id = f"s{ts}"
        parent_id = f"p{ts}"

        scan_res = users_table.scan(
            FilterExpression="email = :e AND #role = :r",
            ExpressionAttributeNames={"#role": "role"},
            ExpressionAttributeValues={":e": parent_email, ":r": "parent"},
        )
        pool = scan_res.get("Items", [])
        while "LastEvaluatedKey" in scan_res:
            scan_res = users_table.scan(
                ExclusiveStartKey=scan_res["LastEvaluatedKey"],
                FilterExpression="email = :e AND #role = :r",
                ExpressionAttributeNames={"#role": "role"},
                ExpressionAttributeValues={":e": parent_email, ":r": "parent"},
            )
            pool.extend(scan_res.get("Items", []))

        existing_parents = [p for p in pool if p.get("branchId") == branch_id]

        if existing_parents:
            parent = existing_parents[0]
            parent_id = parent["id"]
            existing_child_ids = parent.get("childIds", [])
            existing_child_ids.append(student_id)
            users_table.update_item(
                Key={"id": parent_id},
                UpdateExpression="SET childIds = :c",
                ExpressionAttributeValues={":c": existing_child_ids},
            )
        else:
            parent_user = {
                "id": parent_id,
                "name": parent_name or f"Parent of {student_name}",
                "role": "parent",
                "email": parent_email,
                "password": parent_password,
                "branchId": branch_id,
                "childIds": [student_id],
            }
            users_table.put_item(Item=parent_user)

        student = {
            "id": student_id,
            "name": student_name,
            "age": int(age),
            "classId": class_id,
            "section": section,
            "parentId": parent_id,
            "gender": gender,
            "branchId": branch_id,
            "enrollmentDate": body.get("enrollmentDate", ""),
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
        branch_id = None
        qp = event.get("queryStringParameters") or {}
        if qp.get("branchId"):
            branch_id = qp["branchId"]
        else:
            try:
                body = _parse_json_body(event)
                branch_id = body.get("branchId")
            except Exception:
                pass

        response = classes_table.scan()
        classes = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = classes_table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            classes.extend(response.get("Items", []))

        if branch_id:
            classes = [c for c in classes if c.get("branchId") == branch_id]

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"classes": classes}, default=_json_default),
        }
    except Exception as e:
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def get_all_students_handler(event, context):
    """Admin roster: students in one branch."""
    try:
        qp = event.get("queryStringParameters") or {}
        branch_id = qp.get("branchId")
        if not branch_id:
            try:
                body = _parse_json_body(event)
                branch_id = body.get("branchId")
            except Exception:
                branch_id = None
        if not branch_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "branchId is required"}),
            }

        items = []
        scan_kwargs = {
            "FilterExpression": "branchId = :b",
            "ExpressionAttributeValues": {":b": branch_id},
        }
        while True:
            response = students_table.scan(**scan_kwargs)
            items.extend(response.get("Items", []))
            key = response.get("LastEvaluatedKey")
            if not key:
                break
            scan_kwargs["ExclusiveStartKey"] = key

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"students": items}, default=_json_default),
        }
    except Exception as e:
        logger.error(f"get_all_students error: {e}")
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def add_class_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("id")
        name = body.get("name")
        teacher_id = body.get("teacherId", "")
        student_ids = body.get("studentIds", [])
        branch_id = body.get("branchId")

        if not name:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "Class name is required"})}
        if not branch_id:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "branchId is required"})}

        if not class_id:
            import time
            class_id = f"c{int(time.time() * 1000)}"

        cls = {
            "id": class_id,
            "name": name,
            "teacherId": teacher_id,
            "studentIds": student_ids,
            "branchId": branch_id,
            "sections": []
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


def add_branch_handler(event, context):
    try:
        body = _parse_json_body(event)
        name = (body.get("name") or "").strip()
        bid = body.get("id")
        sort_order = body.get("sortOrder", "")
        if not name:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "name is required"})}
        import time
        if not bid:
            bid = f"b{int(time.time() * 1000)}"
        item = {"id": bid, "name": name}
        if sort_order != "":
            item["sortOrder"] = str(sort_order)
        branches_table.put_item(Item=item)
        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Branch created", "branch": item}),
        }
    except Exception as e:
        logger.error("add_branch error: %s", e)
        return {"statusCode": 500, "headers": CORS_HEADERS, "body": json.dumps({"error": str(e)})}


def _branch_is_referenced(branch_id):
    """True if any class, student, or user row still uses this branchId."""
    for tbl in (classes_table, students_table, users_table):
        exclusive = None
        while True:
            scan_args = {
                "FilterExpression": "branchId = :b",
                "ExpressionAttributeValues": {":b": branch_id},
            }
            if exclusive:
                scan_args["ExclusiveStartKey"] = exclusive
            resp = tbl.scan(**scan_args)
            if resp.get("Items"):
                return True
            exclusive = resp.get("LastEvaluatedKey")
            if not exclusive:
                break
    return False


def delete_branch_handler(event, context):
    try:
        body = _parse_json_body(event)
        bid = body.get("id") or body.get("branchId")
        if not bid:
            qp = event.get("queryStringParameters") or {}
            bid = qp.get("id") or qp.get("branchId")
        if not bid:
            return {"statusCode": 400, "headers": CORS_HEADERS, "body": json.dumps({"error": "id or branchId is required"})}

        if _branch_is_referenced(bid):
            return {
                "statusCode": 409,
                "headers": CORS_HEADERS,
                "body": json.dumps(
                    {
                        "error": "Cannot delete this campus while classes, students, or staff still belong to it. "
                        "Move or remove them first."
                    }
                ),
            }

        branches_table.delete_item(Key={"id": bid})
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Campus deleted", "id": bid}),
        }
    except Exception as e:
        logger.error("delete_branch error: %s", e)
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
    elif action == 'get_all_students':
        res = get_all_students_handler(event, context)
    elif action == 'add_student' or action == 'create_student':
        res = add_student_handler(event, context)
    elif action == 'delete_student':
        res = delete_student_handler(event, context)
    elif action == 'get_classes':
        res = get_classes_handler(event, context)
    elif action == 'add_class':
        res = add_class_handler(event, context)
    elif action == 'add_branch':
        res = add_branch_handler(event, context)
    elif action == 'delete_branch':
        res = delete_branch_handler(event, context)
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
