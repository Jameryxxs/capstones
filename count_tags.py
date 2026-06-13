
import re

def count_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove comments
    content = re.sub(r'{\/\*.*?\*\/}', '', content, flags=re.DOTALL)
    content = re.sub(r'\/\/.*', '', content)

    opening_divs = len(re.findall(r'<div', content))
    closing_divs = len(re.findall(r'<\/div>', content))
    
    opening_svg = len(re.findall(r'<svg', content))
    closing_svg = len(re.findall(r'<\/svg>', content))

    opening_g = len(re.findall(r'<g', content))
    closing_g = len(re.findall(r'<\/g>', content))

    opening_card = len(re.findall(r'<Card', content))
    closing_card = len(re.findall(r'<\/Card>', content))

    print(f"Divs: {opening_divs} open, {closing_divs} close")
    print(f"SVG: {opening_svg} open, {closing_svg} close")
    print(f"G: {opening_g} open, {closing_g} close")
    print(f"Card: {opening_card} open, {closing_card} close")

count_tags('C:/Users/albert/THESIS/frontend/src/pages/MarketMap.jsx')
