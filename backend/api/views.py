from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Avg, Sum, Count
from django.db.models.functions import ExtractMonth
from django.conf import settings
from django.core.cache import cache
import numpy as np
import json
import urllib.request
import random
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta, date
from .models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Report, 
    Prediction, Notification, Bulletin
)
from .serializers import (
    UserSerializer, FishSerializer, RetailerSerializer, 
    FishPriceSerializer, FishingLocationSerializer, 
    SupplySourceSerializer, InventorySerializer, 
    FishDeliverySerializer, ReportSerializer, 
    PredictionSerializer, NotificationSerializer,
    MyTokenObtainPairSerializer, BulletinSerializer
)
from .utils import generate_market_bulletin, create_system_notification
from .permissions import IsAdminOrReadOnly, IsAdminUser, IsRetailerOwnerOrAdmin

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            return Response({"error": "Incorrect old password"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"status": "Password updated successfully"})

@api_view(['GET'])
def get_price_forecast(request, fish_id):
    # Query pre-calculated predictions instead of training on-the-fly
    predictions = Prediction.objects.filter(fish_id=fish_id, prediction_date__gte=date.today()).order_by('prediction_date')[:7]
    
    if not predictions:
        return Response({"error": "Forecast not generated yet. Please run training job."}, status=400)
        
    forecast = []
    for p in predictions:
        forecast.append({
            "date": p.prediction_date,
            "predicted_price": float(p.predicted_price)
        })
    return Response(forecast)

@api_view(['GET'])
def download_market_bulletin(request):
    return generate_market_bulletin(request)

