const STORAGE_KEY = "athleteos:v1";

const DEFAULT_PLAN = [
  {
    day: "Monday",
    type: "Strength",
    title: "Upper body strength and abs",
    exercises: [
      { name: "Warm-up: arm circles, jumping jacks, shoulder rotations", target: "8 min" },
      { name: "Bench press or push-ups", target: "4 sets of 8-12 (20-30 if push-ups)" },
      { name: "Pull-ups or lat pulldowns", target: "4 sets of 8-12" },
      { name: "Overhead press", target: "4 sets of 8-12" },
      { name: "Dumbbell rows", target: "4 sets of 10-12 each side" },
      { name: "Dips", target: "3 sets of 8-12" },
      { name: "Bicep curls", target: "3 sets of 10-12" },
      { name: "Triceps pushdowns or diamond push-ups", target: "3 sets of 10-15" },
      { name: "Hanging or lying leg raises", target: "3 sets of 12" },
      { name: "Plank", target: "3 sets of 60 sec" },
      { name: "Russian twists", target: "3 sets of 20" },
      { name: "Hollow body hold", target: "3 sets of 30 sec" },
      { name: "Chest, shoulder and back stretch", target: "8 min" },
    ],
  },
  {
    day: "Tuesday",
    type: "Run",
    title: "Easy run and mobility",
    distance: 8,
    pace: "5:15-5:50/km",
    exercises: [
      { name: "Easy run", target: "8 km at 5:15-5:50/km, controlled" },
      { name: "Hip flexor stretch", target: "" },
      { name: "Hamstring stretch", target: "" },
      { name: "Glute stretch", target: "" },
      { name: "Deep squat hold", target: "" },
      { name: "Cobra stretch", target: "" },
      { name: "Child's pose", target: "" },
      { name: "Slow nasal breathing", target: "5 min" },
    ],
  },
  {
    day: "Wednesday",
    type: "Strength",
    title: "Lower body strength and core",
    exercises: [
      { name: "Warm-up: bodyweight squats, lunges, leg swings, glute bridges", target: "10 min" },
      { name: "Squats", target: "4 sets of 8-12" },
      { name: "Romanian deadlifts", target: "4 sets of 8-12" },
      { name: "Walking lunges", target: "3 sets of 12 each leg" },
      { name: "Calf raises", target: "4 sets of 15-20" },
      { name: "Hip thrusts or glute bridges", target: "4 sets of 12" },
      { name: "Bulgarian split squats", target: "3 sets of 10 each leg" },
      { name: "Plank", target: "3 sets of 60 sec" },
      { name: "Side plank", target: "3 sets of 45 sec each side" },
      { name: "Dead bug", target: "3 sets of 12 each side" },
      { name: "Bird dog", target: "3 sets of 12 each side" },
    ],
  },
  {
    day: "Thursday",
    type: "Run",
    title: "Tempo run",
    distance: 8,
    pace: "4:25-4:40/km tempo",
    exercises: [
      { name: "Easy warm-up", target: "2 km" },
      { name: "Tempo", target: "4 km at 4:25-4:40/km" },
      { name: "Easy cool-down", target: "2 km" },
      { name: "Mobility: hips, quads, calves, lower back", target: "10 min" },
    ],
  },
  {
    day: "Friday",
    type: "Strength",
    title: "Full-body strength and abs",
    exercises: [
      { name: "Warm-up", target: "8 min" },
      { name: "Deadlifts or trap-bar deadlifts", target: "4 sets of 6-8" },
      { name: "Incline dumbbell press", target: "4 sets of 8-12" },
      { name: "Pull-ups or rows", target: "4 sets of 8-12" },
      { name: "Push-ups (near failure)", target: "3 sets of 20-25" },
      { name: "Shoulder lateral raises", target: "3 sets of 15" },
      { name: "Farmer's carry", target: "4 rounds of 30-40 m" },
      { name: "Burpees", target: "3 sets of 10-15" },
      { name: "Cable crunch or weighted sit-ups", target: "3 sets of 12-15" },
      { name: "Leg raises", target: "3 sets of 12" },
      { name: "Mountain climbers", target: "3 sets of 40 sec" },
      { name: "Plank to push-up", target: "3 sets of 10" },
    ],
  },
  {
    day: "Saturday",
    type: "Run",
    title: "Long run",
    distance: 14,
    pace: "5:20-6:00/km",
    exercises: [
      { name: "Long run", target: "14 km at 5:20-6:00/km, steady" },
      { name: "Walk cooldown", target: "10 min" },
      { name: "Stretch", target: "10 min" },
      { name: "Refuel", target: "eat within 1-2 hours" },
    ],
  },
  {
    day: "Sunday",
    type: "Recovery",
    title: "Recovery, flexibility and light core",
    exercises: [
      { name: "Hip flexor stretch", target: "" },
      { name: "Couch stretch", target: "" },
      { name: "Hamstring stretch", target: "" },
      { name: "Pigeon pose", target: "" },
      { name: "Deep squat hold", target: "" },
      { name: "Thoracic rotations", target: "" },
      { name: "Cobra stretch", target: "" },
      { name: "Child's pose", target: "" },
      { name: "Ankle mobility", target: "" },
      { name: "Slow breathing", target: "5 min" },
      { name: "Plank (optional)", target: "2 sets of 60 sec" },
      { name: "Dead bug (optional)", target: "2 sets of 12" },
      { name: "Glute bridge (optional)", target: "2 sets of 20" },
    ],
  },
];

