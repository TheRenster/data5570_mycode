from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Profile(models.Model):
    user_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    search_radius_miles = models.PositiveSmallIntegerField(
        default=25,
        validators=[MinValueValidator(1), MaxValueValidator(50)],
        help_text='Max distance (mi) for local matching, 1–50.',
    )
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

class Match(models.Model):
    """Persisted mutual trade compatibility between two profiles (ordered pair: a_id < b_id)."""

    profile_a = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='matches_as_a')
    profile_b = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='matches_as_b')
    score = models.FloatField(default=1.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['profile_a', 'profile_b'], name='barter_match_unique_pair'),
            models.CheckConstraint(
                check=models.Q(profile_a_id__lt=models.F('profile_b_id')),
                name='barter_match_ordered_ids',
            ),
        ]

    def __str__(self):
        return f"Match({self.profile_a_id} ↔ {self.profile_b_id}, score={self.score})"


class Message(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='received_messages')
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.user_name} -> {self.receiver.user_name}: {self.body[:30]}"
