# Generated by Django 5.1.3 on 2024-12-06 07:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("Client", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Job",
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
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(null=True)),
                ("company", models.CharField(max_length=100, null=True)),
                ("budget", models.FloatField(blank=True, null=True)),
                ("opening_date", models.DateField(blank=True, null=True)),
                ("location", models.CharField(max_length=100, null=True)),
                ("contact_person", models.CharField(max_length=100, null=True)),
                ("contact_person_phone", models.CharField(max_length=100, null=True)),
                ("contact_person_email", models.CharField(max_length=100, null=True)),
                ("nb_positions", models.IntegerField(null=True)),
                ("added_at", models.DateTimeField(auto_now_add=True, null=True)),
                (
                    "status",
                    models.CharField(
                        blank=True,
                        choices=[("open", "Open"), ("close", "Closed")],
                        max_length=50,
                        null=True,
                    ),
                ),
                ("contract_start_date", models.DateField(blank=True, null=True)),
                ("contract_end_date", models.DateField(blank=True, null=True)),
                (
                    "client",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        to="Client.client",
                    ),
                ),
            ],
            options={
                "db_table": "job",
                "ordering": ["-added_at"],
            },
        ),
    ]
