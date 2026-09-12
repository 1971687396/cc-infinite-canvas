param(
  [string]$Source = (Join-Path $PSScriptRoot "..\public\app-icon.png")
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resRoot = Join-Path $projectRoot "android\app\src\main\res"
$sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $Source).Path)

function Save-ScaledImage {
  param([string]$Path, [int]$Width, [int]$Height, [bool]$Transparent = $true)
  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    if ($Transparent) { $graphics.Clear([System.Drawing.Color]::Transparent) }
    else { $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F6F6")) }
    $graphics.DrawImage($sourceImage, 0, 0, $Width, $Height)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Save-SplashImage {
  param([string]$Path)
  $existing = [System.Drawing.Image]::FromFile($Path)
  $width = $existing.Width
  $height = $existing.Height
  $existing.Dispose()
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#F3F6F6"))
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $edge = [Math]::Max(96, [Math]::Round([Math]::Min($width, $height) * 0.28))
    $left = [Math]::Round(($width - $edge) / 2)
    $top = [Math]::Round(($height - $edge) / 2)
    $graphics.DrawImage($sourceImage, $left, $top, $edge, $edge)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$densities = @{
  "mdpi" = @{ icon = 48; foreground = 108 }
  "hdpi" = @{ icon = 72; foreground = 162 }
  "xhdpi" = @{ icon = 96; foreground = 216 }
  "xxhdpi" = @{ icon = 144; foreground = 324 }
  "xxxhdpi" = @{ icon = 192; foreground = 432 }
}

foreach ($density in $densities.Keys) {
  $directory = Join-Path $resRoot "mipmap-$density"
  $values = $densities[$density]
  Save-ScaledImage (Join-Path $directory "ic_launcher.png") $values.icon $values.icon
  Save-ScaledImage (Join-Path $directory "ic_launcher_round.png") $values.icon $values.icon
  Save-ScaledImage (Join-Path $directory "ic_launcher_foreground.png") $values.foreground $values.foreground
}

Get-ChildItem -LiteralPath $resRoot -Recurse -Filter "splash.png" | ForEach-Object { Save-SplashImage $_.FullName }
$sourceImage.Dispose()
Write-Host "Android icons and splash screens generated."
