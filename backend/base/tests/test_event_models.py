from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from base.models import Event, EventAttendance, MyUser, Organization

class EventModelTest(TestCase):
    def setUp(self):
        """Set up test users, organization, and an event"""
        self.user = MyUser.objects.create_user(
            username="eventuser", password="password123", bio="Event test user"
        )
        self.organization = Organization.objects.create(
            name="Event Test Org",
            bio="For testing events",
            owner=self.user
        )
        self.organization.members.add(self.user)
        
        self.event = Event.objects.create(
            organization=self.organization,
            creator=self.user,
            title="Test Event",
            description="A test event description",
            starts_at=timezone.now() + timedelta(days=7)
        )
        
        self.attendee = MyUser.objects.create_user(
            username="attendee", password="password123", bio="Event attendee"
        )
        self.organization.members.add(self.attendee)

    def test_event_creation(self):
        """Test that an event is created with correct attributes"""
        self.assertEqual(self.event.title, "Test Event")
        self.assertEqual(self.event.description, "A test event description")
        self.assertEqual(self.event.organization, self.organization)
        self.assertEqual(self.event.creator, self.user)
        self.assertIsNotNone(self.event.starts_at)
        self.assertIsNotNone(self.event.created_at)

    def test_event_string_representation(self):
        """Test the string representation of an Event"""
        expected_date_format = self.event.starts_at.strftime("%Y‑%m‑%d %H:%M")
        expected_string = f"Test Event on {expected_date_format}"
        self.assertEqual(str(self.event), expected_string)

    def test_event_attendance(self):
        """Test adding an attendance record to an event"""
        attendance = EventAttendance.objects.create(
            event=self.event,
            user=self.attendee,
            rsvp=Event.RSVP.YES
        )
        
        self.assertIn(self.attendee, self.event.attendees.all())
        self.assertEqual(attendance.rsvp, Event.RSVP.YES)

    def test_unique_attendance_constraint(self):
        """Test that a user can only have one attendance record per event"""
        EventAttendance.objects.create(
            event=self.event,
            user=self.attendee,
            rsvp=Event.RSVP.YES
        )
        
        # Attempting to create a second attendance record should raise an error
        with self.assertRaises(Exception):
            EventAttendance.objects.create(
                event=self.event,
                user=self.attendee,
                rsvp=Event.RSVP.NO
            )

    def test_update_attendance(self):
        """Test updating an existing attendance record"""
        attendance = EventAttendance.objects.create(
            event=self.event,
            user=self.attendee,
            rsvp=Event.RSVP.YES
        )
        
        # Update RSVP
        attendance.rsvp = Event.RSVP.NO
        attendance.save()
        
        # Refresh from DB and verify
        attendance.refresh_from_db()
        self.assertEqual(attendance.rsvp, Event.RSVP.NO)