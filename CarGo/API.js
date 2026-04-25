const API_BASE_URL = "http://127.0.0.1:8000/api";


// Load all cars
async function loadCars() {
    const response = await fetch(`${API_BASE_URL}/cars/`);
    const cars = await response.json();
    // render cars into your table/cards
}


// Create a rental
async function createRental(carId, clientId, startDate, endDate) {
    const response = await fetch(`${API_BASE_URL}/rentals/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            car: carId,
            client: clientId,
            start_date: startDate,
            expected_return_date: endDate
        })
    });
    const data = await response.json();
    return data;
}

