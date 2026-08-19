# SafeRoute Guardian 🛡️
> **AI-Assisted Corridor Protection & Production-Hardened Role-Based Safety Platform**  
> *Engineered, Production-Hardened, and Designed with Google Antigravity*

SafeRoute Guardian is an intelligent, production-hardened safety platform engineered to protect solo travelers, students, elderly family members, and night-shift employees along approved route corridors. The platform calculates explainable risk in real time using a high-precision Point-to-Polyline-Segment geodesic projection algorithm, issues proactive in-app check-ins, provides tourist intelligence, and manages multi-channel emergency escalations with audio sirens, SOS panic triggers, and mobile shake gesture detection.

---

## 🌟 3-Mode Role-Based Architecture & Permission Tiers

SafeRoute Guardian features exactly three main user workspace modes with strict backend-governed Role-Based Access Control (RBAC):

```
                       ┌─────────────────────────────────────────┐
                       │       SafeRoute Guardian Platform       │
                       └────────────────────┬────────────────────┘
                                            │
            ┌───────────────────────────────┼──────────────────────────────┐
            ▼                               ▼                              ▼
   ┌───────────────────┐           ┌───────────────────┐          ┌───────────────────┐
   │  1. Tourist Mode  │           │  2. Parent Mode   │          │  3. Organization  │
   └─────────┬─────────┘           └─────────┬─────────┘          └─────────┬─────────┘
             │                               │                              │
   • Explore Safely AI             • Linked Dependents Roster     ┌─────────┴─────────┐
   • Fastest vs Safer Route        • School Corridor Tracking     │                   │
   • Weather & Dead-Zones          • Deviation Alert Feed         ▼                   ▼
   • Community Safety Reviews      • Family Emergency Directory ┌─────────────┐ ┌─────────────┐
   • Trusted 24/7 Safe Spots       • Chronological Audit Log    │  Org Staff  │ │  Org Admin  │
   • Verified Local Help Network                                └──────┬──────┘ └──────┬──────┘
   • Personal Live Journey Map                                         │               │
   • 3s SOS & 3-Shake Gesture Panic                      • Assigned Fleet • Command Center
   • Safe Beacon Offline Cache                           • Live Telemetry • User Roster
                                                         • Incident Ack   • Route Editor
                                                                          • AI Telemetry
                                                                          • Sim Suite
```

### 1. Tourist Mode (Personal Safety)
Tourists can access only their own account and personal safety data:
- **Explore Safely AI Intelligence**: Destination safety index, weather warnings, cellular dead-zone intelligence, and official advisories.
- **Fastest vs. Safer Route Comparison**: Compare direct commutes with well-lit, CCTV-monitored alternative corridors.
- **Community Safety Reviews**: Verified crowdsourced safety ratings, lighting conditions, solo travel tags, and hazard reports.
- **Trusted Safe Spots & Local Help Network**: Verified 24/7 safe havens and nearby volunteer assistance directory.
- **Personal Live Journey Guidance**: GPS corridor tracking, destination ETA, speed, and corridor guidance tips.
- **Emergency SOS & Shake Shortcut**: 3-second hold panic button with animated circular SVG progress ring and DeviceMotion 3-shake hardware trigger.
- **"I'm Safe" Check-In**: One-tap check-in resolution to dismiss deviation warnings.
- **Safe Beacon Mode**: Offline last-known-safe-location beacon saved during limited connectivity.

### 2. Parent / Guardian Mode (Family Safety)
Parents can access only their explicitly linked family members or dependents:
- **Linked Dependents Dashboard**: View live travel status, risk score, and battery telemetry for linked children or elderly family members.
- **Consent-Based Dependent Linking**: Cryptographic single-use expiring token workflow ensuring verifiable consent.
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
  - **Organization Command Center**: Executive KPI metric cards, live fleet monitoring map, and operational telemetry.
  - **Member & Staff Management**: Issue single-use 7-day cryptographic invite tokens and manage staff assignments.
  - **Route & Corridor Editor**: Configure approved waypoints, adjust corridor buffer widths (50m–500m), and set escalation timeouts.
  - **Explainable AI Risk Engine Telemetry**: Real-time signal weight breakdown and formula inspection.
  - **Emergency Simulation Suite (Demo)**: Interactive triggers for Safe on Route, Minor Deviation, High Risk Drift, Return to Corridor, Fast-Forward Timeout, and SOS Panic.

