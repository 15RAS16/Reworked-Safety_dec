# SafeRoute Guardian — API Key & Secret Security Architecture 🔒

This document outlines the security specifications, secret management practices, Cloud Functions backend architecture, key rotation workflows, and App Check protection for SafeRoute Guardian.

---

## 🏛️ Security Architecture Model

SafeRoute Guardian implements a zero-trust frontend security model:

```
┌────────────────────────────────────────────────────────┐
│               Client Browser Application               │
│                                                        │
│  - No private API keys or service account tokens       │
│  - No plain-text passwords or secret storage           │
│  - Reads public Firebase web client identifiers only   │
└──────────┬─────────────────┬───────────────────┬───────┘
           │                 │                   │
           ▼                 ▼                   ▼
    ┌──────────────┐  ┌──────────────┐   ┌────────────────┐
    │   Firebase   │  │    Cloud     │   │ Cloud Functions│
    │     Auth     │  │  Firestore   │   │(Secure Backend)│
    │(Google OAuth │  │  (Protected  │   └───────┬────────┘
    │  & Identity) │  │  by Rules)   │           │
    └──────────────┘  └──────────────┘           │ [Server Secrets:
                                                 │  SMS, CAD, Weather,
                                                 │  Admin SDK Keys]
                                                 ▼
                                         ┌────────────────┐
                                         │  Private Third-│
                                         │   Party APIs   │
                                         │(Twilio, CAD,   │
                                         │ Emergency Gate)│
                                         └────────────────┘
```

### Critical Rules:
1. **Browser Config vs. Private Secrets**:
   - **Public Web Config** (e.g. `VITE_FIREBASE_API_KEY`, `projectId`) is embedded in client bundles to identify the project. It is secured via **Firestore Security Rules**, **App Check**, and **API Key Restrictions**.
   - **Private Secrets** (e.g. Twilio Auth Tokens, Google Cloud Service Account JSONs, CAD 911 gateway keys, AI provider secrets) are **NEVER** transmitted to or stored in client-side code.
2. **Backend Delegation**:
   - Any sensitive operation (triggering real SMS broadcasts, querying live emergency dispatch CAD feeds, or issuing administrative invite tokens) MUST route through a secure backend (Firebase Cloud Functions) that validates user JWT tokens and role claims.

---

## 🔐 1. Local Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local` with public Firebase web configuration.
3. Verify `.env.local` is listed in `.gitignore` so it is never committed to version control.

---

## 🌐 2. Restrict Google Cloud / Firebase API Keys

Even though public Firebase API keys cannot bypass Firestore Security Rules, applying HTTP referrer restrictions adds defense-in-depth:

1. Open the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Find the API key matching your `VITE_FIREBASE_API_KEY` (usually named *Browser key (auto created by Firebase)*).
3. Under **Application restrictions**:
   - Select **Websites**.
   - Add your authorized website domains:
     - `http://localhost:*` (for local development)
     - `https://your-project.web.app/*`
     - `https://your-project.firebaseapp.com/*`
     - `https://yourcustomdomain.com/*`
4. Under **API restrictions**:
   - Select **Restrict key**.
   - Enable only:
     - Identity Toolkit API (Firebase Authentication)
     - Cloud Firestore API
     - Token Service API
5. Click **Save**.

---

## 🛡️ 3. Enable Firebase App Check

Firebase App Check protects your backend resources (Firestore and Cloud Functions) from abuse, scraping, and billing spikes by ensuring requests originate only from your authentic web app:

1. In the Firebase Console, navigate to **Build → App Check**.
2. Click **Get Started** and select the **Apps** tab.
3. Select your web app and choose an attestation provider:
   - **reCAPTCHA Enterprise** (Recommended) or **reCAPTCHA v3**.
4. In the Google Cloud / reCAPTCHA Console, register your domain and obtain your reCAPTCHA site key.
5. In App Check, paste your secret key.
6. Enable enforcement on **Cloud Firestore** and **Cloud Functions**.

---

## ☁️ 4. Server-Side Cloud Functions Architecture for Private APIs

For production integrations (SMS dispatches, CAD 911 transmissions, weather APIs), use Firebase Cloud Functions with Secret Manager:

### Sample Cloud Function (`functions/index.js`):
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Store SMS and CAD secrets using Firebase Secret Manager
// firebase functions:secrets:set TWILIO_AUTH_TOKEN
// firebase functions:secrets:set CAD_GATEWAY_KEY

exports.dispatchEmergencyAlert = functions
  .runWith({ secrets: ['TWILIO_AUTH_TOKEN', 'CAD_GATEWAY_KEY'] })
  .https.onCall(async (data, context) => {
    // 1. Verify User Authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to dispatch emergency alerts.');
    }

    const { travelerId, alertType, liveLocation } = data;

    // 2. Query User Role & Authorization from Firestore
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const userData = userDoc.data();

    // 3. Dispatch using private server-side secrets
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    
    // Perform rate limiting & validation
    // ... send SMS via Twilio / dispatch CAD record ...

    return { success: true, timestamp: new Date().toISOString() };
  });
```

---

## 🔄 5. Key Rotation & Compromise Response Plan

If an API key, service account credential, or webhook token is accidentally committed or exposed:

### Immediate Incident Checklist:
1. **Revoke & Invalidate**:
   - Go to Google Cloud Console → APIs & Services → Credentials.
   - Immediately regenerate or delete the exposed key.
2. **Deploy New Key**:
   - Update your CI/CD secret variables or `.env.local` with the new key.
   - For Cloud Functions, rotate via `firebase functions:secrets:set <SECRET_NAME>`.
3. **Audit Access Logs**:
   - Open [Google Cloud Logs Explorer](https://console.cloud.google.com/logs).
   - Filter logs by `protoPayload.authenticationInfo.principalEmail` and review for anomalous reads or writes.
4. **Enforce Security Rules**:
   - Confirm `firestore.rules` is deployed with strict authentication checks.
5. **Git History Scrubbing**:
   - If a secret was committed to Git, use `git-filter-repo` or BFG Repo-Cleaner to purge it from history, then force-push:
     ```bash
     bfg --delete-files service-account.json
     git reflog expire --expire=now --all && git gc --prune=now --aggressive
     ```

---

## 🏢 6. Separate Development and Production Environments

To ensure strict compliance and prevent test data pollution:
- **Development Project**: `saferoute-guardian-dev` (used for local testing, staging, and demo evaluation).
- **Production Project**: `saferoute-guardian-prod` (enforces strict App Check, restrictive quotas, and custom domain SSL).
