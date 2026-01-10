let startTime = 0;

function startPress() {
  startTime = Date.now();
}

function endPress() {
  if (!startTime) return;
  const duration = (Date.now() - startTime) / 1000;
  startTime = 0;
  startLoading(duration);
}

scanButton.addEventListener("mousedown", startPress);
scanButton.addEventListener("mouseup", endPress);

scanButton.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startPress();
});

scanButton.addEventListener("touchend", endPress);
scanButton.addEventListener("touchcancel", () => startTime = 0);

let mode = null;

const scanButton = document.getElementById("scanButton");

function startAnalysis(type) {
  mode = type;
  document.getElementById("home").classList.add("hidden");
  document.getElementById("analysis").classList.remove("hidden");
  document.getElementById("analysisTitle").innerText =
    type === "fuel" ? "Analiza jakości paliwa" : "Analiza toksyn";
}

scanButton.addEventListener("mousedown", () => {
  startTime = Date.now();
});

scanButton.addEventListener("mouseup", () => {
  const duration = (Date.now() - startTime) / 1000;
  startLoading(duration);
});

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

function showResults(time) {
  document.getElementById("loading").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");

  let quality;
  if (time < 1) quality = "good";
  else if (time <= 3) quality = "medium";
  else quality = "bad";

  if (quality === "bad") {
    document.body.classList.add("alarm");
  }

  const data = buildData(quality);
  renderTable(data);
  renderChart(data, quality);
  const alert = document.getElementById("qualityAlert");

if (quality === "good") alert.innerText = "🟢 JAKOŚĆ WYSOKA – próbka zgodna z normami.";
if (quality === "medium") alert.innerText = "🟡 JAKOŚĆ ŚREDNIA – zalecana filtracja.";
if (quality === "bad") alert.innerText = "🔴 ALERT – WYSOKI POZIOM ZANIECZYSZCZEŃ.";

}


function buildData(quality) {
  const base = quality === "good" ? 20 : quality === "medium" ? 55 : 85;
  return [
    { name: "Zanieczyszczenia", value: base + rand() },
    { name: "Stabilność", value: 100 - base + rand() },
    { name: "Toksyczność", value: base + rand() }
  ];
}

function rand() {
  return Math.floor(Math.random() * 10 - 5);
}

function renderTable(data) {
  const table = document.getElementById("resultsTable");
  table.innerHTML = "";
  data.forEach(d => {
    table.innerHTML += `<tr><td>${d.name}</td><td>${d.value}</td></tr>`;
  });
}

function renderChart(data, quality) {
  const colors =
    quality === "good" ? ["#00ff66"] :
    quality === "medium" ? ["#ffaa00"] :
    ["#ff0033"];

  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: colors
      }]
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 100,
          title: {
            display: true,
            text: "Skala: 0–100 (ppm / indeks czystości)"
          }
        }
      }
    }
  });
}

