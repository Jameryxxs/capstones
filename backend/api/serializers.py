from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    User, Fish, Retailer, FishPrice, FishingLocation, 
    SupplySource, Inventory, FishDelivery, Report, 
    Prediction, Notification, Bulletin, AccountApplication
)

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    stall_number = serializers.CharField(write_only=True, required=False)
    business_name = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    retailer_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone_number', 'first_name', 'last_name', 'created_at', 'retailer_details', 'stall_number', 'business_name', 'address')

    def get_retailer_details(self, obj):
        try:
            return RetailerSerializer(obj.retailer).data
        except:
            return None

    def create(self, validated_data):
        password = validated_data.pop('password')
        stall_number = validated_data.pop('stall_number', 'TBD')
        business_name = validated_data.pop('business_name', None)
        address = validated_data.pop('address', '')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # If user is a retailer, create a retailer profile
        if user.role == 'retailer':
            Retailer.objects.create(
                user=user,
                business_name=business_name or f"{user.username}'s Stall",
                stall_number=stall_number,
                contact_number=user.phone_number or "N/A",
                email=user.email,
                address=address
            )
        return user

class FishSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fish
        fields = '__all__'

class RetailerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retailer
        fields = '__all__'

class FishPriceSerializer(serializers.ModelSerializer):
    fish_name = serializers.ReadOnlyField(source='fish.fish_name')
    fish_category = serializers.ReadOnlyField(source='fish.category')
    retailer_business_name = serializers.ReadOnlyField(source='retailer.business_name')
    
    class Meta:
        model = FishPrice
        fields = '__all__'
        read_only_fields = ('created_by',)
        extra_kwargs = {
            'retailer': {'required': False}
        }

class FishingLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishingLocation
        fields = '__all__'

class SupplySourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplySource
        fields = ('id', 'supplier_name', 'boat_name', 'fishing_location', 'contact_number', 'status', 'current_lat', 'current_lng', 'arrival_date', 'created_at')

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class FishDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = FishDelivery
        fields = '__all__'
        extra_kwargs = {
            'retailer': {'required': False}
        }

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

class BulletinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bulletin
        fields = '__all__'

class AccountApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountApplication
        fields = '__all__'

