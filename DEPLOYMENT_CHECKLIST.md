# SafeRoute Guardian (Reworked-Safety_dec) — Vercel Static Deployment Checklist 🛡️

Follow these exact settings to deploy SafeRoute Guardian (`Reworked-Safety_dec`) as a reliable, production-ready static site on Vercel without Node/Vite build race conditions.

---

## ⚙️ Vercel Project Configuration

When importing or configuring your project in the [Vercel Dashboard](https://vercel.com/dashboard):

| Setting | Exact Value | Description |
|---|---|---|
| **Root Directory** | `./` | This GitHub repository already opens at the folder containing `index.html`, `js/`, and `css/`. |
| **Framework Preset** | `Other` | **Crucial:** Do NOT select "Vite". The site runs directly via browser Babel & native script loading. |
| **Build Command** | *Empty / Disabled* | No build step should run (`npm run build` must NOT execute). |
| **Output Directory** | *Empty / Disabled* | The root static directory is served directly (do NOT use `dist`). |
| **Install Command** | *Empty / Disabled* | No npm dependency installation needed for static delivery. |

---

## 🚫 Critical Deployment Rules

1. **No Node.js / Vite Build**: Node.js build scripts must not execute during Vercel deployment.
2. **No `dist` Folder**: The site is deployed directly from the repository root containing `index.html`.
3. **No Catch-All Rewrites**: The [vercel.json](file:///vercel.json) file contains security & caching headers only, with no `rewrites` block, ensuring all `/js/...` and `/css/...` files return their genuine code content.
4. **Deterministic Bootstrapping**: [js/bootstrap.js](file:///js/bootstrap.js) is loaded as the final script and orchestrates application mounting only after all global dependencies are confirmed ready.

---

## 🔍 Post-Deployment Verification Steps

1. **Open Live URL**: Navigate to your deployed Vercel domain (e.g., `https://your-project.vercel.app`).
2. **Hard Refresh**: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> on Mac) to bypass local browser cache.
3. **Check Loading State**: Verify that the initial loading screen ("Initializing Role-Based Safety Engine...") disappears within 1-2 seconds and the **SafeRoute Guardian Login Portal** renders cleanly.
4. **Inspect DevTools Console (<kbd>F12</kbd>)**:
   - Confirm `[SafeRoute Guardian] Application successfully mounted.` is logged.
   - Confirm there are **no** `SyntaxError: Unexpected token '<'` errors.
   - Confirm that network requests for `/js/bootstrap.js`, `/js/app.jsx`, `/js/models/mockData.js`, and `/css/style.css` return HTTP 200 with their respective JavaScript and CSS MIME types.
5. **Verify Multi-Role Access**:
   - Test Tourist, Parent, Organization Staff, and Organization Admin personas.
   - Verify interactive Leaflet map, circular RiskGauge, and emergency simulation controls.
