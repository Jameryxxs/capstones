from django.core.management.base import BaseCommand
from api.models import Fish, FishPrice, Prediction, Notification, User
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta
import numpy as np
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def get_mock_weather(dt):
    # Simulated weather based on month for the Philippines
    month = dt.month
    # Wet season: June (6) to November (11)
    if 6 <= month <= 11:
        base_rain = 70.0
        base_wind = 6.5
    else:
        # Dry season
        base_rain = 20.0
        base_wind = 3.5
        
    # Add slight random fluctuation based on day of year to make it dynamic but deterministic
    day_offset = dt.timetuple().tm_yday
    rain_chance = max(0, min(100, base_rain + (day_offset % 20) - 10))
    wind_speed = max(0, base_wind + (day_offset % 4) - 2)
    
    return wind_speed, rain_chance

class Command(BaseCommand):
    help = 'Trains predictive models for fish prices and supply with weather, lag features, and dynamic confidence.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting enhanced model training for all fish...")
        fishes = Fish.objects.all()
        
        # Clear old predictions
        Prediction.objects.all().delete()
        
        for fish in fishes:
            prices = list(FishPrice.objects.filter(fish=fish).order_by('market_date'))
            if len(prices) < 5:
                self.stdout.write(self.style.WARNING(f"Skipping {fish.fish_name}: Not enough data (Need at least 5)"))
                continue
            
            first_date = prices[0].market_date
            X = []
            y_price = []
            y_supply = []
            
            # Prepare data with lag features
            for i in range(len(prices)):
                p = prices[i]
                dt = p.market_date
                
                # Exogenous features: Weather
                wind_speed, rain_chance = get_mock_weather(dt)
                
                # Lag features (if not enough history, fallback to current)
                price_1_ago = float(prices[i-1].price_per_kilo) if i >= 1 else float(p.price_per_kilo)
                price_3_ago = float(prices[i-3].price_per_kilo) if i >= 3 else price_1_ago
                supply_1_ago = prices[i-1].quantity_available if i >= 1 else p.quantity_available
                
                X.append([
                    (dt - first_date).days,
                    dt.weekday(),
                    dt.month,
                    wind_speed,
                    rain_chance,
                    price_1_ago,
                    price_3_ago,
                    supply_1_ago
                ])
                y_price.append(float(p.price_per_kilo))
                y_supply.append(p.quantity_available)
                
            X = np.array(X)
            y_price = np.array(y_price)
            y_supply = np.array(y_supply)
            
            # Train Price Model
            model_price = RandomForestRegressor(n_estimators=100, random_state=42)
            model_price.fit(X, y_price)
            
            # Train Supply Model
            model_supply = RandomForestRegressor(n_estimators=100, random_state=42)
            model_supply.fit(X, y_supply)
            
            last_price_obj = prices[-1]
            last_date = last_price_obj.market_date
            last_day_index = (last_date - first_date).days
            
            # Initialize lag features for the forecast loop
            curr_price_1_ago = float(prices[-1].price_per_kilo)
            curr_price_3_ago = float(prices[-3].price_per_kilo) if len(prices) >= 3 else curr_price_1_ago
            curr_supply_1_ago = prices[-1].quantity_available
            
            # Track price array to update lags
            recent_prices = [float(p.price_per_kilo) for p in prices[-3:]] if len(prices) >=3 else [curr_price_1_ago]*3
            
            for i in range(1, 31):
                future_date = last_date + timedelta(days=i)
                f_wind, f_rain = get_mock_weather(future_date)
                
                future_X = np.array([[
                    last_day_index + i,
                    future_date.weekday(),
                    future_date.month,
                    f_wind,
                    f_rain,
                    curr_price_1_ago,
                    curr_price_3_ago,
                    curr_supply_1_ago
                ]])
                
                # Predict Price
                pred_price = model_price.predict(future_X)[0]
                
                # Calculate Confidence Score based on tree variance
                tree_preds = np.array([tree.predict(future_X)[0] for tree in model_price.estimators_])
                std_dev = np.std(tree_preds)
                mean_pred = pred_price if pred_price > 0 else 1
                variance_ratio = std_dev / mean_pred
                confidence_score = max(0.5, min(0.99, 1.0 - variance_ratio))
                
                # Predict Supply
                pred_supply = int(model_supply.predict(future_X)[0])
                
                trend = 'stable'
                if pred_price > curr_price_1_ago + 2:
                    trend = 'increase'
                elif pred_price < curr_price_1_ago - 2:
                    trend = 'decrease'
                
                Prediction.objects.create(
                    fish=fish,
                    predicted_price=round(pred_price, 2),
                    predicted_supply=max(0, pred_supply),
                    prediction_date=future_date,
                    trend_status=trend,
                    confidence_score=round(float(confidence_score), 2)
                )

                # Phase 4: Anomaly Alerting for Tomorrow (i == 1)
                if i == 1:
                    alerts = []
                    # Price Spike Anomaly (>20% increase)
                    if curr_price_1_ago > 0:
                        price_spike_pct = ((pred_price - curr_price_1_ago) / curr_price_1_ago) * 100
                        if price_spike_pct >= 20:
                            alerts.append(f"CRITICAL: {price_spike_pct:.1f}% Price Spike expected for {fish.fish_name} tomorrow (Est. ₱{pred_price:.2f}/kg).")
                    
                    # Supply Shortage Anomaly (<50% of recent average)
                    recent_supply_avg = np.mean(y_supply[-7:]) if len(y_supply) >= 7 else np.mean(y_supply)
                    if recent_supply_avg > 0:
                        if pred_supply < (recent_supply_avg * 0.5):
                            alerts.append(f"WARNING: Severe supply shortage expected for {fish.fish_name} tomorrow (Est. {pred_supply} kg).")

                    if alerts:
                        # 1. Create DB Notifications for Admins/Staff
                        target_users = User.objects.filter(role__in=['admin', 'staff'], is_active=True)
                        notifications = []
                        for alert_msg in alerts:
                            for u in target_users:
                                notifications.append(Notification(
                                    user=u,
                                    title=f"Market Anomaly: {fish.fish_name}",
                                    message=alert_msg,
                                    notification_type='system'
                                ))
                        if notifications:
                            Notification.objects.bulk_create(notifications)
                        
                        # 2. WebSocket Broadcast
                        channel_layer = get_channel_layer()
                        async_to_sync(channel_layer.group_send)(
                            "market_updates",
                            {
                                "type": "broadcast_update",
                                "data": {
                                    "type": "SYSTEM_ALERT",
                                    "message": f"Anomaly detected for {fish.fish_name}!"
                                }
                            }
                        )
                
                # Update Lags for next day
                recent_prices.append(pred_price)
                curr_price_1_ago = pred_price
                curr_price_3_ago = recent_prices[-3]
                curr_supply_1_ago = pred_supply
                
            self.stdout.write(self.style.SUCCESS(f"Successfully generated 30-day enhanced forecast for {fish.fish_name}"))
            
        self.stdout.write(self.style.SUCCESS("All enhanced models trained and predictions saved!"))
