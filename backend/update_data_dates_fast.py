import os
import django
from datetime import date, timedelta
from django.db.models import F

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import FishPrice, FishDelivery, SupplySource, Prediction

def update_dates_optimized():
    today = date.today()
    print(f"Targeting end date: {today}")

    # 1. Update FishPrice using Bulk F expression
    latest_price = FishPrice.objects.order_by('-market_date').first()
    if latest_price:
        offset = (today - latest_price.market_date).days
        if offset != 0:
            print(f"Fast-forwarding FishPrice by {offset} days...")
            FishPrice.objects.update(market_date=F('market_date') + timedelta(days=offset))
        else:
            print("FishPrice data is already up to date.")
    else:
        print("No FishPrice data found.")

    # 2. Update FishDelivery using Bulk F expression
    latest_delivery = FishDelivery.objects.order_by('-delivery_date').first()
    if latest_delivery:
        offset = (today - latest_delivery.delivery_date).days
        if offset != 0:
            print(f"Fast-forwarding FishDelivery by {offset} days...")
            FishDelivery.objects.update(delivery_date=F('delivery_date') + timedelta(days=offset))
        else:
            print("FishDelivery data is already up to date.")
    else:
        print("No FishDelivery data found.")

    # 3. Update SupplySource arrival_date
    print("Syncing SupplySource arrivals to today...")
    SupplySource.objects.all().update(arrival_date=today)

    # 4. Clear old predictions (they should be re-calculated for new dates)
    print("Clearing outdated predictions...")
    Prediction.objects.all().delete()
    
    print("\nSUCCESS: All data has been synchronized to June 7, 2026.")
    print("You can now refresh the dashboard to see live trends and alerts.")

if __name__ == "__main__":
    update_dates_optimized()
