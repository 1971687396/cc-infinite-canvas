$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$dist = Join-Path $root "dist"
$payloadRoot = Join-Path $dist "payload"
$iexpressRoot = Join-Path $env:TEMP "YunwuCanvasIExpress"
$installerPath = Join-Path $dist "YunwuImageCanvasSetup.exe"
$installerTempPath = Join-Path $iexpressRoot "YunwuImageCanvasSetup.exe"
$payloadZip = Join-Path $iexpressRoot "YunwuImageCanvas.zip"
$installScript = Join-Path $iexpressRoot "Install-YunwuCanvas.ps1"
$sedPath = Join-Path $iexpressRoot "YunwuImageCanvasSetup.sed"
$csharpInstaller = Join-Path $iexpressRoot "YunwuImageCanvasInstaller.cs"
$installerIcon = Join-Path $root "public\assets\app-icon.ico"

function Assert-UnderRoot($path, $parent) {
  $resolvedParent = [IO.Path]::GetFullPath($parent)
  $resolvedPath = [IO.Path]::GetFullPath($path)
  if (-not $resolvedPath.StartsWith($resolvedParent, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write outside project root: $resolvedPath"
  }
}

function Assert-NoLocalDataInPayload {
  $localOnlyEntries = @(
    ".env",
    ".env.local",
    "cache",
    "data",
    "dist",
    "node_modules",
    "outputs"
  )

  foreach ($entry in $localOnlyEntries) {
    $payloadEntry = Join-Path $payloadRoot $entry
    if (Test-Path $payloadEntry) {
      throw "Refusing to package local data or development-only entry: $entry"
    }
  }
}

function Build-CSharpInstaller {
  $cscCandidates = @(
    (Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"),
    (Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe")
  )
  $csc = $cscCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $csc) {
    throw "IExpress did not create an installer and the C# compiler was not found."
  }

  $source = @'
using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using Microsoft.Win32;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows.Forms;

internal sealed class InstallerForm : Form
{
    private readonly TextBox installPath;
    private readonly TextBox cachePath;
    private readonly TextBox logBox;
    private readonly Button installButton;

    public InstallerForm()
    {
        InstallDefaults defaults = ReadInstallDefaults();

        Text = "cc infinite canvas installer";
        Width = 720;
        Height = 500;
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;

        Label title = new Label();
        title.Text = "cc infinite canvas";
        title.Font = new Font(FontFamily.GenericSansSerif, 16, FontStyle.Bold);
        title.Left = 18;
        title.Top = 16;
        title.Width = 660;
        title.Height = 30;
        Controls.Add(title);

        Label status = new Label();
        status.Text = defaults.HasExistingInstall
            ? "Existing installation detected. Installing to this location will update it in place."
            : "Choose installation folders. Drive roots are not allowed.";
        status.Left = 18;
        status.Top = 50;
        status.Width = 666;
        status.Height = 20;
        Controls.Add(status);

        installPath = AddPathRow("Install location", defaults.InstallPath, 82);
        cachePath = AddPathRow("File cache location", defaults.CachePath, 142);

        installButton = new Button();
        installButton.Text = "Install";
        installButton.Left = 18;
        installButton.Top = 204;
        installButton.Width = 110;
        installButton.Height = 34;
        installButton.Click += delegate { RunInstall(); };
        Controls.Add(installButton);

        logBox = new TextBox();
        logBox.Left = 18;
        logBox.Top = 254;
        logBox.Width = 666;
        logBox.Height = 190;
        logBox.Multiline = true;
        logBox.ScrollBars = ScrollBars.Vertical;
        logBox.ReadOnly = true;
        logBox.Font = new Font(FontFamily.GenericMonospace, 9);
        Controls.Add(logBox);
    }

    private TextBox AddPathRow(string labelText, string defaultValue, int top)
    {
        Label label = new Label();
        label.Text = labelText;
        label.Left = 18;
        label.Top = top;
        label.Width = 180;
        label.Height = 20;
        Controls.Add(label);

        TextBox box = new TextBox();
        box.Left = 18;
        box.Top = top + 22;
        box.Width = 560;
        box.Text = defaultValue;
        Controls.Add(box);

        Button browse = new Button();
        browse.Text = "Browse";
        browse.Left = 590;
        browse.Top = top + 20;
        browse.Width = 94;
        browse.Height = 26;
        browse.Click += delegate
        {
            using (FolderBrowserDialog dialog = new FolderBrowserDialog())
            {
                dialog.SelectedPath = box.Text;
                if (dialog.ShowDialog(this) == DialogResult.OK)
                {
                    box.Text = dialog.SelectedPath;
                }
            }
        };
        Controls.Add(browse);

        return box;
    }

    private sealed class InstallDefaults
    {
        public string InstallPath;
        public string CachePath;
        public bool HasExistingInstall;
    }

    private static InstallDefaults ReadInstallDefaults()
    {
        InstallDefaults defaults = new InstallDefaults();
        defaults.InstallPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ccInfiniteCanvas");
        defaults.CachePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "ccInfiniteCanvasCache");

        try
        {
            using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\ccInfiniteCanvas"))
            {
                if (key != null)
                {
                    string installLocation = TryNormalizePath(Convert.ToString(key.GetValue("InstallLocation")));
                    if (installLocation.Length > 0)
                    {
                        defaults.InstallPath = installLocation;
                        defaults.HasExistingInstall = true;
                    }

                    string cacheLocation = TryNormalizePath(Convert.ToString(key.GetValue("CacheLocation")));
                    if (cacheLocation.Length > 0)
                    {
                        defaults.CachePath = cacheLocation;
                    }
                }
            }
        }
        catch { }

        ApplyInstallInfo(defaults, defaults.InstallPath);
        return defaults;
    }

    private static void ApplyInstallInfo(InstallDefaults defaults, string installPath)
    {
        string safeInstallPath = TryNormalizePath(installPath);
        if (safeInstallPath.Length == 0) return;

        string infoPath = Path.Combine(safeInstallPath, "install-info.json");
        if (!File.Exists(infoPath)) return;

        try
        {
            string json = File.ReadAllText(infoPath, Encoding.UTF8);
            string storedInstallPath = TryNormalizePath(ReadJsonString(json, "installDir"));
            if (storedInstallPath.Length > 0)
            {
                defaults.InstallPath = storedInstallPath;
                defaults.HasExistingInstall = true;
            }

            string storedCachePath = TryNormalizePath(ReadJsonString(json, "cacheDir"));
            if (storedCachePath.Length > 0)
            {
                defaults.CachePath = storedCachePath;
            }
        }
        catch { }
    }

    private static string ReadJsonString(string json, string key)
    {
        Match match = Regex.Match(
            json,
            "\"" + Regex.Escape(key) + "\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\"",
            RegexOptions.IgnoreCase
        );
        if (!match.Success) return "";

        try
        {
            return Regex.Unescape(match.Groups[1].Value);
        }
        catch
        {
            return match.Groups[1].Value.Replace("\\\\", "\\").Replace("\\\"", "\"");
        }
    }

    private static string TryNormalizePath(string value)
    {
        if (String.IsNullOrWhiteSpace(value)) return "";

        try
        {
            string full = Path.GetFullPath(Environment.ExpandEnvironmentVariables(value.Trim()));
            if (IsDriveRoot(full)) return "";
            return full;
        }
        catch
        {
            return "";
        }
    }

    private void RunInstall()
    {
        string installDir;
        string cacheDir;
        try
        {
            installDir = Path.GetFullPath(Environment.ExpandEnvironmentVariables(installPath.Text.Trim()));
            cacheDir = Path.GetFullPath(Environment.ExpandEnvironmentVariables(cachePath.Text.Trim()));
            ValidatePath(installDir, "Install location");
            ValidatePath(cacheDir, "File cache location");
        }
        catch (Exception ex)
        {
            MessageBox.Show(this, ex.Message, Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return;
        }

        installButton.Enabled = false;
        logBox.Clear();
        AppendLog("Installing...");

        try
        {
            string tempDir = Path.Combine(Path.GetTempPath(), "YunwuCanvasInstaller-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(tempDir);
            try
            {
                string zipPath = Path.Combine(tempDir, "YunwuImageCanvas.zip");
                string scriptPath = Path.Combine(tempDir, "Install-YunwuCanvas.ps1");
                ExtractResource("YunwuImageCanvas.zip", zipPath);
                ExtractResource("Install-YunwuCanvas.ps1", scriptPath);

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments =
                    "-NoProfile -ExecutionPolicy Bypass -File \"" + scriptPath + "\"" +
                    " -InstallDir \"" + EscapeArgument(installDir) + "\"" +
                    " -CacheDir \"" + EscapeArgument(cacheDir) + "\"" +
                    " -Quiet";
                psi.WorkingDirectory = tempDir;
                psi.UseShellExecute = false;
                psi.CreateNoWindow = true;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.StandardOutputEncoding = Encoding.UTF8;
                psi.StandardErrorEncoding = Encoding.UTF8;

                using (Process process = new Process())
                {
                    process.StartInfo = psi;
                    process.OutputDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) AppendLog(e.Data); };
                    process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) AppendLog(e.Data); };
                    process.Start();
                    process.BeginOutputReadLine();
                    process.BeginErrorReadLine();
                    process.WaitForExit();
                    if (process.ExitCode != 0)
                    {
                        throw new InvalidOperationException("Installer exited with code " + process.ExitCode + ".");
                    }
                }
            }
            finally
            {
                try { if (Directory.Exists(tempDir)) Directory.Delete(tempDir, true); } catch { }
            }

            AppendLog("Done.");
            MessageBox.Show(this, "Installation completed.", Text, MessageBoxButtons.OK, MessageBoxIcon.Information);
            Close();
        }
        catch (Exception ex)
        {
            AppendLog("ERROR: " + ex.Message);
            MessageBox.Show(this, ex.Message, Text, MessageBoxButtons.OK, MessageBoxIcon.Error);
            installButton.Enabled = true;
        }
    }

    private void AppendLog(string line)
    {
        if (InvokeRequired)
        {
            BeginInvoke(new Action<string>(AppendLog), line);
            return;
        }
        logBox.AppendText(line + Environment.NewLine);
    }

    private static void ValidatePath(string path, string label)
    {
        if (IsDriveRoot(path))
        {
            throw new InvalidOperationException(label + " must not be a drive root.");
        }
    }

    private static bool IsDriveRoot(string path)
    {
        string full = Path.GetFullPath(path).TrimEnd('\\');
        string root = Path.GetPathRoot(full).TrimEnd('\\');
        return String.Equals(full, root, StringComparison.OrdinalIgnoreCase);
    }

    private static string EscapeArgument(string value)
    {
        return value.Replace("\"", "\\\"");
    }

    private static void ExtractResource(string resourceName, string destination)
    {
        Assembly assembly = Assembly.GetExecutingAssembly();
        using (Stream input = assembly.GetManifestResourceStream(resourceName))
        {
            if (input == null) throw new InvalidOperationException("Missing installer resource: " + resourceName);
            using (FileStream output = File.Create(destination))
            {
                input.CopyTo(output);
            }
        }
    }
}

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new InstallerForm());
    }
}
'@

  Set-Content -LiteralPath $csharpInstaller -Value $source -Encoding ASCII
  $compileArgs = @(
    "/nologo",
    "/target:winexe",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Drawing.dll",
    "/out:$installerTempPath",
    "/resource:$payloadZip,YunwuImageCanvas.zip",
    "/resource:$installScript,Install-YunwuCanvas.ps1"
  )
  if (Test-Path $installerIcon) {
    $compileArgs += "/win32icon:$installerIcon"
  }
  $compileArgs += $csharpInstaller
  & $csc @compileArgs

  if (-not (Test-Path $installerTempPath)) {
    throw "C# installer was not created: $installerTempPath"
  }
}

