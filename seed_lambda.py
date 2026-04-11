import json
import boto3
import os

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

def batch_write(table_name, items):
    table = dynamodb.Table(table_name)
    print(f"Writing {len(items)} items to {table_name}...")
    for item in items:
        try:
            table.put_item(Item=item)
        except Exception as e:
            print(f"Failed to put item into {table_name}:", e)
    print(f"Finished {table_name}.")

def lambda_handler(event, context):
    try:
        # Event should be our massive JSON dict directly
        if 'users' in event:
            batch_write('Playschool_Users', event.get('users', []))
            batch_write('Playschool_Students', event.get('students', []))
            batch_write('Playschool_Classes', event.get('classes', []))
            batch_write('Playschool_Curriculum', event.get('curriculum', []))
            
            lessons_data = event.get('lessonProgress', []) + event.get('lessonPlans', [])
            batch_write('Playschool_Lessons', lessons_data)
            
            batch_write('Playschool_Reports', event.get('studentReports', []))
            
            return {
                "statusCode": 200,
                "body": "Database seeded successfully!"
            }
        else:
            return {
                "statusCode": 400,
                "body": "Please paste the seed_data.json directly into the Test Event"
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": f"Error: {str(e)}"
        }
