let startTime = null;
let mode = null;
let chartInstance = null;

const scanButton = document.getElementById("scanButton");

/* ===== NAV ===== */
function startAnalysis(type) {
  mode = type;
  document.getElementById("home").classList.add("hidden");
  document.getElementById("analysis").classList.remove("hidden");
  document.getElementById("analysisTitle").innerText =
    type === "fuel" ? "Analiza jakości paliwa" : "Analiza toksyn";
}

/* ===== PRESS HANDLING (MOBILE SAFE) ===== */
function pressStart(e) {
  e.preventDefault();
  startTime = Date.now();
}

function pressEnd() {
  if (!startTime) return;
  const duration = (Date.now() - startTime) / 1000;
  startTime = null;
  startLoading(duration);
}

scanButton.addEventListener("pointerdown", pressStart);
scanButton.addEventListener("pointerup", pressEnd);
scanButton.addEventListener("pointercancel", () => startTime = null);
scanButton.addEventListener("pointerleave", () => startTime = null);

/* ===== LOADING ===== */
function startLoading(time) {
  document.getElementById("analysis").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");

  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("loadingText");

  let progress = 0;
  const messages = [
    "Kalibracja sensorów...",
    "Analiza spektrum...",
    "Dekodowanie próbek...",
    "Symulacja reakcji...",
    "Finalizacja raportu..."
  ];

  const interval = setInterval(() => {
    progress += Math.random() * 12;
    bar.style.width = Math.min(progress, 100) + "%";
    text.innerText = messages[Math.floor(Math.random() * messages.length)];

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => showResults(time), 600);
    }
  }, 300);
}

/* ===== RESULTS ===== */
function showResults(time) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");

  let quality;
  if (time < 1) quality = "good";
  else if (time <= 3) quality = "medium";
  else quality = "bad";

  const alert = document.getElementById("qualityAlert");

  if (quality === "good") {
    alert.innerText = "🟢 JAKOŚĆ WYSOKA — zgodność z normami.";
  } else if (quality === "medium") {
    alert.innerText = "🟡 JAKOŚĆ ŚREDNIA — zalecana filtracja.";
  } else {
    alert.innerText = "🔴 ALERT — KRYTYCZNE ZANIECZYSZCZENIE.";
    document.body.classList.add("alarm");
  }

  const data = buildData(quality);
  renderTable(data);
  renderChart(data, quality);
}

function buildData(quality) {
  const base =
    quality === "good" ? 20 :
    quality === "medium" ? 55 :
    85;

  return [
    { name: "Zanieczyszczenia", value: base + rand() },
    { name: "Stabilność", value: 100 - base + rand() },
    { name: "Toksyczność", value: base + rand() }
  ];
}

function rand() {
  return Math.floor(Math.random() * 10 - 5);
}

/* ===== TABLE ===== */
function renderTable(data) {
  const table = document.getElementById("resultsTable");
  table.innerHTML = "";
  data.forEach(d => {
    table.innerHTML += `<tr><td>${d.name}</td><td>${d.value}</td></tr>`;
  });
}

/* ===== CHART ===== */
function renderChart(data, quality) {
  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const color =
    quality === "good" ? "#00ff66" :
    quality === "medium" ? "#ffaa00" :
    "#ff0033";

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        label: "Indeks (0–100)",
        data: data.map(d => d.value),
        backgroundColor: data.map(() => color)
      }]
    },
    options: {
      animation: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Skala pomiarowa (0–100)"
          }
        }
      }
    }
  });
}
