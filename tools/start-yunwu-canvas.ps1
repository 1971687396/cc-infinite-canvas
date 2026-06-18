$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $appRoot

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host "Node.js 18 or newer is required to run cc无限画布." -ForegroundColor Yellow
  Write-Host "Install Node.js, then run YunwuCanvas.cmd again."
  Read-Host "Press Enter to close"
  exit 1
}

$port = 3000
$envFile = Join-Path $appRoot ".env.local"
if (Test-Path $envFile) {
  foreach ($line in Get-Content $envFile) {
    if ($line -match "^\s*PORT\s*=\s*(\d+)\s*$") {
      $port = [int]$matches[1]
      break
    }
  }
}

Write-Host "Starting cc无限画布 at http://localhost:$port"
$server = Start-Process -FilePath $node.Source -ArgumentList "server.js" -WorkingDirectory $appRoot -PassThru -WindowStyle Hidden

Start-Sleep -Milliseconds 900
Start-Process "http://localhost:$port"

Write-Host ""
Write-Host "cc无限画布 is running. Keep this window open while using the app."
Read-Host "Press Enter to stop the local server"

if ($server -and -not $server.HasExited) {
  Stop-Process -Id $server.Id -Force
}
