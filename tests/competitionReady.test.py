"""
SafeRoute Guardian - Competition Readiness & Demo Showcase Test Suite
Validates:
1. Google OAuth sign-in option is completely removed from the login screen (LoginPortal.jsx).
2. Leaflet/OpenStreetMap fallback and Demo Map Mode badge are correctly implemented in InteractiveMap.jsx.
3. Firebase Demo mode and configured live mode are properly detected and reported (configService.js).
4. Major demo control actions (Safe on Route, Minor Deviation, High Risk Drift, Return to Route, SOS Trigger) exist.
"""

import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def test_login_has_no_google_oauth():
    """Verify that LoginPortal.jsx does not offer Google OAuth or related login actions."""
    path = os.path.join(ROOT_DIR, "js", "components", "LoginPortal.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The Google buttons, SVGs, and divider should be gone.
    assert "Continue with Google" not in content, "Google Sign-in button text still present in LoginPortal!"
    assert "srg-insta-google-btn" not in content, "Google sign-in button CSS class still present!"
    assert "handleGoogleSignIn" not in content, "Google sign-in handler still present!"
    print("[PASS] 1. Google OAuth sign-in UI and handlers completely removed from login screen.")

def test_map_fallback_and_badges():
    """Verify map fallback behavior and presence of the Demo Map Mode badge in InteractiveMap.jsx."""
    path = os.path.join(ROOT_DIR, "js", "components", "InteractiveMap.jsx")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "LeafletCampusFallback" in content, "Leaflet fallback component missing from InteractiveMap!"
    assert "Demo Map Mode" in content, "Polished 'Demo Map Mode' badge missing from Leaflet view!"
    assert "Reset Demo Map" in content, "Reset Demo Map action button missing from Leaflet view!"
    assert "srg-leaflet-reset-demo" in content, "Reset Demo Map button ID missing!"
    print("[PASS] 2. Map fallback logic, Demo Map Mode badge, and Reset Demo Map button verified.")

def test_firebase_mode_detection():
    """Verify Firebase mode reporting returns live and demo badge configurations."""
    path = os.path.join(ROOT_DIR, "js", "services", "configService.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "getFirebaseStatusBadge" in content, "getFirebaseStatusBadge method missing from ConfigService!"
    assert "Firebase Connected" in content, "Firebase Connected status label missing!"
    assert "Competition Demo Mode" in content, "Competition Demo Mode status label missing!"
    assert "getMapStatusBadge" in content, "getMapStatusBadge method missing from ConfigService!"
    print("[PASS] 3. Firebase connection status & map provider badges verified in ConfigService.")

def test_demo_controls_functional():
    """Verify all 6 required demo simulation control action keys are present and mapped in the app."""
    # Check app.jsx handler
    app_path = os.path.join(ROOT_DIR, "js", "app.jsx")
    with open(app_path, "r", encoding="utf-8") as f:
        app_content = f.read()

    required_steps = [
        "SAFE_ON_ROUTE",
        "MINOR_DEVIATION",
        "SEVERE_DEVIATION",
        "RETURN_TO_ROUTE",
        "FAST_FORWARD_TIMEOUT",
        "SOS_TRIGGER"
    ]
    for step in required_steps:
        assert step in app_content, f"Demo step key '{step}' not handled in app.jsx!"

    # Check TestDemoModal.jsx UI
    modal_path = os.path.join(ROOT_DIR, "js", "components", "TestDemoModal.jsx")
    with open(modal_path, "r", encoding="utf-8") as f:
        modal_content = f.read()

    for step in required_steps:
        assert step in modal_content, f"Demo step key '{step}' button trigger missing from TestDemoModal.jsx!"

    # Check AdminDashboard.jsx demo panel
    admin_path = os.path.join(ROOT_DIR, "js", "components", "AdminDashboard.jsx")
    with open(admin_path, "r", encoding="utf-8") as f:
        admin_content = f.read()

    assert "SAFE_ON_ROUTE" in admin_content
    assert "MINOR_DEVIATION" in admin_content
    assert "SEVERE_DEVIATION" in admin_content
    assert "RETURN_TO_ROUTE" in admin_content
    assert "FAST_FORWARD_TIMEOUT" in admin_content

    print("[PASS] 4. Major demo control actions (Safe on Route, Minor Deviation, High Risk Drift, Return, Fast-Forward, SOS) verified.")

if __name__ == "__main__":
    print("=" * 70)
    print("  [SRG] Competition-Ready & Demo Showcase Verification Test Suite")
    print("=" * 70)
    test_login_has_no_google_oauth()
    test_map_fallback_and_badges()
    test_firebase_mode_detection()
    test_demo_controls_functional()
    print("=" * 70)
    print("  [SUCCESS] ALL COMPETITION READINESS TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)
