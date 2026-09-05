from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import api.signals
        
        import os
        import sys
        
        # Start the scheduler only if running the actual dev server or when explicitly enabled
        is_runserver = any('runserver' in arg for arg in sys.argv)
        is_main_worker = os.environ.get('RUN_MAIN') == 'true'
        explicitly_enabled = os.environ.get('ENABLE_SCHEDULER') == 'true'
        
        if (is_runserver and is_main_worker) or explicitly_enabled:
            from api import scheduler
            scheduler.start()
