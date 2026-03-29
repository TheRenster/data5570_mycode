from django.db import models

class Profile(models.Model):
    user_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user_name

class Listing(models.Model):
    OFFER = 'offer'
    WANT = 'want'
    TYPE_CHOICES = [(OFFER, 'Offer'), (WANT, 'Want')]
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=200)
    listing_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_local = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.profile.user_name} - {self.listing_type}: {self.title}"

class Message(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_messages')
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.user_name} -> {self.receiver.user_name}: {self.body[:30]}"
