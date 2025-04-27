from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MyUser, Post, Organization, orgPost,Event, EventAttendance, Job, JobApplication

from django.utils import timezone        
from django.db import IntegrityError 
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import override_settings
from django.core.cache import cache


class MyUserModelTest(TestCase):
    def setUp(self):
        """Set up test users"""
        self.user1 = MyUser.objects.create_user(username="testuser1", password="password123", bio="I am user 1")
        self.user2 = MyUser.objects.create_user(username="testuser2", password="password123", bio="I am user 2")

    def test_user_creation(self):
        """Test that a user is created correctly"""
        self.assertEqual(self.user1.username, "testuser1")
        self.assertEqual(self.user1.bio, "I am user 1")
        self.assertTrue(self.user1.check_password("password123"))

    def test_followers_relationship(self):
        """Test following functionality"""
        self.user1.followers.add(self.user2)  # user2 follows user1
        self.assertIn(self.user2, self.user1.followers.all())  # user2 is in user1's followers
        self.assertIn(self.user1, self.user2.following.all())  # user1 appears in user2's following list

    def test_invalid_username(self):
        """Test that creating a user with an empty username raises an error"""
        with self.assertRaises(ValidationError):
            user = MyUser(username="", bio="Invalid user")
            user.full_clean()  # Triggers validation


class PostModelTest(TestCase):
    def setUp(self):
        """Set up a test user and post"""
        self.user = MyUser.objects.create_user(username="testuser", password="password123", bio="Hello")
        self.post = Post.objects.create(user=self.user, description="My first post")

    def test_post_creation(self):
        """Test that a post is created correctly"""
        self.assertEqual(self.post.user, self.user)
        self.assertEqual(self.post.description, "My first post")

    def test_post_likes(self):
        """Test liking a post"""
        another_user = MyUser.objects.create_user(username="another_user", password="password123")
        self.post.likes.add(another_user)  # another_user likes the post
        self.assertIn(another_user, self.post.likes.all())  # Check if user is in likes

    def test_auto_created_at(self):
        """Test that created_at is set automatically"""
        self.assertIsNotNone(self.post.created_at)


class OrganizationModelTest(TestCase):
    def setUp(self):
        """Set up initial users and an organization for testing."""
        self.owner = MyUser.objects.create_user(
            username="org_owner", password="password123", bio="I own an org"
        )
        self.member = MyUser.objects.create_user(
            username="org_member", password="password123", bio="I'm a member"
        )
        self.pending_user = MyUser.objects.create_user(
            username="pending_user", password="password123", bio="I want to join"
        )

        self.organization = Organization.objects.create(
            name="Test Organization",
            bio="An organization for testing",
            owner=self.owner
        )

    def test_organization_creation(self):
        """Test that an organization is created correctly."""
        self.assertEqual(self.organization.name, "Test Organization")
        self.assertEqual(self.organization.bio, "An organization for testing")
        self.assertEqual(self.organization.owner, self.owner)
        self.assertIsNotNone(self.organization.created_at)

    def test_unique_organization_name(self):
        """
        Test that creating another organization with the same name
        raises a ValidationError due to the unique constraint on name.
        """
        with self.assertRaises(ValidationError):
            duplicate_org = Organization(
                name="Test Organization",
                bio="Duplicate attempt",
                owner=self.member
            )
            duplicate_org.full_clean()  # Triggers validation

    def test_organization_str_method(self):
        """Test that the string representation is the organization's name."""
        self.assertEqual(str(self.organization), "Test Organization")

    def test_add_member_to_organization(self):
        """Test that users can join an organization (members field)."""
        self.organization.members.add(self.member)
        self.assertIn(self.member, self.organization.members.all())

    def test_pending_requests(self):
        """
        Test that users can be added to the organization's pending_requests,
        indicating they have requested to join.
        """
        self.organization.pending_requests.add(self.pending_user)
        self.assertIn(self.pending_user, self.organization.pending_requests.all())

    def test_remove_member_from_organization(self):
        """Test removing a user from the organization's membership."""
        self.organization.members.add(self.member)
        self.organization.members.remove(self.member)
        self.assertNotIn(self.member, self.organization.members.all())


