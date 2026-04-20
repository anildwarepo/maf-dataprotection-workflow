#!/usr/bin/env bash
# run.sh — Start MCP server, backend (FastAPI), and frontend (Vite) services
# Usage: ./run.sh

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS=()

echo "=== Backup & Resiliency Workflow ==="
echo ""

# Activate venv (support both Linux and Windows-created venvs)
VENV_ACTIVATE="$ROOT/.venv/bin/activate"
if [ ! -f "$VENV_ACTIVATE" ]; then
    VENV_ACTIVATE="$ROOT/.venv/Scripts/activate"
fi
if [ -f "$VENV_ACTIVATE" ]; then
    # shellcheck source=/dev/null
    source "$VENV_ACTIVATE"
else
    echo "[!] Python venv not found. Create one with: python -m venv .venv"
    exit 1
fi

# Install backend deps if needed
echo "[1/5] Checking backend dependencies..."
pip install -q fastapi "uvicorn[standard]" python-dotenv fastmcp 2>/dev/null || true

# Install frontend deps if needed
FRONTEND_DIR="$ROOT/backup-ui"
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "[2/5] Installing frontend dependencies..."
    (cd "$FRONTEND_DIR" && npm install)
else
    echo "[2/5] Frontend dependencies already installed."
fi

# Kill any existing processes on our ports
echo "[*] Cleaning up previous sessions..."
for port in 3002 8000 5173; do
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
    fi
done
# Clear stale checkpoints and active session marker
rm -f "$ROOT/backup_checkpoints/"*.json

# Cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    for pid in "${PIDS[@]}"; do
        kill "$pid" 2>/dev/null || true
    done
    # Kill by port in case child processes spawned
    for port in 3002 8000 5173; do
        pid=$(lsof -ti :"$port" 2>/dev/null || true)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
        fi
    done
    wait 2>/dev/null || true
    echo "All services stopped."
}
trap cleanup EXIT INT TERM

# Resolve python executable (venv may provide 'python', otherwise use 'python3')
PYTHON="$(command -v python 2>/dev/null || command -v python3 2>/dev/null)"
if [ -z "$PYTHON" ]; then
    echo "[!] Python not found. Install Python 3.12+ and try again."
    exit 1
fi

# Start Data Discovery MCP server
echo "[3/5] Starting Data Discovery MCP server on http://localhost:3002 ..."
"$PYTHON" "$ROOT/data_discovery_mcp/data_discovery_mcp_server.py" --port 3002 &
PIDS+=($!)

# Start backend
echo "[4/5] Starting backend (FastAPI) on http://localhost:8000 ..."
"$PYTHON" -m uvicorn backup_api.app:app --reload --reload-dir backup_api --port 8000 &
PIDS+=($!)

# Start frontend
echo "[5/5] Starting frontend (Vite) on http://localhost:5173 ..."
(cd "$FRONTEND_DIR" && npm run dev) &
PIDS+=($!)

echo ""
echo "=== All services started ==="
echo "  MCP Server: http://localhost:3002  (PID: ${PIDS[0]})"
echo "  Backend:    http://localhost:8000  (PID: ${PIDS[1]})"
echo "  Frontend:   http://localhost:5173  (PID: ${PIDS[2]})"
echo ""
echo "  Press Ctrl+C to stop all services."
echo ""

# Wait for all background processes
wait
