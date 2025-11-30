// ========================================
// F1 Race Notifier - Main Application
// ========================================

// Global State Management
const state = {
    currentSession: null,
    lastPositions: {},
    lastRaceControl: [],
    lastPitStops: [],
    isConnected: false,
    preferences: {
        overtakes: true,
        incidents: true,
        pitStops: true,
        session: true
    },
    pollInterval: null,
    driverCache: {} // Cache driver info: {driver_number: {name, team_name}}
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('F1 Race Notifier initializing...');
    console.log('Initial notification permission:', Notification.permission);
    
    // Don't request permission on load - let user click Test Notification button
    // Only auto-request if they haven't been asked yet
    if (Notification.permission === 'default') {
        console.log('Notification permission not set yet - user needs to click Test Notification');
    }
    
    // Load saved preferences
    loadPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start polling
    startPolling();
});

// Request browser notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission;
        }
        return Notification.permission;
    } else {
        console.warn('Browser does not support notifications');
        return 'unsupported';
    }
}

// Test notification function
async function testNotification() {
    console.log('=== Test Notification Clicked ===');
    
    if (!('Notification' in window)) {
        alert('Your browser does not support notifications');
        addEventToFeed('System', 'Browser does not support notifications', 'incident');
        return;
    }
    
    const currentPermission = Notification.permission;
    console.log('Current notification permission:', currentPermission);
    
    if (currentPermission === 'denied') {
        alert('Notifications are blocked. Please enable them in your browser settings.');
        addEventToFeed('System', 'Notifications are blocked - check browser settings', 'incident');
        return;
    }
    
    if (currentPermission === 'granted') {
        // Already granted, just send test notification
        console.log('Permission already granted, sending notification...');
        sendNotification('Test', 'Notifications are working! You\'ll receive alerts during live races.');
        addEventToFeed('System', '✅ Test notification sent successfully', 'session');
    } else if (currentPermission === 'default') {
        // Need to request permission
        console.log('Requesting permission...');
        addEventToFeed('System', 'Requesting notification permission...', 'session');
        
        try {
            const permission = await Notification.requestPermission();
            console.log('Permission result:', permission);
            
            if (permission === 'granted') {
                console.log('Permission granted! Sending test notification...');
                sendNotification('Test', 'Notifications are working! You\'ll receive alerts during live races.');
                addEventToFeed('System', '✅ Permission granted! Test notification sent', 'session');
            } else if (permission === 'denied') {
                console.log('Permission denied');
                addEventToFeed('System', '❌ Notification permission denied', 'incident');
            } else {
                console.log('Permission dismissed/default');
                addEventToFeed('System', 'Permission dialog dismissed', 'incident');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            addEventToFeed('System', 'Error requesting permission: ' + error.message, 'incident');
        }
    }
}

// Load notification preferences from localStorage
function loadPreferences() {
    const saved = localStorage.getItem('f1NotificationPrefs');
    if (saved) {
        state.preferences = JSON.parse(saved);
        
        // Update UI toggles
        document.getElementById('toggleOvertakes').checked = state.preferences.overtakes;
        document.getElementById('toggleIncidents').checked = state.preferences.incidents;
        document.getElementById('togglePitStops').checked = state.preferences.pitStops;
        document.getElementById('toggleSession').checked = state.preferences.session;
    }
}

// Save notification preferences to localStorage
function savePreferences() {
    localStorage.setItem('f1NotificationPrefs', JSON.stringify(state.preferences));
}

// Setup all event listeners
function setupEventListeners() {
    // Toggle switches
    document.getElementById('toggleOvertakes').addEventListener('change', (e) => {
        state.preferences.overtakes = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('toggleIncidents').addEventListener('change', (e) => {
        state.preferences.incidents = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('togglePitStops').addEventListener('change', (e) => {
        state.preferences.pitStops = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('toggleSession').addEventListener('change', (e) => {
        state.preferences.session = e.target.checked;
        savePreferences();
    });
    
    // Buttons
    document.getElementById('testNotificationBtn').addEventListener('click', () => {
        testNotification();
    });
    
    document.getElementById('refreshBtn').addEventListener('click', () => {
        addEventToFeed('System', 'Manual refresh triggered', 'session');
        pollData();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        const container = document.getElementById('eventContainer');
        container.innerHTML = '<p class="empty-state">No events yet. Waiting for race activity...</p>';
    });
}

// ========================================
// API Integration
// ========================================

// Fetch latest session from OpenF1 API
async function fetchLatestSession() {
    try {
        const response = await fetch('https://api.openf1.org/v1/sessions?session_key=latest');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data[0] || null;
    } catch (error) {
        console.error('Error fetching session:', error);
        throw error;
    }
}

// Fetch driver positions
async function fetchPositions(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching positions:', error);
        throw error;
    }
}

// Fetch race control messages
async function fetchRaceControl(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/race_control?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching race control:', error);
        throw error;
    }
}

// Fetch pit stop data
async function fetchPitStops(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/pit?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching pit stops:', error);
        throw error;
    }
}

// Fetch driver data for caching
async function fetchDrivers(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const drivers = await response.json();
        
        // Cache driver info by driver_number
        drivers.forEach(driver => {
            state.driverCache[driver.driver_number] = {
                name: `${driver.first_name} ${driver.last_name}`,
                team_name: driver.team_name,
                nameCode: driver.name_acronym
            };
        });
        
        return drivers;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
    }
}

// ========================================
// Polling Logic
// ========================================

function startPolling() {
    // Initial poll
    pollData();
    
    // Poll every 2 seconds
    state.pollInterval = setInterval(pollData, 2000);
}

async function pollData() {
    try {
        // Fetch latest session
        const session = await fetchLatestSession();
        
        if (!session) {
            updateConnectionStatus(false, 'No active session found');
            return;
        }
        
        // Update connection status
        updateConnectionStatus(true);
        
        // Check if session changed
        const sessionChanged = !state.currentSession || 
                              state.currentSession.session_key !== session.session_key;
        
        if (sessionChanged) {
            console.log('New session detected:', session);
            state.currentSession = session;
            
            // Reset tracking data
            state.lastPositions = {};
            state.lastRaceControl = [];
            state.lastPitStops = [];
            
            // Fetch and cache driver data
            await fetchDrivers(session.session_key);
            
            // Update session UI
            updateSessionInfo(session);
            
            // Notify session start
            if (state.preferences.session) {
                const message = `${session.session_name} - ${session.session_type} has started`;
                sendNotification('Race Start', message);
                addEventToFeed('Session Start', message, 'session');
            }
        }
        
        // Only poll data if session is in progress
        if (session.session_key) {
            // Fetch all data in parallel
            const [positions, raceControl, pitStops] = await Promise.all([
                fetchPositions(session.session_key),
                fetchRaceControl(session.session_key),
                fetchPitStops(session.session_key)
            ]);
            
            // Process data for events
            detectOvertakes(positions);
            detectIncidents(raceControl);
            detectPitStops(pitStops);
            
            // Update last updated timestamp
            updateLastUpdated();
        }
        
    } catch (error) {
        console.error('Polling error:', error);
        updateConnectionStatus(false, `Error: ${error.message}`);
    }
}

// ========================================
// Event Detection Logic
// ========================================

/**
 * Detect overtakes by comparing current positions with last known positions
 * Filter: Only notify for top 5 positions OR Ferrari drivers
 */
function detectOvertakes(positions) {
    if (!state.preferences.overtakes || !positions || positions.length === 0) {
        return;
    }
    
    // Get latest position for each driver
    const latestPositions = {};
    positions.forEach(p => {
        if (!latestPositions[p.driver_number] || 
            new Date(p.date) > new Date(latestPositions[p.driver_number].date)) {
            latestPositions[p.driver_number] = p;
        }
    });
    
    // Compare with last positions to detect overtakes
    if (Object.keys(state.lastPositions).length > 0) {
        Object.entries(latestPositions).forEach(([driverNum, current]) => {
            const last = state.lastPositions[driverNum];
            
            if (last && last.position !== current.position) {
                // Position changed - possible overtake
                const currentPos = current.position;
                const lastPos = last.position;
                
                // Check if this is a genuine overtake (moved up)
                if (currentPos < lastPos) {
                    // Get driver info
                    const driver = state.driverCache[driverNum];
                    const driverName = driver ? driver.nameCode : `Driver ${driverNum}`;
                    const teamName = driver ? driver.team_name : '';
                    
                    // FILTER: Only notify if top 5 OR Ferrari
                    const isTop5 = currentPos <= 5;
                    const isFerrari = teamName && teamName.toLowerCase().includes('ferrari');
                    
                    if (isTop5 || isFerrari) {
                        const message = `${driverName} moved from P${lastPos} to P${currentPos}`;
                        sendNotification('Overtake', message);
                        addEventToFeed('Overtake', message, 'overtake');
                    }
                }
            }
        });
    }
    
    // Update last positions
    state.lastPositions = latestPositions;
}

/**
 * Detect incidents from race control messages
 * Keywords: SAFETY CAR, VIRTUAL SAFETY CAR, RED FLAG, ACCIDENT, COLLISION
 * Filter: None (all incidents are notified)
 */
function detectIncidents(raceControl) {
    if (!state.preferences.incidents || !raceControl || raceControl.length === 0) {
        return;
    }
    
    // Check for new race control messages
    raceControl.forEach(msg => {
        // Check if we've already seen this message
        const alreadySeen = state.lastRaceControl.some(
            old => old.date === msg.date && old.message === msg.message
        );
        
        if (!alreadySeen) {
            const msgUpper = msg.message.toUpperCase();
            
            // Check for incident keywords
            const keywords = [
                'SAFETY CAR',
                'VIRTUAL SAFETY CAR',
                'RED FLAG',
                'ACCIDENT',
                'COLLISION',
                'VSC',
                'SC DEPLOYED'
            ];
            
            const hasIncidentKeyword = keywords.some(keyword => 
                msgUpper.includes(keyword)
            );
            
            if (hasIncidentKeyword) {
                sendNotification('Incident', msg.message);
                addEventToFeed('Incident', msg.message, 'incident');
            }
        }
    });
    
    // Update last race control messages
    state.lastRaceControl = raceControl;
}

/**
 * Detect new pit stops
 * Filter: Only notify for top 5 drivers OR Ferrari drivers
 */
function detectPitStops(pitStops) {
    if (!state.preferences.pitStops || !pitStops || pitStops.length === 0) {
        return;
    }
    
    // Check for new pit stops
    pitStops.forEach(pit => {
        // Check if we've already seen this pit stop
        const alreadySeen = state.lastPitStops.some(
            old => old.date === pit.date && old.driver_number === pit.driver_number
        );
        
        if (!alreadySeen) {
            // Get driver info
            const driver = state.driverCache[pit.driver_number];
            const driverName = driver ? driver.nameCode : `Driver ${pit.driver_number}`;
            const teamName = driver ? driver.team_name : '';
            
            // Get current position (from lastPositions)
            const currentPos = state.lastPositions[pit.driver_number]?.position || '?';
            
            // FILTER: Only notify if top 5 OR Ferrari
            const isTop5 = currentPos !== '?' && currentPos <= 5;
            const isFerrari = teamName && teamName.toLowerCase().includes('ferrari');
            
            if (isTop5 || isFerrari) {
                const message = `${driverName} (P${currentPos}) pitted on Lap ${pit.lap_number || '?'}`;
                sendNotification('Pit Stop', message);
                addEventToFeed('Pit Stop', message, 'pitstop');
            }
        }
    });
    
    // Update last pit stops
    state.lastPitStops = pitStops;
}

// ========================================
// Notification System
// ========================================

/**
 * Send browser desktop notification
 */
function sendNotification(type, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`🏎️ ${type}`, {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏎️</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🏎️</text></svg>',
            tag: `f1-${Date.now()}`,
            requireInteraction: false
        });
        
        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
}

// ========================================
// UI Updates
// ========================================

/**
 * Update connection status indicator
 */
function updateConnectionStatus(connected, message = '') {
    state.isConnected = connected;
    const badge = document.getElementById('statusBadge');
    
    if (connected) {
        badge.className = 'badge connected';
        badge.textContent = 'Connected';
    } else {
        badge.className = 'badge disconnected';
        badge.textContent = message || 'Disconnected';
    }
}

/**
 * Update session information display
 */
function updateSessionInfo(session) {
    const container = document.getElementById('sessionDetails');
    
    container.innerHTML = `
        <p><strong>Race:</strong> ${session.meeting_name || 'Unknown'}</p>
        <p><strong>Session:</strong> ${session.session_name || 'Unknown'} (${session.session_type || 'Unknown'})</p>
        <p><strong>Status:</strong> ${session.session_type || 'In Progress'}</p>
        <p><strong>Location:</strong> ${session.location || session.country_name || 'Unknown'}</p>
    `;
}

/**
 * Add event to the live feed
 */
function addEventToFeed(type, message, category) {
    const container = document.getElementById('eventContainer');
    
    // Remove empty state if present
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create event item
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    const timestamp = new Date().toLocaleTimeString();
    
    eventItem.innerHTML = `
        <div class="event-content">
            <div class="event-type ${category}">${type}</div>
            <div class="event-message">${message}</div>
        </div>
        <div class="event-time">${timestamp}</div>
    `;
    
    // Add to top of feed
    container.insertBefore(eventItem, container.firstChild);
    
    // Limit to 100 events
    while (container.children.length > 100) {
        container.removeChild(container.lastChild);
    }
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    const now = new Date().toLocaleTimeString();
    element.textContent = `Last updated: ${now}`;
}

// ========================================
// Cleanup
// ========================================

// Clear interval on page unload
window.addEventListener('beforeunload', () => {
    if (state.pollInterval) {
        clearInterval(state.pollInterval);
    }
});

