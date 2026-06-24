import os
import time
import subprocess
from datetime import datetime

def run_service():
    print("🚀 FishLedger Weather Automation Service")
    print("This service will generate a weather report every 24 hours.")
    
    # Run once immediately on start
    print(f"[{datetime.now()}] Initializing first report...")
    subprocess.run(["python", "backend/generate_weather_report.py"])
    
    try:
        while True:
            # Wait for 24 hours (86400 seconds)
            print(f"[{datetime.now()}] Service sleeping... Next update in 24 hours.")
            time.sleep(86400)
            
            print(f"[{datetime.now()}] Generating scheduled daily report...")
            subprocess.run(["python", "backend/generate_weather_report.py"])
            
    except KeyboardInterrupt:
        print("\nService stopped by user.")
    except Exception as e:
        print(f"Critical error in weather service: {e}")

if __name__ == "__main__":
    run_service()
