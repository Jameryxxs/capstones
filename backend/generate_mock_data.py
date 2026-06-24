import os
import django
import random
from datetime import timedelta, date
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, FishDelivery, Inventory
)

def generate_mock_data():
    print("Deleting old mock data...")
    FishPrice.objects.all().delete()
    FishDelivery.objects.all().delete()
    Inventory.objects.all().delete()
    SupplySource.objects.all().delete()
    FishingLocation.objects.all().delete()
    Retailer.objects.all().delete()
    Fish.objects.all().delete()
    User.objects.exclude(username='admin').delete()
    
    print("Creating Fishing Locations...")
    locations = [
        {"name": "Tayabas Bay", "region": "Region IV-A", "province": "Quezon", "lat": 13.8, "lng": 121.6},
        {"name": "Lamon Bay", "region": "Region IV-A", "province": "Quezon", "lat": 14.1, "lng": 122.0},
        {"name": "Ragay Gulf", "region": "Region V", "province": "Camarines Sur", "lat": 13.7, "lng": 122.7},
        {"name": "Sibuyan Sea", "region": "Region IV-B", "province": "Romblon", "lat": 12.8, "lng": 122.5},
    ]
    loc_objs = []
    for loc in locations:
        loc_objs.append(FishingLocation.objects.create(
            location_name=loc['name'], region=loc['region'], province=loc['province'],
            latitude=loc['lat'], longitude=loc['lng'], description=f"Major fishing ground in {loc['province']}"
        ))

    print("Creating Fishes...")
    fishes_data = [
        {"name": "Galunggong (Round Scad)", "cat": "saltwater", "price": 180.00},
        {"name": "Bangus (Milkfish)", "cat": "freshwater", "price": 160.00},
        {"name": "Tilapia", "cat": "freshwater", "price": 130.00},
        {"name": "Tambakol (Yellowfin Tuna)", "cat": "saltwater", "price": 250.00},
        {"name": "Sapsap (Ponyfish)", "cat": "saltwater", "price": 200.00},
        {"name": "Alumahan (Mackerel)", "cat": "saltwater", "price": 220.00},
    ]
    fish_objs = []
    for fd in fishes_data:
        fish_objs.append(Fish.objects.create(
            fish_name=fd['name'], category=fd['cat'], average_price=fd['price'],
            description=f"Freshly caught {fd['name']}."
        ))

    print("Creating Retailers & Users...")
    retailer_objs = []
    for i in range(1, 11):
        user = User.objects.create_user(username=f'retailer{i}', password='password123', role='retailer')
        ret = Retailer.objects.create(
            user=user, business_name=f"Stall {i} Seafoods", stall_number=f"F{i:02d}",
            contact_number=f"091234567{i:02d}", email=f"retailer{i}@fishledger.com",
            address="Lucena Fish Port", latitude=13.9413, longitude=121.6212
        )
        retailer_objs.append(ret)

    print("Creating Supply Sources (Boats)...")
    boat_objs = []
    for i in range(1, 6):
        boat = SupplySource.objects.create(
            supplier_name=f"Supplier {i}", boat_name=f"F/B Venture {i}",
            fishing_location=random.choice(loc_objs), contact_number=f"099876543{i:02d}",
            status='at_sea', arrival_date=date.today()
        )
        boat_objs.append(boat)

    print("Generating 60 Days of Historical Data...")
    today = date.today()
    for days_ago in range(60, -1, -1):
        current_date = today - timedelta(days=days_ago)
        
        # Deliveries for this day
        for boat in boat_objs:
            if random.random() > 0.3: # 70% chance to deliver
                fish = random.choice(fish_objs)
                retailer = random.choice(retailer_objs)
                qty = random.randint(50, 500)
                FishDelivery.objects.create(
                    supply_source=boat, fish=fish, retailer=retailer,
                    quantity=qty, delivery_date=current_date, delivery_status='delivered'
                )

        # Retailer Price Logs for this day
        for fish in fish_objs:
            # Fluctuate base price slightly
            daily_base = float(fish.average_price) + random.uniform(-20, 20)
            
            for retailer in random.sample(retailer_objs, k=random.randint(3, 8)):
                qty_avail = random.randint(10, 100)
                price = round(daily_base + random.uniform(-10, 10), 2)
                
                FishPrice.objects.create(
                    fish=fish, retailer=retailer, price_per_kilo=price,
                    quantity_available=qty_avail, market_date=current_date,
                    origin=random.choice(loc_objs).location_name
                )
                
                # Update inventory if it's today
                if days_ago == 0:
                    Inventory.objects.create(
                        fish=fish, retailer=retailer, stock_quantity=qty_avail
                    )
                    
    print("Mock Data Generation Complete!")

if __name__ == '__main__':
    generate_mock_data()
