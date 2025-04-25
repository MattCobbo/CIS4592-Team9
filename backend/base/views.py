import logging
import os

from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Event, EventAttendance, Job, JobApplication, MyUser, Organization, Post, orgPost
from .serializers import (
    EventAttendanceSerializer,
    EventSerializer,
    JobApplicationSerializer,
    JobSerializer,
    MyUserProfileSerializer,
    OrganizationSerializer,
    OrgPostSerializer,
    PostSerializer,
    UserRegisterSerializer,
    UserSerializer,
)
from .throttling import OrganizationJoinThrottle, TokenRefreshRateThrottle

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@cache_page(60 * 2)  # Cache authenticated response for 2 minutes
def authenticated(request):
    return Response({"status": "authenticated", "username": request.user.username})


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
    throttle_classes = [TokenRefreshRateThrottle]
    
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return Response({"success": False, "error": "No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)
                
            request.data["refresh"] = refresh_token

            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens["access"]

            res = Response()
            res.data = {"success": True}

            # Set a longer max age for the cookie
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
                path="/",
                max_age=60 * 15  # 15 minutes
            )

            return res
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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

    posts = Post.objects.all().order_by('-created_at')

    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(posts, request)

    serializer = PostSerializer(result_page, many=True)

    data = []
    for post in serializer.data:
        new_post = {}

        if my_user.username in post['likes']:
            new_post = {**post, 'liked':True}
        else:
            new_post = {**post, 'liked':False}
        data.append(new_post)

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


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_organization(request, org_id):
    """Update an organization's details (owner only)."""
    try:
        org = Organization.objects.get(id=org_id)
        
        # Ensure the current user is the owner
        if request.user != org.owner:
            return Response(
                {"error": "Only the organization owner can update details"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if new organization name already exists (unless it's the same org)
        if "name" in request.data and request.data["name"] != org.name:
            if Organization.objects.filter(name=request.data["name"]).exists():
                return Response(
                    {"error": "An organization with this name already exists"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update the organization fields
        if "name" in request.data:
            org.name = request.data["name"]
        
        if "bio" in request.data:
            org.bio = request.data["bio"]
            
        # Discord fields
        if "discord_server" in request.data:
            org.discord_server = request.data["discord_server"]
            
        if "discord_channel" in request.data:
            org.discord_channel = request.data["discord_channel"]
        
        if request.FILES.get("profile_image"):
            # Delete old image if exists
            if org.profile_image:
                # Try to delete the old file
                try:
                    if os.path.isfile(org.profile_image.path):
                        os.remove(org.profile_image.path)
                except:
                    pass  # If deletion fails, just continue
            
            org.profile_image = request.FILES["profile_image"]
        
        # Save the changes
        org.save()
        
        # Return the updated organization
        serializer = OrganizationSerializer(org, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Organization.DoesNotExist:
        return Response(
            {"error": "Organization not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to update organization: {str(e)}"}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([OrganizationJoinThrottle])
def request_to_join_organization(request, org_id):
    """Allows users to request to join an organization."""
    try:
        org = Organization.objects.get(id=org_id)
        user = request.user
        
        logger.info(f"Join request: User {user.username} requesting to join org {org.name} (ID: {org_id})")

        if user in org.members.all():
            logger.info(f"User {user.username} is already a member of {org.name}")
            return Response({"error": "Already a member"}, status=status.HTTP_400_BAD_REQUEST)

        if user in org.pending_requests.all():
            logger.info(f"User {user.username} already has a pending request to join {org.name}")
            return Response({"error": "Already requested"}, status=status.HTTP_400_BAD_REQUEST)

        org.pending_requests.add(user)
        logger.info(f"Added user {user.username} to pending requests for {org.name}")
        return Response({"success": "Join request sent"}, status=status.HTTP_200_OK)

    except Organization.DoesNotExist:
        logger.error(f"Organization with ID {org_id} not found")
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error processing join request: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_join_request(request, org_id, user_id):
    """Allows organization owners to accept a join request."""
    try:
        org = Organization.objects.get(id=org_id)

        if request.user != org.owner:
            return Response({"error": "Only owner can accept requests"}, status=status.HTTP_403_FORBIDDEN)

        # Use get_object_or_404 for cleaner error handling
        user = MyUser.objects.get(username=user_id)  # Changed from id to username

        if user not in org.pending_requests.all():
            return Response({"error": "No pending request from this user"}, status=status.HTTP_400_BAD_REQUEST)

        org.pending_requests.remove(user)
        org.members.add(user)
        return Response({"success": "User added to organization"}, status=status.HTTP_200_OK)

    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)
    except MyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


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
        serializer = OrganizationSerializer(org, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

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
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_organizations(request):
    query = request.query_params.get('query', '')
    organizations = Organization.objects.filter(name__icontains=query)
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data)

class IsOrgOwner(permissions.BasePermission):
    """Allow only the organization owner to POST."""
    def has_permission(self, request, view):
        if request.method != "POST":
            return True
        org_id = request.data.get("organization_id")
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return False
        return org.owner == request.user
    

# Add these view functions to your existing views.py file

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def jobs(request):
    """
    GET - Retrieve all job postings
    POST - Create a new job posting
    """
    if request.method == 'GET':
        # Get all jobs, ordered by newest first
        all_jobs = Job.objects.all().order_by('-post_date')
        
        # Use pagination for potentially large job lists
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(all_jobs, request)
        
        serializer = JobSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    elif request.method == 'POST':
        # Create a new job posting
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(creator=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def job_detail(request, job_id):
    """
    GET - Retrieve a specific job
    DELETE - Delete a job (creator only)
    """
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = JobSerializer(job)
        return Response(serializer.data)
    
    elif request.method == 'DELETE':
        # Only the creator can delete a job
        if request.user != job.creator:
            return Response({"error": "Not authorized to delete this job"}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def apply_for_job(request, job_id):
    """Submit an application for a specific job."""
    try:
        # Print debugging information
        print(f"Received job application for job_id: {job_id}")
        print(f"Request data: {request.data}")
        
        # Get the job
        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Create the application with explicit field mapping to avoid any issues
        application_data = {
            'applicant_name': request.data.get('applicant_name', ''),
            'applicant_email': request.data.get('applicant_email', ''),
            'applicant_phone': request.data.get('applicant_phone', ''),
            'requested_pay': request.data.get('requested_pay', ''),
            'resume_text': request.data.get('resume_text', '')
        }
        
        # Validate the data
        serializer = JobApplicationSerializer(data=application_data)
        if serializer.is_valid():
            # Save the application with the job instance
            serializer.save(job=job)
            
            # Additional logic could be added here for notifications to the job creator
            print(f"Application created successfully: {serializer.data}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # If validation fails, print the errors and return them
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        # Catch any other errors that might occur
        print(f"Error in apply_for_job: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_jobs(request):
    """Get all jobs created by the current user."""
    jobs = Job.objects.filter(creator=request.user).order_by('-post_date')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_applications(request, job_id):
    """Get all applications for a specific job (accessible only to job creator)."""
    try:
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user is the job creator
    if request.user != job.creator:
        return Response({"error": "Not authorized to view these applications"}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    applications = JobApplication.objects.filter(job=job).order_by('-application_date')
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)


class EventListCreateView(generics.ListCreateAPIView):
    """
    GET /organization/<org_id>/events/   – list events visible to members  
    POST (owner only)                    – create new event
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgOwner]

    def get_queryset(self):
        org_id = self.kwargs["org_id"]
        return Event.objects.filter(organization_id=org_id).order_by("starts_at")

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

class RSVPUpdateView(generics.UpdateAPIView):
    """
    PATCH /events/<event_id>/rsvp/  body: {"rsvp": "Y" | "N" | "M"}
    """
    serializer_class = EventSerializer  # not really used for PATCH
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        event = Event.objects.get(id=kwargs["event_id"])
        if request.user not in event.organization.members.all():
            return Response(
                {"error": "Not a member of this organization"},
                status=status.HTTP_403_FORBIDDEN,
            )
        rsvp_val = request.data.get("rsvp", Event.RSVP.MAYBE)
        attendance, _ = EventAttendance.objects.get_or_create(
            event=event, user=request.user
        )
        attendance.rsvp = rsvp_val
        attendance.save()
        return Response(
            {"success": True, "new_rsvp": rsvp_val},
            status=status.HTTP_200_OK,
        )
@api_view(["GET"])
@permission_classes([permissions.AllowAny])  
def check_username(request):
    username = request.GET.get('username', '')
    exists = MyUser.objects.filter(username=username).exists()
    
    return Response({'available': not exists})