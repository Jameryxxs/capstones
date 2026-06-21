import time
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api"
LUCENA_LAT = 13.9333
LUCENA_LNG = 121.6167

def login():
    url = f"{BASE_URL}/auth/login/"
    data = json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            return res_data.get('access')
    except Exception as e:
        print("Login failed:", e)
        return None

def get_boats():
    url = f"{BASE_URL}/map-data/"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            return res_data.get('boats', [])
    except Exception as e:
        print("Failed to get boats:", e)
        return []

def update_location(boat_id, lat, lng, status, token):
    url = f"{BASE_URL}/supply-sources/{boat_id}/update_location/"
    data = json.dumps({"lat": lat, "lng": lng, "status": status}).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            pass # Success
    except urllib.error.HTTPError as e:
        print(f"Failed to update boat {boat_id}: {e.code} {e.reason}")
        print(e.read().decode())
    except Exception as e:
        print(f"Failed to update boat {boat_id}:", e)

def simulate():
    print("Logging into Django server...")
    token = login()
    if not token:
        print("Cannot run simulation without authentication.")
        return
        
    print("Fetching active boats from server...")
    boats = get_boats()
    if not boats:
        print("No active boats found.")
        return
        
    print(f"Tracking {len(boats)} boats...")
    
    try:
        while True:
            for boat in boats:
                if boat['status'] == 'docked':
                    continue
                    
                lat_diff = LUCENA_LAT - boat['lat']
                lng_diff = LUCENA_LNG - boat['lng']
                
                if abs(lat_diff) < 0.005 and abs(lng_diff) < 0.005:
                    boat['status'] = 'docked'
                    boat['lat'] = LUCENA_LAT
                    boat['lng'] = LUCENA_LNG
                    print(f"Boat {boat['id']} arrived at port!")
                else:
                    step = 0.02
                    boat['lat'] += (step if lat_diff > 0 else -step)
                    boat['lng'] += (step if lng_diff > 0 else -step)
                
                # Send HTTP POST to server
                update_location(boat['id'], boat['lat'], boat['lng'], boat['status'], token)
                print(f"Updated Boat {boat['id']} -> {boat['lat']:.4f}, {boat['lng']:.4f}")
                
            time.sleep(2)
    except KeyboardInterrupt:
        print("Simulation stopped.")

if __name__ == '__main__':
    simulate()
