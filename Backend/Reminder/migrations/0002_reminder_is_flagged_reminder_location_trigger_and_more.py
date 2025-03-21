# Generated by Django 5.1.3 on 2025-02-03 09:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Reminder", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="reminder",
            name="is_flagged",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="reminder",
            name="location_trigger",
            field=models.JSONField(
                blank=True,
                help_text="Location data for location-based reminders",
                null=True,
            ),
        ),
        migrations.AddField(
            model_name="reminder",
            name="notification_offset",
            field=models.IntegerField(
                blank=True, help_text="Minutes before the due date", null=True
            ),
        ),
        migrations.AddField(
            model_name="reminder",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("time", "Time-based"),
                    ("location", "Location-based"),
                    ("message", "When-messaging"),
                ],
                default="time",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="reminder",
            name="time_zone",
            field=models.CharField(default="UTC", max_length=50),
        ),
        migrations.AddField(
            model_name="reminderlist",
            name="is_smart_list",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="reminderlist",
            name="smart_list_filter",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="reminder",
            name="notes",
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="ReminderAttachment",
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
                    "type",
                    models.CharField(
                        choices=[
                            ("image", "Image"),
                            ("file", "File"),
                            ("url", "URL"),
                            ("checklist", "Checklist"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "content",
                    models.FileField(
                        blank=True, null=True, upload_to="reminder_attachments/"
                    ),
                ),
                ("url", models.URLField(blank=True, null=True)),
                ("checklist_items", models.JSONField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "reminder",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="attachments",
                        to="Reminder.reminder",
                    ),
                ),
            ],
        ),
    ]
