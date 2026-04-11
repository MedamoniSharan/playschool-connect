import json
import requests

# The endpoint provided by the user
ENDPOINT_URL = "https://7s0thxe2lj.execute-api.ap-south-2.amazonaws.com/default/seed_data"

def load_seed_data():
    try:
        print("Reading seed_data.json...")
        with open('seed_data.json', 'r') as f:
            data = json.load(f)
        
        print(f"Sending data to {ENDPOINT_URL}...")
        # seed_lambda.py expects the raw JSON body
        response = requests.post(ENDPOINT_URL, json=data)
        
        if response.status_code == 200:
            print("\n✅ Success!")
            print("Response:", response.text)
        else:
            print(f"\n❌ Failed (Status Code: {response.status_code})")
            print("Response:", response.text)
            
    except FileNotFoundError:
        print("❌ Error: seed_data.json not found.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    load_seed_data()
