from django.contrib import admin

from .models import MyUser, Post, Organization, orgPost

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at']
    filter_horizontal = ['members', 'pending_requests']

admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(orgPost)