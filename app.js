const STORAGE_KEY = "athleteos:v1";

const weeklyPlan = [
  {
    day: "Monday",
    type: "Strength",
    title: "Upper body strength and abs",
    details: ["Push-ups or bench press 4 sets", "Pull-ups or lat pulldown 4 sets", "Rows, dips, curls, triceps", "Leg raises, plank, twists, hollow hold"],
  },
  {
    day: "Tuesday",
    type: "Run",
    title: "Easy run and mobility",
    distance: 8,
    pace: "5:15-5:50/km",
    details: ["Controlled 8 km easy run", "15 min hips, hamstrings, glutes, squat hold", "5 min slow nasal breathing"],
  },
  {
    day: "Wednesday",
    type: "Strength",
    title: "Lower body strength and core",
    details: ["Squats, Romanian deadlifts, lunges", "Calf raises, hip thrusts, split squats", "Plank, side plank, dead bug, bird dog"],
  },
  {
    day: "Thursday",
    type: "Run",
    title: "Tempo run",
    distance: 8,
    pace: "4:25-4:40/km tempo",
    details: ["2 km easy warm-up", "4 km tempo", "2 km easy cool-down", "10 min mobility"],
  },
  {
    day: "Friday",
    type: "Strength",
    title: "Full-body strength and abs",
    details: ["Deadlift or trap-bar deadlift", "Incline press, pull-ups or rows", "Push-ups, lateral raises, farmer's carry", "Core circuit"],
  },
  {
    day: "Saturday",
    type: "Run",
    title: "Long run",
    distance: 14,
    pace: "5:20-6:00/km",
    details: ["Steady long run", "10 min walk", "10 min stretch", "Eat within 1-2 hours"],
  },
  {
    day: "Sunday",
    type: "Recovery",
    title: "Recovery, flexibility and light core",
    details: ["25-30 min full mobility", "Optional plank, dead bug, glute bridge", "No heavy lifting or hard running"],
  },
];

const defaultState = {
  targetKm: 30,
  activeTab: "home",
  logMode: "daily",
  daily: [],
  workouts: [],
  body: [],
};

let state = loadState();
let deferredInstallPrompt = null;

