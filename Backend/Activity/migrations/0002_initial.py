# Generated by Django 5.1.3 on 2024-12-06 07:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("Activity", "0001_initial"),
        ("Candidate", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="activity",
            name="candidate",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="Candidate.candidate",
            ),
        ),
    ]