---

## 🎨 UI/UX Design System Summary

SafeRoute Guardian features a custom, modern, safety-tech design system:

| Design Token | Value | Purpose |
| :--- | :--- | :--- |
| **Deep Navy Primary** | `#0A192F`, `#0F172A` | Professional, high-contrast, low-distraction backdrop |
| **Electric Blue** | `#2563EB`, `#38BDF8` | Approved route corridor, interactive focus states, brand accents |
| **Safe Emerald** | `#10B981` | Safe corridor status, verified safe spots, safe chime confirmations |
| **Caution Amber** | `#F59E0B` | Minor corridor deviation, route advisories, simulation banners |
| **High-Risk Orange** | `#F97316` | Significant off-route drift, pending check-in prompts |
| **Crimson Emergency** | `#EF4444` | Emergency SOS trigger, full-screen audio siren overlay |
| **Typography** | `Plus Jakarta Sans` & `JetBrains Mono` | Modern readability, scannability, and precise telemetry display |
| **Touch Targets** | `44px minimum` | Accessible tap areas for mobile travelers under stress |

---

## 🧠 Point-to-Polyline Geospatial AI Risk Engine

SafeRoute Guardian computes a deterministic, explainable safety risk score from **0 to 100** using 6 contextual signals. Unlike naive waypoint checks, the upgraded engine calculates the exact **orthogonal projection** onto every polyline segment:

$$\text{dist}(P, AB) = \min_{t \in [0, 1]} \| P - (A + t(B - A)) \|$$

| Factor | Weight | Description |
| :--- | :---: | :--- |
| **Corridor Geofence Offset** | $0 - 35\text{ pts}$ | Perpendicular geographic distance outside the approved safe buffer corridor |
| **Time Drift Outside Corridor** | $0 - 25\text{ pts}$ | Duration (seconds/minutes) spent off-route |
| **Trajectory Vector Direction** | $0 - 15\text{ pts}$ | Heading towards vs moving farther away from the approved corridor |
| **Time-of-Day Hazard** | $0 - 15\text{ pts}$ | Daylight vs late-night / low-visibility conditions |
| **Safety Check-in Status** | $0 - 20\text{ pts}$ | Responsiveness to proactive "Are you safe?" prompts |
| **Emergency SOS Override** | $\mathbf{100\text{ pts}}$ | Instant max score on SOS button press, shake gesture, or timeout |

### Safety Risk Levels:
- `0–29`: **Safe** (Emerald) — Smooth progress within designated corridor.
- `30–59`: **Caution** (Amber) — Minor deviation; gentle in-app route reminder dispatched.
- `60–79`: **High Risk** (Orange) — Significant drift; "Are you safe?" check-in prompt and admin alert triggered.
- `80–100`: **Emergency** (Crimson) — Emergency Protocol activated; sirens sound and safety network alerted.

---

## 🔒 Security Architecture & Cloud Firestore Rules

