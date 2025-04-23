# backend/base/tests/test_job_models.py
from django.test import TestCase
from base.models import MyUser, Job, JobApplication

class JobModelTest(TestCase):
    def setUp(self):
        """Set up test users and job posts"""
        self.creator = MyUser.objects.create_user(
            username="jobcreator", password="password123", bio="Job creator"
        )
        
        self.job = Job.objects.create(
            creator=self.creator,
            title="Software Developer",
            description="We need a Django developer",
            pay="$100,000 - $120,000/year"
        )
        
        self.applicant = MyUser.objects.create_user(
            username="applicant", password="password123", bio="Job applicant"
        )

    def test_job_creation(self):
        """Test that a job is created with correct attributes"""
        self.assertEqual(self.job.title, "Software Developer")
        self.assertEqual(self.job.description, "We need a Django developer")
        self.assertEqual(self.job.pay, "$100,000 - $120,000/year")
        self.assertEqual(self.job.creator, self.creator)
        self.assertIsNotNone(self.job.post_date)

    def test_job_string_representation(self):
        """Test the string representation of a Job"""
        expected_string = f"Software Developer posted by {self.creator.username}"
        self.assertEqual(str(self.job), expected_string)

    def test_job_application_creation(self):
        """Test creating a job application"""
        application = JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            requested_pay="$110,000/year",
            resume_text="I am a Django developer with 5 years of experience."
        )
        
        self.assertEqual(application.job, self.job)
        self.assertEqual(application.applicant_name, "Jane Smith")
        self.assertEqual(application.applicant_email, "jane@example.com")
        self.assertEqual(application.requested_pay, "$110,000/year")
        self.assertIsNotNone(application.application_date)

    def test_job_application_string_representation(self):
        """Test the string representation of a JobApplication"""
        application = JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            resume_text="I am a Django developer with 5 years of experience."
        )
        
        expected_string = f"Application from Jane Smith for Software Developer"
        self.assertEqual(str(application), expected_string)

    def test_job_application_relationship(self):
        """Test the relationship between Jobs and JobApplications"""
        # Create multiple applications for the same job
        JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            resume_text="I am a Django developer with 5 years of experience."
        )
        
        JobApplication.objects.create(
            job=self.job,
            applicant_name="John Doe",
            applicant_email="john@example.com",
            applicant_phone="555-987-6543",
            resume_text="I have 3 years of Django experience."
        )
        
        # Verify the job has the expected applications
        self.assertEqual(self.job.applications.count(), 2)
        self.assertEqual(self.job.applications.first().applicant_name, "Jane Smith")