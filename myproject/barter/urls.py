from django.urls import path
from . import views

urlpatterns = [
    path('profiles/', views.profiles),
    path('listings/', views.listings),
    path('matches/<int:profile_id>/', views.matches),
    path('messages/', views.messages),
    path('messages/<int:profile_id>/', views.messages_for_profile),
]