- **Zero Client Privilege Escalation**: Role state in React cannot grant unauthorized backend access. All reads and writes are validated by [firestore.rules](file:///firestore.rules).
- **Consent-Based Family Linking**: Single-use expiring tokens generated on the backend.
- **Cryptographic Organization Invitations**: Random, single-use, expiring tokens validated via Cloud Functions.
- **Default-Deny Policy**: All unlisted subcollections and cross-tenant reads are denied by default.
- **Append-Only Auditing**: Alerts and incident logs cannot be deleted or forged by clients.
- **Serverless Secrets**: Twilio SMS tokens and 911 CAD credentials reside strictly in [functions/index.js](file:///functions/index.js) via Secret Manager.

---

## 🗺️ Google Maps JavaScript API & Campus Safety Geofencing

SafeRoute Guardian integrates the **Google Maps JavaScript API** as its primary live map engine with geometry-based geofence calculation, centered on **Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala Cantonment, Haryana, India**.

### Map Features:
- **Campus Centered**: Centered on MMU Mullana (`30.2505, 77.0495`) in normal roadmap view (`ROADMAP`) with zoom, fullscreen, and map-type controls enabled.
- **Campus Safety Geofence**: Realistic campus perimeter polygon drawn via `google.maps.Polygon` with real-time `google.maps.geometry.poly.containsLocation` evaluation.
- **Campus POI Safe Stations**:
  - 🏛️ Main Gate (Gate 1 Security Post)
  - 🎓 Academic Block 3 (Engineering Complex)
  - 📚 Central Library & Student Help Kiosk
  - 🏢 Hostels Complex (Girls & Boys Zones)
  - 🏥 MM Super Speciality Hospital & 24/7 Trauma Emergency
  - ⚽ MMU Sports Complex & Arena
  - 🚌 MMU Bus Stop & Transit Terminus
- **Safe Walking Corridors**: Approved route path rendered via `google.maps.Polyline` wrapped in a translucent geofence buffer polygon.
- **Dynamic Traveler Status Pins**:
  - 🟢 **Green**: Safe / On Approved Route
  - 🟡 **Amber**: Minor Deviation / Caution
  - 🔴 **Red**: High-Risk Deviation / Active SOS Panic
  - 🔵 **Blue**: Guardian / Organization Monitoring Point
- **Resilient Fallback Handling**:
  - Displays *"Loading MMU Mullana Campus Safety Map…"* during SDK initialization.
  - If the API key is missing, invalid, domain-restricted, or offline, renders an in-page safety card: *"Map is temporarily unavailable. Safety controls and demo mode remain available."* or falls back to OpenStreetMap without crashing dashboards.
  - Zero dual-map container collisions; all instances, markers, and listeners are cleanly unmounted.

### 🔑 Google Maps API Key Security & Restriction Rules:
> [!IMPORTANT]
> **Strict API Key Security Checklist**:
> 1. **Never Hardcode Keys**: Never embed Google Maps API keys in source code or commit them to Git repositories.
> 2. **Environment Variable Configuration**: Set the key in your `.env.local` for local development or in **Vercel Project Settings → Environment Variables**:
>    - Variable Name: `VITE_GOOGLE_MAPS_API_KEY` (or `GOOGLE_MAPS_API_KEY`)
> 3. **Google Cloud Console Restrictions (Mandatory)**:
>    - Go to **Google Cloud Console → APIs & Services → Credentials**.
>    - Select your Maps API key and configure **Application restrictions**:
>      - Choose **HTTP referrers (web sites)**.
>      - Add development authorized URLs:
>        - `http://localhost:*/*`
>        - `http://127.0.0.1:*/*`
>      - Add your exact Vercel production deployment domain:
>        - `https://your-project.vercel.app/*`
>        - `https://*.vercel.app/*` (if using preview branches)
>    - Configure **API restrictions**:
>      - Choose **Restrict key**.
>      - Select **Maps JavaScript API** (and Places API if utilized).
> 4. **Do Not Use Unrestricted Keys**: Unrestricted keys will be flagged and could be subject to unauthorized quota consumption.

---

## 🚀 Deployment Guide (Vercel — Static Site Deployment)

SafeRoute Guardian is fully configured for zero-friction static deployment on **Vercel**.

### Vercel Project Settings (Recommended Option A — Static Deployment):
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In your [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project** and import your repository.
3. Configure the Project Settings:
   - **Root Directory**: Select `Reworked-Safety_dec` (or `./` if your repo root contains `index.html`).
   - **Framework Preset**: Select **Other** (do NOT select Vite for static deployment).
   - **Build Command**: Leave **empty / disabled** (no build step needed; Vercel serves static files directly).
   - **Output Directory**: Leave **empty / disabled** (root directory is served).
   - **Install Command**: Leave **empty / disabled**.
4. Click **Deploy**.

### Safe `vercel.json` Static Header Configuration:
The project includes a streamlined [vercel.json](file:///vercel.json) that sets security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`), 3600-second caching for `/js` and `/css` assets, and **no catch-all rewrite rules** to ensure all script and style requests return their actual file content rather than `index.html`.

### Post-Deployment Troubleshooting & Verification:
- **Hard Refresh**: After deploying or redeploying, perform a hard refresh using <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on macOS) to clear cached HTML/scripts.
- **Inspecting Browser Console**: Open DevTools by pressing <kbd>F12</kbd> (or right-click → **Inspect** → **Console** tab).
  - Verify that scripts load cleanly with `200 OK` status and `Content-Type: application/javascript`.
  - Confirm there are no `SyntaxError: Unexpected token '<'` errors (which only happen when a rewrite rule returns HTML for script files).
  - Verify `[SafeRoute Guardian] Application successfully mounted.` is logged.

### Deterministic Startup Coordinator (`bootstrap.js`):
The platform uses [js/bootstrap.js](file:///js/bootstrap.js) as an application startup coordinator. It validates all global singletons (`window.React`, `window.ReactDOM`, `window.App`, `window.SRG_DATA`, `window.StorageService`, `window.RiskEngine`, `window.FirebaseService`, `window.ConfigService`, `window.AudioService`, `window.MotionService`) before mounting React. If an unexpected network delay or dependency error occurs, it renders a branded diagnostic recovery screen with diagnostic details and a 1-click reload button instead of leaving the loading screen permanently.

---

## 🛡️ Authentication & Guided Onboarding Workflow

### Returning User Fast-Path
When an authenticated user returns to SafeRoute Guardian:
- Their Firestore profile is verified.
- If `onboardingComplete === true`, the user is **immediately and automatically redirected** to their authorized dashboard (`tourist` -> Tourist Dashboard, `parent` -> Parent Dashboard, `organization:admin` -> Admin Command Center, `organization:staff` -> Staff Dashboard).
- No onboarding screens or manual role selection dialogs are shown to returning users.

### First-Time User 4-Step Onboarding
1. **Account Login**: Sign in via Google OAuth or Email/Password.
2. **Select Mode**: Exactly 3 large mode cards:
   - 🧳 **Tourist**: Personal travel safety, AI route scores, SOS panic, and local help.
   - 👨‍👩‍👧 **Parent / Guardian**: Monitor and protect children, elderly family members, or dependents.
   - 🏢 **Organization**: Manage travel safety for schools, enterprises, tour groups, or institutions.
3. **Choose Access Type**:
   - **Tourist**: Self Use (👤).
   - **Parent**: Self Use / Guardian (👨‍👩‍👧).
   - **Organization**: Organization Administrator (👑) or Organization User / Staff (🛡️).
4. **Profile & Verification**:
   - Setup emergency contacts, link dependents, create organizations, or verify official invitation tokens.

---

## 🧪 Automated Testing

SafeRoute Guardian includes an automated test suite verifying both geospatial calculations and security rules:

```powershell
python tests/run_all_tests.py
```

### Test Coverage:
1. **Geospatial Point-to-Segment Test**: Verifies midpoint calculation on 1.1 km long segments without false deviation alerts.
2. **Lateral Offset Precision Test**: Verifies lateral offset measurement accuracy (~140m).
3. **Multi-Segment Projection Test**: Verifies orthogonal distance against multi-waypoint routes.
4. **Security Rules Verification**: Tests default-deny, self-profile reads, alert immutability, audit append-only rules, and organization isolation.

---

## 💻 How to Run Locally

```powershell
python -m http.server 8080
```
Open your browser at:
```
http://localhost:8080
```

---

## 🤖 Built with Google Antigravity

SafeRoute Guardian was architected, production-hardened, and designed using **Google Antigravity**, Google's advanced agentic coding assistant. Antigravity was utilized for:
- Implementing the Point-to-Polyline-Segment geospatial projection engine.
- Hardening Firebase Authentication, Google OAuth, and Firestore Security Rules.
- Crafting the role-tailored UI/UX design system and circular SVG RiskGauge.
- Developing serverless Cloud Functions for emergency dispatch and cryptographic invitations.
- Building the automated test runner and verification suite.

