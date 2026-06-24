import os
import django
import sys
import json
from datetime import date

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from rest_framework.test import APIRequestFactory
from api.models import Fish, Prediction
from api.views import get_price_forecast

def test_forecast():
    fish = Fish.objects.first()
    if not fish:
        print("No fish found in DB.")
        return

    print(f"Testing forecast for Fish: {fish.fish_name} (ID: {fish.id})")
    
    # Delete existing predictions for today to force retraining
    Prediction.objects.filter(fish_id=fish.id, prediction_date__gte=date.today()).delete()

    factory = APIRequestFactory()
    request = factory.get(f'/api/forecast/{fish.id}/')
    response = get_price_forecast(request, fish.id)
    
    print("Response Status:", response.status_code)
    print("Forecast Data:")
    for d in response.data:
        print(f"  Date: {str(d['date'])} | Price: {d['predicted_price']}")
    
    # Verify predictions in DB
    preds = Prediction.objects.filter(fish_id=fish.id, prediction_date__gte=date.today())
    print("\nDatabase Predictions Check:")
    for p in preds:
        print(f"Date: {p.prediction_date} | Price: {p.predicted_price} | Trend: {p.trend_status} | Conf: {p.confidence_score}%")

if __name__ == "__main__":
    test_forecast()
