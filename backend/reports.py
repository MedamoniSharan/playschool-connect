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

# Initialize table — direct reference for fast cold start
reports_table = dynamodb.Table('Playschool_Reports')

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