Assert-UnderRoot $dist $root
Assert-UnderRoot $iexpressRoot $env:TEMP

if (Test-Path $dist) {
  Remove-Item -LiteralPath $dist -Recurse -Force
}
if (Test-Path $iexpressRoot) {
  Remove-Item -LiteralPath $iexpressRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $payloadRoot -Force | Out-Null
New-Item -ItemType Directory -Path $iexpressRoot -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $payloadRoot "tools") -Force | Out-Null

$files = @(
  "server.js",
  "package.json",
  "package-lock.json",
  "README.md",
  "SETUP.md",
  ".env.local.example",
  "YunwuCanvas.cmd",
  "YunwuCanvasDesktop.cmd",
  "Uninstall.cmd"
)

foreach ($file in $files) {
  $source = Join-Path $root $file
  if (Test-Path $source) {
    Copy-Item -LiteralPath $source -Destination (Join-Path $payloadRoot $file) -Force
  }
}

Copy-Item -LiteralPath (Join-Path $root "public") -Destination (Join-Path $payloadRoot "public") -Recurse -Force
if (Test-Path (Join-Path $root "skills")) {
  Copy-Item -LiteralPath (Join-Path $root "skills") -Destination (Join-Path $payloadRoot "skills") -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $root "electron-main.cjs") -Destination (Join-Path $payloadRoot "electron-main.cjs") -Force
