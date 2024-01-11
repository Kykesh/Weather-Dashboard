// Variables
const apiKey = '1e4044bc01d8ad746f6c9f3f51a2e165';
const searchButton = document.getElementById('search-button');
const cityInput = document.getElementById('city-input');
const searchHistoryContainer = document.getElementById('search-history');
const currentWeatherContainer = document.getElementById('current-weather');
const forecastContainer = document.getElementById('forecast-container');
const bodyElement = document.body;

// Weather condition backgrounds
const weatherBackgrounds = {
  '200': 'thunderstorm.jpg', 
  '300': 'drizzle.jpg',      
  '500': 'rain.jpg',         
  '600': 'snow.jpg',         
  '700': 'mist.jpg',        
  '800': 'clear.jpg',        
  '801': 'few-clouds.jpg',   
  '802': 'clouds.jpg',      
  '803': 'broken-clouds.jpg',
  '804': 'overcast-clouds.jpg' 
};

// Event listener for the search button
searchButton.addEventListener('click', () => {
  const cityName = cityInput.value;
  getCoordinatesForCity(cityName);
  cityInput.value = '';
});

document.getElementById('city-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    searchButton.click(); 
  }
});

document.getElementById('clear-history-button').addEventListener('click', function() {
  searchHistoryContainer.innerHTML = ''; // Clears the search history
});

// Fetch weather data using coordinates
function getWeatherForCoordinates(lat, lon, cityName) {
  const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;
  
  fetch(forecastApiUrl)
    .then(response => response.json())
    .then(weatherData => {
      displayWeatherData(weatherData, cityName);
      addToSearchHistory(cityName);
      updateBackground(weatherData.list[0].weather[0].id.toString());
      updateCurrentWeatherBackground(cityName);
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      displayError('An error occurred while fetching weather data.'); // Custom message
    });
}

// Get coordinates for the input city name
function getCoordinatesForCity(cityName) {
  const geocodingApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  
  fetch(geocodingApiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const { lat, lon } = data[0];
        getWeatherForCoordinates(lat, lon, cityName);
      } else {
        displayError('City not found. Please try again.'); // Custom message
      }
    })
    .catch(error => {
      console.error('Error fetching coordinates:', error);
      displayError('An error occurred while fetching location data.'); // Custom message
    });
}

// Display weather data in the HTML
function displayWeatherData(weatherData, cityName) {
  const currentWeather = weatherData.list[0];
  const iconCode = currentWeather.weather[0].icon;
  const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`; // Get the icon URL

  currentWeatherContainer.innerHTML = `
    <h2>${cityName} (${new Date(currentWeather.dt_txt).toLocaleDateString()}) <img src="${iconUrl}" alt="Weather icon"></h2>
    <p>Temp: ${currentWeather.main.temp}°F</p>
    <p>Wind: ${currentWeather.wind.speed} MPH</p>
    <p>Humidity: ${currentWeather.main.humidity}%</p>
  `;

  // Update the 5-day forecast including icons
  forecastContainer.innerHTML = '';
  for (let i = 0; i < weatherData.list.length; i += 8) {
    const forecastData = weatherData.list[i];
    const forecastIconCode = forecastData.weather[0].icon;
    const forecastIconUrl = `http://openweathermap.org/img/wn/${forecastIconCode}.png`;

    const forecastElement = document.createElement('div');
    forecastElement.innerHTML = `
      <h4>${new Date(forecastData.dt_txt).toLocaleDateString()}</h4>
      <img src="${forecastIconUrl}" alt="Weather icon">
      <p>Temp: ${forecastData.main.temp}°F</p>
      <p>Wind: ${forecastData.wind.speed} MPH</p>
      <p>Humidity: ${forecastData.main.humidity}%</p>
    `;
    forecastContainer.appendChild(forecastElement);
  }
}


// Add city to search history
function addToSearchHistory(cityName) {
  if (!document.querySelector(`#search-history button[data-city='${cityName}']`)) {
    const historyButton = document.createElement('button');
    historyButton.textContent = cityName;
    historyButton.setAttribute('data-city', cityName);
    historyButton.addEventListener('click', () => {
        getCoordinatesForCity(cityName);
    });
    searchHistoryContainer.appendChild(historyButton);
  }
}

// Update the website background based on the current weather condition code
function updateBackground(weatherId) {
  const weatherBackgroundImage = weatherBackgrounds[weatherId] || 'default.jpg';
  bodyElement.style.backgroundImage = `url('images/${weatherBackgroundImage}')`;
  bodyElement.style.backgroundSize = 'cover';
}

// Display error messages in the error-message div
function displayError(message) {
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = 'block'; // Show the error message
  
  // Hide the error message after 5 seconds
  setTimeout(() => {
    errorMessageDiv.style.display = 'none'; // Hide the error message
  }, 5000);
}

function updateCurrentWeatherBackground(cityName) {
  const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(cityName)}&per_page=1`;
  const headers = {
    Authorization: 'xsyGRZLyfAL71YxBteh8XuYqu9IALgEZMRAWUE306oGALOyW1dWwvqiD'
  };

  fetch(pexelsApiUrl, { headers })
    .then(response => response.json())
    .then(data => {
      if (data.photos.length > 0) {
        const imageUrl = data.photos[0].src.large;
        const currentWeatherSection = document.getElementById('current-weather');
        currentWeatherSection.style.backgroundImage = `url(${imageUrl})`;
        currentWeatherSection.style.backgroundSize = 'cover';
        currentWeatherSection.style.backgroundPosition = 'center';
      }
    })
    .catch(error => {
      console.error('Error fetching city image from Pexels:', error);
      displayError('An error occurred while fetching city images.'); // Custom message
    });
}

// Initial call to display default city weather
getCoordinatesForCity('Chicago');
