import os
import django
import random
import math
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import (
    Fish, Retailer, FishPrice, User, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Bulletin
)
from django.db.models import Avg, Sum

def generate_production_dataset():
    print("🚀 Starting large-scale production data generation...")
    
    # 1. Ensure Admin User
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

    # 2. Fish Species (Expanded List)
    print("🐟 Seeding fish species...")
    fish_data = [
        ('Tilapia', 'freshwater', 120),
        ('Bangus', 'freshwater', 160),
        ('Galunggong', 'saltwater', 210),
        ('Tambakol', 'saltwater', 190),
        ('Lapu-lapu', 'saltwater', 480),
        ('Maya-maya', 'saltwater', 400),
        ('Alumahan', 'saltwater', 180),
        ('Matangbaka', 'saltwater', 230),
        ('Sapsap', 'saltwater', 140),
        ('Tunsoy', 'saltwater', 110),
        ('Pusit', 'saltwater', 350),
        ('Hipon', 'saltwater', 450),
        ('Sapsap', 'saltwater', 150),
        ('Tuna', 'saltwater', 300),
        ('Salmon', 'saltwater', 550),
        ('Dilis', 'saltwater', 100),
        ('Bisugo', 'saltwater', 220),
        ('Espada', 'saltwater', 280),
        ('Maya-maya', 'saltwater', 420),
    ]
    
    fish_objs = []
    for name, cat, price in fish_data:
        fish, _ = Fish.objects.get_or_create(
            fish_name=name,
            defaults={'category': cat, 'average_price': price, 'status': 'Available'}
        )
        fish_objs.append(fish)

    # 3. Locations & Suppliers
    print("📍 Seeding locations and suppliers...")
    locations_data = [
        ('Panukulan', 'CALABARZON', 'Quezon', 14.8333, 121.8167),
        ('Infanta', 'CALABARZON', 'Quezon', 14.7333, 121.6500),
        ('Atimonan', 'CALABARZON', 'Quezon', 14.0000, 121.9167),
        ('Sariaya', 'CALABARZON', 'Quezon', 13.9667, 121.5333),
        ('Real', 'CALABARZON', 'Quezon', 14.6667, 121.6000),
        ('Dolores', 'CALABARZON', 'Quezon', 14.0167, 121.4333),
    ]
    
    supply_objs = []
    for loc_name, reg, prov, lat, lng in locations_data:
        loc, _ = FishingLocation.objects.get_or_create(
            location_name=loc_name,
            defaults={'region': reg, 'province': prov, 'latitude': lat, 'longitude': lng}
        )
        for i in range(4):
            supply, _ = SupplySource.objects.get_or_create(
                supplier_name=f"{loc_name} Vessel {i+1}",
                defaults={
                    'boat_name': f"F/B {loc_name[:3].upper()}-{random.randint(1000, 9999)}",
                    'fishing_location': loc,
                    'contact_number': f'09{random.randint(100000000, 999999999)}',
                    'arrival_date': datetime.now().date(),
                    'status': random.choice(['at_sea', 'in_transit', 'docked']),
                    'current_lat': lat + random.uniform(-0.1, 0.1),
                    'current_lng': lng + random.uniform(-0.1, 0.1)
                }
            )
            supply_objs.append(supply)

    # 4. Retailers (Increased to 20)
    print("🏪 Seeding 20 retailers...")
    retailer_objs = []
    for i in range(1, 21):
        username = f'retailer_{i}'
        r_user, _ = User.objects.get_or_create(username=username, defaults={'role': 'retailer'})
        if _ : r_user.set_password('retailer123'); r_user.save()
        
        retailer, _ = Retailer.objects.get_or_create(
            user=r_user,
            defaults={
                'business_name': f'Stall {i} - {random.choice(["Premium", "Fresh", "Daily", "Ocean"])} Fish',
                'stall_number': f'ST-{i:03d}',
                'contact_number': f'09{random.randint(100000000, 999999999)}',
                'email': f'retailer{i}@fishledger.com',
                'address': 'Lucena Fish Port Complex',
                'status': 'Active'
            }
        )
        retailer_objs.append(retailer)

    # 5. Historical Data Generation (Last 400 Days)
    print("📅 Generating 400 days of intelligent historical data...")
    today = datetime.now().date()
    
    prices_to_create = []
    deliveries_to_create = []
    inventory_to_create = []
    
    origins = [loc[0] for loc in locations_data] + ['General Luna', 'Polillo Island', 'Baler']

    for day_offset in range(400, -1, -1):
        current_date = today - timedelta(days=day_offset)
        day_of_week = current_date.weekday() # 0=Mon, 6=Sun
        
        # Seasonality (Sine wave over the year)
        seasonality = math.sin(2 * math.pi * (day_offset % 365) / 365)
        
        # Each day, most fish have activity
        active_fish_today = random.sample(fish_objs, random.randint(12, len(fish_objs)))
        
        for fish in active_fish_today:
            # 1. Simulate Deliveries
            # Higher supply on weekends or specific seasons
            base_qty = random.randint(300, 1000)
            weekend_boost = 1.2 if day_of_week >= 4 else 1.0 # Thur-Sun boost
            season_boost = 1.0 + (0.3 * seasonality)
            
            qty_total = int(base_qty * weekend_boost * season_boost)
            
            # Split delivery among a few retailers
            for _ in range(random.randint(1, 3)):
                delivery = FishDelivery(
                    supply_source=random.choice(supply_objs),
                    fish=fish,
                    retailer=random.choice(retailer_objs),
                    quantity=int(qty_total / 2),
                    delivery_date=current_date,
                    delivery_status='delivered'
                )
                deliveries_to_create.append(delivery)
            
            # 2. Simulate Prices
            # Price inverse to supply + seasonality + weekend demand
            price_base = float(fish.average_price)
            supply_effect = (qty_total - 600) * 0.08
            weekend_demand = 1.1 if day_of_week >= 5 else 1.0 # Sat-Sun demand increase
            
            calculated_price = (price_base - supply_effect) * weekend_demand * (1.0 - 0.1 * seasonality)
            final_price = max(calculated_price + random.uniform(-15, 15), 30)

            # Ensure every retailer has some data regularly
            # Every retailer records at least 2-4 fish prices daily
            sampled_retailers = random.sample(retailer_objs, random.randint(10, 20))
            for retailer in sampled_retailers:
                price_rec = FishPrice(
                    fish=fish,
                    retailer=retailer,
                    price_per_kilo=round(final_price + random.uniform(-10, 10), 2),
                    quantity_available=random.randint(10, 200),
                    market_date=current_date,
                    origin=random.choice(origins),
                    created_by=user
                )
                prices_to_create.append(price_rec)

        # Periodic Bulk Creation to save memory
        if len(prices_to_create) > 2000:
            FishPrice.objects.bulk_create(prices_to_create)
            prices_to_create = []
            print(f"  ... seeded up to {current_date}")
            
        if len(deliveries_to_create) > 1000:
            FishDelivery.objects.bulk_create(deliveries_to_create)
            deliveries_to_create = []
            
    # Final bulk create
    if prices_to_create:
        FishPrice.objects.bulk_create(prices_to_create)
    if deliveries_to_create:
        FishDelivery.objects.bulk_create(deliveries_to_create)

    # 6. Inventory Snapshot (Current)
    print("📦 Creating current inventory snapshots...")
    Inventory.objects.all().delete()
    for retailer in retailer_objs:
        for fish in random.sample(fish_objs, 5):
            Inventory.objects.create(
                fish=fish,
                retailer=retailer,
                stock_quantity=random.randint(50, 500),
                availability_status='Available'
            )

    print(f"✨ SUCCESS! Generated robust production dataset for {len(retailer_objs)} retailers over 400 days.")

if __name__ == "__main__":
    # Clear existing data
    print("🧹 Cleaning database...")
    FishPrice.objects.all().delete()
    FishDelivery.objects.all().delete()
    
    generate_production_dataset()
    
    # Run monitoring seed for GPS data
    from seed_monitoring import seed_monitoring_data
    seed_monitoring_data()
