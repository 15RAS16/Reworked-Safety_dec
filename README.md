# SafeRoute Guardian 🛡️
> **AI-Assisted Corridor Protection & Real-Time Geofence Safety Platform**  
> *Built with Google Antigravity*

SafeRoute Guardian is an intelligent safety platform engineered to protect travelers (students, solo tourists, elderly individuals, night-shift employees) as they journey along approved route corridors. The platform calculates explainable risk in real time, issues proactive in-app check-ins, and manages multi-channel emergency escalations with audio sirens, SOS panic triggers, and mobile shake gesture detection.

---

## 🌟 Key Features & Capabilities

### 1. Dual-Role Architecture
- **Administrator Command Center**:
  - **Live Map Monitor**: Interactive Leaflet map with OpenStreetMap displaying route polylines, safe corridor geofence buffers (e.g. 100m), real-time traveler markers, and deviation pins.
  - **Safe Routes Manager**: Create and configure custom routes, adjust buffer corridor widths (50m–500m), set default escalation timeouts (15 minutes), and assign travelers.
  - **Live Alerts & Audit Log**: Real-time chronological incident feed recording corridor breaches, check-in confirmations, SOS triggers, and cancellations.
  - **Emergency Contacts & Safety Network**: Manage guardian details, campus safety dispatchers, and simulated CAD emergency broadcasts (SMS/Voice/911 CAD).
  - **AI Risk Telemetry Panel**: Live breakdown of all 6 safety signals with transparent explainability text and weight contributions.
  - **Demo Controls Panel**: Instant triggers for "Safe on Route", "Minor Deviation", "High Risk Drift", "Return to Corridor", "Fast-Forward Timeout", and "SOS Panic".

- **Monitored Traveler (User) Mobile View**:
  - **Large Safety Status Card**: Visual color-coded safety level (*Safe* [Teal], *Caution* [Amber], *High Risk* [Orange], *Emergency* [Red]).
  - **Journey Telemetry**: Destination, ETA, speed, corridor distance offset, and active guidance tips.
  - **Interactive Route Map**: Mobile-optimized corridor tracking.
  - **"I'm Safe" Acknowledgment**: One-tap resolution to dismiss deviation check-ins and reset risk timers.
  - **Emergency SOS System**:
    - **Hold for 3 Seconds** SOS panic button with animated circular SVG progress ring and audio tick feedback.
    - **DeviceMotion Shake Gesture**: Shake phone 3 times within 5 seconds to activate Emergency Protocol.
    - **Shake Shortcut Status Badge**: Sensor permission indicator with fallback simulation button.
    - **Test Emergency (Demo Mode)**: Silent test button for presentations without loud alarms.

---

## 🧠 Explainable AI Safety Risk Engine

SafeRoute Guardian computes a deterministic, explainable safety risk score from **0 to 100** using 6 contextual signals:

| Factor | Weight | Description |
| :--- | :---: | :--- |
| **Corridor Geofence Offset** | $0 - 35\text{ pts}$ | Calculated geographic distance outside the approved safe buffer corridor |
| **Time Drift Outside Corridor** | $0 - 25\text{ pts}$ | Duration (seconds/minutes) spent off-route |
| **Trajectory Vector Direction** | $0 - 15\text{ pts}$ | Heading towards vs moving farther away from the approved corridor |
| **Time-of-Day Hazard** | $0 - 15\text{ pts}$ | Daylight vs late-night / low-visibility conditions |
| **Safety Check-in Status** | $0 - 20\text{ pts}$ | Responsiveness to "Are you safe?" prompts |
| **Emergency SOS Override** | $\mathbf{100\text{ pts}}$ | Instant max score on SOS button press, shake gesture, or timeout |

