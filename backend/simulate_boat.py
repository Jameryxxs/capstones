import os
import sys
import django
import time
import json
import urllib.request
import urllib.error

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import SupplySource

def post_json(url, payload, token=None):
    data = json.dumps(payload).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except urllib.error.URLError as e:
        return 0, str(e.reason)

def get_token():
    status_code, text = post_json('http://127.0.0.1:8000/api/auth/login/', {
        "username": "admin",
        "password": "admin123"
    })
    if status_code == 200:
        return json.loads(text).get('access')
    else:
        print(f"Failed to authenticate: {text}")
        return None

def simulate_boat():
    boat = SupplySource.objects.filter(status__in=['in_transit', 'at_sea']).first()
    
    if not boat:
        print("No active boats found. Creating a test boat...")
        from api.models import FishingLocation
        loc = FishingLocation.objects.first()
        from datetime import date
        boat = SupplySource.objects.create(
            supplier_name="Simulation Fleet",
            boat_name="MV Test Tracker",
            fishing_location=loc,
            status='in_transit',
            current_lat=13.6000,
            current_lng=121.7500,
            arrival_date=date.today()
        )
        
    print(f"Simulating movement for boat: {boat.boat_name} (ID: {boat.id})")
    
    target_lat = 13.90683
    target_lng = 121.62608
    
    curr_lat = 13.6000
    curr_lng = 121.7500
    
    print(f"Starting at: {curr_lat}, {curr_lng}")
    print(f"Moving towards Lucena Port: {target_lat}, {target_lng}")
    print("Check your Live Supply Map in the browser now! Press Ctrl+C to stop.\n")
    
    steps = 50
    d_lat = (target_lat - curr_lat) / steps
    d_lng = (target_lng - curr_lng) / steps
    
    token = get_token()
    if not token:
        print("Cannot start simulation without authentication.")
        return

    try:
        for i in range(steps):
            curr_lat += d_lat
            curr_lng += d_lng
            
            # Make an HTTP POST request to the web server using built-in urllib
            url = f"http://127.0.0.1:8000/api/supply-sources/{boat.id}/update_location/"
            payload = {
                "lat": curr_lat,
                "lng": curr_lng,
                "status": "in_transit"
            }
            
            status_code, text = post_json(url, payload, token)
            
            if status_code == 200:
                print(f"Step {i+1}/{steps} -> Lat: {curr_lat:.4f}, Lng: {curr_lng:.4f} (WebSocket event sent!)")
            elif status_code == 0:
                print(f"Failed to connect to server. Is python manage.py runserver running? Error: {text}")
            else:
                print(f"Step {i+1}/{steps} -> Error: {status_code} {text}")
                
            time.sleep(2)
            
        print("\nBoat has arrived at port!")
        post_json(f"http://127.0.0.1:8000/api/supply-sources/{boat.id}/update_location/", {"status": "docked"}, token)
        print("Status changed to 'docked'.")
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    simulate_boat()
