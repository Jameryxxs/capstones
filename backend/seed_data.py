import os
import django
import random
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Fish, Retailer, FishPrice, User, FishingLocation, SupplySource, Inventory, FishDelivery
from django.db.models import Avg, Sum

def generate_large_dataset():
    print("Starting large-scale data generation...")
    
    # 1. Ensure Admin User
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

    # 2. Fish Species with specific seasonal patterns (conceptual)
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
    ]
    
    fish_objs = []
    for name, cat, price in fish_data:
        fish, _ = Fish.objects.get_or_create(
            fish_name=name,
            defaults={'category': cat, 'average_price': price, 'status': 'Available'}
        )
        fish_objs.append(fish)

    # 3. Locations & Suppliers
    locations_data = [
        ('Tayabas Bay', 'Region IV-A', 'Quezon'),
        ('Lamon Bay', 'Region IV-A', 'Quezon'),
        ('Pagbilao Waters', 'Region IV-A', 'Quezon'),
        ('Batangas Coast', 'Region IV-A', 'Batangas'),
        ('Visayan Sea', 'Region VI', 'Iloilo'),
    ]
    
    supply_objs = []
    for loc_name, reg, prov in locations_data:
        loc, _ = FishingLocation.objects.get_or_create(
            location_name=loc_name,
            defaults={'region': reg, 'province': prov, 'latitude': 13.0, 'longitude': 121.0}
        )
        for i in range(3):
            supply, _ = SupplySource.objects.get_or_create(
                supplier_name=f"{loc_name} Supplier {i+1}",
                defaults={
                    'boat_name': f"F/B Venture {random.randint(100, 999)}",
                    'fishing_location': loc,
                    'contact_number': '09123456789',
                    'arrival_date': datetime.now().date()
                }
            )
            supply_objs.append(supply)

    # 4. Retailers
    retailer_objs = []
    for i in range(1, 11):
        r_user, _ = User.objects.get_or_create(username=f'retailer_user_{i}', defaults={'role': 'retailer'})
        retailer, _ = Retailer.objects.get_or_create(
            user=r_user,
            defaults={
                'business_name': f'Stall {i} Fresh Fish',
                'stall_number': f'A-{i}',
                'contact_number': '09987654321',
                'email': f'stall{i}@example.com',
                'address': 'Lucena Fish Port',
                'status': 'Active'
            }
        )
        retailer_objs.append(retailer)

    # 5. Historical Data Generation (Last 365 Days)
    print("Generating 1 year of historical data...")
    today = datetime.now().date()
    
    prices_to_create = []
    deliveries_to_create = []
    
    for day_offset in range(365):
        current_date = today - timedelta(days=day_offset)
        
        # Each day, some fish have deliveries and prices recorded
        active_fish_today = random.sample(fish_objs, random.randint(6, 10))
        
        for fish in active_fish_today:
            # 1. Simulate Supply (Deliveries)
            # Some days have high supply, some low
            supply_factor = 1.0 + 0.5 * random.uniform(-1, 1) # Random fluctuation
            # Add a "seasonal" effect (simple sine wave)
            seasonal_boost = 0.3 * (1 + random.uniform(-0.1, 0.1)) # Just a bit of noise
            
            qty = int(random.randint(200, 800) * supply_factor)
            
            delivery = FishDelivery(
                supply_source=random.choice(supply_objs),
                fish=fish,
                retailer=random.choice(retailer_objs),
                quantity=qty,
                delivery_date=current_date,
                delivery_status='delivered'
            )
            deliveries_to_create.append(delivery)
            
            # 2. Simulate Prices
            # Price often has an inverse relationship with supply
            # base price - (quantity deviation * factor)
            price_base = float(fish.average_price)
            # If quantity is high, price goes down slightly
            price_adj = (qty - 500) * 0.05 
            final_price = max(price_base - price_adj + random.uniform(-10, 10), 20)
            
            # Create price records for multiple retailers for this fish
            for _ in range(random.randint(2, 4)):
                price_rec = FishPrice(
                    fish=fish,
                    retailer=random.choice(retailer_objs),
                    price_per_kilo=round(final_price + random.uniform(-5, 5), 2),
                    quantity_available=random.randint(20, 100),
                    market_date=current_date,
                    created_by=user
                )
                prices_to_create.append(price_rec)

        if len(prices_to_create) > 1000:
            FishPrice.objects.bulk_create(prices_to_create)
            prices_to_create = []
            
        if len(deliveries_to_create) > 500:
            FishDelivery.objects.bulk_create(deliveries_to_create)
            deliveries_to_create = []
            
    # Final bulk create
    if prices_to_create:
        FishPrice.objects.bulk_create(prices_to_create)
    if deliveries_to_create:
        FishDelivery.objects.bulk_create(deliveries_to_create)

    print(f"Success! Generated data for 365 days.")

if __name__ == "__main__":
    # Clear existing data to avoid massive bloat if run multiple times during testing
    print("Clearing old price and delivery data...")
    FishPrice.objects.all().delete()
    FishDelivery.objects.all().delete()
    generate_large_dataset()
