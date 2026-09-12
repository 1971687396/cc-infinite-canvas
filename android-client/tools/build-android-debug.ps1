$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$defaultJavaHome = "D:\AndroidToolchain\jdk\jdk-21.0.8+9"
$defaultAndroidHome = "D:\AndroidToolchain\android-sdk"
$defaultGradleHome = "D:\AndroidToolchain\gradle-home"
$defaultAndroidUserHome = "D:\AndroidToolchain\android-user"

if (-not $env:JAVA_HOME) { $env:JAVA_HOME = $defaultJavaHome }
if (-not $env:ANDROID_HOME) { $env:ANDROID_HOME = $defaultAndroidHome }
if (-not $env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT = $env:ANDROID_HOME }
if (-not $env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME = $defaultGradleHome }
if (-not $env:ANDROID_USER_HOME) { $env:ANDROID_USER_HOME = $defaultAndroidUserHome }

if (-not (Test-Path (Join-Path $env:JAVA_HOME "bin\java.exe"))) {
    throw "JDK not found. Set JAVA_HOME or install JDK 21 under $defaultJavaHome."
}
if (-not (Test-Path (Join-Path $env:ANDROID_HOME "platforms\android-36"))) {
    throw "Android SDK 36 not found. Set ANDROID_HOME or install it under $defaultAndroidHome."
}

Push-Location $projectRoot
try {
    & npm.cmd run android:sync
    if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed with exit code $LASTEXITCODE." }

    Push-Location (Join-Path $projectRoot "android")
    try {
        & .\gradlew.bat assembleDebug --console=plain
        if ($LASTEXITCODE -ne 0) { throw "Gradle build failed with exit code $LASTEXITCODE." }
    } finally {
        Pop-Location
    }

    $version = (Get-Content (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json).version
    $sourceApk = Join-Path $projectRoot "android\app\build\outputs\apk\debug\app-debug.apk"
    $outputDir = Join-Path $projectRoot "outputs"
    $outputApk = Join-Path $outputDir "cc-creative-mobile-$version-debug.apk"
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
    Copy-Item -LiteralPath $sourceApk -Destination $outputApk -Force
    Write-Host "APK: $outputApk"
} finally {
    Pop-Location
}
