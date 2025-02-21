from django.test import TestCase
from .models import Client
from Recruiter.models import Recruiter

class ClientModelTestCase(TestCase):
    def setUp(self):
        # Set up data for tests
        self.recruiter = Recruiter.objects.create(
            first_name='John',
            last_name='Doe',
            email='john.doe@example.com',
            position='Recruiter',
            password='password',
            start_date='2023-01-01',
            role='Recruiter',
            responsible='N/A',
            status='active'
        )
        self.client = Client.objects.create(
            company='Test Company',
            email='test@example.com',
            address='123 Test St',
            phone=['1234567890'],
            website=['http://example.com'],
            description='Test client description',
            industry='Tech',
            status='prospect',
            recruiter=self.recruiter
        )

    def test_client_creation(self):
        self.assertTrue(isinstance(self.client, Client))
        self.assertEqual(self.client.__str__(), 'Test Company')
    
    def test_client_fields(self):
        self.assertEqual(self.client.company, 'Test Company')
        self.assertEqual(self.client.email, 'test@example.com')
        self.assertEqual(self.client.status, 'prospect')
        self.assertEqual(self.client.recruiter, self.recruiter)
