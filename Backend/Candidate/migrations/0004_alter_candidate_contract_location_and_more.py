# Generated by Django 5.1.3 on 2024-12-09 09:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Candidate", "0003_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="candidate",
            name="contract_location",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name="candidate",
            name="status",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
