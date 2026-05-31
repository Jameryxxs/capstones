from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg, Sum, Count
from django.db.models.functions import ExtractMonth
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
    PredictionSerializer, NotificationSerializer,
    MyTokenObtainPairSerializer
)
from .utils import generate_market_bulletin

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

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

import json
import urllib.request
from django.conf import settings

from django.core.cache import cache

@api_view(['GET'])
def get_weather(request):
    # Try to get from cache first
    cached_weather = cache.get('lucena_weather')
    if cached_weather:
        return Response(cached_weather)

    # Lucena City Coordinates
    lat = 13.9413
    lon = 121.6212
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', None)
    
    weather_data = {
        "city": "Lucena City",
        "temp": 29.5,
        "description": "Partly Cloudy",
        "icon": "03d",
        "humidity": 78,
        "wind_speed": 4.2,
        "is_mock": True
    }

    if api_key:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            with urllib.request.urlopen(url) as response:
                data = json.loads(response.read().decode())
                weather_data = {
                    "city": data['name'],
                    "temp": data['main']['temp'],
                    "description": data['weather'][0]['description'].capitalize(),
                    "icon": data['weather'][0]['icon'],
                    "humidity": data['main']['humidity'],
                    "wind_speed": data['wind']['speed'],
                    "is_mock": False
                }
        except Exception as e:
            pass
    
    # Cache for 15 minutes
    cache.set('lucena_weather', weather_data, 900)
    return Response(weather_data)

@api_view(['GET'])
def get_dashboard_stats(request):
    category = request.GET.get('category')
    today = date.today()
    seven_days_ago = today - timedelta(days=7)
    
    fish_queryset = Fish.objects.all()
    if category and category != 'all':
        fish_queryset = fish_queryset.filter(category=category)
    
    total_fish = fish_queryset.count()
    active_retailers = Retailer.objects.filter(status='Active').count()
    
    relevant_fish_ids = fish_queryset.values_list('id', flat=True)
    
    # Optimized Price Trends - ONE QUERY
    price_data = FishPrice.objects.filter(
        market_date__gte=seven_days_ago,
        fish_id__in=relevant_fish_ids
    ).values('market_date').annotate(avg_price=Avg('price_per_kilo')).order_by('market_date')
    
    price_trends = [{"date": p['market_date'].strftime('%m/%d'), "price": round(float(p['avg_price']), 2)} for p in price_data]
    
    # Optimized Supply Trends - ONE QUERY
    supply_data = FishDelivery.objects.filter(
        delivery_date__gte=seven_days_ago,
        delivery_status='delivered',
        fish_id__in=relevant_fish_ids
    ).values('delivery_date').annotate(total_qty=Sum('quantity')).order_by('delivery_date')
    
    supply_trends = [{"date": s['delivery_date'].strftime('%m/%d'), "volume": s['total_qty']} for s in supply_data]
        
    # Category Distribution
    cat_dist = list(Fish.objects.values('category').annotate(value=Count('id')))
    for item in cat_dist:
        item['name'] = item.pop('category')
    
    # Top Species by Volume (Last 30 Days)
    thirty_days_ago = today - timedelta(days=30)
    top_species = FishDelivery.objects.filter(
        delivery_date__gte=thirty_days_ago, 
        delivery_status='delivered',
        fish_id__in=relevant_fish_ids
    ).values('fish__fish_name').annotate(volume=Sum('quantity')).order_by('-volume')[:5]
    
    top_species_list = [{"name": s['fish__fish_name'], "volume": s['volume']} for s in top_species]

    # Optimized Alerts - Bulk check
    alerts = []
    yesterday = today - timedelta(days=1)
    
    # Simple supply drop check
    if len(supply_trends) >= 2:
        vol_today = supply_trends[-1]['volume'] if supply_trends[-1]['date'] == today.strftime('%m/%d') else 0
        vol_avg = sum(s['volume'] for s in supply_trends[:-1]) / (len(supply_trends)-1)
        if vol_today < vol_avg * 0.5 and vol_avg > 0:
            alerts.append({
                "type": "supply",
                "severity": "high",
                "message": "Supply volume today is 50% below weekly average!"
            })

    sentiment = "Stable"
    if len(price_trends) >= 2:
        recent_change = price_trends[-1]['price'] - price_trends[-2]['price']
        if recent_change > 5: sentiment = "Bullish (Rising Prices)"
        elif recent_change < -5: sentiment = "Bearish (Dropping Prices)"

    return Response({
        "total_fish": total_fish,
        "active_retailers": active_retailers,
        "price_trends": price_trends,
        "supply_trends": supply_trends,
        "category_dist": cat_dist,
        "top_species_by_volume": top_species_list,
        "alerts": alerts[:4],
        "sentiment": sentiment
    })

