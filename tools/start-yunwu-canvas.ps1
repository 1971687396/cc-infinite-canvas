$ErrorActionPreference = "Stop"

function Test-PortAvailable($candidatePort) {
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $candidatePort)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

function Get-AvailablePort {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  try {
    $listener.Start()
    return ([System.Net.IPEndPoint]$listener.LocalEndpoint).Port
  } finally {
    $listener.Stop()
  }
}

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

if ($port -lt 1 -or $port -gt 65535 -or -not (Test-PortAvailable $port)) {
  $requestedPort = $port
  $port = Get-AvailablePort
  Write-Host "Port $requestedPort is unavailable. Using port $port instead." -ForegroundColor Yellow
}
$env:PORT = [string]$port

Write-Host "Starting cc无限画布 at http://127.0.0.1:$port"
$server = Start-Process -FilePath $node.Source -ArgumentList "server.js" -WorkingDirectory $appRoot -PassThru -WindowStyle Hidden

$appUrl = "http://127.0.0.1:$port"
$ready = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
  if ($server.HasExited) {
    break
  }
  try {
    $response = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 1
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      $ready = $true
      break
    }
  } catch {
    Start-Sleep -Milliseconds 250
  }
}

if (-not $ready) {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
  throw "The local browser service did not start at $appUrl"
}

Start-Process $appUrl

Write-Host ""
Write-Host "cc无限画布 is running. Keep this window open while using the app."
Read-Host "Press Enter to stop the local server"

if ($server -and -not $server.HasExited) {
  Stop-Process -Id $server.Id -Force
}
