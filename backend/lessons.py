import os
import json
import time
from datetime import datetime
from decimal import Decimal
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


lessons_table = ensure_table_exists(
    'Playschool_Lessons',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}],
)


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

def update_lesson_stage_handler(event, context):
    try:
        body = _parse_json_body(event)
        student_id = body.get("studentId")
        activity_id = body.get("activityId")
        stage = body.get("stage")
        
        if not student_id or not activity_id or not stage:
             return {"statusCode": 400, "body": json.dumps({"error": "studentId, activityId, and stage are required"})}
             
        today = datetime.now().isoformat().split("T")[0]
        # In DynamoDB, we'd normally use a composite key for this, but mapping to ID schema:
        progress_id = f"prog-{student_id}-{activity_id}"
        
        progress_record = {
            "id": progress_id,
            "studentId": student_id,
            "activityId": activity_id,
            "stage": stage,
            "updatedAt": today
        }
        
        lessons_table.put_item(Item=progress_record)
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(
                {"message": f"Lesson stage updated to {stage}", "progressRecord": progress_record},
                default=_json_default,
            ),
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def add_lesson_plan_handler(event, context):
    try:
        body = _parse_json_body(event)

        if not body:
            return {"statusCode": 400, "body": json.dumps({"error": "Plan data is required"})}

        # Strip routing fields — do not persist `action` in DynamoDB
        clean = {k: v for k, v in body.items() if k not in ("action",)}
        if not clean.get("classId") or not clean.get("studentId") or not clean.get("activityId") or not clean.get("date"):
            return {"statusCode": 400, "body": json.dumps({"error": "classId, studentId, activityId, and date are required"})}

        plan_id = f"plan-{int(time.time() * 1000)}"
        new_plan = {**clean, "id": plan_id}

        lessons_table.put_item(Item=new_plan)

        return {
            "statusCode": 201,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"message": "Lesson plan created successfully", "plan": new_plan}, default=_json_default),
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def remove_lesson_plan_handler(event, context):
    try:
        path_params = event.get("pathParameters") or {}
        plan_id = path_params.get("id")
        if not plan_id:
            body = _parse_json_body(event)
            plan_id = body.get("id")

        if not plan_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Plan id is required"})}

        lessons_table.delete_item(Key={"id": plan_id})

        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"message": f"Lesson plan {plan_id} removed successfully"}, default=_json_default),
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def get_all_plans_handler(event, context):
    try:
        response = lessons_table.scan()
        items = response.get("Items", [])
        # Table stores both lesson plans (have `date`) and progress rows (`stage`, no `date`)
        plans = [it for it in items if it.get("date")]
        progress = [it for it in items if it.get("stage") is not None and not it.get("date")]
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"plans": plans, "progress": progress}, default=_json_default),
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

    if action == 'update_stage':
        res = update_lesson_stage_handler(event, context)
    elif action == 'add_plan':
        res = add_lesson_plan_handler(event, context)
    elif action == 'remove_plan':
        res = remove_lesson_plan_handler(event, context)
    elif action == 'get_plans':
        res = get_all_plans_handler(event, context)
    else:
        res = {"statusCode": 400, "body": json.dumps({"error": f"Missing or unknown action: {action}"})}

    # Ensure CORS headers are attached to every response
    if "headers" not in res:
        res["headers"] = CORS_HEADERS
    else:
        res["headers"].update(CORS_HEADERS)

    return res
