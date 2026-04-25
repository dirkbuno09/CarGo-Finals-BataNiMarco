from rest_framework import serializers
from .models import Car, Client, Rental, Return


class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class RentalSerializer(serializers.ModelSerializer):
    # Read-only fields to show car and client names in the response
    car_display = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = [
            'id',
            'car',
            'car_display',
            'client',
            'client_name',
            'start_date',
            'expected_return_date',
            'total_cost',
            'notes',
            'created_at',
        ]

    def get_car_display(self, obj):
        return str(obj.car)

    def get_client_name(self, obj):
        return f"{obj.client.last_name}, {obj.client.first_name}"


class ReturnSerializer(serializers.ModelSerializer):
    rental_info = serializers.SerializerMethodField()

    class Meta:
        model = Return
        fields = [
            'id',
            'rental',
            'rental_info',
            'return_date',
            'condition',
            'remarks',
            'is_late',
            'created_at',
        ]

    def get_rental_info(self, obj):
        return str(obj.rental)