Copy-Item -LiteralPath (Join-Path $root "electron-preload.cjs") -Destination (Join-Path $payloadRoot "electron-preload.cjs") -Force
Copy-Item -LiteralPath (Join-Path $root "tools\start-yunwu-canvas.ps1") -Destination (Join-Path $payloadRoot "tools\start-yunwu-canvas.ps1") -Force
Copy-Item -LiteralPath (Join-Path $root "tools\start-yunwu-canvas-desktop.ps1") -Destination (Join-Path $payloadRoot "tools\start-yunwu-canvas-desktop.ps1") -Force
Copy-Item -LiteralPath (Join-Path $root "tools\uninstall-yunwu-canvas.ps1") -Destination (Join-Path $payloadRoot "tools\uninstall-yunwu-canvas.ps1") -Force

$electronDist = Join-Path $root "node_modules\electron\dist"
if (-not (Test-Path (Join-Path $electronDist "electron.exe"))) {
  throw "Electron runtime was not found. Run npm.cmd install before building the installer."
}
New-Item -ItemType Directory -Path (Join-Path $payloadRoot "runtime") -Force | Out-Null
Copy-Item -LiteralPath $electronDist -Destination (Join-Path $payloadRoot "runtime\electron") -Recurse -Force

Assert-NoLocalDataInPayload
Compress-Archive -Path (Join-Path $payloadRoot "*") -DestinationPath $payloadZip -Force
Copy-Item -LiteralPath (Join-Path $root "tools\install-yunwu-canvas.ps1") -Destination $installScript -Force

