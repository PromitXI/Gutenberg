import subprocess
import os
import sys
import signal
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

processes = []

def cleanup(signum=None, frame=None):
    print("\n\nShutting down servers...")
    for proc in processes:
        try:
            proc.terminate()
        except Exception:
            pass
    for proc in processes:
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()
    print("Servers stopped.")
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

def check_node_modules(directory, name):
    nm = os.path.join(directory, "node_modules")
    if not os.path.isdir(nm):
        print(f"Installing {name} dependencies...")
        subprocess.run(["npm", "install"], cwd=directory, shell=True, check=True)
        print(f"{name} dependencies installed.\n")

def main():
    print("=" * 55)
    print("  Cloud Infrastructure Document Generator")
    print("  Starting Backend & Frontend Servers...")
    print("=" * 55)
    print()

    # Check dependencies
    check_node_modules(BACKEND_DIR, "Backend")
    check_node_modules(FRONTEND_DIR, "Frontend")

    # Start backend
    print("[Backend]  Starting on http://localhost:3001")
    backend = subprocess.Popen(
        ["node", "src/index.js"],
        cwd=BACKEND_DIR,
        shell=True
    )
    processes.append(backend)

    time.sleep(1)

    # Start frontend
    print("[Frontend] Starting on http://localhost:5173")
    frontend = subprocess.Popen(
        ["npx", "vite", "--host"],
        cwd=FRONTEND_DIR,
        shell=True
    )
    processes.append(frontend)

    print()
    print("-" * 55)
    print("  App running at:  http://localhost:5173")
    print("  API running at:  http://localhost:3001")
    print("  Press Ctrl+C to stop both servers")
    print("-" * 55)
    print()

    # Wait for either process to exit
    while True:
        for proc in processes:
            ret = proc.poll()
            if ret is not None:
                print(f"\nA server process exited with code {ret}. Shutting down...")
                cleanup()
        time.sleep(1)

if __name__ == "__main__":
    main()
