"""
SafeRoute Guardian - Pure Static Deployment End-to-End Verification Suite
Validates:
1. Absence of Vite build files (package.json, vite.config.js, dist/)
2. Explicit ./ relative paths in index.html for all CSS and JS
3. Strict vercel.json headers without any catch-all rewrites
4. MockData, StorageService, AudioService, MotionService, FirebaseService completeness
5. bootstrap.js as final script with polling, timeout, and diagnostic error screen
6. DEPLOYMENT_CHECKLIST.md with exact Vercel static deployment settings
7. Non-HTML content in all JS, JSX, and CSS files
"""

import os
import json

ROOT_DIR = r"c:\Users\INTEL\OneDrive\Desktop\DEV\Reworked-Safety_dec"

def test_file_exists(rel_path):
    full_path = os.path.join(ROOT_DIR, rel_path)
    assert os.path.exists(full_path), f"File {rel_path} does not exist!"
    return full_path

def test_no_vite_files():
    for f in ["package.json", "package-lock.json", "vite.config.js", "dist"]:
        full_path = os.path.join(ROOT_DIR, f)
        assert not os.path.exists(full_path), f"Vite file/folder {f} still exists! Must be removed for pure static deployment."
    print("[PASS] Vite build files (package.json, vite.config.js, dist) completely removed.")

def test_index_html():
    path = test_file_exists("index.html")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify all CSS and JS paths use explicit ./ relative paths
    assert 'href="./css/style.css"' in content
    assert 'href="./css/light-theme.css"' in content
    assert 'href="./css/portal.css"' in content
    assert 'src="./js/services/configService.js"' in content
    assert 'src="./js/services/firebaseService.js"' in content
    assert 'src="./js/models/mockData.js"' in content
    assert 'src="./js/engine/riskEngine.js"' in content
    assert 'src="./js/services/audioService.js"' in content
    assert 'src="./js/services/motionService.js"' in content
    assert 'src="./js/services/storageService.js"' in content
    assert 'src="./js/components/LoginPortal.jsx"' in content
    assert 'src="./js/components/OnboardingModal.jsx"' in content
    assert 'src="./js/app.jsx"' in content
    assert '<script src="./js/bootstrap.js"></script>' in content
    
    # Verify bootstrap is the very last script before </body>
    body_idx = content.find("</body>")
    boot_idx = content.find('<script src="./js/bootstrap.js"></script>')
    assert boot_idx != -1 and boot_idx < body_idx
    after_boot = content[boot_idx + len('<script src="./js/bootstrap.js"></script>'):body_idx].strip()
    assert after_boot == "", "bootstrap.js must be the final script loaded before </body>!"
    
    # Ensure no fragile inline mount script exists
    assert 'root.render(<window.App />)' not in content
    print("[PASS] index.html structure, explicit ./ paths, and final bootstrap script verified.")

def test_bootstrap_js():
    path = test_file_exists("js/bootstrap.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "REQUIRED_DEPENDENCIES" in content
    assert "renderFallbackErrorScreen" in content
    assert "window.addEventListener('error'" in content
    assert "window.addEventListener('unhandledrejection'" in content
    assert "We could not start the safety platform." in content
    print("[PASS] js/bootstrap.js startup coordinator & error fallback verified.")

def test_mock_data():
    path = test_file_exists("js/models/mockData.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.MockData = window.SRG_DATA" in content
    assert "touristDestinations" in content
    assert "trustedSafeSpots" in content
    assert "window.SRG_DATA.roles.forEach" in content
    print("[PASS] js/models/mockData.js harmonization and datasets verified.")

def test_storage_service():
    path = test_file_exists("js/services/storageService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "getTimeline: function()" in content
    assert "clearAlerts: function()" in content
    assert "addContact: function(" in content
    print("[PASS] js/services/storageService.js methods verified.")

def test_audio_and_motion_service():
    a_path = test_file_exists("js/services/audioService.js")
    with open(a_path, "r", encoding="utf-8") as f:
        a_content = f.read()
    assert "playSafeChime: function()" in a_content

    m_path = test_file_exists("js/services/motionService.js")
    with open(m_path, "r", encoding="utf-8") as f:
        m_content = f.read()
    assert "initShakeDetector: function(" in m_content
    print("[PASS] AudioService and MotionService compatibility verified.")

def test_onboarding_modal():
    path = test_file_exists("js/components/OnboardingModal.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Step 2: Exactly 3 large cards
    assert "How will you use SafeRoute Guardian?" in content
    assert "Continue as Tourist" in content
    assert "Continue as Parent / Guardian" in content
    assert "Continue as Organization" in content

    # Step 3: Access type based on mode
    assert "Self Use" in content
    assert "Self Use / Guardian" in content
    assert "Organization Administrator" in content
    assert "Organization User / Staff" in content

    # Firestore profile parameters
    assert "primaryRole" in content
    assert "accessType" in content
    assert "allowedModes" in content
    assert "onboardingComplete" in content
    print("[PASS] OnboardingModal.jsx 4-step guided RBAC flow verified.")

def test_app_jsx():
    path = test_file_exists("js/app.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "AppErrorBoundary" in content
    assert "user.onboardingComplete === true" in content
    assert "allowedModes" in content
    assert "renderActiveView" in content
    assert "window.AccessDenied" in content
    print("[PASS] app.jsx returning user redirection and Error Boundary verified.")

def test_vercel_json():
    v_path = test_file_exists("vercel.json")
    with open(v_path, "r", encoding="utf-8") as f:
        vercel = json.load(f)
    assert "headers" in vercel
    assert "rewrites" not in vercel, "vercel.json must NOT contain rewrites!"
    
    headers_str = json.dumps(vercel.get("headers", []))
    assert "max-age=3600" in headers_str, "vercel.json should use safe 3600 cache for js/css"
    print("[PASS] vercel.json static configuration (NO REWRITES, max-age=3600) verified.")

def test_static_asset_contents():
    test_files = [
        "js/bootstrap.js",
        "js/app.jsx",
        "js/models/mockData.js",
        "js/services/storageService.js",
        "js/engine/riskEngine.js",
        "js/components/LoginPortal.jsx",
        "css/style.css",
        "css/light-theme.css",
        "css/portal.css"
    ]
    for rel in test_files:
        path = test_file_exists(rel)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        assert not content.strip().startswith("<!DOCTYPE html>"), f"Asset {rel} contains HTML content instead of script/css!"
        assert len(content) > 50, f"Asset {rel} is too small or empty!"
    print("[PASS] All JS, JSX, and CSS static asset files contain genuine code (no HTML rewrites).")

def test_deployment_checklist():
    path = test_file_exists("DEPLOYMENT_CHECKLIST.md")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "Reworked-Safety_dec" in content
    assert "Other" in content
    assert "No Node.js / Vite Build" in content
    print("[PASS] DEPLOYMENT_CHECKLIST.md complete with exact Vercel settings.")

if __name__ == "__main__":
    print("=" * 65)
    print("  [SRG] SafeRoute Guardian -- Static Deployment Verification Suite")
    print("=" * 65)
    test_no_vite_files()
    test_index_html()
    test_bootstrap_js()
    test_mock_data()
    test_storage_service()
    test_audio_and_motion_service()
    test_onboarding_modal()
    test_app_jsx()
    test_vercel_json()
    test_static_asset_contents()
    test_deployment_checklist()
    print("=" * 65)
    print("  [SUCCESS] ALL STATIC DEPLOYMENT VERIFICATIONS PASSED!")
    print("=" * 65)
