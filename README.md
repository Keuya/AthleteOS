# AthleteOS

AthleteOS is an installable personal fitness PWA for logging readiness, workouts, running volume, body metrics, and adaptive weekly training targets.

## Features

- Personal profile: name, weight, 10 km pace, push-up baseline, protein target, programme start date
- Pace zones (easy / tempo / long) computed from your own 10 km pace, applied to the run plan with one tap
- Daily readiness check-ins: sleep, soreness, heart rate, weight, waist, nutrition tick
- Workout logging built around the day's specific activities — check off exercises instead of typing them in
- Week overview with day picker, so previous days in the current week can be backfilled
- Editable weekly plan: change the type, title, and exact activities scheduled for each day
- Weekly running dashboard with adaptive next-week target and an 8-week progression wave
- Streaks, personal bests (push-ups, longest run, best pace, total km), and protein/nutrition tracking
- Offline-ready service worker and installable app manifest

## Install On Your Phone

Open the GitHub Pages URL in your phone browser.

Android Chrome:
1. Open the URL.
2. Tap the menu.
3. Tap **Add to Home screen** or **Install app**.
4. Open AthleteOS from your home screen.

iPhone Safari:
1. Open the URL in Safari.
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Open AthleteOS from your home screen.

Your logs are stored in your phone browser storage. Use **Progress > Export data** to save a backup.

## Sync Between Devices

By default each device keeps its own data. To share one dataset between laptop and phone:

1. On GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Under **Account permissions**, set **Gists: Read and write** (nothing else).
2. In the app: open the ⚙ profile screen → **Sync across devices** → paste the token → **Connect sync**.
3. Repeat step 2 on the other device with the same token.

The app stores your data in a secret Gist on your GitHub account, pulls it every time it opens, and pushes after every save. Logs from both devices are merged, so nothing is overwritten. The token never leaves your device and is not included in data exports.
