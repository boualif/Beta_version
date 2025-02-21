from rest_framework import serializers
from .models import ReminderList, Reminder, ReminderTag , Phrase , Note

class ReminderTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReminderTag
        fields = ['id', 'name', 'color']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'text', 'checked']

class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        fields = ['id', 'text', 'checked']  # Include checked field

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'list', 'title', 'notes', 'due_date', 'priority', 
                 'is_completed', 'is_recurring', 'recurrence_type', 
                 'recurrence_end_date', 'parent', 'created_at','is_flagged']
                 
    def validate_due_date(self, value):
        if not value:
            raise serializers.ValidationError("Due date is required")
        return value

    def get_subtasks(self, obj):
        subtasks = obj.subtasks.all()
        return ReminderSerializer(subtasks, many=True).data

    def validate_title(self, value):
        return str(value)

    def validate_notes(self, value):
        return str(value)

class ReminderListSerializer(serializers.ModelSerializer):
    reminders = ReminderSerializer(many=True, read_only=True)
    reminder_count = serializers.SerializerMethodField()

    class Meta:
        model = ReminderList
        fields = ['id', 'title', 'color', 'icon', 'owner', 'reminders', 
                 'reminder_count', 'created_at']
        read_only_fields = ['owner']  # Make owner read-only

    def get_reminder_count(self, obj):
        return obj.reminders.count()

    def create(self, validated_data):
        # Get the current user from the context
        user = self.context['request'].user
        # Add the owner to the validated data
        validated_data['owner'] = user
        return super().create(validated_data)