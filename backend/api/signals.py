from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import FishPrice, FishDelivery, Bulletin

@receiver(post_save, sender=FishPrice)
def broadcast_price_update(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "market_updates",
        {
            "type": "broadcast_update",
            "data": {
                "type": "PRICE_UPDATE",
                "fish_name": instance.fish.fish_name,
                "price": float(instance.price_per_kilo),
                "retailer": instance.retailer.business_name
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
