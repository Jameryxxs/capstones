
from api.models import Fish, FishPrice, Prediction, Bulletin, User
from datetime import date, timedelta
from django.db.models import Avg

def run():
    # 1. Get Today's Data
    today = date.today()
    latest_prices = FishPrice.objects.filter(market_date=today).order_by('-price_per_kilo')[:3]
    
    if latest_prices.exists():
        price_summary = "\n".join([f"- {p.fish.fish_name}: PHP {p.price_per_kilo}/kg" for p in latest_prices])
    else:
        price_summary = "- No new price entries for today yet."

    # 2. Get AI Predictions
    upcoming_preds = Prediction.objects.filter(prediction_date__gt=today).order_by('prediction_date')[:3]
    if upcoming_preds.exists():
        prediction_text = "\n".join([f"- **{p.fish.fish_name}** ({p.prediction_date}): ₱{p.predicted_price} | Expected Volume: {p.predicted_supply}kg | AI Confidence: {int(p.confidence_score * 100)}%" for p in upcoming_preds])
    else:
        prediction_text = "- AI is processing 7-day forecasts."

    # 3. Weather (Mocked for this entry)
    weather_msg = "☀️ 31°C | Partly Cloudy | Wind: 4.5 m/s (Normal Operations)"

    # 4. Construct Content
    title = f"Daily Market & Forecast - {today.strftime('%B %d')}"
    content = f"""
### 🌤️ Weather Update
{weather_msg}

### 💹 Today's Market Leaders
{price_summary}

### 🔮 AI Price Forecast
{prediction_text}

### 💡 Admin Note
Retailers should prepare for incoming supply from Atimonan. Check the Live Map for boat 'MB Blue Wave' ETA.
    """.strip()

    # 5. Save Bulletin
    bulletin = Bulletin.objects.create(
        title=title,
        content=content,
        category='info',
        is_active=True
    )
    print(f"Bulletin Created: {bulletin.title}")

if __name__ == "__main__":
    run()
