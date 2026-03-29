<<<<<<< HEAD
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
=======
import re
from math import atan2, cos, radians, sin, sqrt

from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Listing, Match, Message, Profile
from .serializers import ListingSerializer, MessageSerializer, ProfileSerializer


def _max_distance_miles(a: Profile, b: Profile) -> float:
    """Both users’ preferences (cap 50) — the tighter radius wins for local trades."""
    ra = min(int(a.search_radius_miles or 50), 50)
    rb = min(int(b.search_radius_miles or 50), 50)
    return float(min(ra, rb))


def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8  # miles
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def titles_match(a: str, b: str) -> bool:
    """Loose match: substring either way, or any shared word (3+ chars) after splitting."""
    a, b = a.lower().strip(), b.lower().strip()
    if not a or not b:
        return False
    if a in b or b in a:
        return True

    words_a = {w for w in re.split(r'[^\w]+', a) if len(w) >= 3}
    words_b = {w for w in re.split(r'[^\w]+', b) if len(w) >= 3}
    return bool(words_a & words_b)

>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a

@api_view(['GET', 'POST'])
def profiles(request):
    if request.method == 'GET':
<<<<<<< HEAD
        return Response(ProfileSerializer(Profile.objects.all(), many=True).data)
    serializer = ProfileSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
=======
        all_profiles = Profile.objects.all()
        return Response(ProfileSerializer(all_profiles, many=True).data)

    if request.method == 'POST':
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a

@api_view(['GET', 'POST'])
def listings(request):
    if request.method == 'GET':
<<<<<<< HEAD
        return Response(ListingSerializer(Listing.objects.all(), many=True).data)
    serializer = ListingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
=======
        all_listings = Listing.objects.all()
        return Response(ListingSerializer(all_listings, many=True).data)

    if request.method == 'POST':
        serializer = ListingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a

@api_view(['GET'])
def matches(request, profile_id):
    try:
        my_profile = Profile.objects.get(id=profile_id)
    except Profile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
<<<<<<< HEAD
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
=======

    my_offer_listings = list(Listing.objects.filter(profile=my_profile, listing_type=Listing.OFFER))
    my_wants = list(Listing.objects.filter(profile=my_profile, listing_type=Listing.WANT))

    results = []
    other_profiles = Profile.objects.exclude(id=profile_id)

    for other in other_profiles:
        their_offers = list(Listing.objects.filter(profile=other, listing_type=Listing.OFFER))
        their_wants = list(Listing.objects.filter(profile=other, listing_type=Listing.WANT))

        matched_their_offer = None
        for offer in their_offers:
            for mw in my_wants:
                if titles_match(mw.title, offer.title):
>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a
                    matched_their_offer = offer
                    break
            if matched_their_offer:
                break
<<<<<<< HEAD
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

=======

        matched_my_offer_listing = None
        for want in their_wants:
            for my_listing in my_offer_listings:
                if titles_match(want.title, my_listing.title):
                    matched_my_offer_listing = my_listing
                    break
            if matched_my_offer_listing:
                break

        if not matched_their_offer or not matched_my_offer_listing:
            continue

        matched_my_offer_title = matched_my_offer_listing.title

        # Local listings: only enforce distance when BOTH profiles have coordinates.
        # If ZIP/geocode failed, we still show the mutual match (distance filter skipped).
        needs_distance = matched_their_offer.is_local or matched_my_offer_listing.is_local
        if needs_distance:
            have_coords = (
                my_profile.lat is not None
                and my_profile.lon is not None
                and other.lat is not None
                and other.lon is not None
            )
            if have_coords:
                dist = haversine(my_profile.lat, my_profile.lon, other.lat, other.lon)
                if dist > _max_distance_miles(my_profile, other):
                    continue

        results.append(
            {
                'profile': ProfileSerializer(other).data,
                'they_offer': matched_their_offer.title,
                'you_offer': matched_my_offer_title,
                'distance_miles': round(
                    haversine(my_profile.lat, my_profile.lon, other.lat, other.lon), 1
                )
                if (
                    my_profile.lat is not None
                    and my_profile.lon is not None
                    and other.lat is not None
                    and other.lon is not None
                )
                else None,
            }
        )

    # Sync persisted Match rows for this user (ordered pairs, score = 1.0 for mutual match)
    Match.objects.filter(Q(profile_a_id=profile_id) | Q(profile_b_id=profile_id)).delete()
    for row in results:
        oid = row['profile']['id']
        lo, hi = sorted([profile_id, oid])
        Match.objects.create(profile_a_id=lo, profile_b_id=hi, score=1.0)

    return Response(results)


>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a
@api_view(['GET', 'POST'])
def messages(request):
    if request.method == 'POST':
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

<<<<<<< HEAD
@api_view(['GET'])
def messages_for_profile(request, profile_id):
    msgs = Message.objects.filter(sender_id=profile_id) | Message.objects.filter(receiver_id=profile_id)
    return Response(MessageSerializer(msgs.order_by('timestamp'), many=True).data)
=======
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
def messages_for_profile(request, profile_id):
    msgs = Message.objects.filter(sender_id=profile_id) | Message.objects.filter(receiver_id=profile_id)
    msgs = msgs.order_by('timestamp')
    return Response(MessageSerializer(msgs, many=True).data)
>>>>>>> 9ee4f7c5dc04655b47c7490328c7b395888d790a
