const modal = document.getElementById("modal");
const modalFlag = document.getElementById("modalFlag");
const modalName = document.getElementById("modalName");
const modalCapital = document.getElementById("modalCapital");
const modalCurrency = document.getElementById("modalCurrency");
const modalBorders = document.getElementById("modalBorders");
const modalLongitude = document.getElementById("modalLongitude");
const modalTemp = document.getElementById("modalTemp");
const modalHumidity = document.getElementById("modalHumidity");
const modalWeather = document.getElementById("modalWeather");

const ACCUWEATHER_API_KEY = import.meta.env.VITE_ACCUWEATHER_API_KEY;

const closeBtn = document.getElementById("closeBtn");
const closeIcon = document.getElementById("closeIcon");

const countriesContainer = document.getElementById("countries");
const paginationContainer = document.getElementById("pagination");
const searchInput = document.getElementById("search");

let allCountries = [];
let filteredCountries = [];
let currentPage = 1;
const countriesPerPage = 16;

async function fetchCountries() {
  try {
    const res = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,flags,capital,currencies,borders,latlng"
    );
    const data = await res.json();

    allCountries = data;
    filteredCountries = data;
    displayCountries(currentPage);
    setupPagination();
  } catch (error) {
    console.error(error);
  }
}

fetchCountries();

function displayCountries(page) {
  countriesContainer.innerHTML = "";

  const start = (page - 1) * countriesPerPage;
  const end = start + countriesPerPage;

  filteredCountries.slice(start, end).forEach(country => {
    const card = document.createElement("div");
    card.className = "card";
    card.onclick = () => openModal(country);

    const img = document.createElement("img");
    img.src = country.flags.png;

    const name = document.createElement("p");
    name.innerText = country.name.common;

    card.appendChild(img);
    card.appendChild(name);
    countriesContainer.appendChild(card);
  });
}

function setupPagination() {
  paginationContainer.innerHTML = "";
  const pageCount = Math.ceil(filteredCountries.length / countriesPerPage);

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;

    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      displayCountries(currentPage);
      setupPagination();
    };

    paginationContainer.appendChild(btn);
  }
}

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();

  filteredCountries = allCountries.filter(country =>
    country.name.common.toLowerCase().includes(searchValue)
  );

  currentPage = 1;
  displayCountries(currentPage);
  setupPagination();
});


function openModal(country) {
  modal.classList.remove("hidden");
  document.body.classList.add("no-scroll");

  modalFlag.src = country.flags.png;
  modalName.innerText = country.name.common;
  modalCapital.innerText = country.capital ? country.capital[0] : "N/A";

  const currency = country.currencies
    ? Object.values(country.currencies)[0].name
    : "N/A";
  modalCurrency.innerText = currency;

  if (!country.borders || country.borders.length === 0) {
    modalBorders.innerText = "None";
  } else if (country.borders.length <= 2) {
    modalBorders.innerText = country.borders.join(", ");
  } else {
    modalBorders.innerText = country.borders.slice(-2).join(", ");
  }

  if (country.latlng && country.latlng.length > 1) {
    modalLongitude.innerText = country.latlng[1];
  } else {
    modalLongitude.innerText = "N/A";
  }

  const capital = country.capital ? country.capital[0] : null;
  if (capital) {
    fetchWeather(capital);
  } else {
    modalTemp.innerText = "N/A";
    modalHumidity.innerText = "N/A";
    modalWeather.innerText = "N/A (No Capital)";
  }
}

async function fetchWeather(city) {
  modalTemp.innerText = "Loading...";
  modalHumidity.innerText = "Loading...";
  modalWeather.innerText = "Loading...";

  if (!ACCUWEATHER_API_KEY || ACCUWEATHER_API_KEY.includes("YOUR_API_KEY")) {
    modalTemp.innerText = "N/A";
    modalHumidity.innerText = "N/A";
    modalWeather.innerText = "API Key Missing";
    return;
  }

  try {

    const locationRes = await fetch(
      `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${encodeURIComponent(city)}`
    );
    const locationData = await locationRes.json();

    if (!locationData || locationData.length === 0) {
      throw new Error("City not found");
    }

    const locationKey = locationData[0].Key;


    const weatherRes = await fetch(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${ACCUWEATHER_API_KEY}&details=true`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData || weatherData.length === 0) {
      throw new Error("Weather data not found");
    }

    const current = weatherData[0];
    modalTemp.innerText = `${current.Temperature.Metric.Value}°${current.Temperature.Metric.Unit}`;
    modalHumidity.innerText = `${current.RelativeHumidity}%`;
    modalWeather.innerText = current.WeatherText;
  } catch (error) {
    console.error("Error fetching weather:", error);
    modalTemp.innerText = "N/A";
    modalHumidity.innerText = "N/A";
    modalWeather.innerText = "Error fetching data";
  }
}



function closeModal() {
  modal.classList.add("hidden");
  document.body.classList.remove("no-scroll");
}

closeBtn.onclick = closeModal;
closeIcon.onclick = closeModal;

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
