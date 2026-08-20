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
- **Live Route & Corridor Monitor**: Real-time tracking showing designated school or commute corridors and deviation alerts.
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

SafeRoute Guardian computes a deterministic, explainable safety risk score from **0 to 100** using 6 contextual signals. Unlike naive waypoint checks, the engine calculates the exact **orthogonal projection** onto every polyline segment:

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
- `80–100`: **Emergency** (Crimson) — Emergency Protocol activated; sirens sound and alerts dispatch.

---

## 🗺️ MapTiler SDK & Marina Bay Showcase Geofencing

SafeRoute Guardian uses **MapTiler SDK JS** (built on MapLibre GL JS) as its primary vector map engine, centered on the **Marina Bay Waterfront, Singapore** (`1.2838, 103.8607`).

### Map Features & Resilient Fallback:
- **Showcase Centered**: Centered on Marina Bay (`1.2838, 103.8607`) with high-resolution vector styles.
- **Safety Geofence**: Marina Bay waterfront bounding polygon drawn with real-time `isPointInsideCampusGeofence` evaluation.
- **Showcase POI Safe Stations**:
  - 🦁 Merlion Park (Iconic Singapore Landmark)
  - 🏨 Marina Bay Sands (Waterfront Landmark)
  - 🌿 Gardens by the Bay (National Garden)
  - 🛡️ Safe Help Point (24/7 Security Post)
- **Safe Walking Corridors**: Approved route path rendered via polyline wrapped in a translucent geofence buffer polygon.
- **Dynamic Traveler Status Pins**: Safe (Emerald 🟢), Caution (Amber 🟡), and SOS Panic (Red 🔴).
- **Resilient Fallback Handling**:
  - Displays *"Loading Marina Bay Safety Map…"* during SDK initialization.
  - **Automatic Fallback Map**: If `MAPTILER_API_KEY` is not configured or network tiles fail, the map **automatically falls back to OpenStreetMap/Leaflet** with zero blank screens.
  - **Demo Map Mode Badge**: Renders a polished amber badge overlay stating **"Demo Map Mode"** when OpenStreetMap fallback is active.
  - **Reset Demo Map**: Presenters can tap **"Reset Demo Map"** to quickly restore default safe coordinates.
  - Zero dual-map container collisions; all instances, markers, and listeners are cleanly unmounted.

### 🔑 MapTiler API Key Setup:
1. Get a free API key at [cloud.maptiler.com](https://cloud.maptiler.com) (free tier: 100,000 tile requests/month).
2. Add your key to `.env.local` for local development or set it in **Vercel Project Settings → Environment Variables**:
   - Variable Name: `VITE_MAPTILER_API_KEY` (or `MAPTILER_API_KEY`)
3. In your MapTiler Cloud console, restrict your key's **Allowed HTTP Origins** to `http://localhost:*` and your production domain.
4. **Offline/Keyless Mode**: SafeRoute Guardian works out of the box even without a key, gracefully using the built-in Leaflet/OpenStreetMap fallback.

---

## 🚀 Deployment Guide (Vercel — Static Site Deployment)

SafeRoute Guardian is fully configured for zero-friction static deployment on **Vercel**.

### Vercel Project Settings (Static Deployment):
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In your [Vercel Dashboard](https://vercel.com/dashboard), click **Add New...** → **Project** and import your repository.
3. Configure the Project Settings:
   - **Root Directory**: Select `Reworked-Safety_dec` (or `./` if your repo root contains `index.html`).
   - **Framework Preset**: Select **Other** (do NOT select Vite for static deployment).
   - **Build Command**: Leave **empty / disabled** (no build step needed; Vercel serves static files directly).
   - **Output Directory**: Leave **empty / disabled** (root directory is served).
   - **Install Command**: Leave **empty / disabled**.
4. Click **Deploy**.

---

## 🛡️ Authentication & Guided Onboarding Workflow

### Email/Password-Only Authentication (Google OAuth Removed)
To protect privacy and ensure smooth offline/local presentation setup, Google OAuth has been completely removed from the login screen. Login is securely governed by email and password registration, authentication, inline validation, and custom password resets.

### Returning User Fast-Path
When an authenticated user returns to SafeRoute Guardian:
- Their Firestore profile is verified.
- If `onboardingComplete === true`, the user is **immediately and automatically redirected** to their authorized dashboard (`tourist` -> Tourist Dashboard, `parent` -> Parent Dashboard, `organization:admin` -> Admin Command Center, `organization:staff` -> Staff Dashboard).
- No onboarding screens or manual role selection dialogs are shown to returning users.

### First-Time User Onboarding
1. **Account Login**: Sign in via Email/Password (runs fully in isolated local storage Demo Mode if Firebase configuration is not present).
2. **Select Mode**: Choose 🧳 **Tourist**, 👨‍👩‍👧 **Parent / Guardian**, or 🏢 **Organization**.
3. **Choose Access Type**:
   - **Tourist**: Self Use (👤).
   - **Parent**: Self Use / Guardian (👨‍👩‍👧).
   - **Organization**: Admin (👑) or Staff (🛡️).
4. **Profile & Verification**: Set up contacts, dependents, or organizations.

---

## ⚡ Two-Minute Competition Demo Flow

Use this flow to showcase SafeRoute Guardian to judges during live demos:

1. **Clean Login Screen (30 seconds)**:
   - Navigate to the app. Point out the clean Instagram-style login page.
   - Note the removal of third-party OAuth to protect traveler metadata.
   - Register or sign in with email/password (e.g. `judge@safe.sg` / `demo123`).
2. **First-Time Guided Onboarding (30 seconds)**:
   - Complete the onboarding as an **Organization Administrator** (👑).
   - Once completed, point out the **System Status** dashboard showing map status (MapTiler or OpenStreetMap Demo active) and Firebase mode (Competition Demo Mode active).
3. **Geofence Simulation & AI Risk Scoring (40 seconds)**:
   - Go to the **Live Fleet Monitor** tab. Open the **Demo Simulation Suite**.
   - Click **Safe on Route** 🟢: Marker centers on Marina Bay; risk is 0.
   - Click **Minor Deviation** 🟡: Marker drifts 120m off path; risk rises to ~40; status goes yellow.
   - Click **High Risk Drift** 🟠: Marker drifts 450m; alert sounds; risk rises to 68; warning modal pops up asking "Are you safe?" with a countdown.
4. **Emergency SOS Verification (20 seconds)**:
   - Click **SOS Panic** 🚨 or click the red SOS button.
   - Full screen animated warning sirens overlay; GPS coordinates are sent to security dispatch.
   - Tap "Cancel SOS" and verify confirmation logs are captured in the chronological journey timeline.

---

## 🧪 Automated Testing

SafeRoute Guardian includes an automated test suite verifying MapTiler integration, geospatial calculations, static deployment compliance, and security rules:

```powershell
python tests/run_all_tests.py
```

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
- Hardening Firebase Authentication and Firestore Security Rules.
- Integrating MapTiler JS SDK with automatic OpenStreetMap fallback resilience.
- Crafting the role-tailored UI/UX design system and circular SVG RiskGauge.
- Developing serverless Cloud Functions for emergency dispatch and cryptographic invitations.
- Building the automated test runner and verification suite.
