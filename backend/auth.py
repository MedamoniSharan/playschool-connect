import os
import json
import secrets
import boto3
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

region = os.environ.get("AWS_REGION", "ap-south-2")
dynamodb = boto3.resource("dynamodb", region_name=region)

users_table = dynamodb.Table("Playschool_Users")


def ensure_table_exists(table_name, key_schema, attribute_definitions):
    try:
        table = dynamodb.Table(table_name)
        table.table_status
        return table
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceNotFoundException":
            logger.info("Creating table %s...", table_name)
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=key_schema,
                AttributeDefinitions=attribute_definitions,
                BillingMode="PAY_PER_REQUEST",
            )
            table.meta.client.get_waiter("table_exists").wait(TableName=table_name)
            return table
        raise


branches_table = ensure_table_exists(
    "Playschool_Branches",
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


def list_branches_handler():
    """Public list of school branches / brands for login."""
    try:
        items = []
        scan_kwargs = {}
        while True:
            resp = branches_table.scan(**scan_kwargs)
            items.extend(resp.get("Items", []))
            lek = resp.get("LastEvaluatedKey")
            if not lek:
                break
            scan_kwargs["ExclusiveStartKey"] = lek
        items.sort(key=lambda b: (str(b.get("sortOrder", "")), str(b.get("name", ""))))
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"branches": items}),
        }
    except Exception as e:
        logger.error("list_branches error: %s", e)
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }


def _pick_user_for_branch(candidates, branch_id):
    """Teachers must match campus. Admins may sign in without a campus (all campuses). Parents need a campus for roster scoping."""
    admins = [u for u in candidates if u.get("role") == "admin"]
    teachers = [u for u in candidates if u.get("role") == "teacher"]
    parents = [u for u in candidates if u.get("role") == "parent"]

    if admins:
        if branch_id:
            for u in admins:
                if u.get("branchId") == branch_id:
                    return u
        # Any admin credential: optional campus or non-matching campus still grants access.
        admins.sort(key=lambda u: str(u.get("id", "")))
        return admins[0]

    if teachers:
        if not branch_id:
            return None
        for u in teachers:
            if u.get("branchId") == branch_id:
                return u
        return None

    if parents:
        if not branch_id:
            return None
        return parents[0]

    return candidates[0] if len(candidates) == 1 else None


def lambda_handler(event, context):
    if _http_method(event) == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        body = _parse_json_body(event)
        action = body.get("action")

        if action == "list_branches":
            return list_branches_handler()

        email = body.get("email")
        password = body.get("password")
        branch_id = (body.get("branchId") or "").strip() or None

        if not email or not password:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Email and password are required"}),
            }

        response = users_table.scan(
            FilterExpression="email = :e AND password = :p",
            ExpressionAttributeValues={":e": email, ":p": password},
        )
        candidates = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = users_table.scan(
                ExclusiveStartKey=response["LastEvaluatedKey"],
                FilterExpression="email = :e AND password = :p",
                ExpressionAttributeValues={":e": email, ":p": password},
            )
            candidates.extend(response.get("Items", []))

        user = _pick_user_for_branch(candidates, branch_id)
        if not user:
            return {
                "statusCode": 401,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Invalid credentials or no access to this campus"}),
            }

        user_safe = {k: v for k, v in user.items() if k != "password"}
        # Admins: omit session branch when signing in without a campus (full-network view).
        if user_safe.get("role") == "admin" and not branch_id:
            user_safe["sessionBranchId"] = None
        else:
            user_safe["sessionBranchId"] = branch_id

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps(
                {
                    "message": "Login successful",
                    "user": user_safe,
                    "token": secrets.token_urlsafe(32),
                }
            ),
        }
    except Exception as e:
        logger.error("Auth error: %s", e)
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }
