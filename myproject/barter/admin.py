from django.contrib import admin
from .models import Profile, Listing, Match, Message

admin.site.register(Profile)
admin.site.register(Listing)
admin.site.register(Match)
admin.site.register(Message)