class OrgPostModelTest(TestCase):
    def setUp(self):
        """Set up users, an organization, and sample orgPosts."""
        self.user = MyUser.objects.create_user(
            username="post_user", password="password123", bio="I post in orgs"
        )
        self.organization = Organization.objects.create(
            name="Another Test Org",
            bio="Org for post tests",
            owner=self.user
        )
        # Org post
        self.org_post = orgPost.objects.create(
            user=self.user,
            description="Org post description",
            organization=self.organization
        )
        # Personal post (not associated with organization)
        self.personal_post = orgPost.objects.create(
            user=self.user,
            description="Personal post with no org"
        )

    def test_org_post_creation(self):
        """Test creation of an orgPost associated with an organization."""
        self.assertEqual(self.org_post.user, self.user)
        self.assertEqual(self.org_post.description, "Org post description")
        self.assertEqual(self.org_post.organization, self.organization)
        self.assertIsNotNone(self.org_post.created_at)

    def test_personal_post_creation(self):
        """Test creation of an orgPost that has no associated organization."""
        self.assertEqual(self.personal_post.user, self.user)
        self.assertEqual(self.personal_post.description, "Personal post with no org")
        self.assertIsNone(self.personal_post.organization)
        self.assertIsNotNone(self.personal_post.created_at)

    def test_is_organization_post_method(self):
        """Test the is_organization_post method returns True/False correctly."""
        self.assertTrue(self.org_post.is_organization_post())
        self.assertFalse(self.personal_post.is_organization_post())

    def test_org_post_str_method(self):
        """Test string representation for an orgPost."""
        expected_str = f"OrgPost by {self.org_post.user.username} in {self.organization.name}"
        self.assertEqual(str(self.org_post), expected_str)

    def test_personal_post_str_method(self):
        """Test string representation for a post not in an organization."""
        expected_str = f"OrgPost by {self.personal_post.user.username} in Unknown Organization"
        self.assertEqual(str(self.personal_post), expected_str)

    def test_org_post_likes(self):
        """
        Test that users can like an orgPost.
        """
        other_user = MyUser.objects.create_user(
            username="org_liker", password="password123", bio="I like org posts"
        )
        self.org_post.likes.add(other_user)
        self.assertIn(other_user, self.org_post.likes.all())

class EventModelTest(TestCase):
    """Validate creation and basic behaviour of the Event model."""

    def setUp(self):
        # One organisation with a single owner who will also be the event creator
        self.owner = MyUser.objects.create_user(
            username="event_owner", password="password123"
        )
        self.org = Organization.objects.create(
            name="Events-R-Us", bio="We host stuff", owner=self.owner
        )

        self.event = Event.objects.create(
            organization=self.org,
            creator=self.owner,
            title="Hack-Night",
            description="All-night coding session",
            starts_at=timezone.now() + timezone.timedelta(days=1),
        )

    def test_event_creation(self):
        """Ensure the event stores every supplied field correctly."""
        self.assertEqual(self.event.organization, self.org)
        self.assertEqual(self.event.creator, self.owner)
        self.assertEqual(self.event.title, "Hack-Night")
        self.assertGreater(self.event.starts_at, timezone.now())
        # created_at is auto populated
        self.assertIsNotNone(self.event.created_at)

    def test_event_str(self):
        """__str__ should match the formatted title and date."""
        expected_prefix = "Hack-Night on "
        self.assertTrue(str(self.event).startswith(expected_prefix))


class EventAttendanceModelTest(TestCase):
    """Verify Many-to-Many through table and unique_together constraint."""

    def setUp(self):
        # Users
        self.u1 = MyUser.objects.create_user(username="alice", password="pw")
        self.u2 = MyUser.objects.create_user(username="bob", password="pw")

        # Org + event
        self.org = Organization.objects.create(
            name="Chess-Club", bio="For fun", owner=self.u1
        )
        self.event = Event.objects.create(
            organization=self.org,
            creator=self.u1,
            title="Spring Tournament",
            starts_at=timezone.now() + timezone.timedelta(days=7),
        )

    def test_single_attendance_row(self):
        """A user can RSVP exactly once; the through table row should reflect it."""
        attend = EventAttendance.objects.create(
            event=self.event, user=self.u2, rsvp=Event.RSVP.YES
        )

        # The reverse relation on Event should expose the attendee
        self.assertIn(self.u2, self.event.attendees.all())
        # And the reverse relation on User should expose the event
        self.assertIn(self.event, self.u2.event_responses.all())
        # Field value persists
        self.assertEqual(attend.rsvp, Event.RSVP.YES)

    def test_unique_together_enforced(self):
        """A duplicate RSVP by the same user for the same event must raise an error."""
        EventAttendance.objects.create(
            event=self.event, user=self.u2, rsvp=Event.RSVP.YES
        )
        with self.assertRaises(IntegrityError):
            EventAttendance.objects.create(
                event=self.event, user=self.u2, rsvp=Event.RSVP.NO
            )


