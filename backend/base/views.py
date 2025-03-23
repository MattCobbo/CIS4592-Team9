from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .models import MyUser, Post, Organization, orgPost
from .serializers import (
    MyUserProfileSerializer,
    PostSerializer,
    UserRegisterSerializer,
    UserSerializer,
    OrganizationSerializer,
    OrgPostSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def authenticated(request):
    return Response("authenticated")


@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens["access"]
            refresh_token = tokens["refresh"]
            username = request.data["username"]

            try:
                user = MyUser.objects.get(username=username)
            except MyUser.DoesNotExist:
                return Response({"error": "user does not exist"})

            res = Response()
            res.data = {"success":True, "user":{"username":user.username, "bio":user.bio, "email":user.email, "first_name":user.first_name, "last_name":user.last_name}}

            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
            )

            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
            )

            return res
        except:
            return Response({"success": False})


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            request.data["refresh"] = refresh_token

            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens["access"]

            res = Response()

            res.data = {"success": True}

            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
            )

            return res
        except:
            return Response({"success": False})


# @ensure_csrf_cookie
# def my_view(request):
#    response = HttpResponse("My response")
#    response["Access-Control-Allow-Origin"] = "http://localhost:3000"
#    response["Access-Control-Allow-Credentials"] = "true"
#    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_profile_data(request, pk):
    try:
        try:
            user = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response({"error": "user does not exit"})

        serializer = MyUserProfileSerializer(user, many=False)

        following = False

        if request.user in user.followers.all():
            following = True

        return Response(
            {
                **serializer.data,
                "is_owner": request.user.username == user.username,
                "following": following,
            }
        )
    except:
        return Response({"error": "error getting user data"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggleFollow(request):
    try:
        try:
            my_user = MyUser.objects.get(username=request.user.username)
            user_to_follow = MyUser.objects.get(username=request.data['username'])
        except MyUser.DoesNotExist:
            return Response({"error": "user does not exit"})
        
        if my_user in user_to_follow.followers.all():
            user_to_follow.followers.remove(my_user)
            return Response({'following':False})
        else:
            user_to_follow.followers.add(my_user)
            return Response({'following':True})
        
    except:
        return Response({'error':'error following user'})
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_posts(request, pk):
    try:
        user = MyUser.objects.get(username=pk)
        my_user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "user does not exist"})

    posts = user.posts.all().order_by('-created_at')

    serializer = PostSerializer(posts, many=True)

    data = []
    for post in serializer.data:
        new_post = {}

        if my_user.username in post['likes']:
            new_post = {**post, 'liked':True}
        else:
            new_post = {**post, 'liked':False}
        data.append(new_post)

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLike(request):
    try:
        try:
            post = Post.objects.get(id=request.data['id'])
        except Post.DoesNotExist:
            return Response({"error": "post does not exist"})
        
        try:
            user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response({"error": "user does not exist"})
        
        if user in post.likes.all():
            post.likes.remove(user)
            return Response({'now_liked':False})
        else:
            post.likes.add(user)
            return Response({'now_liked':True})
    except:
        return Response({'error':'failed to like post'})
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    try:
        data = request.data

        try:
            user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response({"error": "user does not exit"})

        post = Post.objects.create(
            user=user,
            description=data['description']
        )

        serializer = PostSerializer(post, many=False)

        return Response(serializer.data)
    except:
        return Response({'error':'error creating post'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_posts(request):
    try:
        my_user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "user does not exist"})

    # 🔹 Exclude organization posts from the main feed
    posts = Post.objects.filter(organization__isnull=True).order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)

    serializer = PostSerializer(result_page, many=True)

    data = []
    for post in serializer.data:
        if my_user.username in post['likes']:
            data.append({**post, 'liked': True})
        else:
            data.append({**post, 'liked': False})

    return paginator.get_paginated_response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.query_params.get('query', '')
    users = MyUser.objects.filter(username__icontains=query)
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_details(request):
    data = request.data

    try:
        user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({"error": "user does not exist"})
    
    serializer = UserSerializer(user, data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({**serializer.data, "success":True})
    
    return Response({**serializer.errors, "success":False})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        res = Response()
        res.data = {"success":True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res
    except:
        return Response({"success":False})
    
# Organization views
#

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_organization(request):
    """Allows users to create a new organization if the name is unique."""
    data = request.data
    user = request.user

    # Check if an organization with the same name already exists
    if Organization.objects.filter(name=data['name']).exists():
        return Response({"error": "An organization with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # Create organization
    org = Organization.objects.create(
        name=data['name'],
        bio=data.get('bio', ''),
        owner=user,
    )
    org.members.add(user)  # The creator is automatically a member
    org.save()

    serializer = OrganizationSerializer(org)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_to_join_organization(request, org_id):
    """Allows users to request to join an organization."""
    try:
        org = Organization.objects.get(id=org_id)
        user = request.user

        if user in org.members.all():
            return Response({"error": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)

        if user in org.pending_requests.all():
            return Response({"error": "Already requested"}, status=status.HTTP_400_BAD_REQUEST)

        org.pending_requests.add(user)
        return Response({"success": "Join request sent"}, status=status.HTTP_200_OK)

    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_join_request(request, org_id, user_id):
    """Allows organization owners to accept a join request."""
    try:
        org = Organization.objects.get(id=org_id)

        if request.user != org.owner:
            return Response({"error": "Only owner can accept requests"}, status=status.HTTP_403_FORBIDDEN)

        user = MyUser.objects.get(id=user_id)

        if user not in org.pending_requests.all():
            return Response({"error": "No pending request from this user"}, status=status.HTTP_400_BAD_REQUEST)

        org.pending_requests.remove(user)
        org.members.add(user)
        return Response({"success": "User added to organization"}, status=status.HTTP_200_OK)

    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_organization_posts(request, org_id):
    """Retrieve posts from an organization, only visible to members."""
    try:
        org = Organization.objects.get(id=org_id)
        user = request.user

        if user not in org.members.all():
            return Response({"error": "You are not a member of this organization"}, status=status.HTTP_403_FORBIDDEN)

        posts = orgPost.objects.filter(organization=org).order_by('-created_at')
        serializer = OrgPostSerializer(posts, many=True)

        return Response(serializer.data)

    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_organizations(request):
    """Retrieve all organizations the logged-in user is a part of."""
    user = request.user
    organizations = Organization.objects.filter(members=user)
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_organization_feed(request):
    """Retrieve all posts from organizations the user is a part of."""
    user = request.user
    # 1) Find the organizations the user is in
    organizations = Organization.objects.filter(members=user)

    # 2) Query orgPost with organization__in= these orgs
    org_posts = orgPost.objects.filter(organization__in=organizations).order_by('-created_at')

    # 3) Serialize them with OrgPostSerializer
    serializer = OrgPostSerializer(org_posts, many=True)

    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_organization(request, org_id):
    try:
        org = Organization.objects.get(id=org_id)
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrganizationSerializer(org, context={"request": request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_org_post(request):
    """Creates a new post for an organization."""
    try:
        data = request.data
        user = request.user

        # Ensure an organization ID is provided
        if "organization_id" not in data or not data["organization_id"]:
            return Response({"error": "Organization ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            organization = Organization.objects.get(id=data["organization_id"])
        except Organization.DoesNotExist:
            return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

        # Ensure user is a member of the organization
        if user not in organization.members.all():
            return Response({"error": "You are not a member of this organization"}, status=status.HTTP_403_FORBIDDEN)

        # Create the organization post
        org_post = orgPost.objects.create(
            user=user,
            description=data["description"],
            organization=organization
        )

        serializer = PostSerializer(org_post, many=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": "Error creating organization post", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
