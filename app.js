const apiKey = "0dc3bed4df523907f7c0f0b22f7fbcf0";

const cityNameEl = document.getElementById("cityName");
const conditionTextEl = document.getElementById("conditionText");
const tempValueEl = document.getElementById("tempValue");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityValueEl = document.getElementById("humidityValue");
const windValueEl = document.getElementById("windValue");
const pressureValueEl = document.getElementById("pressureValue");
const weatherIconEl = document.getElementById("weatherIcon");
const errorMsgEl = document.getElementById("errorMsg");
const weatherVideoEl = document.getElementById("weatherVideo");

const cityInputEl = document.getElementById("cityInput");
const searchBtnEl = document.getElementById("searchBtn");

const autocompleteList = document.getElementById("autocompleteList");

const cities = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Miami", "Dallas", "Austin", "San Francisco", "Seattle",
    "Orlando", "Tampa", "Atlanta", "Denver", "Boston",
    "Toronto", "Vancouver", "London", "Paris", "Tokyo", "Marianna",
    "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
    "Cape Town", "Johannesburg", "Durban", "Pretoria", "Nairobi",
    "Cairo", "Lagos", "Accra", "Kampala", "Addis Ababa",
    "Buenos Aires", "Sao Paulo", "Rio de Janeiro", "Lima", "Bogota",
    "Caracas", "Santiago", "Montevideo", "Asuncion", "La Paz",
    "Havana", "Kingston", "Port-au-Prince", "San Juan", "Panama City",
    "Mexico City", "Guadalajara", "Monterrey", "Cancun", "Tijuana",
    "Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa",
    "Edmonton", "Winnipeg", "Quebec City", "Halifax", "Victoria",
    "London", "Manchester", "Birmingham", "Glasgow", "Liverpool",
    "Bristol", "Leeds", "Sheffield", "Edinburgh", "Cardiff",
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
    "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt",
    "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig",
    "Rome", "Milan", "Naples", "Turin", "Palermo",
];

cityInputEl.addEventListener("input", () => {
    const input = cityInputEl.value.toLowerCase();
    autocompleteList.innerHTML = "";

    if (input.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    const filtered = cities.filter(city =>
        city.toLowerCase().startsWith(input)
    );

    if (filtered.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    filtered.forEach(city => {
        const item = document.createElement("div");
        item.classList.add("autocomplete-item");
        item.textContent = city;

        item.addEventListener("click", () => {
            cityInputEl.value = city;
            autocompleteList.style.display = "none";
            fetchWeather(city, "US");
        });

        autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
});


async function fetchWeather(city, country) {
    try {
        errorMsgEl.textContent = "";

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}&units=imperial`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("City not found");

        const data = await res.json();
        updateUI(data);

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${apiKey}&units=imperial`;

        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        updateForecast(forecastData);   // <-- correct call

    } catch (err) {
        errorMsgEl.textContent = err.message;
    }
}

function updateForecast(data) {
  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.innerHTML = "";

  const list = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

  list.forEach(day => {
    const temp = Math.round(day.main.temp);
    const condition = day.weather[0].main;

    const div = document.createElement("div");
    div.classList.add("forecast-day");

    div.innerHTML = `
      <span>${new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}</span>
      <strong>${temp}°</strong>
      <span>${condition}</span>
    `;

    forecastContainer.appendChild(div);
  });
}


function updateUI(data) {
  const { name } = data;
  const { temp, feels_like, humidity, pressure, temp_min, temp_max } = data.main;
  const { speed } = data.wind;
  const condition = data.weather[0].main; // Clear, Clouds, Rain, Snow, Mist, etc.
  const description = data.weather[0].description;

  cityNameEl.textContent = name;
  conditionTextEl.textContent = description;
  tempValueEl.textContent = `${Math.round(temp)}°`;
  feelsLikeEl.textContent = `Feels like ${Math.round(feels_like)}°`;
  humidityValueEl.textContent = `${humidity}%`;
  windValueEl.textContent = `${Math.round(speed)} mph`;
  pressureValueEl.textContent = `${pressure} hPa`;
  minTempValue.textContent = `${Math.round(temp_min)}°`;
  maxTempValue.textContent = `${Math.round(temp_max)}°`;

  setAnimatedIcon(condition);
  setVideo(condition);
}


const iconPlayer = document.getElementById("weatherIcon");

function setAnimatedIcon(condition) {
    condition = condition.toLowerCase();
    let iconPath = "assets/icons/";

    if (condition.includes("clear")) {
        iconPath += "sun.json";
    } 
    else if (condition.includes("cloud")) {
        iconPath += "clouds.json";
    } 
    else if (condition.includes("rain")) {
        iconPath += "rain.json";
    } 
    else if (condition.includes("snow")) {
        iconPath += "snow.json";
    } 
    else if (condition.includes("mist") || condition.includes("fog")) {
        iconPath += "mist.json";
    } 
    else {
        iconPath += "clouds.json"; // fallback
    }

    iconPlayer.load(iconPath);
}



function setVideo(condition) {
  let videoPath = "assets/videos/clear.mp4";

  switch (condition) {
    case "Clear":
      videoPath = "assets/videos/clear.mp4";
      break;
    case "Clouds":
      videoPath = "assets/videos/clouds.mp4";
      break;
    case "Rain":
      videoPath = "assets/videos/rain.mp4";
      break;
    case "Snow":
      videoPath = "assets/videos/snow.mp4";
      break;
    case "Mist":
    case "Fog":
      videoPath = "assets/videos/mist.mp4";
      break;
  }

  weatherVideoEl.classList.remove("loaded");
  weatherVideoEl.src = videoPath;

  weatherVideoEl.oncanplay = () => {
    weatherVideoEl.classList.add("loaded");
  };
}



searchBtnEl.addEventListener("click", () => {
  const city = cityInputEl.value.trim();
  if (!city) return;
  fetchWeather(city);
});

cityInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInputEl.value.trim();
    if (!city) return;
    fetchWeather(city);
  }
});

// initial load
fetchWeather("Campbellton");
