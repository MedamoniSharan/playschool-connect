import json
import boto3
import os

region = os.environ.get("AWS_REGION", "ap-south-2")
dynamodb = boto3.resource("dynamodb", region_name=region)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def batch_write(table_name, items):
    table = dynamodb.Table(table_name)
    print(f"Writing {len(items)} items to {table_name}...")
    for item in items:
        try:
            table.put_item(Item=item)
        except Exception as e:
            print(f"Failed to put item into {table_name}:", e)
    print(f"Finished {table_name}.")


def _payload_from_event(event):
    """Support Lambda console test (flat dict) and API Gateway (body string/object)."""
    if not isinstance(event, dict):
        return {}
    if "users" in event and "requestContext" not in event:
        return event
    body = event.get("body")
    if body is None:
        return {}
    if isinstance(body, str):
        if not body.strip():
            return {}
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}
    if isinstance(body, dict):
        return body
    return {}


def lambda_handler(event, context):
    http_method = (
        event.get("httpMethod")
        or (event.get("requestContext") or {}).get("http", {}).get("method")
        or ""
    ).upper()

    if http_method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    try:
        payload = _payload_from_event(event)
        if "users" not in payload:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps(
                    {"error": "Expected JSON body with users, students, classes, etc. (see seed_data.json)"}
                ),
            }

        batch_write("Playschool_Branches", payload.get("branches", []))
        batch_write("Playschool_Users", payload.get("users", []))
        batch_write("Playschool_Students", payload.get("students", []))
        batch_write("Playschool_Classes", payload.get("classes", []))
        batch_write("Playschool_Curriculum", payload.get("curriculum", []))

        lessons_data = payload.get("lessonProgress", []) + payload.get("lessonPlans", [])
        batch_write("Playschool_Lessons", lessons_data)

        batch_write("Playschool_Reports", payload.get("studentReports", []))

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "Database seeded successfully"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)}),
        }
