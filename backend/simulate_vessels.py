import os
import django
import time
import random
from datetime import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import SupplySource

PORT_LAT = 13.9413
PORT_LNG = 121.6212
SPEED = 0.005 # Movement per step

def simulate():
    print("🚢 Vessel Tracking Simulation Started...")
    print("Press Ctrl+C to stop.")
    
    try:
        while True:
            boats = SupplySource.objects.filter(status='in_transit')
            
            if not boats.exists():
                print("No boats in transit. Seeding some...")
                # Call seeding logic or just wait
                time.sleep(5)
                continue

            for boat in boats:
                # Calculate direction
                lat_diff = PORT_LAT - float(boat.current_lat)
                lng_diff = PORT_LNG - float(boat.current_lng)
                
                # Normalize and move
                dist = (lat_diff**2 + lng_diff**2)**0.5
                if dist < SPEED:
                    boat.current_lat = PORT_LAT
                    boat.current_lng = PORT_LNG
                    boat.status = 'docked'
                    print(f"✅ {boat.boat_name} has ARRIVED at the port.")
                else:
                    boat.current_lat = float(boat.current_lat) + (lat_diff / dist) * SPEED
                    boat.current_lng = float(boat.current_lng) + (lng_diff / dist) * SPEED
                    print(f"🚢 {boat.boat_name} is moving... ({boat.current_lat:.4f}, {boat.current_lng:.4f})")
                
                boat.save() # This triggers the broadcast signal
            
            time.sleep(2) # Update every 2 seconds
            
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    simulate()
