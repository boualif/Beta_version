# Generated by Django 5.1.3 on 2025-01-07 09:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Application", "0003_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="application",
            name="interview_client_final",
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name="application",
            name="interview_partner",
            field=models.DateTimeField(null=True),
        ),
    ]
