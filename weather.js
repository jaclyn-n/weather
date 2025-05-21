async function fetchWeather(city, resultDiv) {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      resultDiv.innerHTML = "City not found. Try another.";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const weatherData = await weatherRes.json();

    const weather = weatherData.current_weather;

    resultDiv.innerHTML = `
      <strong>${name}, ${country}</strong><br/>
      Time: ${weather.time}
    `;
  } catch (error) {
    resultDiv.innerHTML = "Error getting weather data.";
    console.error(error);
  }
}
module.exports = { fetchWeather };
