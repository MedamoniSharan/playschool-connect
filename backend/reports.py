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
reports_table = ensure_table_exists(
    'Playschool_Reports',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        student_id = body.get("studentId")
        
        if not student_id:
            return {"statusCode": 400, "body": json.dumps({"error": "studentId is required"})}
            
        period_label = datetime.now().strftime("%B %Y")
        
        # Build logic here using student and curriculum tables
        
        generated_at = datetime.now().isoformat().split("T")[0]
        report_id = f"rep-{int(time.time() * 1000)}"
        
        report_record = {
            "id": report_id,
            "studentId": student_id,
            "period": period_label,
            "attendanceRate": 95.5,
            "presentedCount": 12,
            "practicedCount": 8,
            "masteredCount": 4,
            "comments": "Progressing well across all subjects.",
            "generatedAt": generated_at
        }
        
        reports_table.put_item(Item=report_record)
        
        return {
            "statusCode": 201,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "message": "Report generated successfully",
                "report": report_record
            })
        }
    except Exception as e:
         return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
