import json
import boto3
import os

region = os.environ.get('AWS_REGION', 'ap-south-2')
dynamodb = boto3.resource('dynamodb', region_name=region)

print("Loading seed data...")
with open('seed_data.json', 'r') as f:
    data = json.load(f)

def batch_write(table_name, items):
    table = dynamodb.Table(table_name)
    print(f"Writing {len(items)} items to {table_name}...")
    for item in items:
        try:
            table.put_item(Item=item)
        except Exception as e:
            print(f"Failed to put item into {table_name}:", e)
    print(f"Finished {table_name}.")

# Users
batch_write('Playschool_Users', data.get('users', []))

# Students
batch_write('Playschool_Students', data.get('students', []))

# Classes
batch_write('Playschool_Classes', data.get('classes', []))

# Curriculum (needs a bit of mapping if it has no hash key or if 'classId' is the hash key)
# Assuming 'classId' is the hash key for Playschool_Curriculum
batch_write('Playschool_Curriculum', data.get('curriculum', []))

# Lessons (has both lessonProgress and lessonPlans -> in our db we dump both into Playschool_Lessons with 'id' as hash)
lessons_data = data.get('lessonProgress', []) + data.get('lessonPlans', [])
batch_write('Playschool_Lessons', lessons_data)

# Reports
batch_write('Playschool_Reports', data.get('studentReports', []))

print("Seeding complete!")
