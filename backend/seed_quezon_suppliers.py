import os
import django
import random
from datetime import date, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import FishingLocation, SupplySource

# Quezon Province Top Fishing Municipalities with approximate coordinates
QUEZON_LOCATIONS = [
    {"name": "Lucena City (Dalahican)", "lat": 13.9333, "lng": 121.6167, "desc": "Major bagsakan and commercial port center."},
    {"name": "Pagbilao", "lat": 13.9667, "lng": 121.7000, "desc": "Rich coastal resources and aquaculture."},
    {"name": "Polillo", "lat": 14.7167, "lng": 121.9333, "desc": "Island municipality, major source of fresh marine catch."},
    {"name": "Panukulan", "lat": 14.8333, "lng": 121.8167, "desc": "Island municipality with active Community Fish Landing Center."},
    {"name": "Infanta", "lat": 14.7333, "lng": 121.6500, "desc": "Northern Quezon gateway for fishing activities."},
    {"name": "Atimonan", "lat": 14.0000, "lng": 121.9167, "desc": "Coastal town along Lamon Bay."},
    {"name": "Sariaya", "lat": 13.9667, "lng": 121.5333, "desc": "Coastal community relying heavily on Tayabas Bay."},
    {"name": "Real", "lat": 14.6667, "lng": 121.6000, "desc": "Destination for diverse marine catch in northern Quezon."},
    {"name": "Dolores", "lat": 14.0167, "lng": 121.4333, "desc": "Inland municipality known for freshwater aquaculture (Tilapia, Hito)."}
]

SUPPLIER_PREFIXES = ["Fisherfolk Coop", "Coastal Ventures", "Deep Sea Trawlers", "Marine Traders", "Aquaculture Inc."]

def seed():
    print("Seeding Quezon Province Municipalities...")
    
    locations_created = 0
    suppliers_created = 0
    
    for loc_data in QUEZON_LOCATIONS:
        # Get or create Fishing Location
        location, created = FishingLocation.objects.get_or_create(
            location_name=loc_data["name"],
            defaults={
                "region": "CALABARZON",
                "province": "Quezon",
                "latitude": loc_data["lat"],
                "longitude": loc_data["lng"],
                "description": loc_data["desc"]
            }
        )
        if created:
            locations_created += 1
            print(f"Created location: {location.location_name}")
        
        # Create 2 suppliers for each location if they don't have any yet
        existing_suppliers = SupplySource.objects.filter(fishing_location=location).count()
        if existing_suppliers == 0:
            for i in range(2):
                supplier_name = f"{loc_data['name'].split(' ')[0]} {random.choice(SUPPLIER_PREFIXES)}"
                boat_name = f"MV {loc_data['name'].split(' ')[0]} Star {i+1}"
                
                # Randomize status
                status = random.choice(['at_sea', 'in_transit', 'docked'])
                
                # If at sea or in transit, offset the coordinates slightly from the port
                current_lat = location.latitude
                current_lng = location.longitude
                
                if status != 'docked':
                    # Random offset between -0.05 and +0.05 degrees (approx 5km)
                    current_lat = float(location.latitude) + random.uniform(-0.05, 0.05)
                    current_lng = float(location.longitude) + random.uniform(-0.05, 0.05)
                
                SupplySource.objects.create(
                    supplier_name=supplier_name,
                    boat_name=boat_name,
                    fishing_location=location,
                    contact_number=f"09{random.randint(100000000, 999999999)}",
                    status=status,
                    current_lat=current_lat,
                    current_lng=current_lng,
                    arrival_date=date.today() + timedelta(days=random.randint(0, 3))
                )
                suppliers_created += 1
                
    print(f"\nSeeding Complete!")
    print(f"Locations created: {locations_created}")
    print(f"Suppliers created: {suppliers_created}")

if __name__ == '__main__':
    seed()
