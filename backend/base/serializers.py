from rest_framework import serializers

from .models import MyUser, Post, Organization, orgPost


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