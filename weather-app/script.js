document.addEventListener("DOMContentLoaded", () => {
  // === DOM Elements ===
  const cityInput = document.getElementById("city-input");
  const searchBtn = document.getElementById("search-btn");
  const backgroundVideo = document.getElementById("background-video");
  const weatherBody = document.getElementById("weather-body");
  const errorMessage = document.getElementById("error-message");

  // Weather display elements
  const cityNameDisplay = document.getElementById("city-name");
  const temperatureDisplay = document.getElementById("temperature");
  const descriptionDisplay = document.getElementById("description");
  const humidityDisplay = document.getElementById("humidity");
  const windSpeedDisplay = document.getElementById("wind-speed");
  const weatherIcon = document.getElementById("weather-icon");

  // === API Configuration ===
  const API_KEY = "21e33d62dd67e556d78f0a0af9f4547c"; // Your API key

  function getWeatherByGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
          fetchAndDisplayWeather(url);
        },
        (error) => {
          console.warn("Geolocation permission denied.", error);
          updateBackground(); // Call with no args for default
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      updateBackground(); // Call with no args for default
    }
  }

  // === Event Listeners ===
  searchBtn.addEventListener("click", performSearch);
  cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") performSearch();
  });

  // === Functions ===
  function performSearch() {
    const city = cityInput.value.trim();
    if (city) {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
      fetchAndDisplayWeather(url);
    }
  }

  async function fetchAndDisplayWeather(weatherUrl) {
    weatherBody.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok)
        throw new Error("City not found. Please try again.");
      const weatherData = await weatherResponse.json();

      const { dt, sys } = weatherData;
      const isDay = dt > sys.sunrise && dt < sys.sunset;

      displayCurrentWeather(weatherData, isDay);
      updateBackground(weatherData, isDay);
    } catch (error) {
      console.error("Fetch Error:", error);
      showError(error.message);
    }
  }

  function displayCurrentWeather(data, isDay) {
    const { name, main, weather, wind } = data;
    cityNameDisplay.textContent = name;
    temperatureDisplay.textContent = `${Math.round(main.temp)}°C`;
    descriptionDisplay.textContent = weather[0].description;
    humidityDisplay.textContent = `${main.humidity}%`;
    windSpeedDisplay.textContent = `${wind.speed} km/h`;
    weatherIcon.className = getWeatherIconClass(weather[0].main, isDay);
    weatherBody.classList.remove("hidden");
  }

  function getWeatherIconClass(weatherCondition, isDay) {
    switch (weatherCondition) {
      case "Clear":
        return isDay ? "fas fa-sun" : "fas fa-moon";
      case "Clouds":
        return "fas fa-cloud";
      case "Rain":
      case "Drizzle":
        return "fas fa-cloud-showers-heavy";
      case "Thunderstorm":
        return "fas fa-bolt";
      case "Snow":
        return "fas fa-snowflake";
      case "Mist":
      case "Fog":
      case "Haze":
        return "fas fa-smog";
      default:
        return "fas fa-question-circle";
    }
  }

  function updateBackground(weatherData, isDay) {
    if (!weatherData) {
      backgroundVideo.src = "videos/default.mp4";
      return;
    }

    const condition = weatherData.weather[0].main;
    let videoFile = "default.mp4";

    switch (condition) {
      case "Clear":
        videoFile = isDay ? "clear.mp4" : "clear_night.mp4";
        break;
      case "Clouds":
        // FIX: Changed to match your file name
        videoFile = isDay ? "clouds.mp4" : "clouds_nights.mp4";
        break;
      case "Rain":
      case "Drizzle":
        // You don't have a rain_night.mp4, so this will correctly use rain.mp4 for both
        videoFile = "rain.mp4";
        break;
      case "Thunderstorm":
        // FIX: Changed to match your file name
        videoFile = "thunderstrom.mp4";
        break;
      case "Snow":
        videoFile = "snow.mp4";
        break;
      case "Mist":
      case "Fog":
      case "Haze":
        videoFile = "mist.mp4";
        break;
    }

    const newSrc = `videos/${videoFile}`;
    if (!backgroundVideo.src.includes(newSrc)) {
      backgroundVideo.src = newSrc;
      backgroundVideo.load();
      backgroundVideo
        .play()
        .catch((e) => console.log("Autoplay was prevented"));
    }
  }

  function showError(message) {
    errorMessage.querySelector("p").textContent = message;
    errorMessage.classList.remove("hidden");
    weatherBody.classList.add("hidden");
    updateBackground();
  }

  getWeatherByGeolocation();
});
