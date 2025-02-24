from django.test import TestCase
from .models import MyUser, Post
from django.core.exceptions import ValidationError

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
