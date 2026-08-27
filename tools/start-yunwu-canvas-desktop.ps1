$ErrorActionPreference = "Stop"

$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $appRoot

$packagedElectron = Join-Path $appRoot "runtime\electron\electron.exe"
$developmentElectron = Join-Path $appRoot "node_modules\electron\dist\electron.exe"
$electronCandidates = @(
  $packagedElectron,
  $developmentElectron
)

$electron = $electronCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $electron) {
  $electronInstaller = Join-Path $appRoot "node_modules\electron\install.js"
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue

  if ((Test-Path -LiteralPath $electronInstaller) -and $nodeCommand) {
    Write-Host "Electron runtime is not installed yet. Downloading it now..." -ForegroundColor Yellow
    & $nodeCommand.Source $electronInstaller
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Automatic Electron runtime installation failed with exit code $LASTEXITCODE." -ForegroundColor Red
    }

    $electron = $electronCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  }
}

if (-not $electron) {
  Write-Host "Electron runtime was not found." -ForegroundColor Yellow
  Write-Host "In development, install dependencies and run: npx.cmd install-electron --no"
  Write-Host "For an installed copy, reinstall cc infinite canvas."
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host "Starting cc infinite canvas desktop..."
Start-Process -FilePath $electron -ArgumentList "." -WorkingDirectory $appRoot | Out-Null
