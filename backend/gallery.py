import os
import json
import uuid
import boto3
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)
s3_client = boto3.client('s3', region_name=region)

GALLERY_S3_BUCKET = os.environ.get('GALLERY_S3_BUCKET', 'playschool-gallery-uploads')

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
}


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
                BillingMode='PAY_PER_REQUEST'
            )
            table.meta.client.get_waiter('table_exists').wait(TableName=table_name)
            return table
        raise e

# Initialize table — auto-create if not exists
gallery_table = ensure_table_exists(
    'Playschool_Gallery',
    [{'AttributeName': 'id', 'KeyType': 'HASH'}],
    [{'AttributeName': 'id', 'AttributeType': 'S'}]
)


def get_presigned_url_handler(event, context):
    """Generate a presigned S3 PUT URL for the client to upload directly."""
    try:
        body = json.loads(event.get("body", "{}"))
        file_name = body.get("fileName")
        content_type = body.get("contentType", "image/jpeg")

        if not file_name:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "fileName is required"})
            }

        # Generate a unique S3 key to avoid collisions
        unique_id = str(uuid.uuid4())[:8]
        # Sanitize filename: keep only alphanumeric, dashes, underscores, dots
        safe_name = "".join(c if c.isalnum() or c in "-_." else "_" for c in file_name)
        s3_key = f"gallery/{unique_id}_{safe_name}"

        # Generate presigned URL (valid for 5 minutes)
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': GALLERY_S3_BUCKET,
                'Key': s3_key,
                'ContentType': content_type
            },
            ExpiresIn=300
        )

        # The final public URL of the uploaded object
        s3_url = f"https://{GALLERY_S3_BUCKET}.s3.{region}.amazonaws.com/{s3_key}"

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "uploadUrl": upload_url,
                "s3Key": s3_key,
                "s3Url": s3_url
            })
        }
    except Exception as e:
        logger.error(f"Error generating presigned URL: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }


def save_media_handler(event, context):
    """Save gallery media metadata to DynamoDB."""
    try:
        body = json.loads(event.get("body", "{}"))

        required_fields = ["id", "url", "title", "event", "date", "uploadedBy"]
        for field in required_fields:
            if not body.get(field):
                return {
                    "statusCode": 400,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({"error": f"'{field}' is required"})
                }

        item = {
            "id": body["id"],
            "url": body["url"],
            "type": body.get("type", "photo"),
            "title": body["title"],
            "event": body["event"],
            "date": body["date"],
            "studentIds": body.get("studentIds", []),
            "uploadedBy": body["uploadedBy"]
        }

        gallery_table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"media": item})
        }
    except Exception as e:
        logger.error(f"Error saving media: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }


def list_media_handler(event, context):
    """List all gallery media items from DynamoDB."""
    try:
        response = gallery_table.scan()
        items = response.get('Items', [])

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"media": items})
        }
    except Exception as e:
        logger.error(f"Error listing media: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }


def lambda_handler(event, context):
    """Main entry point — dispatch based on 'action' query parameter."""
    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    query_params = event.get("queryStringParameters") or {}
    action = query_params.get("action")

    if action == "get_presigned_url":
        return get_presigned_url_handler(event, context)
    elif action == "save_media":
        return save_media_handler(event, context)
    elif action == "list_media":
        return list_media_handler(event, context)
    else:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Missing or unknown 'action' parameter. Use: get_presigned_url, save_media, list_media"})
        }
