import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import SupplySource

def fix_data():
    boats = SupplySource.objects.all()
    print(f"Found {boats.count()} boats. Fixing data...")
    
    fixed = 0
    for boat in boats:
        if boat.fishing_location and boat.fishing_location.latitude and boat.fishing_location.longitude:
            base_lat = float(boat.fishing_location.latitude)
            base_lng = float(boat.fishing_location.longitude)
            
            # Add a random offset so they don't stack completely
            boat.current_lat = base_lat + random.uniform(-0.05, 0.05)
            boat.current_lng = base_lng + random.uniform(-0.05, 0.05)
            
            # Randomly set status to at_sea or in_transit so tracking simulation works
            boat.status = random.choice(['at_sea', 'at_sea', 'in_transit'])
            boat.save()
            fixed += 1
        else:
            print(f"Warning: Boat {boat.id} has no valid fishing location.")
            
    print(f"Successfully fixed and randomized coordinates for {fixed} boats.")

if __name__ == '__main__':
    fix_data()
