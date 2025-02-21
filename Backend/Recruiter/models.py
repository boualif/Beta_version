from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class RecruiterManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('is_active', False)
        return self.create_user(email, password, **extra_fields)


class Recruiter(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=50, null=True)
    last_name = models.CharField(max_length=50, null=True)
    #email = models.EmailField(unique=True, null=True)  # Adding email field
    email = models.EmailField(unique=True, null=False)
    address = models.TextField(null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    image = models.BinaryField(null=True)
    position = models.CharField(max_length=50, null=True)
    responsible = models.CharField(max_length=128, null=True)
    status = models.CharField(max_length=50, blank=True, null=True, choices=[('active', 'Active'), ('inactive', 'Inactive'), ('suspended', 'Suspended')])
    password = models.CharField(max_length=128, null=False, default='default_password')
    nb_candidates = models.IntegerField(null=True,default=0)
    is_active = models.BooleanField(default=True)  # Determines whether the user is active
    is_staff = models.BooleanField(default=False)  # Indicates if the user has admin access
    date_joined = models.DateTimeField(default=timezone.now)  # Stores the date and time the user was created

    # Avoid clashes with auth.User by setting related_name
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='recruiter_user_set',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='recruiter_user_permissions',
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = RecruiterManager()
    
    class Meta:
        db_table = 'recruiter'
        ordering = ['-date_joined'] 
