# backend/base/tests/test_organization_api.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from base.models import MyUser, Organization
import json

class OrganizationAPITest(TestCase):
    def setUp(self):
        """Set up test users, organizations and client"""
        self.client = Client()
        
        # Create owner
        self.owner = MyUser.objects.create_user(
            username="orgowner",
            password="password123",
            email="owner@example.com",
            bio="Organization owner"
        )
        
        # Create member
        self.member = MyUser.objects.create_user(
            username="orgmember",
            password="password123",
            email="member@example.com",
            bio="Organization member"
        )
        
        # Create non-member
        self.non_member = MyUser.objects.create_user(
            username="nonmember",
            password="password123",
            email="nonmember@example.com",
            bio="Not a member"
        )
        
        # Create organization
        self.organization = Organization.objects.create(
            name="Test Organization",
            bio="Test organization bio",
            owner=self.owner
        )
        
        # Add member to organization
        self.organization.members.add(self.owner)  # Owner is also a member
        self.organization.members.add(self.member)
        
        # Login URLs
        self.login_url = reverse("login")
        
        # Organization URLs
        self.create_org_url = "/api/organization/create/"
        self.org_detail_url = f"/api/organization/{self.organization.id}/"
        self.org_update_url = f"/api/organization/{self.organization.id}/update/"
        self.join_org_url = f"/api/organization/join/{self.organization.id}/"
        self.accept_request_url = f"/api/organization/accept/{self.organization.id}/{self.non_member.username}/"
        self.org_posts_url = f"/api/organization/posts/{self.organization.id}/"
        self.user_orgs_url = "/api/organization/user/"
        self.org_feed_url = "/api/organization/feed/"
        self.create_org_post_url = "/api/create_org_post/"
        self.search_orgs_url = "/api/search_organizations/"

    def _login(self, username, password):
        """Helper function to log in a user"""
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            content_type="application/json"
        )
        return response
    
    def test_create_organization(self):
        """Test creating a new organization"""
        # Login as a user
        self._login("orgowner", "password123")
        
        # Create organization
        data = {
            "name": "New Organization",
            "bio": "A new test organization"
        }
        
        response = self.client.post(
            self.create_org_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Organization")
        self.assertEqual(response.data["bio"], "A new test organization")
        self.assertEqual(response.data["owner_username"], "orgowner")
        
        # Verify organization was created in the database
        org_exists = Organization.objects.filter(name="New Organization").exists()
        self.assertTrue(org_exists)
    
    def test_get_organization(self):
        """Test retrieving organization details"""
        # Login as a member
        self._login("orgmember", "password123")
        
        # Get organization details
        response = self.client.get(self.org_detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Organization")
        self.assertEqual(response.data["bio"], "Test organization bio")
        self.assertEqual(response.data["owner_username"], "orgowner")
        self.assertEqual(response.data["member_count"], 2)
        self.assertFalse(response.data["is_owner"])
    
    def test_update_organization(self):
        """Test updating organization details as owner"""
        # Login as owner
        self._login("orgowner", "password123")
        
        # Update organization
        data = {
            "name": "Updated Organization",
            "bio": "Updated organization bio"
        }
        
        response = self.client.patch(
            self.org_update_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Updated Organization")
        self.assertEqual(response.data["bio"], "Updated organization bio")
        
        # Verify organization was updated in the database
        self.organization.refresh_from_db()
        self.assertEqual(self.organization.name, "Updated Organization")
        self.assertEqual(self.organization.bio, "Updated organization bio")
    
    def test_update_organization_unauthorized(self):
        """Test that non-owners cannot update organization details"""
        # Login as member (not owner)
        self._login("orgmember", "password123")
        
        # Attempt to update organization
        data = {
            "name": "Unauthorized Update",
            "bio": "This should fail"
        }
        
        response = self.client.patch(
            self.org_update_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify organization was not updated
        self.organization.refresh_from_db()
        self.assertEqual(self.organization.name, "Test Organization")
    
    def test_join_organization_request(self):
        """Test requesting to join an organization"""
        # Login as non-member
        self._login("nonmember", "password123")
        
        # Request to join
        response = self.client.post(self.join_org_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], "Join request sent")
        
        # Verify user is in pending_requests
        self.organization.refresh_from_db()
        self.assertIn(self.non_member, self.organization.pending_requests.all())
    
    def test_accept_join_request(self):
        """Test accepting a join request"""
        # Add non-member to pending_requests
        self.organization.pending_requests.add(self.non_member)
        
        # Login as owner
        self._login("orgowner", "password123")
        
        # Accept join request
        response = self.client.post(self.accept_request_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], "User added to organization")
        
        # Verify user is now a member and not in pending_requests
        self.organization.refresh_from_db()
        self.assertIn(self.non_member, self.organization.members.all())
        self.assertNotIn(self.non_member, self.organization.pending_requests.all())
    
    def test_get_organization_posts(self):
        """Test retrieving organization posts as a member"""
        # Login as member
        self._login("orgmember", "password123")
        
        # Get organization posts
        response = self.client.get(self.org_posts_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_get_organization_posts_unauthorized(self):
        """Test that non-members cannot access organization posts"""
        # Login as non-member
        self._login("nonmember", "password123")
        
        # Attempt to get organization posts
        response = self.client.get(self.org_posts_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_user_organizations(self):
        """Test retrieving organizations a user is a member of"""
        # Login as member
        self._login("orgmember", "password123")
        
        # Get user's organizations
        response = self.client.get(self.user_orgs_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Organization")
    
    def test_search_organizations(self):
        """Test searching for organizations by name"""
        # Login as any user
        self._login("nonmember", "password123")
        
        # Search for organizations
        response = self.client.get(f"{self.search_orgs_url}?query=Test")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Test Organization")
        
        # Search with no results
        response = self.client.get(f"{self.search_orgs_url}?query=NonExistent")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)