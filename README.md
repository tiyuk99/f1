# 🏎️ F1 Race Notifier

A real-time Formula 1 race notification web application that monitors live F1 sessions and sends desktop notifications for important events.

![F1 Race Notifier](https://img.shields.io/badge/F1-Race%20Notifier-E10600?style=for-the-badge&logo=f1)

## Features

### 🎯 Smart Filtering
- **Overtakes**: Get notified only for top 5 positions or Ferrari drivers
- **Incidents**: All safety cars, VSC, red flags, accidents, and collisions
- **Pit Stops**: Track pit stops for top 5 drivers and Ferrari team
- **Session Changes**: Race start and end notifications

### 🔔 Desktop Notifications
- Browser-native desktop notifications
- Real-time event feed on the page
- Customizable notification preferences
- Settings persist across sessions

### 🎨 Modern UI
- Dark theme with F1-inspired red accents
- Responsive design for all screen sizes
- Live connection status indicator
- Clean, card-based layout

## Tech Stack

- **Pure Vanilla JavaScript** - No frameworks, no dependencies
- **OpenF1 API** - Real-time F1 data from [api.openf1.org](https://api.openf1.org)
- **Browser Notification API** - Native desktop notifications
- **LocalStorage** - Persistent user preferences

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection

### Installation

1. Clone this repository:
```bash
git clone https://github.com/YOUR_USERNAME/f1-race-notifier.git
cd f1-race-notifier
```

2. Open `index.html` in your web browser:
```bash
# Linux
xdg-open index.html

# macOS
open index.html

# Windows
start index.html
```

3. Allow notifications when prompted

4. Enjoy real-time F1 race updates! 🏁

## Usage

1. **Connection**: The app automatically connects to the OpenF1 API and polls every 2 seconds during active sessions
2. **Notifications**: Toggle notification types on/off using the switches
3. **Event Feed**: View all events in the live feed on the page
4. **Manual Refresh**: Click the refresh button to manually check for updates
5. **Clear Events**: Clear the event feed with the clear button

## How It Works

### Event Detection

- **Overtakes**: Compares driver positions between API polls to detect position changes
- **Incidents**: Parses race control messages for safety-related keywords
- **Pit Stops**: Monitors pit stop data for new entries
- **Filtering**: Only Ferrari drivers or top 5 positions for overtakes and pit stops

### API Integration

The app polls these OpenF1 endpoints every 2 seconds:
- `/v1/sessions?session_key=latest` - Current session info
- `/v1/position?session_key={key}` - Live driver positions
- `/v1/race_control?session_key={key}` - Race control messages
- `/v1/pit?session_key={key}` - Pit stop data
- `/v1/drivers?session_key={key}` - Driver information

## File Structure

```
f1-race-notifier/
├── index.html      # Main HTML structure
├── style.css       # Styling and responsive design
├── app.js          # Application logic and API integration
└── README.md       # This file
```

## Screenshots

### Main Interface
The app features a clean, dark-themed interface with F1 red accents.

### Notification Settings
Toggle different notification types on/off based on your preferences.

### Live Event Feed
All events are displayed in real-time with color-coded categories.

## Browser Support

- ✅ Chrome/Edge 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Opera 74+

## API Credits

This project uses the [OpenF1 API](https://openf1.org) - a free, open-source API providing real-time F1 data.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This is an unofficial fan project and is not affiliated with Formula 1, FIA, or any F1 teams.

---

Built with ❤️ for F1 fans by F1 fans

