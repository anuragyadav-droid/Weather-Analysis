# 🌤️ Weather Dashboard

A responsive weather dashboard that fetches real-time weather data from the OpenWeatherMap API. Features current weather, 5-day forecast, and detailed weather information.

## Features

✨ **Current Weather Display**
- Temperature, feels-like temperature, and weather description
- Humidity, wind speed, pressure, visibility, and UV index
- Weather icons for visual representation

📅 **5-Day Forecast**
- Daily forecast with high/low temperatures
- Weather descriptions and icons
- Responsive grid layout

🔍 **City Search**
- Search for any city worldwide
- Geolocation support (uses device location on first load)
- Real-time error handling

📱 **Responsive Design**
- Works seamlessly on desktop, tablet, and mobile
- Beautiful gradient design with smooth animations
- Accessible and user-friendly interface

## Setup Instructions

### 1. Get an API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to your API keys section
4. Copy your API key

### 2. Configure the API Key

Open `app.js` and replace `YOUR_OPENWEATHERMAP_API_KEY` with your actual API key:

```javascript
const API_KEY = 'your_actual_api_key_here';