# Generated by Django 5.1.3 on 2024-12-06 07:27

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("Candidate", "0002_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Notification",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "date",
                    models.DateTimeField(default=django.utils.timezone.now, null=True),
                ),
                ("content", models.CharField(blank=True, max_length=20, null=True)),
                ("is_confirmed", models.BooleanField()),
                (
                    "candidate",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="Candidate.candidate",
                    ),
                ),
            ],
            options={
                "db_table": "notification",
                "ordering": ["-date"],
            },
        ),
    ]
