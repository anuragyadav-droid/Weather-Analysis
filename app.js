// Configuration
const API_KEY = '31b2423343dc0415234eede36f3dc901'; // Get from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            () => {
                // Default to London if geolocation fails
                fetchWeatherByCity('London');
            }
        );
    } else {
        fetchWeatherByCity('London');
    }
});

// Handle Search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        cityInput.value = '';
    }
}

// Fetch Weather by City Name
async function fetchWeatherByCity(city) {
    try {
        showLoading(true);
        clearError();

        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        const { lat, lon } = data.coord;

        // Fetch current weather and forecast
        await Promise.all([
            displayCurrentWeather(data),
            fetchForecast(lat, lon)
        ]);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Fetch Weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
    try {
        showLoading(true);
        clearError();

        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        await Promise.all([
            displayCurrentWeather(data),
            fetchForecast(lat, lon)
        ]);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Display Current Weather
function displayCurrentWeather(data) {
    const {
        name,
        sys: { country },
        main: { temp, feels_like, humidity, pressure },
        weather: [{ description, icon }],
        wind: { speed },
        visibility,
        clouds: { all: cloudiness }
    } = data;

    // Update DOM
    document.getElementById('cityName').textContent = `${name}, ${country}`;
    document.getElementById('temp').textContent = Math.round(temp);
    document.getElementById('feelsLike').textContent = `${Math.round(feels_like)}°C`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${speed} m/s`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('description').textContent = description;
    document.getElementById('weatherIcon').src = getWeatherIconUrl(icon);

    // Update UV Index (requires separate API call)
    fetchUVIndex(data.coord.lat, data.coord.lon);
}

// Fetch Forecast
async function fetchForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();
        displayForecast(data.list);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Display Forecast
function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get forecast for next 5 days (every 24 hours)
    const dailyForecasts = [];
    const seenDates = new Set();

    forecastData.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        // Get one forecast per day
        if (!seenDates.has(dateKey) && dailyForecasts.length < 5) {
            seenDates.add(dateKey);
            dailyForecasts.push(item);
        }
    });

    // Create forecast cards
    dailyForecasts.forEach((forecast) => {
        const card = createForecastCard(forecast);
        forecastContainer.appendChild(card);
    });
}

// Create Forecast Card
function createForecastCard(forecast) {
    const {
        dt,
        main: { temp_max, temp_min },
        weather: [{ description, icon }],
    } = forecast;

    const date = new Date(dt * 1000);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
        <div class="forecast-date">${dayName}<br>${dateStr}</div>
        <img src="${getWeatherIconUrl(icon)}" alt="weather" class="forecast-icon">
        <div class="forecast-temp">
            ${Math.round(temp_max)}° / ${Math.round(temp_min)}°
        </div>
        <div class="forecast-description">${description}</div>
    `;

    return card;
}

// Fetch UV Index
async function fetchUVIndex(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        const data = await response.json();
        document.getElementById('uvIndex').textContent = Math.round(data.value);
    } catch (error) {
        console.error('Error fetching UV index:', error);
    }
}

// Get Weather Icon URL
function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Error Handling
function showError(message) {
    const error = document.getElementById('errorMessage');
    error.textContent = `❌ ${message}`;
    error.classList.add('show');
}

function clearError() {
    const error = document.getElementById('errorMessage');
    error.classList.remove('show');
}

// Loading State
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('show');
    } else {
        spinner.classList.remove('show');
    }
}