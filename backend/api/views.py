from rest_framework import viewsets
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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class FishViewSet(viewsets.ModelViewSet):
    queryset = Fish.objects.all()
    serializer_class = FishSerializer

class RetailerViewSet(viewsets.ModelViewSet):
    queryset = Retailer.objects.all()
    serializer_class = RetailerSerializer

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
