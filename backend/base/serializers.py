from rest_framework import serializers

from .models import (
    Event,
    EventAttendance,
    Job,
    JobApplication,
    MyUser,
    Organization,
    Post,
    orgPost,
)


class UserRegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = MyUser
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password"
        ]  # Firstname Lastname fields come from AbstractUser model

    def create(self, validated_data):
        user = MyUser(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        user.set_password(validated_data["password"])  # stores safely
        user.save()
        return user


class MyUserProfileSerializer(serializers.ModelSerializer):

    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = MyUser
        fields = [
            "username",
            "bio",
            "profile_image",
            "follower_count",
            "following_count",
        ]

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
    
class OrganizationSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    member_count = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    members = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='username'
    )  # ✅ Includes usernames of members
    pending_requests = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='username'
    )  # ✅ Includes usernames of pending users

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'bio', 'profile_image', 'created_at',
            'owner_username', 'members', 'pending_requests',
            'member_count', 'is_owner'
        ]

    def get_member_count(self, obj):
        return obj.members.count()

    def get_is_owner(self, obj):
        request = self.context.get('request', None)
        return request and request.user == obj.owner
    

class PostSerializer(serializers.ModelSerializer):

    username = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'username','description','formatted_date','likes', 'like_count']

    def get_username(self, obj):
        return obj.user.username
    
    def get_like_count(self, obj):
        return obj.likes.count()
    
    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%d %b %y")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['username', 'bio', 'email', 'profile_image', 'first_name', 'last_name']


class OrgPostSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = orgPost
        fields = ['id', 'username','description','formatted_date','likes', 'like_count', 'organization']

    def get_username(self, obj):
        return obj.user.username

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_formatted_date(self, obj):
        return obj.created_at.strftime("%d %b %y")


class EventAttendanceSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model  = EventAttendance
        fields = ["username", "rsvp"]


class EventSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source="creator.username")
    organization_id  = serializers.IntegerField(write_only=True)
    attendance       = EventAttendanceSerializer(
        source="eventattendance_set", many=True, read_only=True
    )

    class Meta:
        model  = Event
        fields = [
            "id",
            "organization_id",
            "title",
            "description",
            "starts_at",
            "creator_username",
            "attendance",
        ]


class JobSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    formatted_post_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = ['id', 'creator_username', 'title', 'description', 'pay', 
                 'post_date', 'formatted_post_date']
    
    def get_formatted_post_date(self, obj):
        return obj.post_date.strftime("%d %b %y")

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    job_creator = serializers.ReadOnlyField(source='job.creator.username')
    formatted_application_date = serializers.SerializerMethodField()
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'job_creator', 
            'applicant_name', 'applicant_email', 'applicant_phone', 
            'requested_pay', 'resume_text', 'application_date', 
            'formatted_application_date'
        ]
        read_only_fields = ['id', 'job', 'job_title', 'job_creator', 'application_date', 'formatted_application_date']
    
    def get_formatted_application_date(self, obj):
        return obj.application_date.strftime("%d %b %y")
