from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from .views import get_user_profile_data, CustomTokenObtainPairView, CustomTokenRefreshView, register, authenticated, toggleFollow, get_users_posts, toggleLike, create_post, get_posts, search_users


urlpatterns = [
    path("user_data/<str:pk>/", get_user_profile_data),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('register/', register),
    path('authenticated/', authenticated),
    path('toggle_follow/', toggleFollow),
    path('posts/<str:pk>/', get_users_posts),
    path('toggleLike/', toggleLike),
    path('create_post/', create_post),
    path('get_posts/', get_posts),
    path('search/', search_users)
    ] + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)
