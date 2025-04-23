# backend/base/tests/test_job_api.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from base.models import MyUser, Job, JobApplication
import json

class JobAPITest(TestCase):
    def setUp(self):
        """Set up test users, jobs and client"""
        self.client = Client()
        
        # Create users
        self.employer = MyUser.objects.create_user(
            username="employer",
            password="password123",
            email="employer@example.com",
            bio="Job poster"
        )
        
        self.applicant = MyUser.objects.create_user(
            username="applicant",
            password="password123",
            email="applicant@example.com",
            bio="Job seeker"
        )
        
        # Create a job
        self.job = Job.objects.create(
            creator=self.employer,
            title="Software Developer",
            description="We need a Django developer",
            pay="$100,000 - $120,000/year"
        )
        
        # Login URL
        self.login_url = reverse("login")
        
        # Job URLs
        self.jobs_url = "/api/jobs/"
        self.job_detail_url = f"/api/jobs/{self.job.id}/"
        self.apply_job_url = f"/api/jobs/{self.job.id}/apply/"
        self.my_jobs_url = "/api/my-jobs/"
        self.job_applications_url = f"/api/jobs/{self.job.id}/applications/"

    def _login(self, username, password):
        """Helper function to log in a user"""
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            content_type="application/json"
        )
        return response
    
    def test_get_all_jobs(self):
        """Test retrieving all job listings"""
        # Login as any user
        self._login("applicant", "password123")
        
        # Get all jobs
        response = self.client.get(self.jobs_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Software Developer")
    
    def test_create_job(self):
        """Test creating a new job listing"""
        # Login as employer
        self._login("employer", "password123")
        
        # Create job
        data = {
            "title": "Frontend Developer",
            "description": "We need a React developer",
            "pay": "$90,000 - $110,000/year"
        }
        
        response = self.client.post(
            self.jobs_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Frontend Developer")
        self.assertEqual(response.data["creator_username"], "employer")
        
        # Verify job was created in the database
        job_exists = Job.objects.filter(title="Frontend Developer").exists()
        self.assertTrue(job_exists)
    
    def test_get_job_detail(self):
        """Test retrieving a specific job's details"""
        # Login as any user
        self._login("applicant", "password123")
        
        # Get job details
        response = self.client.get(self.job_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Software Developer")
        self.assertEqual(response.data["description"], "We need a Django developer")
        self.assertEqual(response.data["pay"], "$100,000 - $120,000/year")
        self.assertEqual(response.data["creator_username"], "employer")
    
    def test_delete_job(self):
        """Test deleting a job listing as its creator"""
        # Login as employer (job creator)
        self._login("employer", "password123")
        
        # Delete job
        response = self.client.delete(self.job_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify job was deleted from the database
        job_exists = Job.objects.filter(id=self.job.id).exists()
        self.assertFalse(job_exists)
    
    def test_delete_job_unauthorized(self):
        """Test that non-creators cannot delete job listings"""
        # Login as applicant (not job creator)
        self._login("applicant", "password123")
        
        # Attempt to delete job
        response = self.client.delete(self.job_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify job was not deleted
        job_exists = Job.objects.filter(id=self.job.id).exists()
        self.assertTrue(job_exists)
    
    def test_apply_for_job(self):
        """Test submitting a job application"""
        # Login as applicant
        self._login("applicant", "password123")
        
        # Apply for job
        data = {
            "applicant_name": "Jane Smith",
            "applicant_email": "jane@example.com",
            "applicant_phone": "555-123-4567",
            "requested_pay": "$110,000/year",
            "resume_text": "I am a Django developer with 5 years of experience."
        }
        
        response = self.client.post(
            self.apply_job_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["applicant_name"], "Jane Smith")
        self.assertEqual(response.data["job_title"], "Software Developer")
        
        # Verify application was created in the database
        application_exists = JobApplication.objects.filter(applicant_name="Jane Smith").exists()
        self.assertTrue(application_exists)
    
    def test_get_my_jobs(self):
        """Test retrieving jobs created by the current user"""
        # Login as employer
        self._login("employer", "password123")
        
        # Get my jobs
        response = self.client.get(self.my_jobs_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Software Developer")
    
    def test_get_job_applications(self):
        """Test retrieving applications for a job as its creator"""
        # Create an application
        application = JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            resume_text="I am a Django developer with 5 years of experience."
        )
        
        # Login as employer (job creator)
        self._login("employer", "password123")
        
        # Get job applications
        response = self.client.get(self.job_applications_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["applicant_name"], "Jane Smith")
    
    def test_get_job_applications_unauthorized(self):
        """Test that non-creators cannot access job applications"""
        # Create an application
        application = JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            resume_text="I am a Django developer with 5 years of experience."
        )
        
        # Login as applicant (not job creator)
        self._login("applicant", "password123")
        
        # Attempt to get job applications
        response = self.client.get(self.job_applications_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)