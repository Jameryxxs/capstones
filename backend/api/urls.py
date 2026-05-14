from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, FishViewSet, RetailerViewSet, 
    FishPriceViewSet, FishingLocationViewSet, 
    SupplySourceViewSet, InventoryViewSet, 
    FishDeliveryViewSet, ReportViewSet, 
    PredictionViewSet, NotificationViewSet,
    get_price_forecast, download_market_bulletin,
    RegisterView, get_dashboard_stats, MyTokenObtainPairView, get_weather
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
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard-stats/', get_dashboard_stats, name='dashboard-stats'),
    path('weather/', get_weather, name='weather'),
    path('forecast/<int:fish_id>/', get_price_forecast, name='price-forecast'),
    path('bulletin/', download_market_bulletin, name='download-bulletin'),
]
