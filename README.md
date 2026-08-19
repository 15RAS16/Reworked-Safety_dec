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

## 🚀 How to Run Locally

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
