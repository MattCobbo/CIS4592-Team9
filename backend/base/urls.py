from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from . import views

urlpatterns = [
    path("user_data/<str:pk>/", views.get_user_profile_data),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token-refresh'),
    path('register/', views.register),
    path('authenticated/', views.authenticated),
    path('toggle_follow/', views.toggleFollow),
    path('posts/<str:pk>/', views.get_users_posts),
    path('toggleLike/', views.toggleLike),
    path('create_post/', views.create_post),
    path('get_posts/', views.get_posts),
    path('search/', views.search_users),
    path('update_user/', views.update_user_details),
    path('logout/', views.logout),
    path("organization/user/", views.get_user_organizations),
    path("organization/feed/", views.get_organization_feed),

    # Organization Routes
    path("organization/create/", views.create_organization),
    path("organization/join/<int:org_id>/", views.request_to_join_organization),
    path("organization/accept/<int:org_id>/<str:user_id>/", views.accept_join_request),
    path("organization/posts/<int:org_id>/", views.get_organization_posts),
    path("organization/<int:org_id>/", views.get_organization),
    path("organization/<int:org_id>/update/", views.update_organization),
    path("create_org_post/", views.create_org_post),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('search_organizations/', views.search_organizations),
    path("organization/<int:org_id>/events/", views.EventListCreateView.as_view(), name="org-events",),
    path("events/<int:event_id>/rsvp/", views.RSVPUpdateView.as_view(), name="event-rsvp",),
    path('jobs/', views.jobs, name='jobs'),
    path('jobs/<int:job_id>/', views.job_detail, name='job-detail'),
    path('jobs/<int:job_id>/apply/', views.apply_for_job, name='apply-for-job'),
    path('my-jobs/', views.my_jobs, name='my-jobs'),
    path('jobs/<int:job_id>/applications/', views.job_applications, name='job-applications'),
    path('check-username/', views.check_username, name='check-username'),
] + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)