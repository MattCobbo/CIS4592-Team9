# backend/base/tests/test_serializers.py
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from base.serializers import (
    MyUserProfileSerializer, 
    PostSerializer, 
    OrganizationSerializer,
    OrgPostSerializer,
    EventSerializer,
    JobSerializer,
    JobApplicationSerializer
)
from base.models import (
    MyUser, 
    Post, 
    Organization,
    orgPost,
    Event,
    Job,
    JobApplication
)

class SerializerTest(TestCase):
    def setUp(self):
        """Set up test data for serializer tests"""
        # Create users
        self.user1 = MyUser.objects.create_user(
            username="testuser1",
            password="password123",
            email="user1@example.com",
            bio="Test user 1 bio",
            first_name="Test",
            last_name="User1"
        )
        
        self.user2 = MyUser.objects.create_user(
            username="testuser2",
            password="password123",
            email="user2@example.com",
            bio="Test user 2 bio",
            first_name="Test",
            last_name="User2"
        )
        
        # Set up follow relationship
        self.user1.followers.add(self.user2)
        
        # Create a post
        self.post = Post.objects.create(
            user=self.user1,
            description="Test post description"
        )
        
        # Add a like to the post
        self.post.likes.add(self.user2)
        
        # Create organization
        self.organization = Organization.objects.create(
            name="Test Organization",
            bio="Test organization bio",
            owner=self.user1
        )
        
        # Add members to organization
        self.organization.members.add(self.user1)
        self.organization.members.add(self.user2)
        
        # Create organization post
        self.org_post = orgPost.objects.create(
            user=self.user1,
            description="Test organization post",
            organization=self.organization
        )
        
        # Create event
        self.event = Event.objects.create(
            organization=self.organization,
            creator=self.user1,
            title="Test Event",
            description="Test event description",
            starts_at=timezone.now() + timedelta(days=7)
        )
        
        # Create job
        self.job = Job.objects.create(
            creator=self.user1,
            title="Test Job",
            description="Test job description",
            pay="$100,000/year"
        )
        
        # Create job application
        self.job_application = JobApplication.objects.create(
            job=self.job,
            applicant_name="Jane Smith",
            applicant_email="jane@example.com",
            applicant_phone="555-123-4567",
            resume_text="Test resume text"
        )

    def test_user_profile_serializer(self):
        """Test MyUserProfileSerializer"""
        serializer = MyUserProfileSerializer(self.user1)
        data = serializer.data
        
        self.assertEqual(data["username"], "testuser1")
        self.assertEqual(data["bio"], "Test user 1 bio")
        self.assertEqual(data["follower_count"], 1)
        self.assertEqual(data["following_count"], 0)
    
    def test_post_serializer(self):
        """Test PostSerializer"""
        serializer = PostSerializer(self.post)
        data = serializer.data
        
        self.assertEqual(data["username"], "testuser1")
        self.assertEqual(data["description"], "Test post description")
        self.assertEqual(data["like_count"], 1)
        self.assertEqual(data["formatted_date"], self.post.created_at.strftime("%d %b %y"))
    
    def test_organization_serializer(self):
        """Test OrganizationSerializer"""
        # Create a request context with the user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        context = {"request": MockRequest(self.user1)}
        serializer = OrganizationSerializer(self.organization, context=context)
        data = serializer.data
        
        self.assertEqual(data["name"], "Test Organization")
        self.assertEqual(data["bio"], "Test organization bio")
        self.assertEqual(data["owner_username"], "testuser1")
        self.assertEqual(data["member_count"], 2)
        self.assertTrue(data["is_owner"])
        self.assertEqual(len(data["members"]), 2)
        self.assertIn("testuser1", data["members"])
        self.assertIn("testuser2", data["members"])
    
    def test_org_post_serializer(self):
        """Test OrgPostSerializer"""
        serializer = OrgPostSerializer(self.org_post)
        data = serializer.data
        
        self.assertEqual(data["username"], "testuser1")
        self.assertEqual(data["description"], "Test organization post")
        self.assertEqual(data["like_count"], 0)
        self.assertEqual(data["formatted_date"], self.org_post.created_at.strftime("%d %b %y"))
    
    def test_event_serializer(self):
        """Test EventSerializer"""
        serializer = EventSerializer(self.event)
        data = serializer.data
        
        self.assertEqual(data["title"], "Test Event")
        self.assertEqual(data["description"], "Test event description")
        self.assertEqual(data["creator_username"], "testuser1")
    
    def test_job_serializer(self):
        """Test JobSerializer"""
        serializer = JobSerializer(self.job)
        data = serializer.data
        
        self.assertEqual(data["title"], "Test Job")
        self.assertEqual(data["description"], "Test job description")
        self.assertEqual(data["pay"], "$100,000/year")
        self.assertEqual(data["creator_username"], "testuser1")
        self.assertEqual(data["formatted_post_date"], self.job.post_date.strftime("%d %b %y"))
    
    def test_job_application_serializer(self):
        """Test JobApplicationSerializer"""
        serializer = JobApplicationSerializer(self.job_application)
        data = serializer.data
        
        self.assertEqual(data["applicant_name"], "Jane Smith")
        self.assertEqual(data["applicant_email"], "jane@example.com")
        self.assertEqual(data["applicant_phone"], "555-123-4567")
        self.assertEqual(data["resume_text"], "Test resume text")
        self.assertEqual(data["job_title"], "Test Job")
        self.assertEqual(data["job_creator"], "testuser1")
        self.assertEqual(data["formatted_application_date"], self.job_application.application_date.strftime("%d %b %y"))