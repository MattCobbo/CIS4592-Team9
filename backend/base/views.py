from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import MyUser
from .serializers import MyUserProfileSerializer, UserRegisterSerializer

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def authenticated(request):
    return Response('authenticated')

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
        return Response(serializer.data)
    except:
        return Response({"error": "error getting user data"})
