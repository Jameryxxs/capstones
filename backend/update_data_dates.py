import os
import django
from datetime import date, timedelta

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import FishPrice, FishDelivery, SupplySource, Bulletin, Prediction

def update_dates():
    today = date(2026, 6, 7)
    print(f"Targeting end date: {today}")

    # 1. Update FishPrice
    latest_price = FishPrice.objects.order_by('-market_date').first()
    if latest_price:
        offset = (today - latest_price.market_date).days
        print(f"Shifting FishPrice by {offset} days...")
        for price in FishPrice.objects.all():
            price.market_date += timedelta(days=offset)
            price.save()
    else:
        print("No FishPrice data found to shift.")

    # 2. Update FishDelivery
    latest_delivery = FishDelivery.objects.order_by('-delivery_date').first()
    if latest_delivery:
        offset = (today - latest_delivery.delivery_date).days
        print(f"Shifting FishDelivery by {offset} days...")
        for delivery in FishDelivery.objects.all():
            delivery.delivery_date += timedelta(days=offset)
            delivery.save()
    else:
        print("No FishDelivery data found to shift.")

    # 3. Update SupplySource arrival_date
    print("Updating SupplySource arrival dates to today...")
    SupplySource.objects.all().update(arrival_date=today)

    # 4. Update Bulletin created_at (since it's auto_now_add, we have to be careful, but we can update it manually in Django if not using auto_now_add, or just use update)
    # Actually, Bulletins are fine as long as they are active.
    
    # 5. Update Predictions
    print("Updating Predictions to start from tomorrow...")
    Prediction.objects.all().delete() # Better to re-generate or just clear since they are sensitive to current date
    
    print("Date update complete!")

if __name__ == "__main__":
    update_dates()