### Safety Risk Levels:
- `0–29`: **Safe** (Teal/Green) — Smooth progress within designated corridor.
- `30–59`: **Caution** (Amber) — Minor deviation; gentle in-app route reminder dispatched.
- `60–79`: **High Risk** (Orange) — Significant drift; "Are you safe?" check-in prompt and admin alert triggered.
- `80–100`: **Emergency** (Red) — Emergency Protocol activated; sirens sound and safety network alerted.

> *Disclaimer: "AI-assisted risk assessment using contextual safety signals. This prototype provides safety assistance and should not replace emergency services. In an immediate emergency, call local emergency services."*

---

## 🚨 Emergency Protocol & Audio Siren

When Emergency Protocol is activated:
1. **Full-Screen Emergency Display**: Shows traveler identity, live GPS coordinates, route, and destination.
2. **Dual-Tone Web Audio Siren**: Synthesized oscillating siren (dual-frequency modulation) with visual audio wave pulsation.
3. **Simulated Multi-Channel Broadcast**:
   - High-priority CAD dispatch to Local Authorities (911 / 112).
   - SMS & Push alerts to Guardians (e.g. Priya Sharma).
   - Real-time notification to School & Enterprise Safety Consoles.
4. **Safety Cancellation**: **Hold for 5 seconds to Cancel Emergency** with cancel progress bar, preventing accidental deactivation while logging cancellation time.

---

## 🚀 How to Run Locally

SafeRoute Guardian is built as a zero-dependency web app that runs directly in any modern browser without npm build steps or API keys.

### Method 1: Python HTTP Server (Recommended)
Open PowerShell or Terminal in the project directory:
```powershell
python -m http.server 3000
```
Open your browser at:
```
http://localhost:3000
```

### Method 2: Direct File Launch
Double click `index.html` in your file explorer to open it in Chrome, Edge, or Firefox.

---

## 🎬 Hackathon Demo Walkthrough (2-Minute Script)

1. **Overview & Persona**:
   - Open the app in **Overview** or **Administrator** mode.
   - Note the active persona: *Aarav Sharma (Student Commute - Oakwood High to Central Youth Center)*.
2. **Normal Journey**:
   - Point out the electric blue approved route and the transparent blue 100m corridor buffer on the Leaflet map.
   - Status shows `Safe (0/100)`.
3. **Trigger Minor Deviation**:
   - Click `🟡 Minor Deviation` in Demo Controls.
   - Traveler moves ~140m off route. Risk score increases to Caution (~36). Notice gentle guidance banner.
4. **Trigger High Risk Drift & Fast-Forward**:
   - Click `🟠 High Risk Drift`.
   - Traveler moves 450m away into an alleyway. "Are you safe?" check-in modal appears with 15-minute countdown.
   - Click `⚡ Fast-Forward Timeout` (accelerates countdown into 20 seconds).
   - Watch the countdown hit 0:00 $\to$ **Emergency Protocol activates automatically**!
5. **Emergency Experience**:
   - Full-screen emergency alert pops up with synthesized Web Audio siren.
   - View live dispatch logs to Guardian and 911 CAD.
   - Press and hold **"Hold for 5 seconds to Cancel Emergency"** $\to$ alarm deactivates, safe chime plays, cancellation is logged in audit feed.
6. **Test Mobile SOS & Shake Gesture**:
   - Switch to **Traveler View**.
   - Press and hold the red **SOS** button for 3 seconds $\to$ circular progress ring fills and triggers Emergency.
   - Alternatively, click **"Test Shake Gesture"** to simulate the 3-shake DeviceMotion trigger.

---

## 🛠️ Technology Stack
- **Frontend**: HTML5, Modern React 18 (Babel Standalone), Vanilla CSS Design System.
- **Mapping**: Leaflet.js with OpenStreetMap (zero paid API keys required).
- **Sensory & Audio**: Web Audio API Dual-Tone Siren Synthesizer.
- **Sensors**: Browser DeviceMotion API for mobile shake detection.
- **Persistence**: LocalStorage API for offline incident logs and custom route configurations.
