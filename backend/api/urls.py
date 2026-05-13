from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, FishViewSet, RetailerViewSet, 
    FishPriceViewSet, FishingLocationViewSet, 
    SupplySourceViewSet, InventoryViewSet, 
    FishDeliveryViewSet, ReportViewSet, 
    PredictionViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('fish', FishViewSet)
router.register('retailers', RetailerViewSet)
router.register('fish-prices', FishPriceViewSet)
router.register('locations', FishingLocationViewSet)
router.register('supply-sources', SupplySourceViewSet)
router.register('inventory', InventoryViewSet)
router.register('deliveries', FishDeliveryViewSet)
router.register('reports', ReportViewSet)
router.register('predictions', PredictionViewSet)
router.register('notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
