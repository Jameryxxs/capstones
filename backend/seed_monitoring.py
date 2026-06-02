import os
import django
import random
from datetime import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import FishingLocation, SupplySource

def seed_monitoring_data():
    print("Seeding Live Monitoring data...")
    
    # 1. Update Fishing Locations with realistic GPS
    locations = [
        ('Tayabas Bay', 13.8500, 121.6000),
        ('Lamon Bay', 14.1500, 122.0500),
        ('Pagbilao Waters', 13.9100, 121.7200),
        ('Batangas Coast', 13.7500, 121.0500),
        ('Visayan Sea', 11.5000, 123.5000),
    ]
    
    port_lat = 13.9413
    port_lng = 121.6212
    
    for name, lat, lng in locations:
        loc = FishingLocation.objects.filter(location_name=name).first()
        if loc:
            loc.latitude = lat
            loc.longitude = lng
            loc.save()
            print(f"Updated {name} coordinates.")
            
            # Create/Update 2 active boats for each location
            # One 'at_sea', one 'in_transit'
            
            # At Sea (Near the fishing ground)
            boat1, _ = SupplySource.objects.get_or_create(
                boat_name=f"F/B Explorer {random.randint(100, 999)}",
                defaults={
                    'supplier_name': f"{name} Seafarer A",
                    'fishing_location': loc,
                    'contact_number': '09000000001',
                    'arrival_date': datetime.now().date(),
                    'status': 'at_sea',
                    'current_lat': lat + random.uniform(-0.05, 0.05),
                    'current_lng': lng + random.uniform(-0.05, 0.05)
                }
            )
            boat1.status = 'at_sea'
            boat1.current_lat = lat + random.uniform(-0.05, 0.05)
            boat1.current_lng = lng + random.uniform(-0.05, 0.05)
            boat1.save()
            
            # In Transit (Somewhere between the fishing ground and the port)
            # Midpoint calculation with some noise
            mid_lat = (lat + port_lat) / 2
            mid_lng = (lng + port_lng) / 2
            
            boat2, _ = SupplySource.objects.get_or_create(
                boat_name=f"F/B Voyager {random.randint(100, 999)}",
                defaults={
                    'supplier_name': f"{name} Seafarer B",
                    'fishing_location': loc,
                    'contact_number': '09000000002',
                    'arrival_date': datetime.now().date(),
                    'status': 'in_transit',
                    'current_lat': mid_lat + random.uniform(-0.02, 0.02),
                    'current_lng': mid_lng + random.uniform(-0.02, 0.02)
                }
            )
            boat2.status = 'in_transit'
            boat2.current_lat = mid_lat + random.uniform(-0.02, 0.02)
            boat2.current_lng = mid_lng + random.uniform(-0.02, 0.02)
            boat2.save()

    print("Live Monitoring data seeded successfully!")

if __name__ == "__main__":
    seed_monitoring_data()
