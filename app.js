// ========================================
// F1 Race Notifier - Enhanced Version
// ========================================

// Global State Management
const state = {
    currentSession: null,
    lastPositions: {},
    lastRaceControl: [],
    lastPitStops: [],
    isConnected: false,
    currentLap: 0,
    totalLaps: 0,
    lastTop3ReminderLap: 0,
    driverCache: {},
    
    // Statistics
    stats: {
        totalOvertakes: 0,
        totalPitStops: 0,
        safetyCars: 0,
        fastestPitStop: null
    },
    
    // Enhanced Filters
    filters: {
        positions: {
            overtakes: 'top5',  // 'top5', 'top10', 'all'
            pitStops: 'top5'
        },
        teams: ['Ferrari'],  // Array of selected team names
        incidents: {
            safetyCar: true,
            vsc: true,
            redFlag: true,
            accidents: true,
            penalties: true
        },
        features: {
            top3Reminder: true,
            sessionMilestones: true
        }
    },
    
    pollInterval: null
};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('F1 Race Notifier Enhanced - Initializing...');
    
    // Load saved preferences
    loadPreferences();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UI components
    initializeDictionary();
    
    // Start polling
    startPolling();
});

// ========================================
// Event Listeners Setup
// ========================================

function setupEventListeners() {
    // Sidebar navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Favorite team selector
    document.getElementById('favoriteTeam').addEventListener('change', (e) => {
        changeTheme(e.target.value);
        savePreferences();
    });
    
    // Position filters
    document.querySelectorAll('input[name="overtakeFilter"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.filters.positions.overtakes = e.target.value;
            savePreferences();
        });
    });
    
    document.querySelectorAll('input[name="pitFilter"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.filters.positions.pitStops = e.target.value;
            savePreferences();
        });
    });
    
    // Team filters
    document.querySelectorAll('#teamFilters input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const team = e.target.value;
            if (e.target.checked) {
                if (!state.filters.teams.includes(team)) {
                    state.filters.teams.push(team);
                }
            } else {
                state.filters.teams = state.filters.teams.filter(t => t !== team);
            }
            savePreferences();
        });
    });
    
    // Incident filters
    document.getElementById('incidentSafetyCar').addEventListener('change', (e) => {
        state.filters.incidents.safetyCar = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('incidentVSC').addEventListener('change', (e) => {
        state.filters.incidents.vsc = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('incidentRedFlag').addEventListener('change', (e) => {
        state.filters.incidents.redFlag = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('incidentAccident').addEventListener('change', (e) => {
        state.filters.incidents.accidents = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('incidentPenalty').addEventListener('change', (e) => {
        state.filters.incidents.penalties = e.target.checked;
        savePreferences();
    });
    
    // Feature toggles
    document.getElementById('top3Reminder').addEventListener('change', (e) => {
        state.filters.features.top3Reminder = e.target.checked;
        savePreferences();
    });
    
    document.getElementById('sessionMilestones').addEventListener('change', (e) => {
        state.filters.features.sessionMilestones = e.target.checked;
        savePreferences();
    });
    
    // Buttons
    document.getElementById('testNotificationBtn').addEventListener('click', testNotification);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        addEventToTable('System', 'Manual refresh triggered', 'system');
        pollData();
    });
    document.getElementById('clearBtn').addEventListener('click', clearEventFeed);
    
    // Event search
    document.getElementById('eventSearch').addEventListener('input', (e) => {
        filterEvents(e.target.value);
    });
    
    // Sidebar toggle (mobile)
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });
}

// ========================================
// UI Component Functions
// ========================================

function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.nav-tab[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function changeTheme(teamId) {
    if (teamId) {
        document.body.dataset.theme = teamId;
    } else {
        delete document.body.dataset.theme;
    }
}

function initializeDictionary() {
    const container = document.getElementById('dictionaryContent');
    container.innerHTML = '';
    
    Object.values(F1_DICTIONARY).forEach(entry => {
        const entryEl = document.createElement('div');
        entryEl.className = 'dictionary-entry';
        entryEl.innerHTML = `
            <div class="dictionary-term">${entry.term}</div>
            <div class="dictionary-definition">${entry.definition}</div>
            <div class="dictionary-example">${entry.example}</div>
        `;
        container.appendChild(entryEl);
    });
}

// ========================================
// Preferences Management
// ========================================

function loadPreferences() {
    const saved = localStorage.getItem('f1NotificationPrefs');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            
            // Load filters
            if (prefs.filters) {
                state.filters = { ...state.filters, ...prefs.filters };
                
                // Apply position filters
                document.querySelector(`input[name="overtakeFilter"][value="${state.filters.positions.overtakes}"]`).checked = true;
                document.querySelector(`input[name="pitFilter"][value="${state.filters.positions.pitStops}"]`).checked = true;
                
                // Apply team filters
                document.querySelectorAll('#teamFilters input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = state.filters.teams.includes(checkbox.value);
                });
                
                // Apply incident filters
                document.getElementById('incidentSafetyCar').checked = state.filters.incidents.safetyCar;
                document.getElementById('incidentVSC').checked = state.filters.incidents.vsc;
                document.getElementById('incidentRedFlag').checked = state.filters.incidents.redFlag;
                document.getElementById('incidentAccident').checked = state.filters.incidents.accidents;
                document.getElementById('incidentPenalty').checked = state.filters.incidents.penalties;
                
                // Apply feature toggles
                document.getElementById('top3Reminder').checked = state.filters.features.top3Reminder;
                document.getElementById('sessionMilestones').checked = state.filters.features.sessionMilestones;
            }
            
            // Load theme
            if (prefs.theme) {
                document.getElementById('favoriteTeam').value = prefs.theme;
                changeTheme(prefs.theme);
            }
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
    }
}

function savePreferences() {
    const prefs = {
        filters: state.filters,
        theme: document.getElementById('favoriteTeam').value
    };
    localStorage.setItem('f1NotificationPrefs', JSON.stringify(prefs));
}

// ========================================
// API Integration
// ========================================

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

async function fetchDrivers(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const drivers = await response.json();
        
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

async function fetchLaps(sessionKey) {
    try {
        const response = await fetch(`https://api.openf1.org/v1/laps?session_key=${sessionKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching laps:', error);
        return [];
    }
}

// ========================================
// Polling Logic
// ========================================

function startPolling() {
    pollData();
    state.pollInterval = setInterval(pollData, 2000);
}

async function pollData() {
    try {
        const session = await fetchLatestSession();
        
        if (!session) {
            updateConnectionStatus(false, 'No active session');
            return;
        }
        
        updateConnectionStatus(true);
        
        const sessionChanged = !state.currentSession || 
                              state.currentSession.session_key !== session.session_key;
        
        if (sessionChanged) {
            console.log('New session detected:', session);
            state.currentSession = session;
            state.lastPositions = {};
            state.lastRaceControl = [];
            state.lastPitStops = [];
            state.lastTop3ReminderLap = 0;
            
            // Reset statistics
            state.stats = {
                totalOvertakes: 0,
                totalPitStops: 0,
                safetyCars: 0,
                fastestPitStop: null
            };
            updateStatistics();
            
            await fetchDrivers(session.session_key);
            updateSessionInfo(session);
            
            if (state.filters.features.sessionMilestones) {
                sendNotification('Session Start', `${session.session_name} - ${session.session_type} has started`, true);
                addEventToTable('Session Start', `${session.session_name} - ${session.session_type} has started`, 'session');
            }
        }
        
        if (session.session_key) {
            const [positions, raceControl, pitStops, laps] = await Promise.all([
                fetchPositions(session.session_key),
                fetchRaceControl(session.session_key),
                fetchPitStops(session.session_key),
                fetchLaps(session.session_key)
            ]);
            
            updateLapInfo(laps);
            updateLeaderboard(positions);
            detectOvertakes(positions);
            detectIncidents(raceControl);
            detectPitStops(pitStops);
            checkTop3Reminder(positions);
            
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

function detectOvertakes(positions) {
    if (!positions || positions.length === 0) return;
    
    const latestPositions = {};
    positions.forEach(p => {
        if (!latestPositions[p.driver_number] || 
            new Date(p.date) > new Date(latestPositions[p.driver_number].date)) {
            latestPositions[p.driver_number] = p;
        }
    });
    
    if (Object.keys(state.lastPositions).length > 0) {
        Object.entries(latestPositions).forEach(([driverNum, current]) => {
            const last = state.lastPositions[driverNum];
            
            if (last && last.position !== current.position && current.position < last.position) {
                const driver = state.driverCache[driverNum];
                const driverName = driver ? driver.nameCode : `Driver ${driverNum}`;
                const teamName = driver ? driver.team_name : '';
                
                // Apply filters
                const posFilter = state.filters.positions.overtakes;
                const passesPositionFilter = 
                    posFilter === 'all' ||
                    (posFilter === 'top5' && current.position <= 5) ||
                    (posFilter === 'top10' && current.position <= 10);
                
                const passesTeamFilter = state.filters.teams.length === 0 || 
                                        state.filters.teams.some(t => teamName.includes(t));
                
                if (passesPositionFilter && passesTeamFilter) {
                    const message = `${driverName} moved from P${last.position} to P${current.position}`;
                    sendNotification('Overtake', message, true);
                    addEventToTable('Overtake', message, 'overtake');
                    
                    state.stats.totalOvertakes++;
                    updateStatistics();
                }
            }
        });
    }
    
    state.lastPositions = latestPositions;
}

function detectIncidents(raceControl) {
    if (!raceControl || raceControl.length === 0) return;
    
    raceControl.forEach(msg => {
        const alreadySeen = state.lastRaceControl.some(
            old => old.date === msg.date && old.message === msg.message
        );
        
        if (!alreadySeen) {
            const msgUpper = msg.message.toUpperCase();
            
            const keywords = {
                safetyCar: ['SAFETY CAR DEPLOYED', 'SC DEPLOYED', 'SAFETY CAR IN THIS LAP'],
                vsc: ['VIRTUAL SAFETY CAR', 'VSC'],
                redFlag: ['RED FLAG'],
                accidents: ['ACCIDENT', 'COLLISION', 'INCIDENT'],
                penalties: ['PENALTY', 'INVESTIGATION', 'NO FURTHER ACTION']
            };
            
            let shouldNotify = false;
            let incidentType = 'Incident';
            
            if (state.filters.incidents.safetyCar && keywords.safetyCar.some(k => msgUpper.includes(k))) {
                shouldNotify = true;
                incidentType = 'Safety Car';
                state.stats.safetyCars++;
                updateStatistics();
            } else if (state.filters.incidents.vsc && keywords.vsc.some(k => msgUpper.includes(k))) {
                shouldNotify = true;
                incidentType = 'VSC';
            } else if (state.filters.incidents.redFlag && keywords.redFlag.some(k => msgUpper.includes(k))) {
                shouldNotify = true;
                incidentType = 'Red Flag';
            } else if (state.filters.incidents.accidents && keywords.accidents.some(k => msgUpper.includes(k))) {
                shouldNotify = true;
                incidentType = 'Incident';
            } else if (state.filters.incidents.penalties && keywords.penalties.some(k => msgUpper.includes(k))) {
                shouldNotify = true;
                incidentType = 'Penalty';
            }
            
            if (shouldNotify) {
                sendNotification(incidentType, msg.message, true);
                addEventToTable(incidentType, msg.message, 'incident');
            }
        }
    });
    
    state.lastRaceControl = raceControl;
}

function detectPitStops(pitStops) {
    if (!pitStops || pitStops.length === 0) return;
    
    pitStops.forEach(pit => {
        const alreadySeen = state.lastPitStops.some(
            old => old.date === pit.date && old.driver_number === pit.driver_number
        );
        
        if (!alreadySeen) {
            const driver = state.driverCache[pit.driver_number];
            const driverName = driver ? driver.nameCode : `Driver ${pit.driver_number}`;
            const teamName = driver ? driver.team_name : '';
            
            const currentPos = state.lastPositions[pit.driver_number]?.position || '?';
            
            // Apply filters
            const posFilter = state.filters.positions.pitStops;
            const passesPositionFilter = 
                posFilter === 'all' ||
                (posFilter === 'top5' && currentPos !== '?' && currentPos <= 5) ||
                (posFilter === 'top10' && currentPos !== '?' && currentPos <= 10);
            
            const passesTeamFilter = state.filters.teams.length === 0 || 
                                    state.filters.teams.some(t => teamName.includes(t));
            
            if (passesPositionFilter && passesTeamFilter) {
                const message = `${driverName} (P${currentPos}) pitted on Lap ${pit.lap_number || '?'}`;
                sendNotification('Pit Stop', message, true);
                addEventToTable('Pit Stop', message, 'pitstop');
                
                state.stats.totalPitStops++;
                
                // Track fastest pit stop
                if (pit.pit_duration && (!state.stats.fastestPitStop || pit.pit_duration < state.stats.fastestPitStop)) {
                    state.stats.fastestPitStop = pit.pit_duration;
                }
                
                updateStatistics();
            }
        }
    });
    
    state.lastPitStops = pitStops;
}

function checkTop3Reminder(positions) {
    if (!state.filters.features.top3Reminder) return;
    if (!positions || positions.length === 0) return;
    
    // Get current lap from latest position data
    const latestPos = positions[positions.length - 1];
    if (!latestPos || !latestPos.date) return;
    
    const currentLap = state.currentLap;
    
    // Check if we should send reminder (every 10 laps, but not same lap twice)
    if (currentLap > 0 && currentLap % 10 === 0 && currentLap !== state.lastTop3ReminderLap) {
        state.lastTop3ReminderLap = currentLap;
        
        // Get top 3 drivers
        const latestPositions = {};
        positions.forEach(p => {
            if (!latestPositions[p.driver_number] || 
                new Date(p.date) > new Date(latestPositions[p.driver_number].date)) {
                latestPositions[p.driver_number] = p;
            }
        });
        
        const sorted = Object.values(latestPositions).sort((a, b) => a.position - b.position);
        const top3 = sorted.slice(0, 3).map(p => {
            const driver = state.driverCache[p.driver_number];
            return driver ? driver.nameCode : `Driver ${p.driver_number}`;
        });
        
        if (top3.length >= 3) {
            const message = `Lap ${currentLap} - Top 3: 1. ${top3[0]}, 2. ${top3[1]}, 3. ${top3[2]}`;
            sendNotification('Top 3 Update', message, true);
            addEventToTable('Top 3 Update', message, 'system');
        }
    }
}

// ========================================
// Notification System
// ========================================

async function testNotification() {
    console.log('=== Test Notification Clicked ===');
    
    if (!('Notification' in window)) {
        alert('Your browser does not support notifications');
        addEventToTable('System', 'Browser does not support notifications', 'system');
        return;
    }
    
    const currentPermission = Notification.permission;
    console.log('Current notification permission:', currentPermission);
    
    if (currentPermission === 'denied') {
        alert('Notifications are blocked. Please enable them in your browser settings.');
        addEventToTable('System', 'Notifications are blocked - check browser settings', 'system');
        return;
    }
    
    if (currentPermission === 'granted') {
        console.log('Permission already granted, sending notification...');
        setTimeout(() => {
            sendNotification('Test', 'Notifications are working! You\'ll receive alerts during live races.', true);
            addEventToTable('System', '✓ Test notification sent successfully', 'system');
        }, 100);
    } else if (currentPermission === 'default') {
        console.log('Requesting permission...');
        addEventToTable('System', 'Requesting notification permission...', 'system');
        
        try {
            const permission = await Notification.requestPermission();
            console.log('Permission result:', permission);
            
            if (permission === 'granted') {
                console.log('Permission granted! Sending test notification...');
                setTimeout(() => {
                    sendNotification('Test', 'Notifications are working! You\'ll receive alerts during live races.', true);
                    addEventToTable('System', '✓ Permission granted! Test notification sent', 'system');
                }, 200);
            } else if (permission === 'denied') {
                console.log('Permission denied');
                addEventToTable('System', '✗ Notification permission denied', 'system');
            } else {
                console.log('Permission dismissed/default');
                addEventToTable('System', 'Permission dialog dismissed', 'system');
            }
        } catch (error) {
            console.error('Error requesting permission:', error);
            addEventToTable('System', 'Error requesting permission: ' + error.message, 'system');
        }
    }
}

function sendNotification(type, message, forceShow = false) {
    console.log('sendNotification called:', type, message);
    console.log('Notification permission check:', Notification.permission);
    
    if (!('Notification' in window)) {
        console.error('Notifications not supported');
        return;
    }
    
    if (Notification.permission === 'granted' || forceShow) {
        try {
            console.log('Creating notification...');
            const notification = new Notification(`F1: ${type}`, {
                body: message,
                icon: '/f1-icon.svg',
                badge: '/f1-icon.svg',
                requireInteraction: false,
                silent: false
            });
            
            console.log('Notification created successfully:', notification);
            
            notification.onclick = function() {
                window.focus();
                this.close();
            };
            
            notification.onerror = function(error) {
                console.error('Notification error:', error);
            };
            
            setTimeout(() => {
                try {
                    notification.close();
                } catch (e) {
                    console.log('Notification already closed');
                }
            }, 6000);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    } else {
        console.warn('Notification permission not granted:', Notification.permission);
    }
}

// ========================================
// UI Update Functions
// ========================================

function updateConnectionStatus(connected, message = '') {
    state.isConnected = connected;
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (connected) {
        statusDot.classList.add('connected');
        statusText.textContent = 'Connected';
    } else {
        statusDot.classList.remove('connected');
        statusText.textContent = message || 'Disconnected';
    }
}

function updateSessionInfo(session) {
    const sessionName = document.getElementById('sessionName');
    sessionName.textContent = `${session.meeting_name} - ${session.session_name}`;
}

function updateLapInfo(laps) {
    if (!laps || laps.length === 0) return;
    
    // Get latest lap
    const latestLap = laps.reduce((max, lap) => {
        return (lap.lap_number > max) ? lap.lap_number : max;
    }, 0);
    
    state.currentLap = latestLap;
    
    // Estimate total laps (you might need to adjust this based on session type)
    if (state.totalLaps === 0 && state.currentSession) {
        // Default lap counts by circuit (approximate)
        state.totalLaps = 57; // Default, will vary by circuit
    }
    
    document.getElementById('currentLap').textContent = state.currentLap || '-';
    document.getElementById('totalLaps').textContent = state.totalLaps || '-';
    
    // Update progress bar
    if (state.currentLap && state.totalLaps) {
        const progress = (state.currentLap / state.totalLaps) * 100;
        document.getElementById('progressBar').style.width = `${Math.min(progress, 100)}%`;
        
        // Update race phase
        const phase = document.getElementById('racePhase');
        if (progress < 25) {
            phase.textContent = 'Early Laps';
        } else if (progress < 50) {
            phase.textContent = 'First Stint';
        } else if (progress < 75) {
            phase.textContent = 'Mid-Race';
        } else if (progress < 90) {
            phase.textContent = 'Final Stint';
        } else {
            phase.textContent = 'Final Laps';
        }
    }
}

function updateLeaderboard(positions) {
    if (!positions || positions.length === 0) return;
    
    // Get latest position for each driver
    const latestPositions = {};
    positions.forEach(p => {
        if (!latestPositions[p.driver_number] || 
            new Date(p.date) > new Date(latestPositions[p.driver_number].date)) {
            latestPositions[p.driver_number] = p;
        }
    });
    
    // Sort by position
    const sorted = Object.values(latestPositions).sort((a, b) => a.position - b.position);
    const top10 = sorted.slice(0, 10);
    
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';
    
    top10.forEach(pos => {
        const driver = state.driverCache[pos.driver_number];
        const driverName = driver ? driver.nameCode : `Driver ${pos.driver_number}`;
        const teamName = driver ? driver.team_name : '-';
        
        // Calculate gap (placeholder - would need timing data)
        let gap = '-';
        if (pos.position > 1) {
            gap = '+?.???s';
        } else {
            gap = 'Leader';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="col-pos">${pos.position}</td>
            <td class="col-driver">${driverName}</td>
            <td class="col-team">${teamName}</td>
            <td class="col-gap">${gap}</td>
            <td class="col-tire"><span class="tire-badge tire-medium">MED</span></td>
        `;
        tbody.appendChild(row);
    });
}

function addEventToTable(type, message, category) {
    const tbody = document.getElementById('eventTableBody');
    
    // Remove empty state if present
    const emptyRow = tbody.querySelector('.empty-row');
    if (emptyRow) {
        emptyRow.remove();
    }
    
    const row = document.createElement('tr');
    const timestamp = new Date().toLocaleTimeString();
    
    row.innerHTML = `
        <td class="col-time">${timestamp}</td>
        <td class="col-type"><span class="event-type-badge ${category}">${type}</span></td>
        <td class="col-details">${message}</td>
    `;
    
    // Add to top of feed
    tbody.insertBefore(row, tbody.firstChild);
    
    // Limit to 200 events
    while (tbody.children.length > 200) {
        tbody.removeChild(tbody.lastChild);
    }
}

function clearEventFeed() {
    const tbody = document.getElementById('eventTableBody');
    tbody.innerHTML = '<tr class="empty-row"><td colspan="3" class="empty-cell">No events yet. Waiting for race activity...</td></tr>';
}

function filterEvents(searchTerm) {
    const rows = document.querySelectorAll('#eventTableBody tr:not(.empty-row)');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

function updateStatistics() {
    document.getElementById('statOvertakes').textContent = state.stats.totalOvertakes;
    document.getElementById('statPitStops').textContent = state.stats.totalPitStops;
    document.getElementById('statSafetyCars').textContent = state.stats.safetyCars;
    document.getElementById('statFastestPit').textContent = 
        state.stats.fastestPitStop ? `${state.stats.fastestPitStop.toFixed(2)}s` : '-';
}

function updateLastUpdated() {
    const element = document.getElementById('lastUpdated');
    const now = new Date().toLocaleTimeString();
    element.textContent = `Last updated: ${now}`;
}

// ========================================
// Cleanup
// ========================================

window.addEventListener('beforeunload', () => {
    if (state.pollInterval) {
        clearInterval(state.pollInterval);
    }
});
