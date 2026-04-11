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

# Initialize tables globally (if not exists)
users_table = ensure_table_exists(
    'Playschool_Users',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)
students_table = ensure_table_exists(
    'Playschool_Students',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)
classes_table = ensure_table_exists(
    'Playschool_Classes',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)

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

def lambda_handler(event, context):
    action = event.get('queryStringParameters', {}).get('action') if event.get('queryStringParameters') else None

    if action == 'get_children':
        return get_children_for_parent_handler(event, context)
    elif action == 'get_students':
        return get_students_for_teacher_handler(event, context)
    else:
        return {"statusCode": 400, "body": json.dumps({"error": "Missing or unknown query parameter 'action'"})}
