<<<<<<< HEAD
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
=======
from rest_framework import serializers

from .geocode import geocode_us_zip
from .models import Listing, Message, Profile


class ListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    listings = ListingSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'listings', 'lat', 'lon')

    def validate_search_radius_miles(self, value):
        if value < 1 or value > 50:
            raise serializers.ValidationError('Choose between 1 and 50 miles.')
        return value

    def validate_zip_code(self, value):
        if value is None:
            return ''
        digits = ''.join(c for c in value if c.isdigit())
        if len(digits) not in (0, 5):
            raise serializers.ValidationError('Use a 5-digit US ZIP, or leave blank.')
        if len(digits) == 5:
            return digits
        return ''

    def create(self, validated_data):
        zip_code = validated_data.get('zip_code') or ''
        if zip_code:
            lat, lon = geocode_us_zip(zip_code)
            if lat is not None and lon is not None:
                validated_data['lat'] = lat
                validated_data['lon'] = lon
            else:
                # Still create the profile; ZIP is saved. Local distance matching needs coords.
                validated_data['lat'] = None
                validated_data['lon'] = None
        else:
            validated_data['lat'] = None
            validated_data['lon'] = None
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'

>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a
