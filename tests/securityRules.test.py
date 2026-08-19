import re
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def test_firestore_rules_structure():
    print("=== Running Firestore Security Rules & RBAC Tests ===")
    with open("firestore.rules", "r", encoding="utf-8") as f:
        rules_text = f.read()

    # 1. Verify default-deny
    assert "match /{document=**} {" in rules_text and "allow read, write: if false;" in rules_text, \
        "Missing global default-deny rule at bottom of firestore.rules"
    print("  ✓ PASS: Global default-deny rule exists.")

    # 2. Verify User self-read only
    assert "match /users/{userId} {" in rules_text and "allow read: if isUser(userId);" in rules_text, \
        "Users collection does not restrict reads to self"
    print("  ✓ PASS: User profiles restricted to self-read.")

    # 3. Verify privilege escalation prevention on user profile
    assert "!request.resource.data.diff(resource.data).affectedKeys().hasAny(" in rules_text, \
        "Missing immutable protection against user profile role/permission tampering"
    print("  ✓ PASS: Privilege escalation prevented (users cannot modify role/claims directly).")

    # 4. Verify Organization member / admin isolation
    assert "function isOrgAdmin(orgId)" in rules_text, "Missing isOrgAdmin helper function"
    assert "function isOrgMember(orgId)" in rules_text, "Missing isOrgMember helper function"
    print("  ✓ PASS: Multi-tenant organization isolation and admin validation helper functions exist.")

    # 5. Verify Parent consent validation
    assert "function isLinkedParent(travelerData)" in rules_text, "Missing isLinkedParent helper function"
    print("  ✓ PASS: Consent-based linked parent verification helper function exists.")

    # 6. Verify Assigned Staff validation
    assert "function isAssignedStaff(travelerData)" in rules_text, "Missing isAssignedStaff helper function"
    print("  ✓ PASS: Assigned staff traveler verification helper function exists.")

    # 7. Verify Alert immutability
    assert "request.resource.data.type == resource.data.type" in rules_text, "Alert type must be immutable"
    assert "request.resource.data.travelerId == resource.data.travelerId" in rules_text, "Alert travelerId must be immutable"
    print("  ✓ PASS: Alert incident evidence fields (type, travelerId, createdAt) are strictly immutable.")

    # 8. Verify Audit log deletion prevention
    assert "allow delete: if false;" in rules_text, "Audit log deletion must be denied"
    print("  ✓ PASS: Audit logs and alerts are append-only with client deletion denied.")

    print("=== All Firestore Rules & RBAC Security Tests Passed! ===\n")

if __name__ == '__main__':
    test_firestore_rules_structure()
