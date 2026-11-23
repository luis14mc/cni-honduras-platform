from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [("integrations", "0002_webhookevent_retries")]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.AlterModelTable(
                    name="suitecrmintegrationlog",
                    table="integrations_delivery_log_archive",
                ),
            ],
            state_operations=[migrations.DeleteModel(name="SuiteCRMIntegrationLog")],
        ),
    ]
