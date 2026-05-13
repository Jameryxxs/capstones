import random
from datetime import datetime, timedelta
from api.models import Fish, Retailer, FishPrice, User, FishingLocation, SupplySource, Inventory
from django.utils import timezone

def generate_data():
    # 1. Ensure we have a user
    user = User.objects.first()
    if not user:
        user = User.objects.create_superuser('admin2', 'admin2@example.com', 'admin123')

    # 2. Create Fish Species
    fish_species = [
        ('Tilapia', 'Freshwater', 120),
        ('Bangus', 'Freshwater', 160),
        ('Galunggong', 'Saltwater', 220),
        ('Tambakol', 'Saltwater', 180),
        ('Lapu-lapu', 'Saltwater', 450),
        ('Maya-maya', 'Saltwater', 380),
        ('Alumahan', 'Saltwater', 200),
        ('Matangbaka', 'Saltwater', 240),
        ('Sapsap', 'Saltwater', 150),
        ('Tunsoy', 'Saltwater', 100),
    ]
    
    fish_objs = []
    for name, cat, price in fish_species:
        fish, created = Fish.objects.get_or_create(
            fish_name=name,
            defaults={
                'category': cat.lower(),
                'average_price': price,
                'status': 'Available'
            }
        )
        fish_objs.append(fish)

    # 3. Create Retailers
    retailer_names = ['Ocean Fresh', 'Lucena Bay Side', 'Market Master', 'Fisherman\'s Choice', 'Daily Catch']
    retailer_objs = []
    for i, name in enumerate(retailer_names):
        # Create a user for each retailer
        r_user, _ = User.objects.get_or_create(username=f'retailer_{i}', defaults={'role': 'retailer'})
        retailer, created = Retailer.objects.get_or_create(
            user=r_user,
            defaults={
                'business_name': name,
                'stall_number': f'Stall-{random.randint(1, 50)}',
                'contact_number': f'0917{random.randint(1000000, 9999999)}',
                'email': f'contact@{name.lower().replace(" ", "")}.com',
                'address': 'Lucena Fish Port Complex',
                'status': 'Active'
            }
        )
        retailer_objs.append(retailer)

    # 4. Create 1000 FishPrice records over the last 60 days
    start_date = datetime.now().date() - timedelta(days=60)
    
    print(f"Generating 1000 price records...")
    for _ in range(1000):
        fish = random.choice(fish_objs)
        retailer = random.choice(retailer_objs)
        
        # Add random variation to price based on base price
        base = float(fish.average_price)
        price_val = base + random.uniform(-20, 20)
        
        # Random date in the last 60 days
        days_ago = random.randint(0, 60)
        market_date = datetime.now().date() - timedelta(days=days_ago)
        
        FishPrice.objects.create(
            fish=fish,
            retailer=retailer,
            price_per_kilo=round(price_val, 2),
            quantity_available=random.randint(50, 500),
            market_date=market_date,
            created_by=user,
            remarks="Automatically generated test data"
        )

    # 5. Create Fishing Locations and Supply Sources
    locations = [
        ('Tayabas Bay', 'Region IV-A', 'Quezon', 13.8500, 121.7500, 'Major fishing ground in the south.'),
        ('Lamon Bay', 'Region IV-A', 'Quezon', 14.2500, 122.2000, 'Known for abundant saltwater species.'),
        ('Pagbilao Waters', 'Region IV-A', 'Quezon', 13.9667, 121.7333, 'Proximity to Lucena Port.'),
        ('Batangas Coast', 'Region IV-A', 'Batangas', 13.7500, 121.0500, 'Occasional source for high-end species.')
    ]
    
    for name, reg, prov, lat, lon, desc in locations:
        loc, _ = FishingLocation.objects.get_or_create(
            location_name=name,
            defaults={'region': reg, 'province': prov, 'latitude': lat, 'longitude': lon, 'description': desc}
        )
        
        # Create a few suppliers for each location
        for j in range(2):
            SupplySource.objects.get_or_create(
                supplier_name=f"Supplier {name} {j+1}",
                defaults={
                    'boat_name': f"F/B {random.choice(['Ocean Queen', 'Sea Spirit', 'Blue Wave', 'Morning Star'])} {random.randint(1, 99)}",
                    'fishing_location': loc,
                    'contact_number': f'0917{random.randint(1000000, 9999999)}',
                    'arrival_date': datetime.now().date()
                }
            )

    # 6. Create Initial Inventory for each retailer
    print("Generating inventory for stalls...")
    for retailer in retailer_objs:
        # Clear existing inventory to avoid duplicates if run multiple times
        Inventory.objects.filter(retailer=retailer).delete()
        
        # Give each retailer 5-8 random fish species in their stall
        sample_fish = random.sample(fish_objs, random.randint(5, 8))
        for fish in sample_fish:
            Inventory.objects.create(
                fish=fish,
                retailer=retailer,
                stock_quantity=random.randint(10, 100),
                stock_unit='kg',
                availability_status='Available'
            )

    print("Success! 1000 records, locations, suppliers, and inventory added.")

if __name__ == "__main__":
    generate_data()
