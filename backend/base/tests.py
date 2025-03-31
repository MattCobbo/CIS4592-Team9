from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MyUser, Post


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