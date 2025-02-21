from django.test import TestCase
from .models import Job

class JobModelTest(TestCase):
    def setUp(self):
        self.job = Job.objects.create(
            title="Software Developer",
            description="Develop and maintain software applications.",
            location="New York",
            nb_positions=3,
            status="open"
        )

    def test_job_creation(self):
        self.assertTrue(isinstance(self.job, Job))
        self.assertEqual(str(self.job), "Software Developer")
