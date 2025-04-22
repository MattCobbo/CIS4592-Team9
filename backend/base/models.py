## When adding new Model, must run $ py manage.py makemigrations
 #                                 $ py manage.py migrate

from django.contrib.auth.models import AbstractUser
from django.db import models


class MyUser(AbstractUser):
    username = models.CharField(max_length=30, unique=True, primary_key=True)
    bio = models.CharField(max_length=800)
    profile_image = models.ImageField(upload_to='profile_image/', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

    def __str__(self):
        return self.username
    


class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    bio = models.CharField(max_length=800)
    profile_image = models.ImageField(upload_to='profile_image/', blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)
    owner = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='owned_organizations')
    members = models.ManyToManyField(MyUser, related_name='joined_organizations', blank=True)
    pending_requests = models.ManyToManyField(MyUser, related_name='organization_requests', blank=True)

    def __str__(self):
        return self.name
    

class Post(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='posts')
    description = models.CharField(max_length=800)
    created_at = models.DateField(auto_now_add=True)
    likes = models.ManyToManyField(MyUser, related_name='post_likes', blank=True)
    

class orgPost(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='organization_posts')
    description = models.CharField(max_length=800)
    created_at = models.DateField(auto_now_add=True)
    likes = models.ManyToManyField(MyUser, related_name='org_post_likes', blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='organization_posts', null=True, blank=True)

    def is_organization_post(self):
        return self.organization is not None
    
    def __str__(self):
        return f"OrgPost by {self.user.username} in {self.organization.name if self.organization else 'Unknown Organization'}"

class Event(models.Model):
    """An event that belongs to an Organization."""
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="events",
    )
    creator = models.ForeignKey(
        MyUser,
        on_delete=models.CASCADE,
        related_name="created_events",
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    starts_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class RSVP(models.TextChoices):
        YES = "Y", "Going"
        NO = "N", "Not going"
        MAYBE = "M", "Undecided"

    # one row per user ‑ per event
    attendees = models.ManyToManyField(
        MyUser,
        through="EventAttendance",
        related_name="event_responses",
        blank=True,
    )

    def __str__(self):
        return f"{self.title} on {self.starts_at:%Y‑%m‑%d %H:%M}"

class EventAttendance(models.Model):
    """Join‑table that stores each member’s RSVP."""
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    user  = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    rsvp  = models.CharField(
        max_length=1,
        choices=Event.RSVP.choices,
        default=Event.RSVP.MAYBE,
    )

    class Meta:
        unique_together = ("event", "user")