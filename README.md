# F1 Race Notifier

Real-time desktop notifications and live tracking for Formula 1 races. Professional-grade monitoring tool for F1 fans.

## Features

### Smart Notifications
- Position-based filters (Top 5, Top 10, or All positions)
- Team-based filters (follow specific F1 teams)
- Individual incident type toggles (Safety Car, VSC, Red Flags, Penalties)
- Top 3 position updates every 10 laps
- Session milestone notifications

### Live Race Monitoring
- Real-time leaderboard showing top 10 positions
- Race progress tracker with lap counter
- Live event feed with search functionality
- Race statistics (overtakes, pit stops, safety cars)

### Customization
- Favorite team selector that changes app theme
- Persistent filter preferences
- Customizable notification settings

### F1 Dictionary
- Comprehensive glossary of F1 terms
- Explanations for common concepts (Undercut, Overcut, DRS, ERS, etc.)
- Flag meanings and race terminology

## Tech Stack

- Vanilla JavaScript (HTML/CSS/JS)
- OpenF1 API (https://api.openf1.org)
- Browser Notification API
- LocalStorage for preferences
- Titillium Web font

## Setup

### Using Local Web Server

1. Clone this repository
2. Navigate to the directory
3. Start a local web server:
```bash
python3 -m http.server 8000
```
4. Open http://localhost:8000 in your browser
5. Allow notifications when prompted

### Note on File Protocol

For notifications to work properly, you must serve the app over HTTP (not `file://`). Use the local server method above.

## Usage

### Navigation
- **Monitor Tab**: Live race tracking and notification settings
- **F1 Terms Tab**: Dictionary of F1 terminology
- **Statistics Tab**: Race statistics and metrics

### Filters
- **Position Filters**: Choose Top 5, Top 10, or All for overtakes and pit stops
- **Team Filters**: Select which teams you want to follow
- **Incident Filters**: Toggle specific incident types on/off

### Theme
- Select your favorite team to change the app's color scheme
- Themes match official F1 team colors

## Features Breakdown

### Position Filters
Filter overtake and pit stop notifications by driver position:
- Top 5 only
- Top 10 only
- All positions

### Team Filters
Follow specific teams:
- Ferrari, Red Bull, Mercedes, McLaren
- Aston Martin, Alpine, Williams, RB
- Sauber, Haas

### Incident Types
Individual toggles for:
- Safety Car deployments
- Virtual Safety Car (VSC)
- Red Flags
- Accidents/Collisions
- Penalties and Investigations

### Additional Features
- Top 3 reminder every 10 laps
- Session milestone notifications
- Live leaderboard with gaps
- Race progress visualization
- Searchable event history

## API Endpoints

```
GET https://api.openf1.org/v1/sessions?session_key=latest
GET https://api.openf1.org/v1/position?session_key={key}
GET https://api.openf1.org/v1/race_control?session_key={key}
GET https://api.openf1.org/v1/pit?session_key={key}
GET https://api.openf1.org/v1/drivers?session_key={key}
GET https://api.openf1.org/v1/laps?session_key={key}
```

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires support for:
- Notifications API
- LocalStorage
- ES6+ JavaScript

## Credits

- OpenF1 API (https://openf1.org) for real-time F1 data
- Google Fonts (Titillium Web)

## License

MIT License - Free to use and modify

## Disclaimer

This is an unofficial fan project and is not affiliated with Formula 1, FIA, or any F1 teams.
