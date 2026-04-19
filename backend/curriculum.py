import os
import json
import time
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
        table.table_status
        return table
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            logger.info(f"Creating table {table_name}...")
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=key_schema,
                AttributeDefinitions=attribute_definitions,
                BillingMode='PAY_PER_REQUEST',
            )
            table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
            return table
        raise e


# Initialize table — auto-create if not exists (same pattern as gallery Lambda)
curriculum_table = ensure_table_exists(
    'Playschool_Curriculum',
    [{'AttributeName': 'classId', 'KeyType': 'HASH'}],
    [{'AttributeName': 'classId', 'AttributeType': 'S'}],
)


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

def get_activities_with_subjects_handler(event, context):
    try:
        query_params = event.get("queryStringParameters") or {}
        class_id = query_params.get("classId")
        
        if not class_id:
            return {"statusCode": 400, "body": json.dumps({"error": "classId is required"})}
            
        response = curriculum_table.get_item(Key={'classId': class_id})
        cc = response.get('Item')
        
        out = []
        if cc:
            for sub in cc.get("subjects", []):
                for act in sub.get("activities", []):
                    out.append({"activity": act, "subjectName": sub["name"]})
                    
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"activities": out}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def add_subject_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("classId")
        name = body.get("name")
        
        if not class_id or not name:
             return {"statusCode": 400, "body": json.dumps({"error": "classId and name are required"})}
             
        new_id = f"sub-{class_id}-{int(time.time() * 1000)}"
        new_subject = {
            "id": new_id,
            "classId": class_id,
            "name": name,
            "activities": []
        }
        
        # Get existing curriculum or create empty one
        response = curriculum_table.get_item(Key={'classId': class_id})
        cc = response.get('Item')
        if not cc:
            cc = {'classId': class_id, 'subjects': []}
            
        cc['subjects'].append(new_subject)
        curriculum_table.put_item(Item=cc)
        
        return {
            "statusCode": 201,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"message": "Subject created", "subject": new_subject}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def add_activity_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("classId")
        subject_id = body.get("subjectId")
        name = body.get("name")
        description = body.get("description", "")
        
        if not class_id or not subject_id or not name:
             return {"statusCode": 400, "body": json.dumps({"error": "classId, subjectId, and name are required"})}
             
        response = curriculum_table.get_item(Key={'classId': class_id})
        cc = response.get('Item')
        
        if not cc:
            return {"statusCode": 404, "body": json.dumps({"error": "Curriculum not found for class"})}
            
        new_act_id = f"act-{subject_id}-{int(time.time() * 1000)}"
        new_act = {
            "id": new_act_id,
            "subjectId": subject_id,
            "name": name,
            "description": description
        }
        
        for sub in cc.get('subjects', []):
            if sub['id'] == subject_id:
                sub['activities'].append(new_act)
                break
                
        curriculum_table.put_item(Item=cc)
        
        return {
            "statusCode": 201,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"message": "Activity created", "activity": new_act}, default=_json_default)
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def remove_subject_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("classId")
        subject_id = body.get("subjectId")
        if not class_id or not subject_id:
            return {"statusCode": 400, "body": json.dumps({"error": "classId and subjectId are required"})}

        response = curriculum_table.get_item(Key={"classId": class_id})
        cc = response.get("Item")
        if not cc:
            return {"statusCode": 404, "body": json.dumps({"error": "Curriculum not found for class"})}

        subs = [s for s in cc.get("subjects", []) if s.get("id") != subject_id]
        cc["subjects"] = subs
        curriculum_table.put_item(Item=cc)

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"ok": True, "message": "Subject removed"}, default=_json_default),
        }
    except Exception as e:
        logger.error(f"remove_subject: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def remove_activity_handler(event, context):
    try:
        body = _parse_json_body(event)
        class_id = body.get("classId")
        subject_id = body.get("subjectId")
        activity_id = body.get("activityId")
        if not class_id or not subject_id or not activity_id:
            return {"statusCode": 400, "body": json.dumps({"error": "classId, subjectId, and activityId are required"})}

        response = curriculum_table.get_item(Key={"classId": class_id})
        cc = response.get("Item")
        if not cc:
            return {"statusCode": 404, "body": json.dumps({"error": "Curriculum not found for class"})}

        for sub in cc.get("subjects", []):
            if sub.get("id") == subject_id:
                sub["activities"] = [a for a in sub.get("activities", []) if a.get("id") != activity_id]
                break

        curriculum_table.put_item(Item=cc)

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"ok": True, "message": "Activity removed"}, default=_json_default),
        }
    except Exception as e:
        logger.error(f"remove_activity: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def _http_method(event):
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


def get_curriculum_handler(event, context):
    """Return full curriculum document for one class (subjects + activities)."""
    try:
        query_params = event.get("queryStringParameters") or {}
        class_id = query_params.get("classId")
        if not class_id:
            try:
                body = _parse_json_body(event)
                class_id = body.get("classId")
            except Exception:
                pass
        if not class_id:
            return {"statusCode": 400, "body": json.dumps({"error": "classId is required"})}

        response = curriculum_table.get_item(Key={"classId": class_id})
        item = response.get("Item")
        if not item:
            curriculum = {"classId": class_id, "subjects": []}
        else:
            curriculum = {
                "classId": item.get("classId", class_id),
                "subjects": item.get("subjects", []),
            }

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"curriculum": curriculum}, default=_json_default),
        }
    except Exception as e:
        logger.error(f"get_curriculum error: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def lambda_handler(event, context):
    # Handle CORS preflight
    if _http_method(event) == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": ""
        }

    action = event.get('queryStringParameters', {}).get('action') if event.get('queryStringParameters') else None

    if not action:
        try:
            body = _parse_json_body(event)
            action = body.get("action")
        except Exception:
            action = None

    if action == 'get_activities':
        res = get_activities_with_subjects_handler(event, context)
    elif action == 'get_curriculum':
        res = get_curriculum_handler(event, context)
    elif action == 'add_subject':
        res = add_subject_handler(event, context)
    elif action == 'add_activity':
        res = add_activity_handler(event, context)
    elif action == 'remove_subject':
        res = remove_subject_handler(event, context)
    elif action == 'remove_activity':
        res = remove_activity_handler(event, context)
    else:
        res = {"statusCode": 400, "body": json.dumps({"error": "Missing or unknown action"})}

    # Ensure CORS headers are attached to every response if not already
    if "headers" not in res:
        res["headers"] = CORS_HEADERS
    else:
        res["headers"].update(CORS_HEADERS)

    return res
