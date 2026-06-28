import re

with open('c:/Users/albert/THESIS/backend/api/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix indentation on line 342
content = content.replace("relevant_fish_ids = fish_queryset.values_list('id', flat=True)", "    relevant_fish_ids = fish_queryset.values_list('id', flat=True)")

# Replace get_correlation_data
pattern = r"@api_view\(\['GET'\]\)\ndef get_correlation_data\(request, fish_id\):.*?return Response\(.*?\)\n"

new_func = """@api_view(['GET'])
def get_correlation_data(request, fish_id):
    days_ago = date.today() - timedelta(days=180)
    deliveries = FishDelivery.objects.filter(
        fish_id=fish_id, 
        delivery_date__gte=days_ago,
        delivery_status='delivered'
    ).values('delivery_date').annotate(total_qty=Sum('quantity'))
    
    prices = FishPrice.objects.filter(
        fish_id=fish_id,
        market_date__gte=days_ago
    ).values('market_date').annotate(avg_price=Avg('price_per_kilo'))
    
    data_map = {}
    for d in deliveries:
        dt = d['delivery_date'].strftime('%Y-%m-%d')
        data_map[dt] = {'supply': d['total_qty'], 'price': None}
    
    for p in prices:
        dt = p['market_date'].strftime('%Y-%m-%d')
        if dt in data_map:
            data_map[dt]['price'] = round(float(p['avg_price']), 2)
            
    correlation_data = []
    supply_arr = []
    price_arr = []
    
    for k, v in data_map.items():
        if v['price'] is not None and v['supply'] is not None:
            s_val = float(v['supply'])
            p_val = float(v['price'])
            correlation_data.append({'date': k, 'supply': s_val, 'price': p_val})
            supply_arr.append(s_val)
            price_arr.append(p_val)
            
    pearson_r = 0.0
    if len(supply_arr) > 1 and len(price_arr) > 1:
        import numpy as np
        try:
            corr_matrix = np.corrcoef(supply_arr, price_arr)
            if not np.isnan(corr_matrix[0, 1]):
                pearson_r = round(corr_matrix[0, 1], 2)
        except Exception as e:
            print("Error:", e)
            
    return Response({
        "correlation_coefficient": pearson_r,
        "data_points": correlation_data
    })
"""

content = re.sub(pattern, new_func, content, flags=re.DOTALL)

with open('c:/Users/albert/THESIS/backend/api/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix applied successfully")