const screen = document.querySelector("#screen");
const installButton = document.querySelector("#installButton");

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function weekStart(dateInput = new Date()) {
  const date = new Date(dateInput);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function inCurrentWeek(item) {
  return item.date >= weekStart() && item.date <= todayISO();
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function average(items, key) {
  const values = items.map((item) => Number(item[key])).filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function todaysPlan() {
  const day = new Date().getDay();
  const index = day === 0 ? 6 : day - 1;
  return weeklyPlan[index];
}

function currentWeekWorkouts() {
  return state.workouts.filter(inCurrentWeek);
}

function currentWeekRuns() {
  return currentWeekWorkouts().filter((workout) => workout.category === "Run");
}

function latestDaily() {
  return [...state.daily].sort((a, b) => b.date.localeCompare(a.date))[0];
}

function latestBody() {
  return [...state.body].sort((a, b) => b.date.localeCompare(a.date))[0];
}

function readiness() {
  const check = state.daily.find((item) => item.date === todayISO()) || latestDaily();
  const weekFatigue = average(currentWeekWorkouts(), "fatigue");
  const sleep = Number(check?.sleep) || 0;
  const soreness = Number(check?.soreness) || 0;
  let score = 72;

  if (sleep) score += Math.min(14, (sleep - 6) * 7);
  if (soreness) score -= Math.max(0, soreness - 4) * 7;
  if (weekFatigue) score -= Math.max(0, weekFatigue - 6) * 5;

  score = Math.max(32, Math.min(96, Math.round(score)));

  if (score >= 82) return { score, tone: "green", title: "Peak: push the plan", detail: "Recovery is strong. Hit the planned session cleanly and log fatigue after." };
  if (score >= 64) return { score, tone: "amber", title: "Moderate: stay controlled", detail: "Complete the work, but keep intensity honest and stop short of reckless reps." };
  return { score, tone: "red", title: "Low: scale today down", detail: "Swap hard work for mobility, easy movement, and sleep. Protect the next session." };
}

function adaptiveAdvice() {
  const weekRuns = currentWeekRuns();
  const weekWorkouts = currentWeekWorkouts();
  const km = sum(weekRuns, "distance");
  const avgFatigue = average(weekWorkouts, "fatigue");
  const completion = Math.round((weekWorkouts.length / 6) * 100);
  const nextTarget = km >= state.targetKm && avgFatigue > 0 && avgFatigue <= 6 ? state.targetKm + 2 : avgFatigue >= 8 ? Math.max(24, state.targetKm - 2) : state.targetKm;

  if (avgFatigue >= 8) {
    return {
      nextTarget,
      title: "Deload signal",
      message: `Average fatigue is ${avgFatigue.toFixed(1)}/10. Keep next week near ${nextTarget} km and turn the next hard run into easy aerobic work.`,
    };
  }

  if (km >= state.targetKm && avgFatigue > 0 && avgFatigue <= 6) {
    return {
      nextTarget,
      title: "Progression unlocked",
      message: `You handled ${km.toFixed(1)} km with controlled fatigue. Next week's run target moves to ${nextTarget} km.`,
    };
  }

  if (completion < 50 && weekWorkouts.length > 0) {
    return {
      nextTarget,
      title: "Consistency first",
      message: "Hold the target steady until you complete more sessions. The app will increase volume after the base week is stable.",
    };
  }

  return {
    nextTarget,
    title: "Maintain the base",
    message: `Build toward ${state.targetKm} km, keep strength clean, and log fatigue so the app can adapt next week.`,
  };
}

function staminaScore() {
  const runs = currentWeekRuns();
  const km = sum(runs, "distance");
  const longRun = Math.max(0, ...runs.map((run) => Number(run.distance) || 0));
  const fatigue = average(currentWeekWorkouts(), "fatigue");
  let score = Math.round((km / state.targetKm) * 62 + Math.min(longRun / 14, 1) * 24 + 14);
  if (fatigue >= 8) score -= 12;
  return Math.max(20, Math.min(100, score));
}

function mobilityScore() {
  const daily = state.daily.filter(inCurrentWeek);
  const lowSorenessDays = daily.filter((item) => Number(item.soreness) <= 5).length;
  const mobilityLogs = currentWeekWorkouts().filter((item) => item.category === "Mobility" || item.category === "Recovery").length;
  return Math.min(100, 45 + lowSorenessDays * 8 + mobilityLogs * 14);
}

function setActiveTab(tab) {
  state.activeTab = tab;
  saveState();
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tab);
  });
  render();
  window.scrollTo(0, 0);
}

function metric(label, value, suffix = "", dark = false) {
  return `<div class="metric ${dark ? "dark" : ""}"><span>${label}</span><strong>${value}${suffix}</strong></div>`;
}

function statusClass(tone) {
  if (tone === "red") return "status red";
  if (tone === "amber") return "status amber";
  return "status";
}

function renderHome() {
  const ready = readiness();
  const plan = todaysPlan();
  const runs = currentWeekRuns();
  const km = sum(runs, "distance");
  const progress = Math.min(100, Math.round((km / state.targetKm) * 100));
  const advice = adaptiveAdvice();
  const body = latestBody();

  screen.innerHTML = `
    <section class="panel hero-panel">
      <div class="readiness-line">
        <div>
          <p class="label">Today</p>
          <h2 class="hero-title">${ready.title}</h2>
          <p class="muted">${ready.detail}</p>
        </div>
        <div class="score-ring"><strong>${ready.score}</strong></div>
      </div>
      <div>
        <div class="readiness-line">
          <span class="muted">Weekly run volume</span>
          <strong>${km.toFixed(1)} / ${state.targetKm} km</strong>
        </div>
        <div class="progress-track" aria-label="Weekly run progress"><div class="progress-fill" style="width:${progress}%"></div></div>
      </div>
      <div class="grid-3">
        ${metric("Stamina", staminaScore(), "", true)}
        ${metric("Mobility", mobilityScore(), "", true)}
        ${metric("Body", body ? `${body.weight || "-"}kg` : "-", "", true)}
      </div>
    </section>

    <section class="panel panel-pad">
      <div class="readiness-line">
        <div>
          <p class="label">${plan.day}</p>
          <h2>${plan.title}</h2>
        </div>
        <span class="${statusClass(plan.type === "Recovery" ? "amber" : "green")}">${plan.type}</span>
      </div>
      <div class="workout-list">
        ${plan.details.map((item) => `<div class="row"><span>${item}</span></div>`).join("")}
      </div>
      <button class="primary-button" type="button" data-action="quick-log" style="margin-top:12px">Log this session</button>
    </section>

    <section class="panel panel-pad">
      <p class="label">Adaptive coach</p>
      <h2>${advice.title}</h2>
      <p class="muted">${advice.message}</p>
    </section>
  `;
}

