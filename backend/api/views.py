from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Avg
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import timedelta, date
from .models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Report, 
    Prediction, Notification
)
from .serializers import (
    UserSerializer, FishSerializer, RetailerSerializer, 
    FishPriceSerializer, FishingLocationSerializer, 
    SupplySourceSerializer, InventorySerializer, 
    FishDeliverySerializer, ReportSerializer, 
    PredictionSerializer, NotificationSerializer
)
from .utils import generate_market_bulletin

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
def get_price_forecast(request, fish_id):
    prices = FishPrice.objects.filter(fish_id=fish_id).values('market_date').annotate(avg_price=Avg('price_per_kilo')).order_by('market_date')
    if len(prices) < 2:
        return Response({"error": "Insufficient data for prediction"}, status=400)
    first_date = prices[0]['market_date']
    X = np.array([(p['market_date'] - first_date).days for p in prices]).reshape(-1, 1)
    y = np.array([float(p['avg_price']) for p in prices])
    model = LinearRegression()
    model.fit(X, y)
    last_day = (prices[len(prices)-1]['market_date'] - first_date).days
    future_X = np.array([last_day + i for i in range(1, 8)]).reshape(-1, 1)
    future_y = model.predict(future_X)
    forecast = []
    for i, pred in enumerate(future_y):
        forecast_date = prices[len(prices)-1]['market_date'] + timedelta(days=i+1)
        forecast.append({
            "date": forecast_date,
            "predicted_price": round(float(pred), 2)
        })
    return Response(forecast)

@api_view(['GET'])
def download_market_bulletin(request):
    return generate_market_bulletin(request)

@api_view(['GET'])
def get_dashboard_stats(request):
    total_fish = Fish.objects.count()
    active_retailers = Retailer.objects.filter(status='Active').count()
    today = date.today()
    trends = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        avg = FishPrice.objects.filter(market_date=day).aggregate(Avg('price_per_kilo'))['price_per_kilo__avg'] or 0
        trends.append({"date": day.strftime('%m/%d'), "price": round(float(avg), 2)})
    categories = Fish.objects.values('category').annotate(count=Avg('id'))
    cat_dist = [{"name": c['category'], "value": Fish.objects.filter(category=c['category']).count()} for c in categories]
    return Response({
        "total_fish": total_fish,
        "active_retailers": active_retailers,
        "price_trends": trends,
        "category_dist": cat_dist
    })

class FishViewSet(viewsets.ModelViewSet):
    queryset = Fish.objects.all()
    serializer_class = FishSerializer

class RetailerViewSet(viewsets.ModelViewSet):
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer

    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        retailer = self.get_object()
        inventory = Inventory.objects.filter(retailer=retailer)
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

class FishPriceViewSet(viewsets.ModelViewSet):
    queryset = FishPrice.objects.all()
    serializer_class = FishPriceSerializer

class FishingLocationViewSet(viewsets.ModelViewSet):
    queryset = FishingLocation.objects.all()
    serializer_class = FishingLocationSerializer

class SupplySourceViewSet(viewsets.ModelViewSet):
    queryset = SupplySource.objects.all()
    serializer_class = SupplySourceSerializer

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer

    @action(detail=False, methods=['get'])
    def my_stall(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)
        try:
            retailer = Retailer.objects.get(user=request.user)
            inventory = Inventory.objects.filter(retailer=retailer)
            serializer = InventorySerializer(inventory, many=True)
            return Response(serializer.data)
        except Retailer.DoesNotExist:
            return Response({"error": "Retailer profile not found"}, status=404)

class FishDeliveryViewSet(viewsets.ModelViewSet):
    queryset = FishDelivery.objects.all()
    serializer_class = FishDeliverySerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
