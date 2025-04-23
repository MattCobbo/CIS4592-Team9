# backend/base/tests/test_post_api.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from base.models import MyUser, Post
import json

class PostAPITest(TestCase):
    def setUp(self):
        """Set up test users, posts and client"""
        self.client = Client()
        
        # Create users
        self.user1 = MyUser.objects.create_user(
            username="user1",
            password="password123",
            email="user1@example.com",
            bio="Test user 1"
        )
        
        self.user2 = MyUser.objects.create_user(
            username="user2",
            password="password123",
            email="user2@example.com",
            bio="Test user 2"
        )
        
        # Create posts
        self.post1 = Post.objects.create(
            user=self.user1,
            description="Test post by user1"
        )
        
        self.post2 = Post.objects.create(
            user=self.user2,
            description="Test post by user2"
        )
        
        # Login URL
        self.login_url = reverse("login")
        
        # Post URLs
        self.create_post_url = "/api/create_post/"
        self.get_posts_url = "/api/get_posts/"
        self.user1_posts_url = f"/api/posts/{self.user1.username}/"
        self.toggle_like_url = "/api/toggleLike/"

    def _login(self, username, password):
        """Helper function to log in a user"""
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            content_type="application/json"
        )
        return response
    
    def test_create_post(self):
        """Test creating a new post"""
        # Login as user1
        self._login("user1", "password123")
        
        # Create post
        data = {
            "description": "A new post for testing"
        }
        
        response = self.client.post(
            self.create_post_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "user1")
        self.assertEqual(response.data["description"], "A new post for testing")
        
        # Verify post was created in the database
        post_exists = Post.objects.filter(description="A new post for testing").exists()
        self.assertTrue(post_exists)
    
    def test_get_user_posts(self):
        """Test retrieving posts by a specific user"""
        # Login as any user
        self._login("user2", "password123")
        
        # Get user1's posts
        response = self.client.get(self.user1_posts_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "user1")
        self.assertEqual(response.data[0]["description"], "Test post by user1")
        self.assertFalse(response.data[0]["liked"])  # user2 hasn't liked user1's post
    
    def test_get_all_posts(self):
        """Test retrieving all posts"""
        # Login as any user
        self._login("user1", "password123")
        
        # Get all posts
        response = self.client.get(self.get_posts_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 2)  # Should have both posts
    
    def test_toggle_like(self):
        """Test liking and unliking a post"""
        # Login as user2
        self._login("user2", "password123")
        
        # Like user1's post
        data = {
            "id": self.post1.id
        }
        
        response = self.client.post(
            self.toggle_like_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["now_liked"])
        
        # Verify post was liked in the database
        self.post1.refresh_from_db()
        self.assertIn(self.user2, self.post1.likes.all())
        
        # Unlike the post
        response = self.client.post(
            self.toggle_like_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["now_liked"])
        
        # Verify post was unliked in the database
        self.post1.refresh_from_db()
        self.assertNotIn(self.user2, self.post1.likes.all())
    
    def test_get_posts_liked_status(self):
        """Test that liked status is correctly returned in post data"""
        # Login as user1
        self._login("user1", "password123")
        
        # Like user2's post
        self.post2.likes.add(self.user1)
        
        # Get all posts
        response = self.client.get(self.get_posts_url)
        
        # Find user2's post in the results
        user2_post = None
        for post in response.data["results"]:
            if post["username"] == "user2":
                user2_post = post
                break
        
        self.assertIsNotNone(user2_post)
        self.assertTrue(user2_post["liked"])  # user1 has liked user2's post