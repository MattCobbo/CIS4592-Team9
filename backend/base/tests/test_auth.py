# backend/base/tests/test_auth.py
from django.test import TestCase, Client
from django.urls import reverse
from base.models import MyUser
from rest_framework import status
import json

class AuthenticationTest(TestCase):
    def setUp(self):
        """Set up test users and client"""
        self.client = Client()
        self.user = MyUser.objects.create_user(
            username="testuser", 
            password="password123",
            email="test@example.com",
            bio="Test user bio"
        )
        
        self.login_url = reverse("login")
        self.register_url = "/api/register/"
        self.auth_url = "/api/authenticated/"

    def test_login_success(self):
        """Test successful login produces access and refresh tokens in cookies"""
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "password123"},
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["user"]["username"], "testuser")
        
        # Verify cookies are set
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

    def test_login_failure(self):
        """Test login with incorrect credentials fails"""
        response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "wrongpassword"},
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_register_success(self):
        """Test successful user registration"""
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "password123"
        }
        
        response = self.client.post(
            self.register_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "newuser")
        self.assertEqual(response.data["email"], "newuser@example.com")
        
        # Verify user was created in the database
        user_exists = MyUser.objects.filter(username="newuser").exists()
        self.assertTrue(user_exists)

    def test_authentication_check(self):
        """Test authentication check with and without login"""
        # Without login
        response = self.client.get(self.auth_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # With login
        self.client.post(
            self.login_url,
            {"username": "testuser", "password": "password123"},
            content_type="application/json"
        )
        
        response = self.client.get(self.auth_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "authenticated")
        self.assertEqual(response.data["username"], "testuser")

    def test_refresh_token(self):
        """Test refreshing access token with refresh token"""
        # First login to get the refresh token
        login_response = self.client.post(
            self.login_url,
            {"username": "testuser", "password": "password123"},
            content_type="application/json"
        )
        
        # Attempt to refresh token
        refresh_url = "/api/token/refresh/"
        response = self.client.post(refresh_url)
        
        # Should succeed since the refresh token is in the cookies
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertIn("access_token", response.cookies)

    def test_logout(self):
        """Test that logout clears the auth cookies"""
        # First login
        self.client.post(
            self.login_url,
            {"username": "testuser", "password": "password123"},
            content_type="application/json"
        )
        
        # Then logout
        logout_url = "/api/logout/"
        response = self.client.post(logout_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        
        # Verify cookies are deleted
        self.assertEqual(response.cookies["access_token"].value, "")
        self.assertEqual(response.cookies["refresh_token"].value, "")