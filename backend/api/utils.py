import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from .models import FishPrice, Fish, Notification, User
from datetime import date, timedelta
from django.db.models import Avg

def create_system_notification(title, message, alert_type='system'):
    """
    Creates a notification for all active users regarding market or system alerts.
    """
    users = User.objects.filter(is_active=True)
    notifications = []
    for user in users:
        # Check if a similar unread notification already exists to avoid spam
        exists = Notification.objects.filter(
            user=user, 
            title=title, 
            is_read=False,
            created_at__date=date.today()
        ).exists()
        
        if not exists:
            notifications.append(Notification(
                user=user,
                title=title,
                message=message,
                notification_type=alert_type
            ))
    
    if notifications:
        Notification.objects.bulk_create(notifications)
        return True
    return False

def generate_market_bulletin(request):
    period = request.GET.get('period', 'daily')
    today = date.today()
    
    start_date = today
    title_prefix = "Daily"
    
    if period == 'weekly':
        start_date = today - timedelta(days=7)
        title_prefix = "Weekly"
    elif period == 'monthly':
        start_date = today - timedelta(days=30)
        title_prefix = "Monthly"
    elif period == 'annual':
        start_date = today - timedelta(days=365)
        title_prefix = "Annual"

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(width / 2, height - 50, f"FishLodger: {title_prefix} Market Bulletin")
    pdf.setFont("Helvetica", 11)
    
    date_range = today.strftime('%B %d, %Y') if period == 'daily' else f"{start_date.strftime('%b %d')} - {today.strftime('%b %d, %Y')}"
    pdf.drawCentredString(width / 2, height - 70, f"Lucena Fish Port Complex | {date_range}")
    
    pdf.setStrokeColor(colors.HexColor("#48dbfb"))
    pdf.line(50, height - 85, width - 50, height - 85)

    # Content Query
    prices = FishPrice.objects.filter(market_date__range=[start_date, today]).select_related('fish', 'retailer')
    
    # Aggregated Summary Data
    total_listings = prices.count()
    avg_price = prices.aggregate(Avg('price_per_kilo'))['price_per_kilo__avg'] or 0
    unique_species = prices.values('fish').distinct().count()
    top_species = prices.values('fish__fish_name').annotate(avg_p=Avg('price_per_kilo')).order_by('-avg_p')[:5]

    y = height - 120
    
    # Summary Box
    pdf.setFillColor(colors.HexColor("#f1f2f6"))
    pdf.rect(50, y - 60, width - 100, 60, fill=1, stroke=0)
    pdf.setFillColor(colors.black)
    
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(60, y - 20, f"Summary Period: {title_prefix}")
    pdf.setFont("Helvetica", 10)
    pdf.drawString(60, y - 40, f"Total Records: {total_listings}")
    pdf.drawString(200, y - 40, f"Unique Species: {unique_species}")
    pdf.drawString(350, y - 40, f"Avg Market Price: PHP {avg_price:.2f}")

    y -= 90
    
    # Section: Detailed Price Logs (Limit to top 30 for PDF length safety)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, f"Market Price Overview ({title_prefix})")
    y -= 25
    
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(50, y, "Fish Species")
    pdf.drawString(200, y, "Category")
    pdf.drawString(300, y, "Avg Price")
    pdf.drawString(400, y, "Retailer (Last)")
    
    pdf.line(50, y - 5, width - 50, y - 5)
    y -= 25
    pdf.setFont("Helvetica", 9)

    # Use distinct fish for the main table to avoid huge repeats in long reports
    distinct_fish_data = prices.values('fish__fish_name', 'fish__category').annotate(
        avg_p=Avg('price_per_kilo')
    ).order_by('fish__fish_name')[:40]

    if not distinct_fish_data:
        pdf.drawString(50, y, "No data available for this period.")
    else:
        for item in distinct_fish_data:
            if y < 80:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica", 9)
            
            pdf.drawString(50, y, item['fish__fish_name'].upper())
            pdf.drawString(200, y, item['fish__category'].capitalize())
            pdf.drawString(300, y, f"PHP {item['avg_p']:.2f}")
            
            # Find a retailer who sold this fish in this period
            last_seller = prices.filter(fish__fish_name=item['fish__fish_name']).first()
            if last_seller:
                pdf.drawString(400, y, last_seller.retailer.business_name[:25])
            
            y -= 18

    # Footer
    pdf.setFont("Helvetica-Oblique", 8)
    pdf.drawCentredString(width / 2, 30, "Automated Market Intelligence Report - FishLodger Lucena")

    pdf.showPage()
    pdf.save()

    buffer.seek(0)
    filename = f"FishLodger_{title_prefix}_Bulletin_{today}.pdf"
    return FileResponse(buffer, as_attachment=True, filename=filename)

import math
from datetime import datetime, timedelta

PORT_LAT = 13.913
PORT_LNG = 121.632
AVERAGE_BOAT_SPEED_KMPH = 15.0 # ~8 knots

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    try:
        R = 6371.0 # Earth radius in km
        
        dlat = math.radians(float(lat2) - float(lat1))
        dlon = math.radians(float(lon2) - float(lon1))
        
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    except Exception:
        return 0.0

def get_vessel_eta(lat, lng):
    if not lat or not lng:
        return "Unknown"
    
    dist = calculate_haversine_distance(lat, lng, PORT_LAT, PORT_LNG)
    
    if dist < 0.5:
        return "Docked"
        
    hours = dist / AVERAGE_BOAT_SPEED_KMPH
    minutes = int(hours * 60)
    
    return f"{minutes}m ({dist:.1f}km remaining)"
