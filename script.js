const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    message.textContent = "Please enter a city name.";
    weatherResult.hidden = true;
    return;
  }

  message.textContent = "Loading weather...";
  weatherResult.hidden = true;

  try {
    // Step 1: Find the city's coordinates
    const cityURL =
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
      encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    const cityResponse = await fetch(cityURL);

    if (!cityResponse.ok) {
      throw new Error("Unable to search for the city.");
    }

    const cityData = await cityResponse.json();

    if (!cityData.results || cityData.results.length === 0) {
      throw new Error("City not found. Please try another name.");
    }

    const location = cityData.results[0];

    const latitude = location.latitude;
    const longitude = location.longitude;

    // Step 2: Fetch the weather
    const weatherURL =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" +
      latitude +
      "&longitude=" +
      longitude +
      "&current=temperature_2m,relative_humidity_2m,wind_speed_10m" +
      "&temperature_unit=celsius&wind_speed_unit=kmh";

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Unable to retrieve weather data.");
    }

    const weatherData = await weatherResponse.json();

    // Step 3: Read the nested JSON object
    const current = weatherData.current;

    if (!current) {
      throw new Error("Weather information is unavailable.");
    }

    // Step 4: Display the results
    document.getElementById("cityName").textContent =
      location.name + ", " + (location.country || "Unknown country");

    document.getElementById("temperature").textContent =
      current.temperature_2m + " °C";

    document.getElementById("humidity").textContent =
      current.relative_humidity_2m + "%";

    document.getElementById("windSpeed").textContent =
      current.wind_speed_10m + " km/h";

    document.getElementById("updatedTime").textContent =
      "Weather time: " + current.time.replace("T", " ");

    weatherResult.hidden = false;
    message.textContent = "Weather loaded successfully!";
  } catch (error) {
    weatherResult.hidden = true;
    message.textContent =
      error.message || "Something went wrong. Please try again.";
  }
});
