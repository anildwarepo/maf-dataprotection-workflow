# run.ps1 — Start MCP server, backend (FastAPI), and frontend (Vite) services
# Usage: .\run.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Backup & Resiliency Workflow ===" -ForegroundColor Cyan
Write-Host ""

# Activate venv
$venvActivate = Join-Path $root ".venv\Scripts\Activate.ps1"
if (Test-Path $venvActivate) {
    & $venvActivate
} else {
    Write-Host "[!] Python venv not found at $venvActivate" -ForegroundColor Red
    exit 1
}

# Install backend deps if needed
Write-Host "[1/5] Checking backend dependencies..." -ForegroundColor Yellow
pip install -q fastapi "uvicorn[standard]" python-dotenv fastmcp 2>$null

# Install frontend deps if needed
$frontendDir = Join-Path $root "backup-ui"
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "[2/5] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    Pop-Location
} else {
    Write-Host "[2/5] Frontend dependencies already installed." -ForegroundColor Green
}

# Kill any existing processes on our ports
Write-Host "[*] Cleaning up previous sessions..." -ForegroundColor Yellow
foreach ($port in @(3002, 8000, 5173)) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
# Stop and remove any leftover background jobs from a previous run
Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
# Clear stale checkpoints and active session marker
Remove-Item (Join-Path $root "backup_checkpoints\*.json") -Force -ErrorAction SilentlyContinue

$pythonExe = Join-Path $root ".venv\Scripts\python.exe"
$npmCmd = Join-Path (Split-Path (Get-Command node).Source) "npm.cmd"

# Start Data Discovery MCP server
Write-Host "[3/5] Starting Data Discovery MCP server on http://localhost:3002 ..." -ForegroundColor Yellow
$mcpJob = Start-Job -ScriptBlock {
    param($py, $script, $wd)
    Set-Location $wd
    & $py $script --port 3002 2>&1
} -ArgumentList $pythonExe, (Join-Path $root "data_discovery_mcp\data_discovery_mcp_server.py"), $root

# Start backend
Write-Host "[4/5] Starting backend (FastAPI) on http://localhost:8000 ..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($py, $wd)
    Set-Location $wd
    & $py -m uvicorn backup_api.app:app --reload --reload-dir backup_api --port 8000 2>&1
} -ArgumentList $pythonExe, $root

# Start frontend
Write-Host "[5/5] Starting frontend (Vite) on http://localhost:5173 ..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($npm, $wd)
    Set-Location $wd
    & $npm run dev 2>&1
} -ArgumentList $npmCmd, $frontendDir

Write-Host ""
Write-Host "=== All services started ===" -ForegroundColor Green
Write-Host "  MCP Server: http://localhost:3002  (Job: $($mcpJob.Id))" -ForegroundColor Cyan
Write-Host "  Backend:    http://localhost:8000  (Job: $($backendJob.Id))" -ForegroundColor Cyan
Write-Host "  Frontend:   http://localhost:5173  (Job: $($frontendJob.Id))" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View logs:  Receive-Job -Id <JobId>" -ForegroundColor Gray
Write-Host "  Stop all:   Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor Gray
Write-Host ""

# Stream output from all jobs until Ctrl+C
try {
    while ($true) {
        foreach ($job in @($mcpJob, $backendJob, $frontendJob)) {
            $output = Receive-Job -Id $job.Id -ErrorAction SilentlyContinue
            if ($output) {
                $output | ForEach-Object { Write-Host $_ }
            }
        }
        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    # Kill child processes by port immediately
    foreach ($port in @(3002, 8000, 5173)) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($c in $conns) {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
    # Remove jobs without waiting — Force skips graceful shutdown
    @($mcpJob, $backendJob, $frontendJob) | ForEach-Object {
        Remove-Job -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "All services stopped." -ForegroundColor Green
}

