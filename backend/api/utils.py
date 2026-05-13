import io
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from .models import FishPrice, Fish
from datetime import date

def generate_market_bulletin(request):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawCentredString(width / 2, height - 50, "FishLodger: Daily Market Bulletin")
    p.setFont("Helvetica", 12)
    p.drawCentredString(width / 2, height - 70, f"Lucena Fish Port Complex - {date.today().strftime('%B %d, %Y')}")
    
    p.line(50, height - 80, width - 50, height - 80)

    # Content
    prices = FishPrice.objects.filter(market_date=date.today()).select_related('fish')
    
    y = height - 120
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Fish Species")
    p.drawString(250, y, "Price / kg")
    p.drawString(350, y, "Retailer")
    
    p.line(50, y - 5, width - 50, y - 5)
    
    y -= 30
    p.setFont("Helvetica", 10)
    
    if not prices.exists():
        p.drawString(50, y, "No data recorded for today.")
    else:
        for price in prices:
            if y < 100:
                p.showPage()
                y = height - 50
            
            p.drawString(50, y, price.fish.fish_name)
            p.drawString(250, y, f"PHP {price.price_per_kilo}")
            p.drawString(350, y, price.retailer.business_name)
            y -= 20

    # Summary Section
    y -= 40
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Summary")
    p.line(50, y - 5, 120, y - 5)
    y -= 25
    
    total_listings = prices.count()
    avg_price = sum(p.price_per_kilo for p in prices) / total_listings if total_listings > 0 else 0
    
    p.setFont("Helvetica", 10)
    p.drawString(50, y, f"Total Species Listed: {total_listings}")
    y -= 20
    p.drawString(50, y, f"Average Market Price: PHP {avg_price:.2f}")

    # Footer
    p.setFont("Helvetica-Oblique", 8)
    p.drawCentredString(width / 2, 30, "Generated automatically by FishLodger PWA Monitoring System")

    p.showPage()
    p.save()

    buffer.seek(0)
    return FileResponse(buffer, as_attachment=True, filename=f"Market_Bulletin_{date.today()}.pdf")
