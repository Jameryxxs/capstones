from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Report, 
    Prediction, Notification, Bulletin
)

@admin.register(Bulletin)
class BulletinAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active')

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'phone_number')}),
    )
    list_display = ['username', 'email', 'role', 'is_staff']

@admin.register(Fish)
class FishAdmin(admin.ModelAdmin):
    list_display = ('fish_name', 'category', 'average_price', 'status', 'created_at')
    search_fields = ('fish_name', 'scientific_name')
    list_filter = ('category', 'status')

@admin.register(Retailer)
class RetailerAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'stall_number', 'contact_number', 'status')
    search_fields = ('business_name', 'stall_number')
    list_filter = ('status',)

@admin.register(FishPrice)
class FishPriceAdmin(admin.ModelAdmin):
    list_display = ('fish', 'retailer', 'price_per_kilo', 'market_date')
    list_filter = ('market_date', 'fish')

@admin.register(FishingLocation)
class FishingLocationAdmin(admin.ModelAdmin):
    list_display = ('location_name', 'region', 'province')

@admin.register(SupplySource)
class SupplySourceAdmin(admin.ModelAdmin):
    list_display = ('supplier_name', 'boat_name', 'fishing_location', 'arrival_date')

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('fish', 'retailer', 'stock_quantity', 'stock_unit', 'availability_status')
    list_filter = ('availability_status', 'retailer')

@admin.register(FishDelivery)
class FishDeliveryAdmin(admin.ModelAdmin):
    list_display = ('fish', 'retailer', 'quantity', 'delivery_date', 'delivery_status')
    list_filter = ('delivery_status', 'delivery_date')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('report_name', 'report_type', 'generated_by', 'generated_date')
    list_filter = ('report_type', 'generated_date')

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ('fish', 'predicted_price', 'prediction_date', 'trend_status')
    list_filter = ('trend_status', 'prediction_date')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