function renderLog() {
  const mode = state.logMode;
  screen.innerHTML = `
    <section class="panel panel-pad">
      <h2>Log progress</h2>
      <div class="tabs">
        <button class="tab-choice ${mode === "daily" ? "is-active" : ""}" type="button" data-log-mode="daily">Daily check-in</button>
        <button class="tab-choice ${mode === "workout" ? "is-active" : ""}" type="button" data-log-mode="workout">Workout</button>
      </div>
    </section>
    ${mode === "daily" ? dailyForm() : workoutForm()}
    <section class="panel panel-pad">
      <h2>Recent logs</h2>
      ${recentLogs()}
    </section>
  `;
}

function dailyForm() {
  return `
    <form class="panel panel-pad form" data-form="daily">
      <div class="grid-2">
        ${field("Date", "date", "date", todayISO())}
        ${field("Sleep", "sleep", "number", "", "Hours", "0.1")}
      </div>
      <div class="grid-2">
        ${field("Soreness", "soreness", "number", "", "1-10", "1")}
        ${field("Morning HR", "hr", "number", "", "BPM", "1")}
      </div>
      <div class="grid-2">
        ${field("Weight", "weight", "number", "", "kg", "0.1")}
        ${field("Waist", "waist", "number", "", "cm", "0.1")}
      </div>
      <button class="primary-button" type="submit">Save check-in</button>
    </form>
  `;
}

function workoutForm() {
  return `
    <form class="panel panel-pad form" data-form="workout">
      <div class="grid-2">
        ${field("Date", "date", "date", todayISO())}
        <div class="field">
          <label for="category">Category</label>
          <select id="category" name="category">
            <option>Run</option>
            <option>Strength</option>
            <option>Mobility</option>
            <option>Core</option>
            <option>Recovery</option>
          </select>
        </div>
      </div>
      ${field("Routine", "routine", "text", todaysPlan().title)}
      <div class="grid-2">
        ${field("Distance", "distance", "number", "", "km", "0.1")}
        ${field("Time", "time", "number", "", "minutes", "0.1")}
      </div>
      <div class="grid-2">
        ${field("Push-up max", "pushups", "number", "", "reps", "1")}
        ${field("Fatigue", "fatigue", "number", "", "1-10", "1")}
      </div>
      <div class="field">
        <label for="notes">Notes</label>
        <textarea id="notes" name="notes" placeholder="Sets, reps, pace, soreness, what felt strong"></textarea>
      </div>
      <button class="primary-button" type="submit">Save workout</button>
    </form>
  `;
}

function field(labelText, name, type, value = "", placeholder = "", step = "") {
  const id = `${name}-${Math.random().toString(16).slice(2)}`;
  return `
    <div class="field">
      <label for="${id}">${labelText}</label>
      <input id="${id}" name="${name}" type="${type}" value="${value}" placeholder="${placeholder}" ${step ? `step="${step}"` : ""} />
    </div>
  `;
}

