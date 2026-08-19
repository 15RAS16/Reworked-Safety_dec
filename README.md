# SafeRoute Guardian 🛡️
> **AI-Assisted Corridor Protection & Production Role-Based Safety Platform**  
> *Engineered and Upgraded with Google Antigravity*

SafeRoute Guardian is an intelligent safety platform engineered to protect travelers (solo tourists, students, elderly individuals, night-shift employees) along approved route corridors. The platform calculates explainable risk in real time, issues proactive in-app check-ins, provides tourist intelligence (weather, dead-zones, safer routes), and manages multi-channel emergency escalations with audio sirens, SOS panic triggers, and mobile shake gesture detection.

---

## 🌟 3-Mode Role-Based Access Architecture

SafeRoute Guardian features exactly three main user workspace modes with granular Role-Based Access Control (RBAC):

```
                       ┌─────────────────────────────────────┐
                       │     SafeRoute Guardian Platform     │
                       └──────────────────┬──────────────────┘
                                          │
            ┌─────────────────────────────┼────────────────────────────┐
            ▼                             ▼                            ▼
   ┌─────────────────┐           ┌─────────────────┐          ┌─────────────────┐
   │ 1. Tourist Mode │           │ 2. Parent Mode  │          │ 3. Organization │
   └────────┬────────┘           └────────┬────────┘          └────────┬────────┘
            │                             │                            │
   • Explore Safely AI           • Linked Dependents Roster   ┌────────┴────────┐
   • Weather & Dead-Zones        • Live Dependent Tracking    │                 │
   • Community Reviews           • Deviation Alerts Feed      ▼                 ▼
   • Trusted Safe Spots          • Family Emergency Network ┌───────────┐ ┌───────────┐
   • Local Help Requests         • Incident Audit Timeline  │Org Staff  │ │Org Admin  │
   • Live Journey Map                                       └─────┬─────┘ └─────┬─────┘
   • SOS Hold & Shake Trigger                                     │             │
   • Safe Beacon Offline Mode                      • Assigned Fleet • Command Center
                                                   • Live Telemetry • User Roster
                                                   • Incident Ack   • Route Editor
                                                                    • AI Telemetry
                                                                    • Sim Suite
```

### 1. Tourist Mode
Tourists can access only their own account and personal safety data:
- **Explore Safely Dashboard**: AI safety scores, live weather warnings, cellular dead-zone maps, and official advisories.
- **Fastest vs. Safer Route Comparison**: Compare direct paths with well-lit, CCTV-monitored alternative corridors.
- **Community Safety Reviews**: Crowdsourced safety ratings, lighting conditions, solo travel tags, and hazard reports.
- **Trusted Safe Spots & Local Help Network**: Verified 24/7 safe havens and nearby volunteer assistance directory.
- **Personal Live Journey Guidance**: GPS corridor tracking, destination ETA, and corridor guidance tips.
- **Emergency SOS & Shake Shortcut**: 3-second hold panic button and DeviceMotion 3-shake hardware trigger.
- **"I'm Safe" Check-In**: One-tap check-in resolution to dismiss deviation warnings.
- **Safe Beacon Mode**: Offline last-known-safe-location beacon saved during limited connectivity.

### 2. Parent / Guardian Mode
Parents can access only their explicitly linked family members or dependents:
- **Linked Dependents Dashboard**: View live travel status, risk score, and battery telemetry for linked children or elderly family members.
- **Secure Dependent Linking**: Link family members through verified invite codes.
- **Live Route & Corridor Monitor**: Real-time Leaflet tracking showing designated school or commute corridors and deviation alerts.
- **Family Incident Timeline**: Chronological audit trail of check-ins, route movements, and safe beacon updates.
- **Family Emergency Network**: Manage family safety contacts and school safety liaisons.

### 3. Organization Mode (Schools, Tour Operators, Enterprises)
Inside Organization mode, permissions are split into two distinct tiers:
- **Organization User / Staff**:
  - View only assigned travelers/groups and approved routes.
  - Live map, risk scores, and telemetry for assigned travelers.
  - Acknowledge and resolve incident alerts.
- **Organization Administrator**:
  - **Organization Command Center**: Fleet-wide metrics, active journey ratios, and operational telemetry.
  - **Member & Staff Management**: Invite users, manage permissions (Admin vs Staff), and assign staff to travelers.
  - **Route & Corridor Editor**: Configure approved waypoints, adjust corridor buffer widths (50m–500m), and set escalation timeouts.
  - **Explainable AI Risk Engine Telemetry**: Real-time signal weight breakdown and formula inspection.
  - **Emergency Simulation Suite**: Interactive triggers for Safe on Route, Minor Deviation, High Risk Drift, Return to Corridor, Fast-Forward Timeout, and SOS Panic.

