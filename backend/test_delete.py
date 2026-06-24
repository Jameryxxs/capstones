import urllib.request
import json
import random

def test_delete():
    base_url = "http://127.0.0.1:8000/api"
    
    # 1. Login as an existing retailer
    login_data = json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/auth/login/", data=login_data, headers={'Content-Type': 'application/json'})
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            token = res_data.get('access')
    except Exception as e:
        print("Login failed:", e)
        return
        
    headers = {"Authorization": f"Bearer {token}", 'Content-Type': 'application/json'}
    
    # 2. Get all prices
    req2 = urllib.request.Request(f"{base_url}/fish-prices/", headers={"Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req2) as response:
            prices = json.loads(response.read().decode())
    except Exception as e:
        print("Failed to get prices:", e)
        return
        
    if not prices:
        print("No prices found to delete.")
        return
        
    # Get the ID of the last one just to be safe
    target_id = prices[-1]['id']
    
    # 3. Delete Price
    print(f"Trying to delete price ID {target_id}")
    req4 = urllib.request.Request(f"{base_url}/fish-prices/{target_id}/", headers=headers, method='DELETE')
    try:
        with urllib.request.urlopen(req4) as response:
            print("Delete status code:", response.status)
    except urllib.error.HTTPError as e:
        print("Delete error code:", e.code)
        print("Delete response:", e.read().decode())
    except Exception as e:
        print("Delete error:", e)

if __name__ == "__main__":
    test_delete()
