from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyUser
from .serializers import MyUserProfileSerializer

from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def my_view(request):
        response = HttpResponse("My response")
        response['Access-Control-Allow-Origin'] = "http://localhost:3000"
        response['Access-Control-Allow-Credentials'] = 'true'
        return response


@api_view(["GET"])
@permission_classes( [IsAuthenticated] )
def get_user_profile_data(request, pk):
    try:
        try:
            user = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response({"error": "user does not exit"})

        serializer = MyUserProfileSerializer(user, many=False)
        return Response(serializer.data)
    except:
        return Response({"error": "error getting user data"})
