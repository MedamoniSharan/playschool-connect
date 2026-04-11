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

# Initialize table globally (if not exists)
users_table = ensure_table_exists(
    'Playschool_Users',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        email = body.get("email")
        password = body.get("password")
        
        if not email or not password:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Email and password are required"})
            }
            
        # For simplicity, scanning. In production, create a GSI on 'email' and use query().
        response = users_table.scan(
            FilterExpression="email = :e AND password = :p",
            ExpressionAttributeValues={":e": email, ":p": password}
        )
        users = response.get('Items', [])
        
        if len(users) > 0:
            user = users[0]
            # Drop the password before returning 
            user_safe = {k: v for k, v in user.items() if k != "password"}
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "message": "Login successful",
                    "user": user_safe,
                    "token": "mock-jwt-token-123"
                })
            }
            
        return {
            "statusCode": 401,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": "Invalid email or password"})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
