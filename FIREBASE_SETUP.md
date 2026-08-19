# SafeRoute Guardian — Firebase Setup & Security Guide 🛡️

This guide provides step-by-step instructions to configure **Firebase Authentication**, **Cloud Firestore Database**, and deploy production-grade **Firestore Security Rules** for SafeRoute Guardian.

---

## 📋 Overview of Firebase Architecture

SafeRoute Guardian uses Firebase for:
1. **Authentication**: Sign in with Google (OAuth), Email/Password registration, Email/Password sign-in, and Password Reset.
2. **Cloud Firestore**: Multi-tenant data store separating user profiles, organizations, linked dependents, routes, alerts, and live journey telemetry.
3. **Security Rules (`firestore.rules`)**: Role-Based Access Control (RBAC) ensuring Tourists, Parents, and Organizations can only read and write data they own or are explicitly authorized to view.

---

## 🚀 Step 1: Create a Firebase Project

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or select an existing Google Cloud project).
3. Name your project (e.g., `saferoute-guardian-prod`).
4. (Optional) Enable Google Analytics and click **Create Project**.

---

## 🔐 Step 2: Enable Firebase Authentication Providers

1. In the Firebase Console sidebar, select **Build → Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - **Google**:
     - Click **Google** → Toggle **Enable**.
     - Set the project public-facing name to `SafeRoute Guardian`.
     - Select a project support email and click **Save**.
   - **Email/Password**:
     - Click **Email/Password** → Toggle **Enable**.
     - Keep "Email link (passwordless sign-in)" disabled unless needed.
     - Click **Save**.
4. Under the **Authorized domains** tab:
   - Verify `localhost` is present for local development.
   - Add your production hosting domains (e.g., `saferoute-guardian.web.app`, `yourdomain.com`).

---

## 🗄️ Step 3: Create Cloud Firestore Database

1. In the Firebase Console sidebar, select **Build → Firestore Database**.
2. Click **Create Database**.
3. Choose a Firestore location close to your users (e.g., `nam5 (us-central)` or `europe-west1`).
4. Select **Start in production mode** (this enables secure default-deny rules).
5. Click **Create**.

---

## 🛡️ Step 4: Deploy Firestore Security Rules

Deploy the included `firestore.rules` file to enforce role-based access control and tenant isolation.

### Option A: Via Firebase CLI (Recommended)
1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and select your project:
   ```bash
   firebase login
   firebase use --add
   ```
3. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Via Firebase Web Console
1. Open **Firestore Database → Rules** in the Firebase Console.
2. Copy the complete contents of `firestore.rules` from this repository.
3. Paste into the editor and click **Publish**.

---

## ⚙️ Step 5: Configure Frontend Environment Variables

1. In the Firebase Console, click the **Settings Cog (⚙️) → Project settings**.
2. Scroll to the **Your apps** section and click the **Web (</>)** icon.
3. Register the app nickname (e.g., `SafeRoute Web`).
4. Copy the `firebaseConfig` object values.
5. In your local repository, create a `.env.local` file (copy from `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=saferoute-guardian-prod.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=saferoute-guardian-prod
   VITE_FIREBASE_STORAGE_BUCKET=saferoute-guardian-prod.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
   ```

> [!NOTE]
> If `.env.local` is omitted, SafeRoute Guardian will automatically run in secure **Simulated Demo Mode**, allowing you to test all roles and features without throwing runtime errors.

---

## 🧪 Step 6: Verify Role-Based Access Control

1. **Tourist Account**:
   - Register a new account and choose **Tourist**.
   - Complete personal profile and emergency contacts.
   - Verify access to Explore Safely, Safe Spots, Community Reviews, and Live Journey Map.
   - Verify that Organization Command Center tools are inaccessible.

2. **Parent / Guardian Account**:
   - Register or switch to **Parent / Guardian**.
   - Link a dependent student traveler.
   - Verify dependent status telemetry, corridor deviation tracking, and family alert feeds.

3. **Organization Administrator Account**:
   - Register or switch to **Organization** → Choose **Create Organization**.
   - Verify access to the Organization Command Center, Member & Staff Roster management, Route & Corridor width editor, AI Risk Engine telemetry, and Emergency Simulation Suite.
