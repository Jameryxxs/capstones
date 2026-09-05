
from django.db import models
from django.contrib.auth.models import AbstractUser
from simple_history.models import HistoricalRecords


# =====================================================
# CUSTOM USER MODEL
# =====================================================

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('retailer', 'Retailer'),
        ('staff', 'Staff'),
        ('guest', 'Guest/Consumer'),
        ('supplier', 'Supplier/Vessel Owner'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.username


# =====================================================
# FISH TABLE
# =====================================================

class Fish(models.Model):
    CATEGORY_CHOICES = (
        ('freshwater', 'Freshwater'),
        ('saltwater', 'Saltwater'),
    )

    fish_name = models.CharField(max_length=255)
    scientific_name = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    average_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='fish_images/', blank=True, null=True)
    status = models.CharField(max_length=50, default='Available')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.fish_name


# =====================================================
# RETAILERS TABLE
# =====================================================

class Retailer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    stall_number = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    latitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    longitude = models.DecimalField(max_digits=12, decimal_places=9, null=True, blank=True)
    registration_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Active')

    def __str__(self):
        return self.business_name


# =====================================================
# FISH PRICE MONITORING TABLE
# =====================================================

class FishPrice(models.Model):
    fish = models.ForeignKey(Fish, on_delete=models.CASCADE)
    retailer = models.ForeignKey(Retailer, on_delete=models.CASCADE)
    price_per_kilo = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.IntegerField()
    market_date = models.DateField()
    origin = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.fish.fish_name} - ₱{self.price_per_kilo}"

    class Meta:
        indexes = [
            models.Index(fields=['market_date', 'fish']),
            models.Index(fields=['market_date']),
            models.Index(fields=['retailer', 'fish']),
        ]


# =====================================================
# FISHING LOCATIONS TABLE
# =====================================================

class FishingLocation(models.Model):
    location_name = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    province = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.location_name


# =====================================================
# SUPPLY SOURCES TABLE
# =====================================================

class SupplySource(models.Model):
    STATUS_CHOICES = (
        ('at_sea', 'At Sea'),
        ('in_transit', 'In Transit'),
        ('docked', 'Docked'),
        ('arrived', 'Arrived'),
    )
    TYPE_CHOICES = (
        ('vessel', 'Fishing Vessel'),
        ('external', 'External Supplier'),
    )

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vessel')
    supplier_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='vessel')
    supplier_name = models.CharField(max_length=255)
    boat_name = models.CharField(max_length=255, blank=True, null=True)
    fishing_location = models.ForeignKey(
        FishingLocation,
        on_delete=models.CASCADE
    )
    contact_number = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='at_sea')
    current_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    arrival_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.supplier_name


# =====================================================
# INVENTORY TABLE
# =====================================================

class Inventory(models.Model):
    fish = models.ForeignKey(Fish, on_delete=models.CASCADE)
    retailer = models.ForeignKey(Retailer, on_delete=models.CASCADE)
    stock_quantity = models.IntegerField()
    stock_unit = models.CharField(max_length=50, default='kg')
    expiration_date = models.DateField(blank=True, null=True)
    availability_status = models.CharField(
        max_length=50,
        default='Available'
    )
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.fish.fish_name} Inventory"


# =====================================================
# FISH DELIVERIES TABLE
# =====================================================

class FishDelivery(models.Model):
    DELIVERY_STATUS = (
        ('pending', 'Pending'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    supply_source = models.ForeignKey(
        SupplySource,
        on_delete=models.CASCADE
    )
    fish = models.ForeignKey(Fish, on_delete=models.CASCADE)
    retailer = models.ForeignKey(Retailer, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    delivery_date = models.DateField()
    delivery_status = models.CharField(
        max_length=20,
        choices=DELIVERY_STATUS,
        default='pending'
    )
    remarks = models.TextField(blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.fish.fish_name} Delivery"

    class Meta:
        indexes = [
            models.Index(fields=['delivery_date', 'fish', 'delivery_status']),
            models.Index(fields=['delivery_date']),
            models.Index(fields=['retailer', 'fish']),
        ]


# =====================================================
# REPORTS TABLE
# =====================================================

class Report(models.Model):
    REPORT_TYPES = (
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    )

    report_name = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    generated_date = models.DateTimeField(auto_now_add=True)
    file_path = models.FileField(upload_to='reports/', blank=True, null=True)
    summary = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.report_name


# =====================================================
# PREDICTIVE ANALYTICS TABLE
# =====================================================

class Prediction(models.Model):
    TREND_STATUS = (
        ('increase', 'Increase'),
        ('decrease', 'Decrease'),
        ('stable', 'Stable'),
    )

    fish = models.ForeignKey(Fish, on_delete=models.CASCADE)
    predicted_price = models.DecimalField(max_digits=10, decimal_places=2)
    predicted_supply = models.IntegerField()
    prediction_date = models.DateField()
    trend_status = models.CharField(
        max_length=20,
        choices=TREND_STATUS
    )
    confidence_score = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.fish.fish_name} Prediction"


# =====================================================
# NOTIFICATIONS TABLE
# =====================================================

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('price_update', 'Price Update'),
        ('delivery', 'Delivery'),
        ('system', 'System'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# =====================================================
# BULLETIN BOARD TABLE
# =====================================================

class Bulletin(models.Model):
    CATEGORY_CHOICES = (
        ('info', 'Information'),
        ('urgent', 'Urgent Advisory'),
        ('weather', 'Weather Warning'),
    )

    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='info')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

# =====================================================
# ACCOUNT APPLICATION TABLE
# =====================================================

class AccountApplication(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    ROLE_CHOICES = (
        ('retailer', 'Retailer'),
        ('supplier', 'Supplier'),
    )

    full_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    business_name = models.CharField(max_length=255, blank=True, null=True)
    requested_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    appointment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.full_name} - {self.requested_role} Application"
