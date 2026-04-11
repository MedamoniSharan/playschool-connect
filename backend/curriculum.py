import os
import json
import time
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
curriculum_table = ensure_table_exists(
    'Playschool_Curriculum',
    [{'AttributeName': 'classId', 'KeyType': 'HASH'}],
    [{'AttributeName': 'classId', 'AttributeType': 'S'}]
)

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
            "body": json.dumps({"activities": out})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def add_subject_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
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
            "body": json.dumps({"message": "Subject created", "subject": new_subject})
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

def add_activity_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
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
            "body": json.dumps({"message": "Activity created", "activity": new_act})
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

    if action == 'get_activities':
        return get_activities_with_subjects_handler(event, context)
    elif action == 'add_subject':
        return add_subject_handler(event, context)
    elif action == 'add_activity':
        return add_activity_handler(event, context)
    else:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing or unknown action (provide in query string or body JSON)"})}
