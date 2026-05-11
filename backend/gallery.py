import os
import json
import uuid
import logging
from urllib.parse import urlparse

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

# Regional endpoint + virtual-hosted URLs so presigned PUTs sign `host` as
# `{bucket}.s3.{region}.amazonaws.com`. The legacy global host `{bucket}.s3.amazonaws.com`
# for non–us-east-1 buckets often leads to 403 / redirects and Chrome reports "CORS error".
_s3_config = Config(
    signature_version="s3v4",
    s3={"addressing_style": "virtual"},
)
_s3_endpoint = os.environ.get(
    "S3_REGIONAL_ENDPOINT",
    f"https://s3.{region}.amazonaws.com",
)
s3_client = boto3.client(
    "s3",
    region_name=region,
    endpoint_url=_s3_endpoint,
    config=_s3_config,
)

GALLERY_S3_BUCKET = os.environ.get('GALLERY_S3_BUCKET', 'playschool-gallery-uploads')
# Presigned GET for listing / immediate display (private objects). Lambda role needs s3:GetObject on this prefix.
_GALLERY_GET_URL_TTL = int(os.environ.get("GALLERY_GET_URL_TTL_SECONDS", "3600"))


def _json_safe_dynamo(obj):
    """Convert DynamoDB-style values (e.g. Decimal) for JSON serialization."""
    return json.loads(json.dumps(obj, default=str))


def _gallery_object_key(item):
    """Resolve S3 object key for this gallery row (stored s3Key or parsed from canonical url)."""
    key = item.get("s3Key")
    if isinstance(key, str) and key.startswith("gallery/"):
        return key
    url = item.get("url")
    if not url or not isinstance(url, str):
        return None
    if not (url.startswith("http://") or url.startswith("https://")):
        return None
    try:
        parsed = urlparse(url)
        host = (parsed.netloc or "").lower()
        bucket_l = GALLERY_S3_BUCKET.lower()
        if not host.startswith(f"{bucket_l}.s3."):
            return None
        if not host.endswith(".amazonaws.com"):
            return None
        path = parsed.path.lstrip("/")
        if path.startswith("gallery/"):
            return path
    except Exception:
        return None
    return None


def _presigned_get_object_url(key):
    if not key:
        return None
    try:
        return s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": GALLERY_S3_BUCKET, "Key": key},
            ExpiresIn=_GALLERY_GET_URL_TTL,
        )
    except ClientError as e:
        logger.warning("Could not presign GET for s3://%s/%s: %s", GALLERY_S3_BUCKET, key, e)
        return None


def _item_with_readable_url(item):
    """Return a copy of item with url replaced by a time-limited presigned GET when object is in our bucket."""
    if not isinstance(item, dict):
        return item
    out = dict(item)
    key = _gallery_object_key(out)
    if not key:
        return out
    signed = _presigned_get_object_url(key)
    if signed:
        out["url"] = signed
    return out


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


def _safe_upload_filename(file_name):
    return "".join(c if c.isalnum() or c in "-_." else "_" for c in (file_name or ""))


def _valid_avatar_user_id(user_id):
    if not user_id or not isinstance(user_id, str):
        return False
    return all(c.isalnum() or c in "-_" for c in user_id) and ".." not in user_id


def get_presigned_url_handler(event, context):
    """Generate a presigned S3 PUT URL for the client to upload directly (gallery or profile avatar)."""
    try:
        body = _parse_json_body(event)
        file_name = body.get("fileName")
        content_type = body.get("contentType", "image/jpeg")
        upload_kind = (body.get("uploadKind") or "gallery").strip().lower()
        user_id = (body.get("userId") or "").strip()

        if not file_name:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "fileName is required"})
            }

        unique_id = str(uuid.uuid4())[:8]
        safe_name = _safe_upload_filename(file_name)
        if not safe_name or safe_name == ".":
            safe_name = "image.jpg"

        if upload_kind == "avatar":
            if not _valid_avatar_user_id(user_id):
                return {
                    "statusCode": 400,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({"error": "userId is required for avatar uploads"}),
                }
            # Same bucket and `gallery/` prefix as other uploads (existing IAM / lifecycle).
            s3_key = f"gallery/avatars/{user_id}/{unique_id}_{safe_name}"
        else:
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


def presign_get_object_handler(event, context):
    """Return a time-limited read URL for a private object under `gallery/` (includes `gallery/avatars/`)."""
    try:
        body = _parse_json_body(event)
        key = (body.get("s3Key") or "").strip()
        if not key or ".." in key or key.startswith("/"):
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Invalid s3Key"}),
            }
        # `gallery/*` matches existing uploads; `avatars/*` only for older profile rows before `gallery/avatars/`.
        if not (key.startswith("gallery/") or key.startswith("avatars/")):
            return {
                "statusCode": 403,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Key prefix not allowed"}),
            }
        read_url = _presigned_get_object_url(key)
        if not read_url:
            return {
                "statusCode": 500,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Could not generate read URL"}),
            }
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"readUrl": read_url}),
        }
    except Exception as e:
        logger.error("presign_get_object error: %s", e)
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }


def save_media_handler(event, context):
    """Save gallery media metadata to DynamoDB."""
    try:
        body = _parse_json_body(event)

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
            "uploadedBy": body["uploadedBy"],
        }
        if body.get("s3Key") and isinstance(body["s3Key"], str):
            item["s3Key"] = body["s3Key"]

        gallery_table.put_item(Item=item)

        # Response url is presigned GET so the browser can render the image without a public bucket policy.
        response_media = _item_with_readable_url(item)

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"media": response_media}, default=str),
        }
    except Exception as e:
        logger.error(f"Error saving media: {e}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }


def list_media_handler(event, context):
    """List all gallery media items from DynamoDB (presigned GET urls for our private S3 objects)."""
    try:
        response = gallery_table.scan()
        items = response.get("Items", [])
        safe_items = _json_safe_dynamo(items)
        if not isinstance(safe_items, list):
            safe_items = items
        readable = [_item_with_readable_url(it) for it in safe_items]

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"media": readable}, default=str),
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
    if _http_method(event) == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    query_params = event.get("queryStringParameters") or {}
    action = query_params.get("action")

    if action == "get_presigned_url":
        res = get_presigned_url_handler(event, context)
    elif action == "presign_get_object":
        res = presign_get_object_handler(event, context)
    elif action == "save_media":
        res = save_media_handler(event, context)
    elif action == "list_media":
        res = list_media_handler(event, context)
    else:
        res = {
            "statusCode": 400,
            "body": json.dumps(
                {
                    "error": "Missing or unknown 'action' parameter. Use: get_presigned_url, presign_get_object, save_media, list_media",
                }
            )
        }

    # Ensure CORS headers are attached to every response if not already
    if "headers" not in res:
        res["headers"] = CORS_HEADERS
    else:
        # Merge CORS_HEADERS into existing headers
        res["headers"].update(CORS_HEADERS)

    return res
