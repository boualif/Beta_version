from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderListView, ReminderView

urlpatterns = [
    # ReminderList URLs
    path('lists/', ReminderListView.get_lists, name='get-lists'),
    path('lists/create/', ReminderListView.create_list, name='create-list'),  # This line is crucial
    path('lists/<int:id>/update/', ReminderListView.update_list, name='update-list'),
    path('lists/<int:id>/delete/', ReminderListView.delete_list, name='delete-list'),
    path('lists/counts/', ReminderListView.get_reminder_counts, name='get-reminder-counts'),
    path('lists/all/', ReminderListView.reminder_lists, name='reminder-lists'),
    path('lists/<int:list_id>/phrases/', ReminderListView.list_phrases, name='list_phrases'), # This is what Django is using to map the URL
    path('lists/<int:list_id>/notes/', ReminderListView.list_notes, name='list_notes'),



    # Reminder URLs
    path('reminders/counts/', ReminderView.get_reminder_counts, name='get-reminder-counts'),
    path('reminders/update-flag/', ReminderView.update_flag, name='update-flag'),
    path('reminders/<int:id>/toggle/', ReminderView.toggle_complete, name='toggle-complete'),
    path('reminders/', ReminderView.get_reminders, name='get-reminders'),
    path('reminders/list/<int:list_id>/', ReminderView.get_reminders, name='get-list-reminders'),
    path('reminders/today/', ReminderView.get_today_reminders, name='get-today-reminders'),
    path('reminders/scheduled/', ReminderView.get_scheduled_reminders, name='get-scheduled-reminders'),
    path('reminders/create/', ReminderView.create_reminder, name='create-reminder'),
    path('reminders/<int:id>/update/', ReminderView.update_reminder, name='update-reminder'),
    path('reminders/<int:id>/delete/', ReminderView.delete_reminder, name='delete-reminder'),
    path('reminders/<int:id>/toggle-complete/', ReminderView.toggle_complete, name='toggle-complete'),
    

]