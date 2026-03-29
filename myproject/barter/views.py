from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from math import radians, sin, cos, sqrt, atan2
from .models import Profile, Listing, Message
from .serializers import ProfileSerializer, ListingSerializer, MessageSerializer

def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

@api_view(['GET', 'POST'])
def profiles(request):
    if request.method == 'GET':
        return Response(ProfileSerializer(Profile.objects.all(), many=True).data)
    serializer = ProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def listings(request):
    if request.method == 'GET':
        return Response(ListingSerializer(Listing.objects.all(), many=True).data)
    serializer = ListingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def matches(request, profile_id):
    try:
        my_profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    my_offers = list(Listing.objects.filter(profile=my_profile, listing_type='offer').values_list('title', flat=True))
    my_wants = list(Listing.objects.filter(profile=my_profile, listing_type='want').values_list('title', flat=True))
    results = []
    for other in Profile.objects.exclude(id=profile_id):
        their_offers = list(Listing.objects.filter(profile=other, listing_type='offer'))
        their_wants = list(Listing.objects.filter(profile=other, listing_type='want'))
        matched_their_offer = None
        for offer in their_offers:
            for my_want in my_wants:
                if my_want.lower() in offer.title.lower() or offer.title.lower() in my_want.lower():
                    matched_their_offer = offer
                    break
            if matched_their_offer:
                break
        matched_my_offer = None
        for want in their_wants:
            for my_offer in my_offers:
                if want.title.lower() in my_offer.lower() or my_offer.lower() in want.title.lower():
                    matched_my_offer = my_offer
                    break
            if matched_my_offer:
                break
        if not matched_their_offer or not matched_my_offer:
            continue
        if matched_their_offer.is_local:
            if not (my_profile.lat and my_profile.lon and other.lat and other.lon):
                continue
            if haversine(my_profile.lat, my_profile.lon, other.lat, other.lon) > 50:
                continue
        results.append({
            'profile': ProfileSerializer(other).data,
            'they_offer': matched_their_offer.title,
            'you_offer': matched_my_offer,
        })
    return Response(results)

@api_view(['GET', 'POST'])
def messages(request):
    if request.method == 'POST':
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def messages_for_profile(request, profile_id):
    msgs = Message.objects.filter(sender_id=profile_id) | Message.objects.filter(receiver_id=profile_id)
    return Response(MessageSerializer(msgs.order_by('timestamp'), many=True).data)
