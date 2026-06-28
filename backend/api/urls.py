from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, FishViewSet, RetailerViewSet, 
    FishPriceViewSet, FishingLocationViewSet, 
    SupplySourceViewSet, InventoryViewSet, 
    FishDeliveryViewSet, ReportViewSet, 
    PredictionViewSet, NotificationViewSet, BulletinViewSet,
    get_price_forecast, download_market_bulletin,
    RegisterView, get_dashboard_stats, MyTokenObtainPairView, get_weather,
    get_correlation_data, get_seasonality_data, get_seasonality_forecast, get_supplier_performance, get_comparative_prices,
    get_map_data, get_retailer_map_data, get_public_market_view, get_historical_comparison,
    generate_ai_report, get_public_dashboard_data, AccountApplicationViewSet,
    get_top_species, get_vessel_arrivals
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
router.register('bulletins', BulletinViewSet)
router.register('applications', AccountApplicationViewSet, basename='accountapplication')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard-stats/', get_dashboard_stats, name='dashboard-stats'),
    path('weather/', get_weather, name='weather'),
    path('forecast/<int:fish_id>/', get_price_forecast, name='price-forecast'),
    path('bulletin/', download_market_bulletin, name='download-bulletin'),
    path('correlation/<int:fish_id>/', get_correlation_data, name='correlation'),
    path('seasonality/<int:fish_id>/', get_seasonality_data, name='seasonality'),
    path('seasonality-forecast/<int:fish_id>/', get_seasonality_forecast, name='seasonality-forecast'),
    path('supplier-performance/', get_supplier_performance, name='supplier-performance'),
    path('compare-prices/', get_comparative_prices, name='compare-prices'),
    path('map-data/', get_map_data, name='map-data'),
    path('retailer-map-data/', get_retailer_map_data, name='retailer-map-data'),
    path('public-market/', get_public_market_view, name='public-market'),
    path('public-dashboard/', get_public_dashboard_data, name='public-dashboard'),
    path('historical-comparison/<int:fish_id>/', get_historical_comparison, name='historical-comparison'),
    path('generate-report/', generate_ai_report, name='generate-report'),
    path('analytics/top-species/', get_top_species, name='top-species'),
    path('analytics/vessel-arrivals/', get_vessel_arrivals, name='vessel-arrivals'),
]