@api_view(['GET'])
def get_map_data(request):
    # Locations with recent delivery volumes
    seven_days_ago = date.today() - timedelta(days=7)
    locations = FishingLocation.objects.all()
    map_data = {
        "locations": [],
        "boats": []
    }
    
    for loc in locations:
        volume = FishDelivery.objects.filter(
            supply_source__fishing_location=loc,
            delivery_date__gte=seven_days_ago,
            delivery_status='delivered'
        ).aggregate(Sum('quantity'))['quantity__sum'] or 0
        
        if volume > 0:
            map_data["locations"].append({
                "id": loc.id,
                "name": loc.location_name,
                "lat": float(loc.latitude),
                "lng": float(loc.longitude),
                "volume": volume
            })
    
    # Active boats (In Transit or At Sea)
    active_boats = SupplySource.objects.filter(status__in=['in_transit', 'at_sea'])
    for boat in active_boats:
        if boat.current_lat and boat.current_lng:
            map_data["boats"].append({
                "id": boat.id,
                "name": boat.boat_name,
                "supplier": boat.supplier_name,
                "lat": float(boat.current_lat),
                "lng": float(boat.current_lng),
                "status": boat.status,
                "origin": boat.fishing_location.location_name
            })
            
    return Response(map_data)

@api_view(['GET'])
def get_correlation_data(request, fish_id):
    # Correlation between Supply (Deliveries) and Price
    thirty_days_ago = date.today() - timedelta(days=30)
    deliveries = FishDelivery.objects.filter(
        fish_id=fish_id, 
        delivery_date__gte=thirty_days_ago,
        delivery_status='delivered'
    ).values('delivery_date').annotate(total_qty=Sum('quantity'))
    
    prices = FishPrice.objects.filter(
        fish_id=fish_id,
        market_date__gte=thirty_days_ago
    ).values('market_date').annotate(avg_price=Avg('price_per_kilo'))
    
    # Merge datasets by date
    data_map = {}
    for d in deliveries:
        dt = d['delivery_date'].strftime('%Y-%m-%d')
        data_map[dt] = {'supply': d['total_qty'], 'price': None}
    
    for p in prices:
        dt = p['market_date'].strftime('%Y-%m-%d')
        if dt in data_map:
            data_map[dt]['price'] = round(float(p['avg_price']), 2)
    
    correlation_data = [
        {'date': k, 'supply': v['supply'], 'price': v['price']} 
        for k, v in data_map.items() if v['price'] is not None
    ]
    
    return Response(correlation_data)

@api_view(['GET'])
def get_seasonality_data(request, fish_id):
    # Average supply by month over the last year
    seasonality = FishDelivery.objects.filter(
        fish_id=fish_id,
        delivery_status='delivered'
    ).annotate(month=ExtractMonth('delivery_date')).values('month').annotate(avg_volume=Avg('quantity')).order_by('month')
    
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    formatted_data = []
    for s in seasonality:
        formatted_data.append({
            "month": month_names[s['month'] - 1],
            "volume": round(float(s['avg_volume']), 2)
        })
        
    return Response(formatted_data)

@api_view(['GET'])
def get_supplier_performance(request):
    # Performance by Fishing Location
    performance = FishDelivery.objects.filter(
        delivery_status='delivered'
    ).values('supply_source__fishing_location__location_name').annotate(
        total_volume=Sum('quantity'),
        delivery_count=Count('id')
    ).order_by('-total_volume')
    
    formatted_data = [{
        "location": p['supply_source__fishing_location__location_name'],
        "volume": p['total_volume'],
        "frequency": p['delivery_count']
    } for p in performance]
    
    return Response(formatted_data)

@api_view(['GET'])
def get_comparative_prices(request):
    fish_ids = request.GET.getlist('ids')
    if not fish_ids:
        return Response([])
        
    seven_days_ago = date.today() - timedelta(days=7)
    data = []
    
    # Get dates first
    dates = FishPrice.objects.filter(
        market_date__gte=seven_days_ago
    ).dates('market_date', 'day').order_by('market_date')
    
    for d in dates:
        entry = {"date": d.strftime('%m/%d')}
        for fid in fish_ids:
            try:
                fish = Fish.objects.get(id=fid)
                avg = FishPrice.objects.filter(
                    fish_id=fid, 
                    market_date=d
                ).aggregate(Avg('price_per_kilo'))['price_per_kilo__avg'] or 0
                entry[fish.fish_name] = round(float(avg), 2)
            except Fish.DoesNotExist:
                continue
        data.append(entry)
        
    return Response(data)

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

    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        boat = self.get_object()
        lat = request.data.get('lat')
        lng = request.data.get('lng')
        status = request.data.get('status')
        
        if lat: boat.current_lat = lat
        if lng: boat.current_lng = lng
        if status: boat.status = status
        
        boat.save()
        return Response({"status": "Location updated"})

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
