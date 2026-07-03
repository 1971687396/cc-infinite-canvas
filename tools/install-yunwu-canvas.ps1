param(
  [string]$InstallDir = "",
  [string]$CacheDir = "",
  [switch]$Quiet
)

$ErrorActionPreference = "Stop"

$appName = "cc infinite canvas"
$appId = "ccInfiniteCanvas"
$defaultInstallDir = Join-Path $env:LOCALAPPDATA "ccInfiniteCanvas"
$defaultCacheDir = Join-Path $env:LOCALAPPDATA "ccInfiniteCanvasCache"
$payloadZip = Join-Path $PSScriptRoot "YunwuImageCanvas.zip"

function Resolve-UserPath($path) {
  $expanded = [Environment]::ExpandEnvironmentVariables($path.Trim())
  return [IO.Path]::GetFullPath($expanded)
}

function Test-IsRootPath($path) {
  $full = [IO.Path]::GetFullPath($path).TrimEnd('\')
  $root = [IO.Path]::GetPathRoot($full).TrimEnd('\')
  return $full.Equals($root, [StringComparison]::OrdinalIgnoreCase)
}

function Get-SafeFullPath($path) {
  if ([string]::IsNullOrWhiteSpace($path)) {
    return ""
  }

  try {
    $resolved = Resolve-UserPath ([string]$path)
    if (Test-IsRootPath $resolved) {
      return ""
    }
    return $resolved
  } catch {
    return ""
  }
}

function Read-InstallInfoDefaults($installPath) {
  $resolvedInstallDir = Get-SafeFullPath $installPath
  $result = @{
    installDir = ""
    cacheDir = ""
  }
  if (-not $resolvedInstallDir) {
    return $result
  }

  $infoPath = Join-Path $resolvedInstallDir "install-info.json"
  if (-not (Test-Path $infoPath)) {
    return $result
  }

  try {
    $info = Get-Content -LiteralPath $infoPath -Raw | ConvertFrom-Json
    $storedInstallDir = $resolvedInstallDir
    if ($info.installDir) {
      $storedInstallDir = [string]$info.installDir
    }
    $result.installDir = Get-SafeFullPath $storedInstallDir
    if ($info.cacheDir) {
      $result.cacheDir = Get-SafeFullPath ([string]$info.cacheDir)
    }
  } catch {
    return @{
      installDir = ""
      cacheDir = ""
    }
  }

  return $result
}

function Get-PreviousInstallInfo {
  $result = @{
    installDir = ""
    cacheDir = ""
  }

  $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$appId"
  try {
    $reg = Get-ItemProperty -Path $regPath -ErrorAction Stop
    if ($reg.InstallLocation) {
      $result.installDir = Get-SafeFullPath ([string]$reg.InstallLocation)
    }
    if ($reg.CacheLocation) {
      $result.cacheDir = Get-SafeFullPath ([string]$reg.CacheLocation)
    }
  } catch {
    # First install, or an older build without uninstall metadata.
  }

  foreach ($candidate in @($result.installDir, $defaultInstallDir)) {
    $fileDefaults = Read-InstallInfoDefaults $candidate
    if (-not $result.installDir -and $fileDefaults.installDir) {
      $result.installDir = $fileDefaults.installDir
    }
    if (-not $result.cacheDir -and $fileDefaults.cacheDir) {
      $result.cacheDir = $fileDefaults.cacheDir
    }
  }

  return [pscustomobject]$result
}

function Read-SafePath($label, $defaultPath) {
  while ($true) {
    $inputValue = Read-Host "$label [$defaultPath]"
    if ([string]::IsNullOrWhiteSpace($inputValue)) {
      $inputValue = $defaultPath
    }

    $resolved = Resolve-UserPath $inputValue
    if (Test-IsRootPath $resolved) {
      Write-Host "Do not choose a drive root. Pick a specific folder." -ForegroundColor Yellow
      continue
    }

    return $resolved
  }
}

function Format-EnvValue($value) {
  $text = [string]$value
  if ($text -match "[\s#""']") {
    return '"' + ($text.Replace('"', '\"')) + '"'
  }
  return $text
}

function Set-EnvLine($file, $key, $value) {
  $line = "$key=$(Format-EnvValue $value)"
  if (-not (Test-Path $file)) {
    Set-Content -LiteralPath $file -Value $line -Encoding UTF8
    return
  }

  $lines = Get-Content -LiteralPath $file
  $updated = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*$([regex]::Escape($key))\s*=") {
      $lines[$i] = $line
      $updated = $true
    }
  }
  if (-not $updated) {
    $lines += $line
  }
  Set-Content -LiteralPath $file -Value $lines -Encoding UTF8
}

