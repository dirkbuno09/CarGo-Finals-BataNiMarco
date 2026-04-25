from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard_summary),

    # Cars  →  /api/cars/  and  /api/cars/<id>/
    path('cars/', views.car_list),
    path('cars/<int:pk>/', views.car_detail),

    # Clients  →  /api/clients/  and  /api/clients/<id>/
    path('clients/', views.client_list),
    path('clients/<int:pk>/', views.client_detail),

    # Rentals  →  /api/rentals/  and  /api/rentals/<id>/
    path('rentals/', views.rental_list),
    path('rentals/<int:pk>/', views.rental_detail),

    # Returns  →  /api/returns/  and  /api/returns/<id>/
    path('returns/', views.return_list),
    path('returns/<int:pk>/', views.return_detail),
]
