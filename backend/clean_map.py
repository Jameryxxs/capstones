import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import SupplySource

def clean_map():
    # Find all active boats
    active_boats = SupplySource.objects.filter(status__in=['in_transit', 'at_sea'])
    
    count = 0
    for boat in active_boats:
        # We will change their status to 'docked' so they disappear from the live map
        boat.status = 'docked'
        boat.save()
        count += 1
        
    print(f"Successfully cleaned up {count} ghost boats from the map.")

if __name__ == "__main__":
    clean_map()
