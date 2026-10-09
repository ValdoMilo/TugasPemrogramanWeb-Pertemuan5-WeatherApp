/* =========================================================
   Weather App - OpenWeatherMap
   Fitur:
   - Pencarian kota + data cuaca real-time
   - Forecast 5 hari
   - Riwayat pencarian (LocalStorage)
   - Toggle °C / °F
   - Loading state + error handling
   ========================================================= */

// =========================================================
// KONFIGURASI
// =========================================================
// 🔑 Buat key baru di https://openweathermap.org/api lalu tempelkan di sini.
const API_KEY = "04b18e5f968d3879fa65c98ca241720d";

const BASE_URL = "https://api.openweathermap.org/data/2.5";
const ICON_URL = "https://openweathermap.org/img/wn";

// LocalStorage key
const STORAGE_KEY = "weather_app_history";
const UNIT_KEY = "weather_app_unit";
const MAX_HISTORY = 6;

// =========================================================
// STATE
// =========================================================
let currentUnit = localStorage.getItem(UNIT_KEY) || "metric"; // metric = °C, imperial = °F
let lastCity = "";

// =========================================================
// DOM ELEMENTS
// =========================================================
const elements = {
  form: document.getElementById("search-form"),
  input: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
  loading: document.getElementById("loading"),
  errorBox: document.getElementById("error-box"),
  errorMessage: document.getElementById("error-message"),
  weatherMain: document.getElementById("weather-main"),
  cityName: document.getElementById("city-name"),
  cityCountry: document.getElementById("city-country"),
  temperature: document.getElementById("temperature"),
  tempUnit: document.getElementById("temp-unit"),
  weatherIcon: document.getElementById("weather-icon"),
  weatherDesc: document.getElementById("weather-desc"),
  feelsLike: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
  forecastList: document.getElementById("forecast-list"),
  historySection: document.getElementById("history-section"),
  historyList: document.getElementById("history-list"),
  clearHistory: document.getElementById("clear-history"),
  unitBtns: document.querySelectorAll(".unit-btn"),
};

const requiredElements = [elements.form, elements.input, elements.searchBtn, elements.errorMessage];

if (requiredElements.some((element) => !element)) {
  throw new Error("Struktur HTML Weather App tidak lengkap.");
}

// =========================================================
// HELPER FUNCTIONS
// =========================================================
const showElement = (el) => el && el.removeAttribute("hidden");
const hideElement = (el) => el && el.setAttribute("hidden", "");

const showLoading = () => {
  hideElement(elements.errorBox);
  hideElement(elements.weatherMain);
  showElement(elements.loading);
  elements.searchBtn.classList.add("loading");
  elements.searchBtn.disabled = true;
};

const hideLoading = () => {
  hideElement(elements.loading);
  elements.searchBtn.classList.remove("loading");
  elements.searchBtn.disabled = false;
};

const showError = (message) => {
  hideLoading();
  hideElement(elements.weatherMain);
  elements.errorMessage.textContent = message;
  showElement(elements.errorBox);
};

const setForecastMessage = (message) => {
  elements.forecastList.replaceChildren();
  const paragraph = document.createElement("p");
  paragraph.className = "forecast-empty";
  paragraph.textContent = message;
  elements.forecastList.append(paragraph);
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const getDayName = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("id-ID", { weekday: "long" });
};

const getUnitSymbol = () => (currentUnit === "metric" ? "°C" : "°F");
const getSpeedUnit = () => (currentUnit === "metric" ? "m/s" : "mph");

// =========================================================
// LOCALSTORAGE - HISTORY
// =========================================================
const getHistory = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveHistory = (city) => {
  const history = getHistory();
  const normalized = city.trim();

  // filter untuk buang duplikat (case-insensitive), lalu tambahkan ke depan
  const updated = [
    normalized,
    ...history.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  renderHistory();
};

const removeHistoryItem = (city) => {
  const updated = getHistory().filter((item) => item !== city);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  renderHistory();
};

const clearAllHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
};

const renderHistory = () => {
  const history = getHistory();

  if (history.length === 0) {
    hideElement(elements.historySection);
    return;
  }

  // Gunakan map() untuk membuat chip element
  elements.historyList.replaceChildren();
  history.forEach((city) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-chip";
    button.dataset.city = city;
    button.title = `Cari ${city}`;
    button.textContent = `📍 ${city}`;
    elements.historyList.append(button);
  });

  showElement(elements.historySection);
};

// =========================================================
// FETCH DATA
// =========================================================
const fetchCurrentWeather = async (city) => {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${currentUnit}&lang=id`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Kota "${city}" tidak ditemukan. Coba periksa ejaannya.`);
    } else if (response.status === 401) {
      throw new Error("API Key tidak valid. Silakan periksa konfigurasi Anda.");
    } else if (response.status === 429) {
      throw new Error("Terlalu banyak permintaan. Silakan coba beberapa saat lagi.");
    }
    throw new Error(`Gagal mengambil data (status: ${response.status}).`);
  }

  return response.json();
};