# ------------------------------------------------------------
#  Job-related tests
# ------------------------------------------------------------
class JobModelTest(TestCase):
    """Cover Job creation and its __str__ helper."""

    def setUp(self):
        self.poster = MyUser.objects.create_user(username="recruiter", password="pw")
        self.job = Job.objects.create(
            creator=self.poster,
            title="Junior Backend Developer",
            description="Build APIs in Django",
            pay="$60-70k",
        )

    def test_job_creation(self):
        """Fields should persist and the post date auto-populates."""
        self.assertEqual(self.job.creator, self.poster)
        self.assertEqual(self.job.title, "Junior Backend Developer")
        self.assertEqual(self.job.pay, "$60-70k")
        self.assertIsNotNone(self.job.post_date)

    def test_job_str(self):
        """Readable string includes title and creator username."""
        expected = "Junior Backend Developer posted by recruiter"
        self.assertEqual(str(self.job), expected)


class JobApplicationModelTest(TestCase):
    """Ensure JobApplication instances link correctly to a Job and stringify nicely."""

    def setUp(self):
        self.poster = MyUser.objects.create_user(username="hr_manager", password="pw")
        self.job = Job.objects.create(
            creator=self.poster,
            title="DevOps Engineer",
            description="Keep CI/CD humming",
            pay="$90-110k",
        )
        self.app = JobApplication.objects.create(
            job=self.job,
            applicant_name="Charlie Day",
            applicant_email="charlie@example.com",
            applicant_phone="555-1234",
            requested_pay="$95k",
            resume_text="Linux, Kubernetes, Jenkins",
        )

    def test_application_creation(self):
        """Model should store all provided data and back-reference the parent job."""
        self.assertEqual(self.app.job, self.job)
        self.assertEqual(self.app.applicant_name, "Charlie Day")
        self.assertIsNotNone(self.app.application_date)

    def test_application_str(self):
        """__str__ returns an informative summary line."""
        expected = "Application from Charlie Day for DevOps Engineer"
        self.assertEqual(str(self.app), expected)

class LoginThrottleTest(APITestCase):
    def setUp(self):
        """Set up a test user for throttling tests"""
        self.login_url = reverse("login")  
        self.user = get_user_model().objects.create_user(username="testuser", password="password123")

    @override_settings(REST_FRAMEWORK={
        "DEFAULT_THROTTLE_CLASSES": [
            "base.throttling.LoginThrottle",
        ],
        "DEFAULT_THROTTLE_RATES": {
            "login": "2/minute",  # Set a low rate for testing
        },
    })
    def test_login_throttle_allows_within_limit(self):
        """Test that login requests within the throttle limit are allowed."""
        url = self.login_url
        data = {"username": "testuser", "password": "password123"}

        # First request
        response = self.client.post(url, data)
        self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

        # Second request
        response = self.client.post(url, data)
        self.assertNotEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
    
    @override_settings(REST_FRAMEWORK={
        "DEFAULT_THROTTLE_CLASSES": [
            "base.throttling.LoginThrottle",
        ],
        "DEFAULT_THROTTLE_RATES": {
            "login": "2/minute",  # Set a low rate for testing
        },
    })
    def test_login_throttle_resets_after_time(self):
        """Test that the throttle resets after the time window."""
        url = self.login_url
        data = {"username": "testuser", "password": "password123"}

        # First request
        self.client.post(url, data)

        # Second request
        self.client.post(url, data)

        # Simulate the throttle limit being reached
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

   

        # Third request (should be throttled)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)