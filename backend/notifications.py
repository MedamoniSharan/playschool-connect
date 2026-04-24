import json
import os
from decimal import Decimal

import boto3
from botocore.exceptions import ClientError

region = os.environ.get("AWS_REGION", "ap-south-2")
dynamodb = boto3.resource("dynamodb", region_name=region)


def ensure_table_exists(table_name, key_schema, attribute_definitions):
    try:
        table = dynamodb.Table(table_name)
        table.table_status
        return table
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=key_schema,
                AttributeDefinitions=attribute_definitions,
                BillingMode="PAY_PER_REQUEST",
            )
            table.meta.client.get_waiter("table_exists").wait(TableName=table_name)
            return table
        raise e


notifications_table = ensure_table_exists(
    "Playschool_Notifications",
    [{"AttributeName": "id", "KeyType": "HASH"}],
    [{"AttributeName": "id", "AttributeType": "S"}],
)

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


def _json_default(value):
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def list_notifications_handler(event, context):
    response = notifications_table.scan()
    items = response.get("Items", [])
    # Stable latest-first ordering for UI lists.
    items.sort(key=lambda n: (str(n.get("date", "")), str(n.get("id", ""))), reverse=True)
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"notifications": items}, default=_json_default),
    }


def upsert_notifications_handler(event, context):
    body = _parse_json_body(event)
    rows = body.get("notifications")
    if not isinstance(rows, list):
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "notifications array is required"}),
        }

    saved = 0
    for row in rows:
        if not isinstance(row, dict):
            continue
        notif_id = row.get("id")
        if not notif_id:
            continue
        notifications_table.put_item(Item=row)
        saved += 1

    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"ok": True, "saved": saved}),
    }


def lambda_handler(event, context):
    if _http_method(event) == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    action = event.get("queryStringParameters", {}).get("action") if event.get("queryStringParameters") else None
    if not action:
        try:
            body = _parse_json_body(event)
            action = body.get("action")
        except Exception:
            action = None

    if action == "list_notifications":
        res = list_notifications_handler(event, context)
    elif action == "upsert_notifications":
        res = upsert_notifications_handler(event, context)
    else:
        res = {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {"error": "Missing or unknown action. Use: list_notifications, upsert_notifications"}
            ),
        }

    if "headers" not in res:
        res["headers"] = CORS_HEADERS
    else:
        res["headers"].update(CORS_HEADERS)
    return res

