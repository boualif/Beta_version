# Generated by Django 5.1.3 on 2024-12-09 09:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Candidate", "0006_alter_candidate_contract_location_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="candidate",
            name="contract_type",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
