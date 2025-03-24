from django.contrib import admin

from .models import MyUser, Post, Organization, orgPost

admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Organization)
admin.site.register(orgPost)