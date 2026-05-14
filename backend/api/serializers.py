from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Report, 
    Prediction, Notification
)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone_number', 'created_at')

class FishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fish
        fields = '__all__'

class RetailerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retailer
        fields = '__all__'

class FishPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishPrice
        fields = '__all__'

class FishingLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishingLocation
        fields = '__all__'

class SupplySourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplySource
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class FishDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = FishDelivery
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
