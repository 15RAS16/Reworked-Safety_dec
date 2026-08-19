import os
import sys
import subprocess

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    print("==================================================================")
    print("  🛡️  SafeRoute Guardian — Automated Test & Security Suite  🛡️   ")
    print("==================================================================\n")

    test_files = [
        "tests/riskEngine.test.py",
        "tests/securityRules.test.py"
    ]

    all_passed = True
    for tf in test_files:
        res = subprocess.run([sys.executable, tf], capture_output=True, text=True, encoding='utf-8', errors='ignore')
        print(res.stdout)
        if res.returncode != 0:
            print(f"❌ TEST FAILED: {tf}")
            print(res.stderr)
            all_passed = False

    if all_passed:
        print("==================================================================")
        print("  🎉 ALL AUTOMATED UNIT & SECURITY TESTS PASSED SUCCESSFULLY!    ")
        print("==================================================================")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
