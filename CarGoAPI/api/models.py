from django.db import models


class Car(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('maintenance', 'Under Maintenance'),
    ]

    make = models.CharField(max_length=100)           # e.g. Toyota
    model = models.CharField(max_length=100)          # e.g. Vios
    year = models.IntegerField()                      # e.g. 2022
    plate_number = models.CharField(max_length=20, unique=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - {self.plate_number}"


class Client(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    license_id = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.last_name}, {self.first_name} - {self.license_id}"


class Rental(models.Model):
    car = models.ForeignKey(Car, on_delete=models.PROTECT, related_name='rentals')
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='rentals')
    start_date = models.DateField()
    expected_return_date = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rental #{self.id} - {self.car} by {self.client}"

    def save(self, *args, **kwargs):
        # Auto-calculate total cost when saving
        if self.start_date and self.expected_return_date and self.car:
            days = (self.expected_return_date - self.start_date).days
            if days > 0:
                self.total_cost = days * self.car.daily_rate
        # Mark the car as rented
        self.car.status = 'rented'
        self.car.save()
        super().save(*args, **kwargs)


class Return(models.Model):
    CONDITION_CHOICES = [
        ('good', 'Good'),
        ('minor_damage', 'Minor Damage'),
        ('major_damage', 'Major Damage'),
    ]

    rental = models.OneToOneField(Rental, on_delete=models.PROTECT, related_name='return_record')
    return_date = models.DateField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    remarks = models.TextField(blank=True, null=True)
    is_late = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Return for Rental #{self.rental.id} on {self.return_date}"

    def save(self, *args, **kwargs):
        # Auto-detect late return
        if self.return_date > self.rental.expected_return_date:
            self.is_late = True
        # Mark the car as available again (or maintenance if damaged)
        if self.condition == 'major_damage':
            self.rental.car.status = 'maintenance'
        else:
            self.rental.car.status = 'available'
        self.rental.car.save()
        super().save(*args, **kwargs)
