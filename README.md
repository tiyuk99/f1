# F1 Race Notifier

Real-time desktop notifications for Formula 1 races. Get alerts for overtakes, incidents, and pit stops during live sessions.

## What it does

Monitors live F1 sessions via the OpenF1 API and sends browser notifications for:
- Overtakes (top 5 positions or Ferrari only)
- Incidents (safety cars, VSC, red flags, crashes)
- Pit stops (top 5 drivers or Ferrari only)
- Session start/end

## Setup

1. Clone and open `index.html` in your browser
2. Allow notifications when prompted
3. The app automatically connects to live sessions

That's it. No build process, no dependencies.

## Technical details

- Vanilla JavaScript (HTML/CSS/JS)
- Polls OpenF1 API every 2 seconds
- Uses Browser Notification API
- Settings saved in localStorage

## API endpoints

```
GET https://api.openf1.org/v1/sessions?session_key=latest
GET https://api.openf1.org/v1/position?session_key={key}
GET https://api.openf1.org/v1/race_control?session_key={key}
GET https://api.openf1.org/v1/pit?session_key={key}
GET https://api.openf1.org/v1/drivers?session_key={key}
```

## Files

```
index.html  - UI structure
style.css   - Dark theme styling
app.js      - API polling and event detection
```

## Notes

- Works best in Chrome/Firefox/Edge
- Requires active F1 session for live data
- Uses the free OpenF1 API (https://openf1.org)
- Not affiliated with Formula 1 or FIA

