import os
import django
import random

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Retailer, Inventory, Fish

PORT_LAT = 13.9413
PORT_LNG = 121.6212

def seed_coords():
    print("📍 Seeding Retailer Coordinates & Inventory for Custom Map...")
    retailers = Retailer.objects.all()
    fish_objs = list(Fish.objects.all())
    
    if not retailers.exists():
        print("❌ No retailers found. Please run seed_data.py first.")
        return
    
    if not fish_objs:
        print("❌ No fish found. Please run seed_data.py first.")
        return

    # Image space is 1000x1000. Let's distribute stalls in a readable pattern.
    for i, retailer in enumerate(retailers):
        # Create rows and columns in the 200-800 range to keep them centered
        row = i // 5
        col = i % 5
        
        # Leaflet [y, x] for CRS.Simple
        # Mapping them across the image reference space
        retailer.latitude = 800 - (row * 150) # Y coordinate
        retailer.longitude = 200 + (col * 150) # X coordinate
        retailer.save()
        
        print(f"✅ Updated {retailer.business_name} -> Y: {retailer.latitude}, X: {retailer.longitude}")

        # Seed some inventory for this retailer if they don't have any
        if not Inventory.objects.filter(retailer=retailer).exists():
            # Add 2-4 random fish to inventory
            selected_fish = random.sample(fish_objs, min(len(fish_objs), random.randint(2, 4)))
            for fish in selected_fish:
                Inventory.objects.create(
                    fish=fish,
                    retailer=retailer,
                    stock_quantity=random.randint(50, 200),
                    stock_unit='kg',
                    availability_status='Available'
                )
            print(f"   📦 Seeded inventory for {retailer.business_name}")

    print("Success! Retailers now have coordinates and inventory.")

if __name__ == "__main__":
    seed_coords()