const fetchForecast = async (city) => {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(
    city
  )}&appid=${API_KEY}&units=${currentUnit}&lang=id`;

  const response = await fetch(url);
  if (!response.ok) return null; // forecast opsional, jangan gagalkan seluruh proses

  return response.json();
};

// =========================================================
// RENDER
// =========================================================
const renderCurrentWeather = (data) => {
  const {
    name,
    sys: { country },
    main: { temp, feels_like, humidity, pressure },
    weather,
    wind: { speed = 0 } = {},
    visibility,
  } = data;

  const [weatherInfo] = weather; // destructuring array

  elements.cityName.textContent = name;
  elements.cityCountry.textContent = country;
  elements.temperature.textContent = Math.round(temp);
  elements.tempUnit.textContent = getUnitSymbol();
  elements.weatherIcon.src = `${ICON_URL}/${weatherInfo.icon}@4x.png`;
  elements.weatherIcon.alt = weatherInfo.description;
  elements.weatherDesc.textContent = weatherInfo.description;
  elements.feelsLike.textContent = `Terasa seperti ${Math.round(feels_like)}${getUnitSymbol()}`;
  elements.humidity.textContent = `${humidity}%`;
  elements.wind.textContent = `${speed.toFixed(1)} ${getSpeedUnit()}`;
  elements.pressure.textContent = `${pressure} hPa`;
  elements.visibility.textContent = visibility ? `${(visibility / 1000).toFixed(1)} km` : "-";

  showElement(elements.weatherMain);
};

const renderForecast = (forecastData) => {
  if (!forecastData || !forecastData.list) {
    setForecastMessage("Data prakiraan tidak tersedia.");
    return;
  }

  // Ambil satu data per hari (jam 12:00) menggunakan reduce + filter
  const dailyData = forecastData.list.reduce((acc, item) => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    const hour = new Date(item.dt * 1000).getHours();

    // Pilih data yang mendekati jam 12 siang untuk setiap hari
    if (!acc[date] || Math.abs(hour - 12) < Math.abs(new Date(acc[date].dt * 1000).getHours() - 12)) {
      acc[date] = item;
    }
    return acc;
  }, {});

  // Konversi ke array & ambil 5 hari pertama
  const forecastItems = Object.values(dailyData).slice(0, 5);

  if (forecastItems.length === 0) {
    setForecastMessage("Data prakiraan tidak tersedia.");
    return;
  }

  // Gunakan map() untuk render setiap item
  elements.forecastList.replaceChildren();
  forecastItems.forEach((item) => {
    const [info] = item.weather;
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p class="forecast-day"></p>
      <p class="forecast-date"></p>
      <img class="forecast-icon" loading="lazy" />
      <p class="forecast-temp"></p>
      <p class="forecast-desc"></p>
    `;
    card.querySelector(".forecast-day").textContent = getDayName(item.dt);
    card.querySelector(".forecast-date").textContent = formatDate(item.dt);
    const icon = card.querySelector(".forecast-icon");
    icon.src = `${ICON_URL}/${info.icon}@2x.png`;
    icon.alt = info.description;
    card.querySelector(".forecast-temp").textContent = `${Math.round(item.main.temp)}${getUnitSymbol()}`;
    const description = card.querySelector(".forecast-desc");
    description.textContent = info.description;
    description.title = info.description;
    elements.forecastList.append(card);
  });
};

// =========================================================
// MAIN SEARCH HANDLER
// =========================================================
const searchWeather = async (city) => {
  if (!city || !city.trim()) {
    showError("Silakan masukkan nama kota terlebih dahulu.");
    return;
  }

  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    showError("API Key belum diatur. Isi API_KEY di script.js dengan key OpenWeatherMap yang aktif.");
    return;
  }

  showLoading();
  lastCity = city.trim();

  try {
    // Jalankan paralel untuk performa
    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(lastCity),
      fetchForecast(lastCity),
    ]);

    hideLoading();
    renderCurrentWeather(current);
    renderForecast(forecast);
    saveHistory(lastCity);
  } catch (err) {
    console.error("Error:", err);

    // Deteksi network error
    if (err instanceof TypeError || err.name === "AbortError") {
      showError("Koneksi bermasalah. Periksa koneksi internet Anda dan coba lagi.");
    } else {
      showError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  }
};

// =========================================================
// EVENT LISTENERS
// =========================================================
elements.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = elements.input.value;
  searchWeather(city);
  elements.input.blur();
});

// Klik chip riwayat
elements.historyList.addEventListener("click", (e) => {
  const chip = e.target.closest(".history-chip");
  if (!chip) return;
  const city = chip.dataset.city;
  elements.input.value = city;
  searchWeather(city);
});

// Hapus semua riwayat
elements.clearHistory.addEventListener("click", () => {
  if (confirm("Hapus semua riwayat pencarian?")) {
    clearAllHistory();
  }
});

// Toggle unit suhu
elements.unitBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const unit = btn.dataset.unit;
    if (unit === currentUnit) return;

    currentUnit = unit;
    localStorage.setItem(UNIT_KEY, unit);

    // Update tampilan tombol
    elements.unitBtns.forEach((b) => b.classList.toggle("active", b === btn));

    // Re-fetch jika sudah ada kota terakhir
    if (lastCity) {
      searchWeather(lastCity);
    }
  });
});

// =========================================================
// INIT APP
// =========================================================
const initApp = () => {
  renderHistory();

  // Set tombol unit aktif sesuai state
  elements.unitBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.unit === currentUnit);
  });

  // Isi input dengan kota terakhir (jika ada)
  const history = getHistory();
  if (history.length > 0) {
    elements.input.value = history[0];
    searchWeather(history[0]);
  }

  elements.input.focus();
};

// Inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", initApp);