def fetch_weather_info():
    # Try to get from cache first
    cached_weather = cache.get('lucena_weather')
    if cached_weather:
        return cached_weather

    # Lucena City Coordinates
    lat = 13.9413
    lon = 121.6212
    api_key = getattr(settings, 'OPENWEATHER_API_KEY', None)
    
    # Dynamic mock data for demonstration if no API key
    weather_data = {
        "city": "Lucena City",
        "temp": round(28.0 + random.uniform(0, 5), 1),
        "description": random.choice(["Partly Cloudy", "Clear Sky", "Light Rain", "Mostly Sunny"]),
        "icon": random.choice(["01d", "02d", "03d", "04d", "10d"]),
        "humidity": random.randint(65, 85),
        "wind_speed": round(2.0 + random.uniform(0, 10), 1),
        "rain_chance": random.randint(5, 95),
        "is_mock": True
    }

    if api_key:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
            with urllib.request.urlopen(url, timeout=3) as response:
                data = json.loads(response.read().decode())
                weather_data = {
                    "city": data['name'],
                    "temp": data['main']['temp'],
                    "description": data['weather'][0]['description'].capitalize(),
                    "icon": data['weather'][0]['icon'],
                    "humidity": data['main']['humidity'],
                    "wind_speed": data['wind']['speed'],
                    "rain_chance": round(data.get('pop', 0) * 100) if 'pop' in data else random.randint(5, 20),
                    "is_mock": False
                }
        except Exception as e:
            print(f"Weather API Error/Timeout: {e}")
    
    # --- AUTOMATED WEATHER NOTIFICATIONS ---
    # Triggered based on current values (even if mock)
    if weather_data.get('wind_speed', 0) > 10:
        create_system_notification(
            title="⚠️ HIGH WIND ALERT",
            message=f"Wind speed is {weather_data['wind_speed']} m/s. Fishing activities may be suspended.",
            alert_type="system"
        )
    
    if weather_data.get('temp', 0) > 31:
        create_system_notification(
            title="🌡️ EXTREME HEAT ALERT",
            message=f"Temperature reached {weather_data['temp']}°C. Ensure proper icing for delivered fish.",
            alert_type="system"
        )
    # ----------------------------------------

    # Broadcast weather update via WebSocket
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "WEATHER_UPDATE",
                    "weather": weather_data
                }
            }
        )
    except Exception as e:
        print(f"WS Weather Broadcast Error: {e}")
    
    # Cache for 30 seconds for demonstration purposes
    cache.set('lucena_weather', weather_data, 30)
    return weather_data

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_weather(request):
    weather_data = fetch_weather_info()
    return Response(weather_data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
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
    
    # Optimized Supply Trends - Combine Delivery and Retail Logs
    # This ensures that when retailers log their daily stock, it adds to the total port volume
    delivery_data = FishDelivery.objects.filter(
        delivery_date__gte=seven_days_ago,
        delivery_status='delivered',
        fish_id__in=relevant_fish_ids
    ).values('delivery_date').annotate(total_qty=Sum('quantity'))

    price_qty_data = FishPrice.objects.filter(
        market_date__gte=seven_days_ago,
        fish_id__in=relevant_fish_ids
    ).values('market_date').annotate(total_qty=Sum('quantity_available'))

    # Combine data by date
    combined_supply = {}
    for d in delivery_data:
        date_str = d['delivery_date'].strftime('%m/%d')
        combined_supply[date_str] = combined_supply.get(date_str, 0) + (d['total_qty'] or 0)
    
    for p in price_qty_data:
        date_str = p['market_date'].strftime('%m/%d')
        combined_supply[date_str] = combined_supply.get(date_str, 0) + (p['total_qty'] or 0)

    supply_trends = [{"date": k, "volume": v} for k, v in sorted(combined_supply.items())]
        
    # Category Distribution
    cat_dist = list(Fish.objects.values('category').annotate(value=Count('id')))
    for item in cat_dist:
        item['name'] = item.pop('category')
    
    # NEW: Category Average Prices
    category_prices = FishPrice.objects.filter(
        market_date__gte=seven_days_ago
    ).values('fish__category').annotate(avg_price=Avg('price_per_kilo'))
    cat_price_data = {item['fish__category']: round(float(item['avg_price']), 2) for item in category_prices}

    # NEW: Species Price Comparison (Include ALL species)
    all_fish = Fish.objects.all()
    species_price_list = []
    
    # Get latest average prices for each fish
    for fish in all_fish:
        avg_p = FishPrice.objects.filter(
            fish=fish,
            market_date__gte=today - timedelta(days=30) # Look back 30 days for "current" prices
        ).aggregate(Avg('price_per_kilo'))['price_per_kilo__avg'] or 0
        
        species_price_list.append({
            "name": fish.fish_name,
            "price": round(float(avg_p), 2),
            "category": fish.category
        })
    
    # Sort by price descending
    species_price_list.sort(key=lambda x: x['price'], reverse=True)

    # Detailed Category Counts for the card
    freshwater_count = all_fish.filter(category='freshwater').count()
    saltwater_count = all_fish.filter(category='saltwater').count()
    category_breakdown = {
        "freshwater": freshwater_count,
        "saltwater": saltwater_count
    }

    # Top Species by Volume (Last 30 Days) - Combine Delivery and Price Logs
    thirty_days_ago = today - timedelta(days=30)
    
    delivery_vol = FishDelivery.objects.filter(
        delivery_date__gte=thirty_days_ago, 
        delivery_status='delivered',
        fish_id__in=relevant_fish_ids
    ).values('fish__fish_name').annotate(vol=Sum('quantity'))

    price_vol = FishPrice.objects.filter(
        market_date__gte=thirty_days_ago,
        fish_id__in=relevant_fish_ids
    ).values('fish__fish_name').annotate(vol=Sum('quantity_available'))

    combined_vol = {}
    for d in delivery_vol:
        name = d['fish__fish_name']
        combined_vol[name] = combined_vol.get(name, 0) + (d['vol'] or 0)
    
    for p in price_vol:
        name = p['fish__fish_name']
        combined_vol[name] = combined_vol.get(name, 0) + (p['vol'] or 0)

    top_species_list = []
    for name, vol in combined_vol.items():
        top_species_list.append({"name": name, "volume": vol})
    
    top_species_list = sorted(top_species_list, key=lambda x: x['volume'], reverse=True)[:5]

    # Optimized Alerts - Bulk check
    alerts = []
    yesterday = today - timedelta(days=1)
    
    # Simple supply drop check
    if len(supply_trends) >= 2:
        vol_today = supply_trends[-1]['volume'] if supply_trends[-1]['date'] == today.strftime('%m/%d') else 0
        vol_avg = sum(s['volume'] for s in supply_trends[:-1]) / (len(supply_trends)-1)
        if vol_today < vol_avg * 0.5 and vol_avg > 0:
            msg = "Supply volume today is 50% below weekly average!"
            alerts.append({
                "type": "supply",
                "severity": "high",
                "message": msg
            })
            
            # Create persistent notification and broadcast
            created = create_system_notification(
                title="📊 SUPPLY ALERT",
                message=msg,
                alert_type="system"
            )
            
            if created:
                try:
                    channel_layer = get_channel_layer()
                    async_to_sync(channel_layer.group_send)(
                        "market_updates",
                        {
                            "type": "broadcast_update",
                            "data": {
                                "type": "SYSTEM_ALERT",
                                "message": msg
                            }
                        }
                    )
                except Exception:
                    pass

    # Weather-Driven Alerts
    w_data = fetch_weather_info()
    if w_data:
        if w_data.get('wind_speed', 0) > 10:
            alerts.append({
                "type": "weather",
                "severity": "high",
                "message": f"High Wind Alert ({w_data['wind_speed']} m/s)! Fishing activities may be suspended."
            })
        if w_data.get('temp', 0) > 33:
            alerts.append({
                "type": "weather",
                "severity": "medium",
                "message": f"Extreme Heat ({w_data['temp']}°C). Ensure proper icing for delivered fish."
            })

    # Sentiment Calculation
    sentiment = "Stable"
    if len(price_trends) >= 2:
        recent_change = price_trends[-1]['price'] - price_trends[-2]['price']
        if recent_change > 5: sentiment = "Bullish (Rising Prices)"
        elif recent_change < -5: sentiment = "Bearish (Dropping Prices)"

    # Latest Activities for initial load
    recent_prices = FishPrice.objects.select_related('fish', 'retailer').order_by('-market_date', '-id')[:5]
    latest_activities = []
    for p in recent_prices:
        latest_activities.append({
            "type": "PRICE_UPDATE",
            "fish_name": p.fish.fish_name,
            "category": p.fish.category,
            "price": float(p.price_per_kilo),
            "retailer": p.retailer.business_name,
            "timestamp": p.market_date.strftime('%Y-%m-%d')
        })

    return Response({
        "total_fish": total_fish,
        "active_retailers": active_retailers,
        "category_breakdown": category_breakdown,
        "price_trends": price_trends,
        "supply_trends": supply_trends,
        "category_dist": cat_dist,
        "category_prices": cat_price_data,
        "species_prices": species_price_list,
        "top_species_by_volume": top_species_list,
        "alerts": alerts[:4],
        "sentiment": sentiment,
        "latest_activities": latest_activities
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
@permission_classes([permissions.AllowAny])
def get_comparative_prices(request):
    fish_ids = request.GET.getlist('ids')
    if not fish_ids:
        return Response([])
        
    seven_days_ago = date.today() - timedelta(days=7)
    
    # Optimized query using values and annotate
    price_data = FishPrice.objects.filter(
        fish_id__in=fish_ids,
        market_date__gte=seven_days_ago
    ).values('market_date', 'fish__fish_name').annotate(
        avg_price=Avg('price_per_kilo')
    ).order_by('market_date')

    # Pivot the data in Python
    pivoted_data = {}
    for entry in price_data:
        dt_str = entry['market_date'].strftime('%m/%d')
        if dt_str not in pivoted_data:
            pivoted_data[dt_str] = {"date": dt_str}
        
        pivoted_data[dt_str][entry['fish__fish_name']] = round(float(entry['avg_price']), 2)
    
    return Response(list(pivoted_data.values()))

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_retailer_map_data(request):
    retailers = Retailer.objects.filter(status='Active').select_related('user')
    today = date.today()
    
    map_data = []
    for retailer in retailers:
        # Get latest inventory
        inventory = Inventory.objects.filter(retailer=retailer, availability_status='Available')
        fish_list = []
        total_stock = 0
        for item in inventory:
            latest_price = FishPrice.objects.filter(
                retailer=retailer, 
                fish=item.fish
            ).order_by('-market_date', '-created_at').first()
            
            stock = item.stock_quantity
            total_stock += stock
            fish_list.append({
                "fish_name": item.fish.fish_name,
                "stock": stock,
                "unit": item.stock_unit,
                "price": float(latest_price.price_per_kilo) if latest_price else None,
                "category": item.fish.category,
                "remarks": latest_price.remarks if latest_price else ""
            })
            
        status = 'available'
        if total_stock == 0: status = 'out_of_stock'
        elif total_stock < 50: status = 'low_stock'

        map_data.append({
            "id": retailer.id,
            "business_name": retailer.business_name,
            "vendor_name": f"{retailer.user.first_name} {retailer.user.last_name}",
            "stall_number": retailer.stall_number,
            "contact_number": retailer.contact_number,
            "status": status,
            "lat": float(retailer.latitude) if retailer.latitude else None,
            "lng": float(retailer.longitude) if retailer.longitude else None,
            "inventory": fish_list
        })
        
    return Response(map_data)

class FishViewSet(viewsets.ModelViewSet):
    queryset = Fish.objects.all()
    serializer_class = FishSerializer
    permission_classes = [IsAdminOrReadOnly]

class RetailerViewSet(viewsets.ModelViewSet):
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['get'])
    def available_stalls(self, request):
        taken_stalls = Retailer.objects.values_list('stall_number', flat=True)
        all_stalls = [f"F{i:02d}" for i in range(1, 31)]
        available = [s for s in all_stalls if s not in taken_stalls]
        return Response(available)

    @action(detail=False, methods=['get'])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)
        try:
            retailer = Retailer.objects.get(user=request.user)
            serializer = self.get_serializer(retailer)
            return Response(serializer.data)
        except Retailer.DoesNotExist:
            return Response({"error": "Retailer profile not found"}, status=404)

    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        retailer = self.get_object()
        inventory = Inventory.objects.filter(retailer=retailer)
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

class FishPriceViewSet(viewsets.ModelViewSet):
    queryset = FishPrice.objects.select_related('fish', 'retailer').all()
    serializer_class = FishPriceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsRetailerOwnerOrAdmin]

    def get_queryset(self):
        queryset = FishPrice.objects.select_related('fish', 'retailer').all()
        # Allow retailers to see ONLY their prices if requested via 'mine' parameter
        if self.request.query_params.get('mine') == 'true' and self.request.user.is_authenticated:
            try:
                retailer = Retailer.objects.get(user=self.request.user)
                return queryset.filter(retailer=retailer)
            except Retailer.DoesNotExist:
                return queryset.none()
        return queryset

    def perform_create(self, serializer):
        # Automatically assign retailer if the user is a retailer (Security/UX)
        if self.request.user.role == 'retailer':
            try:
                retailer = Retailer.objects.get(user=self.request.user)
                serializer.save(created_by=self.request.user, retailer=retailer)
            except Retailer.DoesNotExist:
                # Fallback if no profile exists yet
                serializer.save(created_by=self.request.user)
        else:
            # For Admins/Staff, use the retailer provided in the payload
            # If they didn't provide one, it will use the serializer default or raise error
            serializer.save(created_by=self.request.user)

class FishingLocationViewSet(viewsets.ModelViewSet):
    queryset = FishingLocation.objects.all()
    serializer_class = FishingLocationSerializer
    permission_classes = [IsAdminOrReadOnly]

class SupplySourceViewSet(viewsets.ModelViewSet):
    queryset = SupplySource.objects.all()
    serializer_class = SupplySourceSerializer
    permission_classes = [IsAdminOrReadOnly]

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
        
        # Broadcast the update to all connected WebSockets
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "LOCATION_UPDATE",
                    "vehicle_id": boat.id,
                    "lat": float(boat.current_lat) if boat.current_lat else None,
                    "lng": float(boat.current_lng) if boat.current_lng else None,
                    "status": boat.status
                }
            }
        )
        
        return Response({"status": "Location updated"})

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
    permission_classes = [permissions.IsAuthenticated]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]

class PredictionViewSet(viewsets.ModelViewSet):
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Notification.objects.filter(user=self.request.user).order_by('-created_at')
        return Notification.objects.none()

class BulletinViewSet(viewsets.ModelViewSet):
    queryset = Bulletin.objects.all().order_by('-created_at')
    serializer_class = BulletinSerializer
    permission_classes = [IsAdminOrReadOnly]