function clonePlan(plan) {
  return plan.map((day) => ({ ...day, exercises: day.exercises.map((exercise) => ({ ...exercise })) }));
}

const defaultState = {
  targetKm: 30,
  activeTab: "home",
  logMode: "daily",
  plan: null,
  daily: [],
  workouts: [],
  body: [],
};

let state = loadState();
let deferredInstallPrompt = null;

const screen = document.querySelector("#screen");
const installButton = document.querySelector("#installButton");

function loadState() {
  let loaded;
  try {
    loaded = { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    loaded = { ...defaultState };
  }
  if (!Array.isArray(loaded.plan) || loaded.plan.length !== 7) {
    loaded.plan = clonePlan(DEFAULT_PLAN);
  }
  return loaded;
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

function dayIndexFor(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function todaysPlan() {
  return state.plan[dayIndexFor()];
}

function planForDate(dateStr) {
  return state.plan[dayIndexFor(dateStr)];
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

function goToLog(mode) {
  state.activeTab = "log";
  state.logMode = mode;
  saveState();
  document.querySelectorAll(".nav-button").forEach((button) => button.classList.toggle("is-active", button.dataset.tab === "log"));
  render();
  window.scrollTo(0, 0);
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
        ${plan.exercises.map((exercise) => `<div class="row"><span>${exercise.name}</span><span class="muted">${exercise.target}</span></div>`).join("")}
      </div>
      <div class="grid-2" style="margin-top:12px">
        <button class="primary-button" type="button" data-action="quick-log">Log this session</button>
        <button class="secondary-button" type="button" data-action="edit-plan">Edit plan</button>
      </div>
    </section>

    <section class="panel panel-pad">
      <p class="label">Adaptive coach</p>
      <h2>${advice.title}</h2>
      <p class="muted">${advice.message}</p>
    </section>
  `;
}

const LOG_MODES = [
  { key: "daily", label: "Check-in" },
  { key: "workout", label: "Workout" },
  { key: "plan", label: "Edit plan" },
];

function renderLog() {
  const mode = state.logMode;
  screen.innerHTML = `
    <section class="panel panel-pad">
      <h2>Log progress</h2>
      <div class="tabs">
        ${LOG_MODES.map((item) => `<button class="tab-choice ${mode === item.key ? "is-active" : ""}" type="button" data-log-mode="${item.key}">${item.label}</button>`).join("")}
      </div>
    </section>
    ${mode === "daily" ? dailyForm() : mode === "workout" ? workoutForm() : planEditor()}
    ${mode !== "plan" ? `<section class="panel panel-pad"><h2>Recent logs</h2>${recentLogs()}</section>` : ""}
  `;
}

function dailyForm() {
  return `
    <form class="panel panel-pad form" data-form="daily">
      <div class="grid-2">
        ${field("Date", "date", "date", todayISO())}
        ${field("Sleep", "sleep", "number", "", "Hours", "0.1")}
      </div>
      ${scaleField("Soreness", "soreness")}
      <div class="grid-2">
        ${field("Morning HR", "hr", "number", "", "BPM", "1")}
        ${field("Weight", "weight", "number", "", "kg", "0.1")}
      </div>
      ${field("Waist", "waist", "number", "", "cm", "0.1")}
      <button class="primary-button" type="submit">Save check-in</button>
    </form>
  `;
}

function workoutForm() {
  const dateValue = todayISO();
  return `
    <form class="panel panel-pad form" data-form="workout">
      ${field("Date", "date", "date", dateValue)}
      <div id="planPreview">${planPreviewHTML(dateValue)}</div>
      <div class="grid-2">
        ${scaleField("Fatigue", "fatigue")}
        ${field("Push-up max", "pushups", "number", "", "reps", "1")}
      </div>
      <div class="field">
        <label for="notes">Notes</label>
        <textarea id="notes" name="notes" placeholder="Optional — anything worth remembering"></textarea>
      </div>
      <button class="primary-button" type="submit">Save workout</button>
    </form>
  `;
}

function planPreviewHTML(dateStr) {
  const plan = planForDate(dateStr);
  return `
    <div class="plan-preview">
      <p class="label">${plan.day} · ${plan.type}</p>
      <h3>${plan.title}</h3>
    </div>
    <div class="checklist">
      ${plan.exercises.length
        ? plan.exercises
            .map(
              (exercise) => `
        <label class="check-row">
          <input type="checkbox" name="done" value="${exercise.name}" />
          <span>${exercise.name}</span>
          <span class="muted">${exercise.target}</span>
        </label>
      `,
            )
            .join("")
        : `<p class="muted">No activities listed for this day yet. Add some in Edit plan.</p>`}
    </div>
    ${
      plan.type === "Run"
        ? `<div class="grid-2">
      ${field("Distance", "distance", "number", plan.distance || "", "km", "0.1")}
      ${field("Time", "time", "number", "", "minutes", "0.1")}
    </div>`
        : ""
    }
    <input type="hidden" name="category" value="${plan.type}" />
    <input type="hidden" name="routine" value="${plan.title}" />
  `;
}

function planEditor() {
  return `
    <section class="panel panel-pad">
      <h2>Edit weekly plan</h2>
      <p class="muted">Adjust the type, title, and specific activities scheduled for each day. Changes apply immediately to Home and Workout logging.</p>
    </section>
    ${state.plan.map((day, index) => planDayCard(day, index)).join("")}
    <section class="panel panel-pad">
      <button class="secondary-button" type="button" data-action="reset-plan">Reset to default plan</button>
    </section>
  `;
}

function planDayCard(day, index) {
  return `
    <div class="panel panel-pad plan-day" data-day-index="${index}">
      <div class="grid-2">
        <div class="field">
          <label>Day</label>
          <input type="text" value="${day.day}" disabled />
        </div>
        <div class="field">
          <label for="type-${index}">Type</label>
          <select id="type-${index}" data-plan-field="type" data-day-index="${index}">
            ${["Run", "Strength", "Mobility", "Core", "Recovery"].map((type) => `<option ${day.type === type ? "selected" : ""}>${type}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="title-${index}">Session title</label>
        <input id="title-${index}" type="text" data-plan-field="title" data-day-index="${index}" value="${day.title}" />
      </div>
      ${
        day.type === "Run"
          ? `<div class="grid-2">
        <div class="field"><label for="distance-${index}">Distance</label><input id="distance-${index}" type="number" step="0.1" data-plan-field="distance" data-day-index="${index}" value="${day.distance || ""}" placeholder="km" /></div>
        <div class="field"><label for="pace-${index}">Pace</label><input id="pace-${index}" type="text" data-plan-field="pace" data-day-index="${index}" value="${day.pace || ""}" placeholder="e.g. 5:15-5:50/km" /></div>
      </div>`
          : ""
      }
      <div class="exercise-list">
        ${day.exercises
          .map(
            (exercise, exerciseIndex) => `
          <div class="row exercise-row">
            <input type="text" data-plan-field="name" data-day-index="${index}" data-exercise-index="${exerciseIndex}" value="${exercise.name}" placeholder="Activity" />
            <input type="text" data-plan-field="target" data-day-index="${index}" data-exercise-index="${exerciseIndex}" value="${exercise.target}" placeholder="Sets/reps" />
            <button type="button" class="icon-button" data-action="remove-exercise" data-day-index="${index}" data-exercise-index="${exerciseIndex}" aria-label="Remove activity">×</button>
          </div>
        `,
          )
          .join("")}
      </div>
      <button class="secondary-button" type="button" data-action="add-exercise" data-day-index="${index}">+ Add activity</button>
    </div>
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

function scaleField(labelText, name, value = "") {
  const options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return `
    <div class="field">
      <label>${labelText}</label>
      <div class="scale-picker">
        ${options.map((option) => `<button type="button" class="scale-btn ${String(option) === String(value) ? "is-active" : ""}" data-scale-name="${name}" data-scale-value="${option}">${option}</button>`).join("")}
      </div>
      <input type="hidden" name="${name}" value="${value}" data-scale-input="${name}" />
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
      const subtitle = log.kind === "Workout" && Array.isArray(log.done) && log.done.length ? `${log.date} · ${log.done.length} activities` : log.date;
      return `<div class="row"><div><strong>${title}</strong><span class="muted">${subtitle}</span></div><span class="status">${log.kind}</span></div>`;
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
        ${state.plan
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
      ${field("Waist", "waist", "number", "", "cm", "0.1")}
      ${scaleField("Abs rating", "abs")}
      <button class="primary-button" type="submit">Save body log</button>
    </form>
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

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.classList.add("is-hiding"), 1800);
  setTimeout(() => node.remove(), 2100);
}

function updatePlanField(el) {
  const dayIndex = Number(el.dataset.dayIndex);
  const day = state.plan[dayIndex];
  const field = el.dataset.planField;

  if (el.dataset.exerciseIndex !== undefined && el.dataset.exerciseIndex !== "") {
    day.exercises[Number(el.dataset.exerciseIndex)][field] = el.value;
  } else {
    day[field] = el.value;
  }

  saveState();
  if (field === "type") renderLog();
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

  const scaleBtn = event.target.closest("[data-scale-value]");
  if (scaleBtn) {
    const name = scaleBtn.dataset.scaleName;
    const picker = scaleBtn.closest(".scale-picker");
    picker.querySelectorAll(".scale-btn").forEach((btn) => btn.classList.toggle("is-active", btn === scaleBtn));
    const hidden = picker.parentElement.querySelector(`input[data-scale-input="${name}"]`);
    if (hidden) hidden.value = scaleBtn.dataset.scaleValue;
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "quick-log") goToLog("workout");
  if (action === "edit-plan") goToLog("plan");

  if (action === "add-exercise") {
    const dayIndex = Number(event.target.closest("[data-action]").dataset.dayIndex);
    state.plan[dayIndex].exercises.push({ name: "", target: "" });
    saveState();
    renderLog();
  }

  if (action === "remove-exercise") {
    const btn = event.target.closest("[data-action]");
    const dayIndex = Number(btn.dataset.dayIndex);
    const exerciseIndex = Number(btn.dataset.exerciseIndex);
    state.plan[dayIndex].exercises.splice(exerciseIndex, 1);
    saveState();
    renderLog();
  }

  if (action === "reset-plan") {
    state.plan = clonePlan(DEFAULT_PLAN);
    saveState();
    toast("Plan reset to default");
    renderLog();
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

document.addEventListener("input", (event) => {
  if (event.target.name === "date" && event.target.closest('[data-form="workout"]')) {
    const container = document.querySelector("#planPreview");
    if (container) container.innerHTML = planPreviewHTML(event.target.value);
    return;
  }

  if (event.target.dataset.planField) updatePlanField(event.target);
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();

  if (form.dataset.form === "daily") {
    const data = toObject(form);
    state.daily = state.daily.filter((item) => item.date !== data.date);
    state.daily.push(data);
    if (data.weight || data.waist) state.body.push({ date: data.date, weight: data.weight, waist: data.waist, abs: "" });
    toast("Check-in saved");
  }

  if (form.dataset.form === "workout") {
    const formData = new FormData(form);
    const done = formData.getAll("done");
    const data = Object.fromEntries(formData.entries());
    delete data.done;
    data.done = done;
    state.workouts.push(data);
    toast("Workout saved");
  }

  if (form.dataset.form === "body") {
    state.body.push(toObject(form));
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
