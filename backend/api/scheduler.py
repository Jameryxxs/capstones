import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django.core.management import call_command
from django.conf import settings

logger = logging.getLogger(__name__)

def train_ml_models_job():
    try:
        logger.info("Starting automated background ML training...")
        call_command('train_models')
        logger.info("Successfully completed automated ML training.")
    except Exception as e:
        logger.error(f"Failed to execute automated ML training: {str(e)}")

def start():
    scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_jobstore(DjangoJobStore(), "default")
    
    # We schedule this job to run at midnight every day
    scheduler.add_job(
        train_ml_models_job,
        trigger=CronTrigger(hour="00", minute="00"),  # Midnight
        id="train_ml_models_nightly",
        max_instances=1,
        replace_existing=True,
    )
    
    logger.info("Added job 'train_ml_models_nightly' to run at midnight.")
    
    scheduler.start()
    logger.info("APScheduler started in background.")
