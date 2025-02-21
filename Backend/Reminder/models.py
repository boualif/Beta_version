from django.db import models
from django.conf import settings

class ReminderList(models.Model):
    title = models.CharField(max_length=200)
    color = models.CharField(max_length=7, default="#007AFF")  # Couleur hex
    icon = models.CharField(max_length=50, default="list")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_smart_list = models.BooleanField(default=False)  # Add default value

    
    def __str__(self):
        return self.title
class Phrase(models.Model):
    list = models.ForeignKey(ReminderList, related_name='phrases', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    checked = models.BooleanField(default=False)
    
class Note(models.Model):
    list = models.ForeignKey(ReminderList, related_name='notes', on_delete=models.CASCADE)
    text = models.TextField()
    checked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']  
class Reminder(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ]
    
    list = models.ForeignKey(ReminderList, on_delete=models.CASCADE, related_name='reminders')
    title = models.CharField(max_length=200)  # Standard CharField
    notes = models.TextField(null=True, blank=True)  # Standard TextField
    due_date = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=20, null=True, blank=True)
    recurrence_end_date = models.DateTimeField(null=True, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subtasks')
    is_flagged = models.BooleanField(default=False)  # Add this line


    def __str__(self):
        return self.title

class ReminderTag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default="#007AFF")
    reminders = models.ManyToManyField(Reminder, related_name='tags')
    
    def __str__(self):
        return self.name