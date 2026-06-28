from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import FishPrice, FishDelivery, Bulletin, SupplySource, Inventory, Retailer, AccountApplication

@receiver(post_delete, sender=FishPrice)
def sync_inventory_on_price_delete(sender, instance, **kwargs):
    # Find if there's any remaining price record for this fish and retailer
    latest_price = FishPrice.objects.filter(
        retailer=instance.retailer, 
        fish=instance.fish
    ).order_by('-market_date', '-created_at').first()
    
    if latest_price:
        # Revert inventory to the next latest available record
        Inventory.objects.update_or_create(
            fish=instance.fish,
            retailer=instance.retailer,
            defaults={
                'stock_quantity': latest_price.quantity_available,
                'availability_status': 'Available' if latest_price.quantity_available > 0 else 'Out of Stock'
            }
        )
    else:
        # No more records for this fish, completely remove from inventory
        Inventory.objects.filter(fish=instance.fish, retailer=instance.retailer).delete()

@receiver(post_save, sender=FishPrice)
def sync_price_to_inventory(sender, instance, created, **kwargs):
    # Update or create inventory record
    inventory, _ = Inventory.objects.update_or_create(
        fish=instance.fish,
        retailer=instance.retailer,
        defaults={
            'stock_quantity': instance.quantity_available,
            'availability_status': 'Available' if instance.quantity_available > 0 else 'Out of Stock'
        }
    )
    
    # WebSocket Broadcast
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "market_updates",
        {
            "type": "broadcast_update",
            "data": {
                "type": "PRICE_UPDATE",
                "fish_name": instance.fish.fish_name,
                "price": float(instance.price_per_kilo),
                "retailer": instance.retailer.business_name,
                "quantity": instance.quantity_available
            }
        }
    )

@receiver(post_save, sender=FishDelivery)
def broadcast_delivery_update(sender, instance, created, **kwargs):
    if instance.delivery_status == 'delivered':
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "DELIVERY_UPDATE",
                    "fish_name": instance.fish.fish_name,
                    "quantity": instance.quantity,
                    "source": instance.supply_source.boat_name
                }
            }
        )

@receiver(post_save, sender=Bulletin)
def broadcast_bulletin(sender, instance, created, **kwargs):
    if created and instance.is_active:
        # 1. WebSocket Broadcast
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "BULLETIN_UPDATE",
                    "title": instance.title,
                    "category": instance.category
                }
            }
        )
        
        # 2. Database Notifications for all users
        from .models import User, Notification
        users = User.objects.filter(is_active=True)
        notifications = []
        for user in users:
            notifications.append(Notification(
                user=user,
                title=f"New Bulletin: {instance.title}",
                message=instance.content[:100] + "..." if len(instance.content) > 100 else instance.content,
                notification_type="system"
            ))
        if notifications:
            Notification.objects.bulk_create(notifications)

@receiver(post_save, sender=SupplySource)
def broadcast_vessel_location(sender, instance, **kwargs):
    if instance.current_lat and instance.current_lng:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "VESSEL_LOCATION_UPDATE",
                    "id": instance.id,
                    "name": instance.boat_name,
                    "supplier": instance.supplier_name,
                    "lat": float(instance.current_lat),
                    "lng": float(instance.current_lng),
                    "status": instance.status,
                    "origin": instance.fishing_location.location_name
                }
            }
        )

@receiver(post_save, sender=AccountApplication)
def broadcast_new_application(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "market_updates",
            {
                "type": "broadcast_update",
                "data": {
                    "type": "NEW_APPLICATION_UPDATE",
                    "id": instance.id,
                    "full_name": instance.full_name,
                    "requested_role": instance.requested_role,
                    "status": instance.status,
                    "created_at": instance.created_at.isoformat()
                }
            }
        )
