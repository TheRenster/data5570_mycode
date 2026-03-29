from rest_framework import serializers
from .models import Profile, Listing, Message

class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    listings = ListingSerializer(many=True, read_only=True)
    class Meta:
        model = Profile
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
