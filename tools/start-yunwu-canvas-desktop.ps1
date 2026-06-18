$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $appRoot

$electronCandidates = @(
  (Join-Path $appRoot "runtime\electron\electron.exe"),
  (Join-Path $appRoot "node_modules\electron\dist\electron.exe")
)

$electron = $electronCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $electron) {
  Write-Host "Electron runtime was not found." -ForegroundColor Yellow
  Write-Host "Run npm.cmd install first in development, or reinstall cc infinite canvas."
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host "Starting cc infinite canvas desktop..."
Start-Process -FilePath $electron -ArgumentList "." -WorkingDirectory $appRoot | Out-Null
