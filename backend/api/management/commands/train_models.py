from django.core.management.base import BaseCommand
from api.models import Fish, FishPrice, Prediction
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta
import numpy as np

class Command(BaseCommand):
    help = 'Trains the predictive models for fish prices and saves the next 7 days forecasts.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting model training for all fish...")
        fishes = Fish.objects.all()
        
        # Clear old predictions
        Prediction.objects.all().delete()
        
        for fish in fishes:
            prices = FishPrice.objects.filter(fish=fish).order_by('market_date')
            if len(prices) < 2:
                self.stdout.write(self.style.WARNING(f"Skipping {fish.fish_name}: Not enough data"))
                continue
            
            first_date = prices[0].market_date
            X = []
            y = []
            supply = []
            
            for p in prices:
                dt = p.market_date
                X.append([
                    (dt - first_date).days,
                    dt.weekday(),
                    dt.month
                ])
                y.append(float(p.price_per_kilo))
                supply.append(p.quantity_available)
                
            X = np.array(X)
            y = np.array(y)
            
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X, y)
            
            last_price_obj = prices.last()
            last_date = last_price_obj.market_date
            last_day_index = (last_date - first_date).days
            last_price = float(last_price_obj.price_per_kilo)
            
            # Simple average for supply prediction fallback
            avg_supply = int(sum(supply) / len(supply))
            
            for i in range(1, 8):
                future_date = last_date + timedelta(days=i)
                future_X = np.array([[
                    last_day_index + i,
                    future_date.weekday(),
                    future_date.month
                ]])
                pred = model.predict(future_X)[0]
                
                trend = 'stable'
                if pred > last_price + 2:
                    trend = 'increase'
                elif pred < last_price - 2:
                    trend = 'decrease'
                
                # Update last_price for next iteration comparison
                last_price = pred
                
                Prediction.objects.create(
                    fish=fish,
                    predicted_price=round(pred, 2),
                    predicted_supply=avg_supply,  # In a full version, train a model for supply too
                    prediction_date=future_date,
                    trend_status=trend,
                    confidence_score=0.85  # Placeholder for random forest score
                )
                
            self.stdout.write(self.style.SUCCESS(f"Successfully generated 7-day forecast for {fish.fish_name}"))
            
        self.stdout.write(self.style.SUCCESS("All models trained and predictions saved!"))