function recentLogs() {
  const logs = [
    ...state.workouts.map((item) => ({ ...item, kind: "Workout" })),
    ...state.daily.map((item) => ({ ...item, kind: "Check-in" })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (!logs.length) return document.querySelector("#emptyStateTemplate").innerHTML;
  return `<div class="log-list">${logs
    .map((log) => {
      const title = log.kind === "Workout" ? `${log.category}: ${log.routine}` : `Sleep ${log.sleep || "-"}h, soreness ${log.soreness || "-"}/10`;
      return `<div class="row"><div><strong>${title}</strong><span class="muted">${log.date}</span></div><span class="status">${log.kind}</span></div>`;
    })
    .join("")}</div>`;
}

function renderRun() {
  const runs = currentWeekRuns();
  const km = sum(runs, "distance");
  const avgFatigue = average(runs, "fatigue");
  const progress = Math.min(100, Math.round((km / state.targetKm) * 100));

  screen.innerHTML = `
    <section class="panel panel-pad">
      <h2>Running block</h2>
      <div class="grid-3">
        ${metric("KM this week", km.toFixed(1))}
        ${metric("Target", state.targetKm, " km")}
        ${metric("Fatigue", avgFatigue ? avgFatigue.toFixed(1) : "-")}
      </div>
      <div class="progress-track" style="margin-top:12px"><div class="progress-fill" style="width:${progress}%"></div></div>
    </section>
    <section class="panel panel-pad">
      <h2>Planned runs</h2>
      <div class="workout-list">
        ${weeklyPlan
          .filter((item) => item.type === "Run")
          .map((item) => `<div class="row"><div><strong>${item.day}: ${item.title}</strong><span class="muted">${item.distance} km at ${item.pace}</span></div><span class="status">${item.distance} km</span></div>`)
          .join("")}
      </div>
    </section>
    <section class="panel panel-pad">
      <h2>Run history</h2>
      ${runs.length ? `<div class="log-list">${runs.map((run) => `<div class="row"><div><strong>${run.distance || 0} km in ${run.time || "-"} min</strong><span class="muted">${run.date} · ${run.routine}</span></div><span class="status">${pace(run)}</span></div>`).join("")}</div>` : document.querySelector("#emptyStateTemplate").innerHTML}
    </section>
  `;
}

function pace(run) {
  const distance = Number(run.distance);
  const time = Number(run.time);
  if (!distance || !time) return "-";
  const raw = time / distance;
  const minutes = Math.floor(raw);
  const seconds = Math.round((raw - minutes) * 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}/km`;
}

function renderBody() {
  const latest = latestBody();
  screen.innerHTML = `
    <section class="panel panel-pad">
      <h2>Body and abs tracker</h2>
      <div class="grid-3">
        ${metric("Weight", latest?.weight || "-", latest?.weight ? "kg" : "")}
        ${metric("Waist", latest?.waist || "-", latest?.waist ? "cm" : "")}
        ${metric("Push-ups", bestPushups() || "-")}
      </div>
    </section>
    <form class="panel panel-pad form" data-form="body">
      <div class="grid-2">
        ${field("Date", "date", "date", todayISO())}
        ${field("Weight", "weight", "number", "", "kg", "0.1")}
      </div>
      <div class="grid-2">
        ${field("Waist", "waist", "number", "", "cm", "0.1")}
        ${field("Abs rating", "abs", "number", "", "1-10", "1")}
      </div>
      <div class="field">
        <label for="photo">Progress photo</label>
        <input id="photo" name="photo" type="file" accept="image/*" />
      </div>
      <button class="primary-button" type="submit">Save body log</button>
    </form>
    <section class="panel panel-pad">
      <h2>Latest photo</h2>
      ${latest?.photo ? `<img class="photo-preview" src="${latest.photo}" alt="Latest progress photo" />` : document.querySelector("#emptyStateTemplate").innerHTML}
    </section>
  `;
}

function bestPushups() {
  return Math.max(0, ...state.workouts.map((item) => Number(item.pushups) || 0));
}

function renderProgress() {
  const advice = adaptiveAdvice();
  screen.innerHTML = `
    <section class="panel panel-pad">
      <h2>Progress trends</h2>
      <div class="grid-2">
        ${metric("Next target", advice.nextTarget, " km")}
        ${metric("Best push-ups", bestPushups() || "-")}
      </div>
    </section>
    <section class="panel panel-pad">
      <h2>Weekly kilometres</h2>
      <div class="chart">${lineChart(weeklyDistanceSeries(), "km")}</div>
    </section>
    <section class="panel panel-pad">
      <h2>Body trend</h2>
      <div class="chart">${lineChart(state.body.slice(-8).map((item) => ({ label: item.date.slice(5), value: Number(item.weight) || 0 })), "kg")}</div>
    </section>
    <section class="panel panel-pad">
      <h2>Data controls</h2>
      <div class="grid-2">
        <button class="secondary-button" type="button" data-action="export">Export data</button>
        <button class="secondary-button" type="button" data-action="apply-target">Use next target</button>
      </div>
    </section>
  `;
}

function weeklyDistanceSeries() {
  const buckets = new Map();
  state.workouts
    .filter((item) => item.category === "Run")
    .forEach((item) => {
      const key = weekStart(item.date);
      buckets.set(key, (buckets.get(key) || 0) + (Number(item.distance) || 0));
    });
  return [...buckets.entries()].slice(-8).map(([label, value]) => ({ label: label.slice(5), value }));
}

function lineChart(points, unit) {
  const clean = points.filter((point) => point.value > 0);
  if (!clean.length) return document.querySelector("#emptyStateTemplate").innerHTML;
  const width = 320;
  const height = 150;
  const padding = 24;
  const max = Math.max(...clean.map((point) => point.value), 1);
  const coords = clean.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, clean.length - 1);
    const y = height - padding - (point.value / max) * (height - padding * 2);
    return { ...point, x, y };
  });
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Trend chart in ${unit}">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#dfe5e8" />
      <polyline points="${line}" fill="none" stroke="#24d36b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      ${coords.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#0f1720" /><text x="${point.x}" y="${height - 6}" text-anchor="middle">${point.label}</text><text x="${point.x}" y="${point.y - 10}" text-anchor="middle">${point.value.toFixed(1)}${unit}</text>`).join("")}
    </svg>
  `;
}

function render() {
  if (state.activeTab === "home") renderHome();
  if (state.activeTab === "log") renderLog();
  if (state.activeTab === "run") renderRun();
  if (state.activeTab === "body") renderBody();
  if (state.activeTab === "progress") renderProgress();
}

function toObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function compressImage(file) {
  if (!file) return "";
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.classList.add("is-hiding"), 1800);
  setTimeout(() => node.remove(), 2100);
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-tab]");
  if (nav) setActiveTab(nav.dataset.tab);

  const logMode = event.target.closest("[data-log-mode]");
  if (logMode) {
    state.logMode = logMode.dataset.logMode;
    saveState();
    render();
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "quick-log") {
    state.activeTab = "log";
    state.logMode = "workout";
    saveState();
    document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === "log"));
    render();
    window.scrollTo(0, 0);
  }
  if (action === "export") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `athleteos-data-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
  if (action === "apply-target") {
    state.targetKm = adaptiveAdvice().nextTarget;
    saveState();
    toast(`Weekly target set to ${state.targetKm} km`);
    render();
  }
});

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();

  const data = toObject(form);
  if (form.dataset.form === "daily") {
    state.daily = state.daily.filter((item) => item.date !== data.date);
    state.daily.push(data);
    if (data.weight || data.waist) state.body.push({ date: data.date, weight: data.weight, waist: data.waist, abs: "", photo: latestBody()?.photo || "" });
    toast("Check-in saved");
  }

  if (form.dataset.form === "workout") {
    state.workouts.push(data);
    toast("Workout saved");
  }

  if (form.dataset.form === "body") {
    const photo = await compressImage(form.querySelector('input[type="file"]').files[0]);
    state.body.push({ ...data, photo: photo || latestBody()?.photo || "" });
    toast("Body log saved");
  }

  saveState();
  render();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.classList.remove("install-hidden");
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.classList.add("install-hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.classList.toggle("is-active", button.dataset.tab === state.activeTab);
});

render();
