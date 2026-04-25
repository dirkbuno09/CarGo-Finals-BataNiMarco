# Setup

### Step 1: Clone the Repository
Open your terminal or command prompt and clone the project from GitHub:


`git clone [Your-GitHub-Repository-URL]`

`cd CarGoAPI`


### Step 2: Install Dependencies
Install the necessary Python packages required to run the Django backend:

`pip install django djangorestframework django-cors-headers`

### Step 3: Database Setup
Initialize the local SQLite database and create the necessary tables for cars, clients, rentals, and returns:

`python manage.py makemigrations`

`python manage.py migrate`

(Optional) To access the administrative dashboard, create an admin account:

`python manage.py createsuperuser`


### Step 4: Launch the Backend Server
Start the Django development server. By default, the API will run at http://127.0.0.1:8000/.
Bash

`python manage.py runserver`

### Step 5: Launch the Frontend

The frontend is built using HTML, CSS, and JavaScript.
Locate the index.html file in the project folder.
Open index.html directly in any modern web browser (e.g., Chrome, Firefox, or Edge).
Ensure the backend server from Step 4 is still running to allow the frontend to fetch data.

# System Features Overview
Once the system is running, the following modules are available:

Dashboard: A summary of total vehicles, available cars, and active rentals.

Vehicles: Manage the fleet inventory, including plate numbers and daily rates.

Clients: Maintain customer profiles and driver's license records.

Rentals: Log new bookings and track expected return dates.

Returns: Process returning vehicles, check for damages, and calculate late statuses.

# Backend API Endpoints

/api/cars/

/api/clients/

/api/rentals/

/api/returns/