---

## 🔐 Authentication & Zero-Trust Security

SafeRoute Guardian integrates **Firebase Authentication** and **Cloud Firestore**:
1. **Google OAuth ("Continue with Google")**: Official Google identity popup; never prompts for Gmail passwords directly.
2. **Email & Password Authentication**: Secure registration, login, and password reset email flows.
3. **Session Persistence**: React-driven `onAuthStateChanged` listener with persistent authenticated sessions.
4. **Onboarding Flow**: Multi-step onboarding for first-time sign-ins with mode selection and role configuration.
5. **Route Guards & Access Denied**: Unauthorized navigation items are hidden completely; direct navigation attempts render a friendly Access Denied page.
6. **Zero-Breakage Dual Mode**: Automatically activates a secure local fallback if live Firebase credentials are not yet configured in `.env.local`.

---

## 🧠 Explainable AI Safety Risk Engine

SafeRoute Guardian computes a deterministic, explainable safety risk score from **0 to 100** using 6 contextual signals:

| Factor | Weight | Description |
| :--- | :---: | :--- |
| **Corridor Geofence Offset** | $0 - 35\text{ pts}$ | Geographic distance outside the approved safe buffer corridor |
| **Time Drift Outside Corridor** | $0 - 25\text{ pts}$ | Duration (seconds/minutes) spent off-route |
| **Trajectory Vector Direction** | $0 - 15\text{ pts}$ | Heading towards vs moving farther away from the approved corridor |
| **Time-of-Day Hazard** | $0 - 15\text{ pts}$ | Daylight vs late-night / low-visibility conditions |
| **Safety Check-in Status** | $0 - 20\text{ pts}$ | Responsiveness to proactive "Are you safe?" prompts |
| **Emergency SOS Override** | $\mathbf{100\text{ pts}}$ | Instant max score on SOS button press, shake gesture, or timeout |

### Safety Risk Levels:
- `0–29`: **Safe** (Teal/Green) — Smooth progress within designated corridor.
- `30–59`: **Caution** (Amber) — Minor deviation; gentle in-app route reminder dispatched.
- `60–79`: **High Risk** (Orange) — Significant drift; "Are you safe?" check-in prompt and admin alert triggered.
- `80–100`: **Emergency** (Red) — Emergency Protocol activated; sirens sound and safety network alerted.

---

## 🚨 Emergency Protocol & Audio Siren

When Emergency Protocol is activated:
1. **Full-Screen Emergency Display**: Shows traveler identity, live GPS coordinates, route, and destination.
2. **Dual-Tone Web Audio Siren**: Synthesized oscillating siren with visual audio wave pulsation.
3. **Simulated Multi-Channel Broadcast**:
   - High-priority CAD dispatch to Local Authorities (911 / 112).
   - SMS & Push alerts to Guardians.
   - Real-time notification to School & Enterprise Safety Consoles.
4. **Safety Cancellation**: **Hold for 5 seconds to Cancel Emergency** with cancel progress bar, preventing accidental deactivation while logging cancellation time.

---

## 🚀 How to Run Locally

SafeRoute Guardian runs directly in modern browsers with zero build dependencies:

### Method 1: Python HTTP Server (Recommended)
```powershell
python -m http.server 3000
```
Open your browser at:
```
http://localhost:3000
```

### Method 2: Direct File Launch
Open `index.html` directly in Chrome, Edge, or Firefox.

---

## 📚 Documentation & Setup Guides

- [FIREBASE_SETUP.md](file:///FIREBASE_SETUP.md): Step-by-step guide for Firebase Auth, Google OAuth, Cloud Firestore, and Security Rules.
- [API_SECURITY_SETUP.md](file:///API_SECURITY_SETUP.md): Architecture for API key protection, App Check, Cloud Functions, and secret rotation.
- [firestore.rules](file:///firestore.rules): Production Firestore Security Rules enforcing RBAC and default-deny.

---

## 🤖 Google Antigravity Usage

SafeRoute Guardian was built and upgraded using **Google Antigravity**, Google's advanced agentic coding assistant. Antigravity was utilized for:
- Architecting the 3-role multi-tenant RBAC system and permission tiers.
- Implementing the 6-signal explainable AI Risk Engine.
- Integrating Firebase Authentication, Google OAuth, and Cloud Firestore.
- Generating production-grade Firestore Security Rules and zero-trust API protection.
- Crafting responsive, accessible UI components with Web Audio synthesis and hardware sensor integration.
