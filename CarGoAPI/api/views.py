from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Car, Client, Rental, Return
from .serializers import CarSerializer, ClientSerializer, RentalSerializer, ReturnSerializer


# ─────────────────────────────────────────
# CARS
# ─────────────────────────────────────────

@api_view(['GET', 'POST'])
def car_list(request):
    """GET all cars / POST a new car"""
    if request.method == 'GET':
        cars = Car.objects.all().order_by('-created_at')
        serializer = CarSerializer(cars, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def car_detail(request, pk):
    """GET / PUT / PATCH / DELETE a single car by ID"""
    try:
        car = Car.objects.get(pk=pk)
    except Car.DoesNotExist:
        return Response({'error': 'Car not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CarSerializer(car)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = CarSerializer(car, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        car.delete()
        return Response({'message': 'Car deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# CLIENTS
# ─────────────────────────────────────────

@api_view(['GET', 'POST'])
def client_list(request):
    """GET all clients / POST a new client"""
    if request.method == 'GET':
        clients = Client.objects.all().order_by('-created_at')
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def client_detail(request, pk):
    """GET / PUT / PATCH / DELETE a single client by ID"""
    try:
        client = Client.objects.get(pk=pk)
    except Client.DoesNotExist:
        return Response({'error': 'Client not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ClientSerializer(client)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ClientSerializer(client, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        client.delete()
        return Response({'message': 'Client deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# RENTALS
# ─────────────────────────────────────────

@api_view(['GET', 'POST'])
def rental_list(request):
    """GET all rentals / POST a new rental"""
    if request.method == 'GET':
        rentals = Rental.objects.all().order_by('-created_at')
        serializer = RentalSerializer(rentals, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = RentalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def rental_detail(request, pk):
    """GET / PUT / PATCH / DELETE a single rental by ID"""
    try:
        rental = Rental.objects.get(pk=pk)
    except Rental.DoesNotExist:
        return Response({'error': 'Rental not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = RentalSerializer(rental)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = RentalSerializer(rental, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        rental.delete()
        return Response({'message': 'Rental deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# RETURNS
# ─────────────────────────────────────────

@api_view(['GET', 'POST'])
def return_list(request):
    """GET all returns / POST a new return"""
    if request.method == 'GET':
        returns = Return.objects.all().order_by('-created_at')
        serializer = ReturnSerializer(returns, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ReturnSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def return_detail(request, pk):
    """GET / PUT / PATCH / DELETE a single return by ID"""
    try:
        return_record = Return.objects.get(pk=pk)
    except Return.DoesNotExist:
        return Response({'error': 'Return record not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ReturnSerializer(return_record)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ReturnSerializer(return_record, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        return_record.delete()
        return Response({'message': 'Return record deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
# DASHBOARD SUMMARY (bonus endpoint)
# ─────────────────────────────────────────

@api_view(['GET'])
def dashboard_summary(request):
    """Returns counts for the dashboard stats cards"""
    return Response({
        'total_cars': Car.objects.count(),
        'available_cars': Car.objects.filter(status='available').count(),
        'rented_cars': Car.objects.filter(status='rented').count(),
        'total_clients': Client.objects.count(),
        'active_rentals': Rental.objects.count(),
        'total_returns': Return.objects.count(),
    })
