async function getWeather() {
    const city = document.getElementById("cityInput").value;

    const message = document.getElementById("message");

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Loading...";

    try {

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            message.textContent = "City not found.";
            return;
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const cityName = location.name;
        const country = location.country;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather data.");
        }

        const weatherData = await weatherResponse.json();

        const currentWeather = weatherData.current;

        document.getElementById("cityName").textContent =
            `${cityName}, ${country}`;

        document.getElementById("temperature").textContent =
            currentWeather.temperature_2m;

        document.getElementById("windSpeed").textContent =
            currentWeather.wind_speed_10m;

        document.getElementById("humidity").textContent =
            currentWeather.relative_humidity_2m;

        document.getElementById("weatherDescription").textContent =
            getWeatherDescription(currentWeather.weather_code);

        message.textContent = "";

    }

    catch (error) {

        message.textContent =
            "Something went wrong. Please try again.";

        console.error(error);
    }
}
function getWeatherDescription(code) {

    if (code === 0) {
        return "☀️ Clear Sky";
    }

    if (code === 1 || code === 2 || code === 3) {
        return "🌤️ Partly Cloudy";
    }

    if (code === 45 || code === 48) {
        return "🌫️ Foggy";
    }

    if (code >= 51 && code <= 57) {
        return "🌦️ Drizzle";
    }

    if (code >= 61 && code <= 67) {
        return "🌧️ Rain";
    }

    if (code >= 71 && code <= 77) {
        return "❄️ Snow";
    }

    if (code >= 80 && code <= 82) {
        return "🌧️ Rain Showers";
    }

    if (code >= 95) {
        return "⛈️ Thunderstorm";
    }

    return "🌤️ Unknown Weather";
}
