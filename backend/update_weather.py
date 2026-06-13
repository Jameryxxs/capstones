import os
import django
import time
import requests
from datetime import datetime

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.views import fetch_weather_info

def auto_update():
    print("🌤️ Weather Auto-Update Service Started...")
    print("Updating every 10 minutes. Press Ctrl+C to stop.")
    
    try:
        while True:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Fetching fresh meteorological data...")
            # fetch_weather_info already handles caching and WebSocket broadcasting
            weather = fetch_weather_info()
            print(f"✅ Success: {weather['temp']}°C, {weather['description']}")
            
            # Update more frequently (every 30 seconds) for demonstration
            time.sleep(30)
            
    except KeyboardInterrupt:
        print("\nService stopped.")
    except Exception as e:
        print(f"❌ Critical Error: {e}")

if __name__ == "__main__":
    auto_update()
