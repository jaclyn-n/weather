const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function fetchWeatherForCity(city) {
  const trimmedCity = city.trim().toLowerCase();
  const cacheKey = `weather_${trimmedCity}`;
  const resultDiv = document.getElementById("weatherResult");

  try {
    // Check localStorage for cached data
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = new Date().getTime();

      if (now - parsed.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${trimmedCity}`);
        return parsed.html;
      }
    }

    // If offline and no valid cache, show offline message
    if (!navigator.onLine && !cached) {
      return `<strong>${trimmedCity}:</strong> Offline. No cached data available.`;
    }

    // Fetch coordinates
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmedCity
    )}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return `<strong>${trimmedCity}:</strong> City not found.`;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Fetch weather data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&current_weather_fields=temperature,windspeed`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      return `<strong>${name}, ${country}:</strong> Weather data unavailable.`;
    }

    const { temperature, windspeed } = weatherData.current_weather;

    const html = `
      <strong>${name}, ${country}</strong><br/>
      Temperature: ${temperature}°C<br/>
      Wind Speed: ${windspeed} km/h
      <hr/>
    `;

    // Cache result
    localStorage.setItem(cacheKey, JSON.stringify({ html, timestamp: new Date().getTime() }));

    return html;
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);

    if (localStorage.getItem(cacheKey)) {
      const parsed = JSON.parse(localStorage.getItem(cacheKey));
      return `${parsed.html}<em>(Showing cached data due to error)</em>`;
    }

    return `<strong>${trimmedCity}:</strong> Error fetching data.`;
  }
}


async function getWeatherForCities(cities) {
  const resultDiv = document.getElementById("weatherResult");
  resultDiv.innerHTML = "Fetching weather data....";
  const results = await Promise.all(cities.map(fetchWeatherForCity));
  resultDiv.innerHTML = results.join("");
}

function WeatherButtonClick() {
  const input = document.getElementById("cityInput").value;
  const cities = input.split(",");
  getWeatherForCities(cities);
}



// async function getWeatherNew() {
//   // Get user input and the result display div
//   const cityInput = document.getElementById("cityInput");
//   const resultDiv = document.getElementById("weatherResult");
//   const city = cityInput.value.trim(); // Remove extra spaces

//   // Log the trimmed user input for debugging
//   console.log(`User input (trimmed): "${city}"`);

//   // Check if the input is empty after trimming
//   if (!city) {
//     alert("Please enter a city name.");
//     resultDiv.innerHTML = "Please enter a city name.";
//     return; // Stop the function here
//   }

//   // Show loading message while fetching data
//   resultDiv.innerHTML = "Fetching weather data...";

//   try {
//     // Construct URL for geocoding API using encodeURIComponent to safely include city name
//     const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
//       city
//     )}&count=1&language=en&format=json`;
//     const geoRes = await fetch(geoUrl); // Send request
//     const geoData = await geoRes.json(); // Parse response to JSON

//     // Check if city was found in the geocoding results
//     if (!geoData.results || geoData.results.length === 0) {
//       resultDiv.innerHTML = `No results found for "${city}". Please try another city.`;
//       return;
//     }

//     // Extract coordinates and city details from the first result
//     const { latitude, longitude, name, country } = geoData.results[0];

//     // Construct weather API URL using coordinates
//     const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&current_weather_fields=temperature,windspeed`;

//     const weatherRes = await fetch(weatherUrl);
//     const weatherData = await weatherRes.json();

//     // Check if weather data is available
//     if (!weatherData.current_weather) {
//       resultDiv.innerHTML = "Weather data unavailable for this location.";
//       return;
//     }

//     // Extract relevant weather info
//     const { temperature, windspeed } = weatherData.current_weather;

//     // Display weather information in HTML
//     resultDiv.innerHTML = `
//       <strong>${name}, ${country}</strong><br/>
//       Temperature: ${temperature}°C<br/>
//       Wind Speed: ${windspeed} km/h
//     `;
//   } catch (error) {
//     // Catch and log any network or parsing errors
//     console.error("Error fetching weather data:", error);
//     resultDiv.innerHTML = "Something went wrong. Please try again later.";
//   }
// }
