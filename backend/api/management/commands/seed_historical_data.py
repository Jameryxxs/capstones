from django.core.management.base import BaseCommand
from api.models import Fish, FishPrice, Retailer, User, SupplySource, FishingLocation, FishDelivery
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Seeds 2 years of realistic historical fish market data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old records...")
        FishPrice.objects.all().delete()
        FishDelivery.objects.all().delete()
        
        # Ensure a Retailer exists
        retailer = Retailer.objects.first()
        if not retailer:
            user, _ = User.objects.get_or_create(username='dummy_retailer', defaults={'role': 'retailer', 'email': 'dummy@test.com'})
            retailer = Retailer.objects.create(
                user=user,
                business_name="Lucena Port Retailer Default",
                stall_number="A1",
                contact_number="09123456789",
                email="dummy@test.com",
                address="Lucena Fish Port",
            )
            
        # Ensure a SupplySource exists
        supply_source = SupplySource.objects.first()
        if not supply_source:
            loc, _ = FishingLocation.objects.get_or_create(
                location_name="Tayabas Bay",
                region="CALABARZON",
                province="Quezon",
                latitude=13.8,
                longitude=121.6
            )
            supply_source = SupplySource.objects.create(
                supplier_name="Default Fleet",
                boat_name="MB Seeker",
                fishing_location=loc,
                contact_number="09123456789",
                arrival_date=date.today()
            )

        fishes = list(Fish.objects.all())
        if not fishes:
            self.stdout.write(self.style.ERROR("No Fish records found. Please add fish via Admin first."))
            return

        today = date.today()
        num_days = 730
        start_date = today - timedelta(days=num_days)
        
        self.stdout.write(f"Generating 2 years of data from {start_date} to {today}...")

        prices_to_create = []
        deliveries_to_create = []

        for fish in fishes:
            base_price = float(fish.average_price) if fish.average_price else 150.0
            
            # Start inflation low, slowly creep up
            inflation_rate = 0.85 # 2 years ago, it was 15% cheaper
            inflation_step = (1.0 - 0.85) / num_days
            
            for i in range(num_days + 1):
                current_date = start_date + timedelta(days=i)
                month = current_date.month
                
                # Seasonal Multipliers
                # Wet season: Less catch, higher price
                if 6 <= month <= 11:
                    seasonal_price_mult = random.uniform(1.05, 1.25)
                    seasonal_supply_base = random.randint(300, 600)
                else:
                    # Dry season: Good catch, lower price
                    seasonal_price_mult = random.uniform(0.85, 1.0)
                    seasonal_supply_base = random.randint(700, 1200)
                    
                # Calculate daily price
                daily_volatility = random.uniform(0.95, 1.05) # +/- 5%
                current_inflation = 0.85 + (i * inflation_step)
                
                final_price = base_price * current_inflation * seasonal_price_mult * daily_volatility
                
                # Inverse Supply: If price is unusually high, supply is low
                supply_volatility = random.uniform(0.8, 1.2)
                # If seasonal_price_mult is high, divide supply by it
                final_supply = int((seasonal_supply_base / seasonal_price_mult) * supply_volatility)
                
                prices_to_create.append(
                    FishPrice(
                        fish=fish,
                        retailer=retailer,
                        price_per_kilo=round(final_price, 2),
                        quantity_available=max(0, final_supply),
                        market_date=current_date,
                        origin=supply_source.fishing_location.location_name
                    )
                )
                
                deliveries_to_create.append(
                    FishDelivery(
                        supply_source=supply_source,
                        fish=fish,
                        retailer=retailer,
                        quantity=max(0, final_supply),
                        delivery_date=current_date,
                        delivery_status='delivered'
                    )
                )
                
                if len(prices_to_create) >= 5000:
                    FishPrice.objects.bulk_create(prices_to_create)
                    FishDelivery.objects.bulk_create(deliveries_to_create)
                    prices_to_create = []
                    deliveries_to_create = []

        if prices_to_create:
            FishPrice.objects.bulk_create(prices_to_create)
            FishDelivery.objects.bulk_create(deliveries_to_create)
            
        self.stdout.write(self.style.SUCCESS("✅ 2 years of realistic historical data successfully generated!"))
