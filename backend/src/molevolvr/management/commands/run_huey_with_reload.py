from django.core.management.base import BaseCommand
from django.utils import autoreload

from huey.contrib.djhuey.management.commands.run_huey import Command as RunHueyCommand

class Command(BaseCommand):
    help = "Run the Huey consumer with Django autoreload (for development use only)."

    def handle(self, *args, **options):
        run_huey = RunHueyCommand().handle

        self.stdout.write(
            self.style.NOTICE("Starting Huey with autoreload (dev mode only)...")
        )

        # This will restart Huey whenever a code file changes
        autoreload.run_with_reloader(run_huey, *args, **options)
