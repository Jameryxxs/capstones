import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
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

def draw_bantay_presyo_background(pdf, width, height, date_text):
    # Navy Blue Header Banner
    pdf.setFillColor(colors.HexColor("#1b4471"))
    pdf.roundRect(80, height - 130, width - 130, 90, 10, fill=1, stroke=0)
    
    # Text in Header Banner
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawCentredString(width / 2 + 50, height - 65, "PFDA – Lucena Fish Port Complex")
    pdf.setFont("Helvetica-Bold", 26)
    pdf.drawCentredString(width / 2 + 50, height - 90, "FISH PRICE MONITORING")
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(width / 2 + 50, height - 110, f"for {date_text}")
    
    # "Price Tag" Shape on the left
    pdf.setFillColor(colors.HexColor("#1b4471"))
    path = pdf.beginPath()
    path.moveTo(40, height - 60)
    path.lineTo(160, height - 30)
    path.lineTo(190, height - 140)
    path.lineTo(70, height - 180)
    path.close()
    pdf.drawPath(path, fill=1, stroke=0)
    
    # Price Tag Border (White)
    pdf.setStrokeColor(colors.white)
    pdf.setLineWidth(2)
    path_inner = pdf.beginPath()
    path_inner.moveTo(45, height - 63)
    path_inner.lineTo(155, height - 36)
    path_inner.lineTo(182, height - 136)
    path_inner.lineTo(72, height - 173)
    path_inner.close()
    pdf.drawPath(path_inner, fill=0, stroke=1)
    
    # BANTAY PRESYO Text rotated inside the tag
    pdf.saveState()
    pdf.translate(115, height - 105)
    pdf.rotate(15)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 28)
    pdf.drawCentredString(0, 15, "BANTAY")
    pdf.drawCentredString(0, -15, "PRESYO")
    
    # "Wind" lines next to PRESYO
    pdf.setStrokeColor(colors.white)
    pdf.setLineWidth(2)
    pdf.bezier(60, -8, 80, 5, 80, -25, 60, -12)
    pdf.bezier(65, -15, 85, 0, 85, -30, 65, -18)
    pdf.restoreState()
    
    # Hole and string
    pdf.setFillColor(colors.white)
    pdf.circle(60, height - 115, 6, fill=1, stroke=0)
    pdf.setStrokeColor(colors.gray)
    pdf.setLineWidth(1.5)
    pdf.bezier(60, height - 115, 20, height - 100, 0, height - 150, 40, height - 200)

    # Footer Waves (Simplified)
    pdf.setFillColor(colors.HexColor("#1b4471"))
    pdf.rect(0, 0, width, 50, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor("#5b9bd5"))
    path_wave = pdf.beginPath()
    path_wave.moveTo(0, 50)
    path_wave.curveTo(width/8, 80, width*3/8, 80, width/2, 50)
    path_wave.curveTo(width*5/8, 20, width*7/8, 20, width, 50)
    path_wave.lineTo(width, 0)
    path_wave.lineTo(0, 0)
    path_wave.close()
    pdf.drawPath(path_wave, fill=1, stroke=0)
    
    # Fish Silhouettes
    pdf.setFillColor(colors.HexColor("#1b4471"))
    # Fish 1
    pdf.ellipse(400, 60, 440, 80, fill=1, stroke=0)
    p1 = pdf.beginPath()
    p1.moveTo(440, 70)
    p1.lineTo(455, 85)
    p1.lineTo(450, 60)
    p1.close()
    pdf.drawPath(p1, fill=1, stroke=0)
    
    # Fish 2
    pdf.ellipse(460, 70, 510, 110, fill=1, stroke=0)
    p2 = pdf.beginPath()
    p2.moveTo(505, 90)
    p2.lineTo(530, 120)
    p2.lineTo(520, 60)
    p2.close()
    pdf.drawPath(p2, fill=1, stroke=0)
    
    # Footer Text
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica", 8)
    pdf.drawString(80, 15, "Department of Agriculture | Philippine Fisheries Development Authority")
    pdf.drawString(450, 15, "www.pfda.gov.ph")

def generate_market_bulletin(request):
    period = request.GET.get('period', 'daily')
    start_str = request.GET.get('start_date')
    end_str = request.GET.get('end_date')

    today = date.today()
    if start_str and end_str:
        from datetime import datetime
        start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
    else:
        end_date = today
        start_date = today
        if period == 'weekly': start_date = today - timedelta(days=7)
        elif period == 'monthly': start_date = today - timedelta(days=30)
        elif period == 'annual': start_date = today - timedelta(days=365)

    if start_date == end_date:
        date_text = start_date.strftime('%B %d, %Y')
    else:
        date_text = f"{start_date.strftime('%b %d, %Y')} - {end_date.strftime('%b %d, %Y')}"

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Data Source
    prices = FishPrice.objects.filter(market_date__range=[start_date, end_date])
    distinct_fish_data = prices.values('fish__fish_name').annotate(
        avg_p=Avg('price_per_kilo')
    ).order_by('fish__fish_name')

    data_list = list(distinct_fish_data)
    if not data_list:
        data_list = [{'fish__fish_name': 'NO DATA RECORDED', 'avg_p': 0.0}]

    chunk_size = 10
    chunks = [data_list[i:i + chunk_size] for i in range(0, len(data_list), chunk_size)]

    for chunk in chunks:
        draw_bantay_presyo_background(pdf, width, height, date_text)
        
        # Build Table Data
        table_data = [['SPECIES', 'AVERAGE WHOLESALE\nPRICE PER KILO (in peso)']]
        for item in chunk:
            species = item['fish__fish_name'].upper()
            price = f"{item['avg_p']:.2f}" if item['avg_p'] else "0.00"
            table_data.append([species, price])
        
        # Build Table
        t = Table(table_data, colWidths=[240, 210])
        table_style = [
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#184589")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('VALIGN', (0, 0), (-1, 0), 'MIDDLE'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('TOPPADDING', (0, 0), (-1, 0), 10),
            # Data rows styling
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('ALIGN', (1, 1), (1, -1), 'CENTER'),
            ('VALIGN', (0, 1), (-1, -1), 'MIDDLE'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 10),
            # Grid
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#c4d2e1")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#c4d2e1")),
        ]
        
        # Row Backgrounds
        for i in range(1, len(table_data)):
            if i % 2 != 0:
                table_style.append(('BACKGROUND', (0, i), (-1, i), colors.HexColor("#e3ebf4"))) # Ice blue
            else:
                table_style.append(('BACKGROUND', (0, i), (-1, i), colors.white))

        t.setStyle(TableStyle(table_style))
        
        t_width, t_height = t.wrapOn(pdf, width, height)
        # Position table left-aligned with the blue banner
        t.drawOn(pdf, 80, height - 140 - t_height)

        pdf.showPage()
        
    pdf.save()
    buffer.seek(0)
    filename = f"BantayPresyo_{start_date}.pdf"
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
