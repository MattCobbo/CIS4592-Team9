from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from .views import (
    get_user_profile_data, CustomTokenObtainPairView, CustomTokenRefreshView,
    register, authenticated, toggleFollow, get_users_posts, toggleLike,
    create_post, get_posts, search_users, logout, update_user_details,
    create_organization, request_to_join_organization,
    accept_join_request, get_organization_posts, get_user_organizations,
    get_organization_feed, get_organization, create_org_post
)

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
    path('search/', search_users),
    path('update_user/', update_user_details),
    path('logout/', logout),
    path("organization/user/", get_user_organizations),
    path("organization/feed/", get_organization_feed),

    # Organization Routes
    path("organization/create/", create_organization),
    path("organization/join/<int:org_id>/", request_to_join_organization),
    path("organization/accept/<int:org_id>/<int:user_id>/", accept_join_request),
    path("organization/posts/<int:org_id>/", get_organization_posts),
    path("organization/<int:org_id>/", get_organization),
    path("create_org_post/", create_org_post),
    ] + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)