$sed = @"
[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles

[SourceFiles]
SourceFiles0=$iexpressRoot\

[SourceFiles0]
%FILE0%=
%FILE1%=

[Strings]
InstallPrompt=
DisplayLicense=
FinishMessage=cc infinite canvas has been installed.
TargetName=$installerTempPath
FriendlyName=cc infinite canvas
AppLaunched=powershell.exe -NoProfile -ExecutionPolicy Bypass -File Install-YunwuCanvas.ps1
PostInstallCmd=<None>
FILE0=YunwuImageCanvas.zip
FILE1=Install-YunwuCanvas.ps1
"@

Set-Content -LiteralPath $sedPath -Value $sed -Encoding ASCII

$installerBuilt = $false
try {
  Build-CSharpInstaller
  $installerBuilt = $true
} catch {
  Write-Host "C# installer was not created; falling back to IExpress. $($_.Exception.Message)"
}

if (-not $installerBuilt) {
  $iexpress = Join-Path $env:SystemRoot "System32\iexpress.exe"
  if (-not (Test-Path $iexpress)) {
    throw "IExpress was not found at $iexpress"
  }

  $iexpressProcess = Start-Process -FilePath $iexpress -ArgumentList @("/N", "/Q", $sedPath) -Wait -PassThru
  if ($iexpressProcess.ExitCode -ne 0) {
    throw "IExpress failed with exit code $($iexpressProcess.ExitCode)."
  }

  if (-not (Test-Path $installerTempPath)) {
    throw "IExpress did not create an installer."
  }
}

Copy-Item -LiteralPath $installerTempPath -Destination $installerPath -Force
Write-Host "Installer created: $installerPath"
