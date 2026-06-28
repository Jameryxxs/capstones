from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import api.signals
        
        import os
        import sys
        
        # Start the scheduler only if running the actual server, not during migrations
        if os.environ.get('RUN_MAIN', None) == 'true' or 'runserver' not in sys.argv:
            # Check to avoid running twice in development or during manage.py commands like migrate
            is_management_command = any(cmd in sys.argv for cmd in ['migrate', 'makemigrations', 'test', 'shell'])
            if not is_management_command:
                from api import scheduler
                scheduler.start()
