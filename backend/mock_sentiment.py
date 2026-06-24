import os
import django
import sys
from datetime import date, timedelta
from decimal import Decimal

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from api.models import FishPrice, User, Fish, Retailer

def mock_sentiment(sentiment_type):
    print(f"Mocking {sentiment_type.upper()} Sentiment...")
    today = date.today()
    yesterday = today - timedelta(days=1)
    two_days_ago = today - timedelta(days=2)
    
    # If database is empty, let's create a base setup
    if FishPrice.objects.count() == 0:
        print("Database is empty. Generating some base data...")
        fish = Fish.objects.create(fish_name="Mock Tuna", category="saltwater", average_price=200)
        user = User.objects.create(username="mockuser", role="retailer", email="mock@ex.com")
        retailer = Retailer.objects.create(user=user, business_name="Mock Stall", stall_number="M1")
        
        FishPrice.objects.create(fish=fish, retailer=retailer, price_per_kilo=200, quantity_available=50, market_date=two_days_ago, created_by=user)
        FishPrice.objects.create(fish=fish, retailer=retailer, price_per_kilo=200, quantity_available=50, market_date=yesterday, created_by=user)
    
    # Get all prices for yesterday
    yesterday_prices = FishPrice.objects.filter(market_date=yesterday)
    
    if not yesterday_prices.exists():
        # If no prices yesterday, take any existing prices and pretend they are from yesterday
        latest = FishPrice.objects.order_by('-market_date').first()
        if latest:
            yesterday_prices = FishPrice.objects.filter(market_date=latest.market_date)
            for p in yesterday_prices:
                p.pk = None
                p.market_date = yesterday
                p.save()
            yesterday_prices = FishPrice.objects.filter(market_date=yesterday)
    
    avg_yesterday = sum(p.price_per_kilo for p in yesterday_prices) / yesterday_prices.count() if yesterday_prices.exists() else Decimal('200.00')
    print(f"Yesterday's Average Price: {avg_yesterday:.2f} PHP")
    
    # Delete today's prices so we can cleanly override them
    FishPrice.objects.filter(market_date=today).delete()
    
    # Determine the target price for today
    if sentiment_type == 'bullish':
        target_price = avg_yesterday + Decimal('25.00') # Rise > 5
    elif sentiment_type == 'bearish':
        target_price = avg_yesterday - Decimal('25.00') # Drop > 5
    else:
        target_price = avg_yesterday + Decimal('1.00')  # Stable
        
    print(f"Setting Today's Average Price to: {target_price:.2f} PHP")
    
    # Create new prices for today based on yesterday's sellers/fishes
    count = 0
    for p in yesterday_prices:
        FishPrice.objects.create(
            fish=p.fish,
            retailer=p.retailer,
            price_per_kilo=target_price,
            quantity_available=p.quantity_available,
            market_date=today,
            created_by=p.created_by
        )
        count += 1
        
    print(f"Successfully generated {count} price entries for today.")
    print("Check your Live Monitoring dashboard to see the updated Market Sentiment!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        sentiment = sys.argv[1].lower()
        if sentiment in ['bullish', 'bearish', 'stable']:
            mock_sentiment(sentiment)
        else:
            print("Usage: python mock_sentiment.py [bullish|bearish|stable]")
    else:
        print("Defaulting to bullish...")
        mock_sentiment("bullish")
