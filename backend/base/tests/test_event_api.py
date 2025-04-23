# backend/base/tests/test_event_api.py
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from base.models import MyUser, Organization, Event, EventAttendance
import json

class EventAPITest(TestCase):
    def setUp(self):
        """Set up test users, organization, event and client"""
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
        
        # Create organization
        self.organization = Organization.objects.create(
            name="Event Test Org",
            bio="For testing events",
            owner=self.owner
        )
        
        # Add members to organization
        self.organization.members.add(self.owner)
        self.organization.members.add(self.member)
        
        # Create event
        self.event = Event.objects.create(
            organization=self.organization,
            creator=self.owner,
            title="Test Event",
            description="A test event description",
            starts_at=timezone.now() + timedelta(days=7)
        )
        
        # Login URL
        self.login_url = reverse("login")
        
        # Event URLs
        self.org_events_url = f"/api/organization/{self.organization.id}/events/"
        self.event_rsvp_url = f"/api/events/{self.event.id}/rsvp/"

    def _login(self, username, password):
        """Helper function to log in a user"""
        response = self.client.post(
            self.login_url,
            {"username": username, "password": password},
            content_type="application/json"
        )
        return response
    
    def test_get_organization_events(self):
        """Test retrieving events for an organization"""
        # Login as member
        self._login("orgmember", "password123")
        
        # Get organization events
        response = self.client.get(self.org_events_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Test Event")
        self.assertEqual(response.data[0]["creator_username"], "orgowner")
    
    def test_create_event(self):
        """Test creating a new event as organization owner"""
        # Login as owner
        self._login("orgowner", "password123")
        
        # Create event
        data = {
            "organization_id": self.organization.id,
            "title": "New Event",
            "description": "A new test event",
            "starts_at": (timezone.now() + timedelta(days=14)).isoformat()
        }
        
        response = self.client.post(
            self.org_events_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "New Event")
        self.assertEqual(response.data["creator_username"], "orgowner")
        
        # Verify event was created in the database
        event_exists = Event.objects.filter(title="New Event").exists()
        self.assertTrue(event_exists)
    
    def test_create_event_unauthorized(self):
        """Test that non-owners cannot create events"""
        # Login as member (not owner)
        self._login("orgmember", "password123")
        
        # Attempt to create event
        data = {
            "organization_id": self.organization.id,
            "title": "Unauthorized Event",
            "description": "This should fail",
            "starts_at": (timezone.now() + timedelta(days=14)).isoformat()
        }
        
        response = self.client.post(
            self.org_events_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Verify event was not created
        event_exists = Event.objects.filter(title="Unauthorized Event").exists()
        self.assertFalse(event_exists)
    
    def test_update_rsvp(self):
        """Test updating RSVP status for an event"""
        # Login as member
        self._login("orgmember", "password123")
        
        # Update RSVP
        data = {
            "rsvp": "Y"  # Going
        }
        
        response = self.client.patch(
            self.event_rsvp_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["new_rsvp"], "Y")
        
        # Verify RSVP was created in the database
        attendance = EventAttendance.objects.get(event=self.event, user=self.member)
        self.assertEqual(attendance.rsvp, "Y")
        
        # Change RSVP
        data = {
            "rsvp": "N"  # Not going
        }
        
        response = self.client.patch(
            self.event_rsvp_url,
            data,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["new_rsvp"], "N")
        
        # Verify RSVP was updated
        attendance.refresh_from_db()
        self.assertEqual(attendance.rsvp, "N")