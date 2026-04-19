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


reports_table = ensure_table_exists(
    'Playschool_Reports',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}],
)


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")

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

    try:
        body = _parse_json_body(event)
        student_id = body.get("studentId")
        
        if not student_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "studentId is required"}),
            }
            
        period_label = datetime.now().strftime("%B %Y")
        
        # Build logic here using student and curriculum tables
        
        generated_at = datetime.now().isoformat().split("T")[0]
        report_id = f"rep-{int(time.time() * 1000)}"
        
        # DynamoDB does not accept Python float — use Decimal for fractional numbers
        report_record = {
            "id": report_id,
            "studentId": student_id,
            "period": period_label,
            "attendanceRate": Decimal("95.5"),
            "presentedCount": 12,
            "practicedCount": 8,
            "masteredCount": 4,
            "comments": "Progressing well across all subjects.",
            "generatedAt": generated_at,
        }

        reports_table.put_item(Item=report_record)

        return {
            "statusCode": 201,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {"message": "Report generated successfully", "report": report_record},
                default=_json_default,
            ),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }
