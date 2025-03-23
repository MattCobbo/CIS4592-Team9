## When adding new Model, must run $ py manage.py makemigrations
 #                                 $ py manage.py migrate

from django.db import models
from django.contrib.auth.models import AbstractUser

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
<<<<<<< HEAD
    

class orgPost(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='organization_posts')
    description = models.CharField(max_length=800)
    created_at = models.DateField(auto_now_add=True)
    likes = models.ManyToManyField(MyUser, related_name='org_post_likes', blank=True)
=======
>>>>>>> 169e02a4d6cdb7b35851ccc886deec7133702ae8
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='organization_posts', null=True, blank=True)

    def is_organization_post(self):
        return self.organization is not None
<<<<<<< HEAD
    
    def __str__(self):
        return f"OrgPost by {self.user.username} in {self.organization.name if self.organization else 'Unknown Organization'}"
=======

>>>>>>> 169e02a4d6cdb7b35851ccc886deec7133702ae8
