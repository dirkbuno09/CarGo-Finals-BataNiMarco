from django.contrib import admin
from .models import Car, Client, Rental, Return


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ('id', 'make', 'model', 'year', 'plate_number', 'color', 'daily_rate', 'status', 'created_at')
    search_fields = ('make', 'model', 'plate_number')
    list_filter = ('status', 'make')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'last_name', 'first_name', 'phone', 'email', 'license_id', 'created_at')
    search_fields = ('last_name', 'first_name', 'license_id', 'phone')


@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ('id', 'car', 'client', 'start_date', 'expected_return_date', 'total_cost', 'created_at')
    search_fields = ('car__plate_number', 'client__last_name')
    list_filter = ('start_date',)


@admin.register(Return)
class ReturnAdmin(admin.ModelAdmin):
    list_display = ('id', 'rental', 'return_date', 'condition', 'is_late', 'created_at')
    list_filter = ('condition', 'is_late')