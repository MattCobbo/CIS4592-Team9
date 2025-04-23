from django.contrib import admin

from .models import MyUser, Post, Organization, orgPost, Job, JobApplication

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at']
    filter_horizontal = ['members', 'pending_requests']

class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'pay', 'post_date']
    search_fields = ['title', 'description']
    list_filter = ['post_date']

class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant_name', 'job', 'applicant_email', 'application_date']
    search_fields = ['applicant_name', 'applicant_email', 'resume_text']
    list_filter = ['application_date']

admin.site.register(Job, JobAdmin)
admin.site.register(JobApplication, JobApplicationAdmin)
admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(orgPost)