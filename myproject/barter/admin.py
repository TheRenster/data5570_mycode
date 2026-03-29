from django.contrib import admin
<<<<<<< HEAD
from .models import Profile, Listing, Message
admin.site.register(Profile)
admin.site.register(Listing)
=======
from .models import Profile, Listing, Match, Message

admin.site.register(Profile)
admin.site.register(Listing)
admin.site.register(Match)
>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a
admin.site.register(Message)
