# Generated by Django 5.1.3 on 2024-12-09 10:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Candidate", "0007_alter_candidate_contract_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="candidate",
            name="status",
            field=models.CharField(blank=True, null=True),
        ),
    ]