function Get-NodeCommandPath {
  $command = Get-Command node -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $candidates = @(
    (Join-Path $env:ProgramFiles "nodejs\node.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "nodejs\node.exe")
  )
  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  return $null
}

function Test-NodeReady {
  $nodePath = Get-NodeCommandPath
  if (-not $nodePath) {
    return $false
  }

  try {
    $versionText = & $nodePath --version
    if ($versionText -match '^v(\d+)\.') {
      return ([int]$matches[1] -ge 18)
    }
  } catch {
    return $false
  }

  return $false
}

function Get-NodeMsiArch {
  if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64" -or $env:PROCESSOR_ARCHITEW6432 -eq "ARM64") {
    return "arm64"
  }
  if ([Environment]::Is64BitOperatingSystem) {
    return "x64"
  }
  return "x86"
}

function Install-NodeLts {
  if (Test-NodeReady) {
    Write-Host "Node.js 18+ detected."
    return
  }

  Write-Host "Node.js 18+ was not found. Downloading the latest Node.js LTS installer..."
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  $arch = Get-NodeMsiArch
  $fileKey = "win-$arch-msi"
  $indexUrl = "https://nodejs.org/dist/index.json"

  try {
    $versions = Invoke-RestMethod -Uri $indexUrl -UseBasicParsing
    $release = $versions | Where-Object {
      $_.lts -and $_.files -contains $fileKey -and ([int]($_.version.TrimStart('v').Split('.')[0]) -ge 18)
    } | Select-Object -First 1

    if (-not $release) {
      throw "No compatible Node.js LTS MSI was found for $arch."
    }

    $version = [string]$release.version
    $msiName = "node-$version-$arch.msi"
    $msiUrl = "https://nodejs.org/dist/$version/$msiName"
    $msiPath = Join-Path $env:TEMP $msiName

    Write-Host "Downloading $msiName"
    Invoke-WebRequest -Uri $msiUrl -OutFile $msiPath -UseBasicParsing

    Write-Host "Installing Node.js $version. A Windows installer/UAC prompt may appear."
    $process = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$msiPath`" /passive /norestart" -Wait -PassThru
    if ($process.ExitCode -ne 0) {
      throw "Node.js installer exited with code $($process.ExitCode)."
    }
  } catch {
    throw "Automatic Node.js installation failed: $($_.Exception.Message)"
  }

  if (-not (Test-NodeReady)) {
    throw "Node.js installation finished, but node.exe 18+ was not detected. Restart Windows or install Node.js manually from https://nodejs.org/."
  }

  Write-Host "Node.js is ready."
}

if (-not (Test-Path $payloadZip)) {
  throw "Installer payload was not found: $payloadZip"
}

$previousInstall = Get-PreviousInstallInfo
if ($previousInstall.installDir) {
  $defaultInstallDir = $previousInstall.installDir
}
if ($previousInstall.cacheDir) {
  $defaultCacheDir = $previousInstall.cacheDir
}

Write-Host "$appName installer"
Write-Host "Install path and cache path must not be a drive root."
if ($previousInstall.installDir) {
  Write-Host "Existing installation detected: $($previousInstall.installDir)"
  Write-Host "Installing to the same location will update it in place."
}
$installDir = if ([string]::IsNullOrWhiteSpace($InstallDir)) { Read-SafePath "Install location" $defaultInstallDir } else { Resolve-UserPath $InstallDir }
$cacheDir = if ([string]::IsNullOrWhiteSpace($CacheDir)) { Read-SafePath "File cache location" $defaultCacheDir } else { Resolve-UserPath $CacheDir }
if (Test-IsRootPath $installDir) {
  throw "Install location must not be a drive root."
}
if (Test-IsRootPath $cacheDir) {
  throw "File cache location must not be a drive root."
}
Install-NodeLts

$tempDir = Join-Path $env:TEMP ("ccInfiniteCanvasInstall-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
  Expand-Archive -Path $payloadZip -DestinationPath $tempDir -Force

  New-Item -ItemType Directory -Path $installDir -Force | Out-Null
  New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
  Copy-Item -Path (Join-Path $tempDir "*") -Destination $installDir -Recurse -Force

  $envFile = Join-Path $installDir ".env.local"
  if (-not (Test-Path $envFile) -and (Test-Path (Join-Path $installDir ".env.local.example"))) {
    Copy-Item -LiteralPath (Join-Path $installDir ".env.local.example") -Destination $envFile -Force
  }
  Set-EnvLine $envFile "CC_CANVAS_CACHE_DIR" $cacheDir

  $installInfo = @{
    appName = $appName
    appId = $appId
    installDir = $installDir
    cacheDir = $cacheDir
    installedAt = (Get-Date).ToString("o")
  }
  $installInfo | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installDir "install-info.json") -Encoding UTF8

  $launcher = Join-Path $installDir "YunwuCanvasDesktop.cmd"
  $browserLauncher = Join-Path $installDir "YunwuCanvas.cmd"
  if (-not (Test-Path $launcher)) {
    $launcher = $browserLauncher
  }
  $iconPath = Join-Path $installDir "public\assets\app-icon.ico"
  $uninstaller = Join-Path $installDir "Uninstall.cmd"
  $desktop = [Environment]::GetFolderPath("DesktopDirectory")
  $programs = [Environment]::GetFolderPath("Programs")
  $startMenuDir = Join-Path $programs $appName
  New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null

  $shell = New-Object -ComObject WScript.Shell

  $desktopShortcut = $shell.CreateShortcut((Join-Path $desktop "$appName.lnk"))
  $desktopShortcut.TargetPath = $launcher
  $desktopShortcut.WorkingDirectory = $installDir
  $desktopShortcut.Description = $appName
  if (Test-Path $iconPath) {
    $desktopShortcut.IconLocation = $iconPath
  }
  $desktopShortcut.Save()

  $startShortcut = $shell.CreateShortcut((Join-Path $startMenuDir "$appName.lnk"))
  $startShortcut.TargetPath = $launcher
  $startShortcut.WorkingDirectory = $installDir
  $startShortcut.Description = $appName
  if (Test-Path $iconPath) {
    $startShortcut.IconLocation = $iconPath
  }
  $startShortcut.Save()

  if (Test-Path $browserLauncher) {
    $browserShortcut = $shell.CreateShortcut((Join-Path $startMenuDir "$appName Browser.lnk"))
    $browserShortcut.TargetPath = $browserLauncher
    $browserShortcut.WorkingDirectory = $installDir
    $browserShortcut.Description = "$appName browser fallback"
    if (Test-Path $iconPath) {
      $browserShortcut.IconLocation = $iconPath
    }
    $browserShortcut.Save()
  }

  $uninstallShortcut = $shell.CreateShortcut((Join-Path $startMenuDir "Uninstall $appName.lnk"))
  $uninstallShortcut.TargetPath = $uninstaller
  $uninstallShortcut.WorkingDirectory = $installDir
  $uninstallShortcut.Description = "Uninstall $appName"
  if (Test-Path $iconPath) {
    $uninstallShortcut.IconLocation = $iconPath
  }
  $uninstallShortcut.Save()

  $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$appId"
  New-Item -Path $regPath -Force | Out-Null
  New-ItemProperty -Path $regPath -Name DisplayName -Value $appName -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $regPath -Name InstallLocation -Value $installDir -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $regPath -Name CacheLocation -Value $cacheDir -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $regPath -Name UninstallString -Value "`"$uninstaller`"" -PropertyType String -Force | Out-Null
  New-ItemProperty -Path $regPath -Name Publisher -Value "Local" -PropertyType String -Force | Out-Null

  Write-Host "$appName installed to: $installDir"
  Write-Host "File cache location: $cacheDir"
  Write-Host "Desktop, Start Menu, and uninstall shortcuts were created."

  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "Node.js 18 or newer is required before launching the app." -ForegroundColor Yellow
  }
} finally {
  Remove-Item -LiteralPath $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not $Quiet) {
  Read-Host "Press Enter to close"
}
