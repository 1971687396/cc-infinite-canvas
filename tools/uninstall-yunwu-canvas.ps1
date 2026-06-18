$ErrorActionPreference = "Stop"

$appName = "cc infinite canvas"
$appId = "ccInfiniteCanvas"
$appRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$installInfoPath = Join-Path $appRoot "install-info.json"

function Test-IsRootPath($path) {
  $full = [IO.Path]::GetFullPath($path).TrimEnd('\')
  $root = [IO.Path]::GetPathRoot($full).TrimEnd('\')
  return $full.Equals($root, [StringComparison]::OrdinalIgnoreCase)
}

function Remove-PathSafely($path, $label) {
  if ([string]::IsNullOrWhiteSpace($path)) {
    return
  }
  $resolved = [IO.Path]::GetFullPath($path)
  if (Test-IsRootPath $resolved) {
    throw "$label must not be a drive root: $resolved"
  }
  if (Test-Path $resolved) {
    Remove-Item -LiteralPath $resolved -Recurse -Force
  }
}

$installDir = [IO.Path]::GetFullPath($appRoot)
$cacheDir = ""
if (Test-Path $installInfoPath) {
  $info = Get-Content -LiteralPath $installInfoPath -Raw | ConvertFrom-Json
  if ($info.installDir) {
    $installDir = [IO.Path]::GetFullPath([string]$info.installDir)
  }
  if ($info.cacheDir) {
    $cacheDir = [IO.Path]::GetFullPath([string]$info.cacheDir)
  }
}

if (Test-IsRootPath $installDir) {
  throw "Install directory is a drive root. Uninstall stopped: $installDir"
}

Write-Host "Preparing to uninstall $appName"
Write-Host "Install directory: $installDir"
if ($cacheDir) {
  Write-Host "File cache location: $cacheDir"
}

$confirm = Read-Host "Type Y to uninstall"
if ($confirm -notin @("Y", "y")) {
  Write-Host "Uninstall cancelled."
  exit 0
}

$deleteCache = "N"
if ($cacheDir) {
  $deleteCache = Read-Host "Type Y to also delete the file cache"
}

$desktop = [Environment]::GetFolderPath("DesktopDirectory")
$programs = [Environment]::GetFolderPath("Programs")
$startMenuDir = Join-Path $programs $appName
Remove-Item -LiteralPath (Join-Path $desktop "$appName.lnk") -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $startMenuDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$appId" -Recurse -Force -ErrorAction SilentlyContinue

Set-Location $env:TEMP
Remove-PathSafely $installDir "Install directory"

if ($deleteCache -in @("Y", "y") -and $cacheDir) {
  Remove-PathSafely $cacheDir "File cache directory"
}

Write-Host "$appName uninstalled."
Read-Host "Press Enter to close"
