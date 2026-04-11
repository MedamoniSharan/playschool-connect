import os
import json
import time
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

def ensure_table_exists(table_name, key_schema, attribute_definitions):
    try:
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=key_schema,
            AttributeDefinitions=attribute_definitions,
            BillingMode='PAY_PER_REQUEST'
        )
        logger.info(f"Creating table {table_name}. Waiting for it to become ACTIVE...")
        table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
        logger.info(f"Table {table_name} is now available.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            logger.info(f"Table {table_name} already exists.")
        else:
            raise e
    return dynamodb.Table(table_name)

# Initialize table globally (if not exists)
lessons_table = ensure_table_exists(
    'Playschool_Lessons',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)

def update_lesson_stage_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
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
            "body": json.dumps({
                "message": f"Lesson stage updated to {stage}",
                "progressRecord": progress_record
            })
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def add_lesson_plan_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        
        if not body:
             return {"statusCode": 400, "body": json.dumps({"error": "Plan data is required"})}
             
        plan_id = f"plan-{int(time.time() * 1000)}"
        new_plan = {**body, "id": plan_id}
        
        lessons_table.put_item(Item=new_plan)
        
        return {
            "statusCode": 201,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "message": "Lesson plan created successfully",
                "plan": new_plan
            })
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def remove_lesson_plan_handler(event, context):
    try:
        path_params = event.get("pathParameters") or {}
        plan_id = path_params.get("id")
        
        if not plan_id:
             return {"statusCode": 400, "body": json.dumps({"error": "Plan ID is required in URL"})}
             
        lessons_table.delete_item(Key={'id': plan_id})
        
        return {
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "message": f"Lesson plan {plan_id} removed successfully"
            })
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def lambda_handler(event, context):
    action = event.get('queryStringParameters', {}).get('action') if event.get('queryStringParameters') else None

    if not action:
        try:
            body = json.loads(event.get("body", "{}"))
            action = body.get("action")
        except:
            action = None

    if action == 'update_stage':
        return update_lesson_stage_handler(event, context)
    elif action == 'add_plan':
        return add_lesson_plan_handler(event, context)
    elif action == 'remove_plan':
        return remove_lesson_plan_handler(event, context)
    else:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing or unknown action"})}
