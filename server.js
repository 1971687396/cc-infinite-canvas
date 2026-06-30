import http from "node:http";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageInfo = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8"));
const publicDir = path.join(__dirname, "public");
const skillsDir = path.join(__dirname, "skills");
const outputDir = path.join(__dirname, "outputs");
const cacheDir = path.join(__dirname, "cache");
const assetCacheDir = path.join(cacheDir, "assets");
const projectCacheFile = path.join(cacheDir, "project.json");
const defaultCacheDir = cacheDir;
const envFile = path.join(__dirname, ".env.local");
const grokKeyModel = "grok-image-image";
const grsaiDefaultBaseUrl = "https://grsaiapi.com";
const grsaiGenerateEndpoint = "/v1/api/generate";
const grsaiResultEndpoint = "/v1/api/result";
const grsaiDefaultModel = "nano-banana-2";
const dreaminaDownloadBase = "https://lf3-static.bytednsdoc.com/obj/eden-cn/psj_hupthlyk/ljhwZthlaukjlkulzlp/dreamina_cli_beta";
const dreaminaSkillUrl = `${dreaminaDownloadBase}/SKILL.md`;
const dreaminaVersionUrl = "https://lf3-static.bytednsdoc.com/obj/eden-cn/psj_hupthlyk/ljhwZthlaukjlkulzlp/version.json";
const dreaminaWindowsBinaryUrl = `${dreaminaDownloadBase}/dreamina_cli_windows_amd64.exe`;
const dreaminaModelVersions = new Set(["3.0", "3.1", "4.0", "4.1", "4.5", "4.6", "4.7", "5.0"]);
const dreaminaRatios = new Set(["21:9", "16:9", "3:2", "4:3", "1:1", "3:4", "2:3", "9:16"]);
const dreaminaVideoModelVersions = new Set(["seedance2.0", "seedance2.0fast", "seedance2.0_vip", "seedance2.0fast_vip", "seedance2.0mini"]);
const dreaminaVideoRatios = new Set(["1:1", "3:4", "16:9", "4:3", "9:16", "21:9"]);
const dreaminaVideoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v"]);
const maxMultipartBytes = 512 * 1024 * 1024;
const assistantDefaultModel = "gpt-5.5";
const modelKeyModels = ["gpt-image-2", "grok-image-image", assistantDefaultModel];
const serverHost = "127.0.0.1";

loadEnvFile(envFile);

const config = {
  port: Number(process.env.PORT || 3000),
  version: packageInfo.version || "0.0.0",
  updateRepo: process.env.CC_CANVAS_UPDATE_REPO || "1971687396/cc-infinite-canvas",
  apiKey: process.env.YUNWU_API_KEY || "",
  grsaiApiKey: process.env.GRSAI_API_KEY || "",
  baseUrl: process.env.YUNWU_BASE_URL || "https://yunwu.ai",
  imageEndpoint: process.env.YUNWU_IMAGE_ENDPOINT || "/v1/images/generations",
  editEndpoint: process.env.YUNWU_EDIT_ENDPOINT || "/v1/images/edits",
  chatEndpoint: process.env.YUNWU_CHAT_ENDPOINT || "/v1/chat/completions",
  defaultModel: process.env.YUNWU_DEFAULT_MODEL || "gpt-image-2",
  assistantModel: process.env.YUNWU_ASSISTANT_MODEL || assistantDefaultModel,
  modelApiKeys: loadModelApiKeys(),
  cacheDir: sanitizeCacheDir(process.env.CC_CANVAS_CACHE_DIR || process.env.YUNWU_CACHE_DIR || defaultCacheDir, defaultCacheDir)
};

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".gif", "image/gif"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".mp4", "video/mp4"],
  [".mov", "video/quicktime"],
  [".webm", "video/webm"],
  [".m4v", "video/x-m4v"]
]);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/config") {
      return sendJson(res, 200, {
        ...publicSettings(),
        projectCache: "cache/canvases/<projectId>/project.json"
      });
    }

    if (req.method === "GET" && url.pathname === "/api/settings") {
      return sendJson(res, 200, publicSettings());
    }

    if (req.method === "POST" && url.pathname === "/api/settings") {
      return await handleSaveSettings(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/dreamina/status") {
      return await handleDreaminaStatus(res);
    }

    if (req.method === "POST" && url.pathname === "/api/dreamina/install") {
      return await handleDreaminaInstall(res);
    }

    if (req.method === "POST" && url.pathname === "/api/dreamina/login") {
      return await handleDreaminaLogin(res);
    }

    if (req.method === "GET" && url.pathname === "/api/update/check") {
      return await handleUpdateCheck(res);
    }

    if (req.method === "GET" && url.pathname === "/api/update/download") {
      return await handleUpdateDownload(res, url);
    }

    if (req.method === "GET" && url.pathname === "/api/projects") {
      return await handleListProjects(res);
    }

    if (req.method === "GET" && url.pathname === "/api/project") {
      return await handleGetProject(res, url);
    }

    if (req.method === "PUT" && url.pathname === "/api/project") {
      return await handleSaveProject(req, res, url);
    }

    if (req.method === "POST" && url.pathname === "/api/cache-assets") {
      return await handleCacheAssets(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/generate") {
      return await handleGenerate(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/assistant/chat") {
      return await handleAssistantChat(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/assistant/skills") {
      return await handleAssistantBuiltInSkills(res);
    }

    if (req.method === "GET" && url.pathname.startsWith("/outputs/")) {
      return await serveFile(res, path.join(__dirname, decodeURIComponent(url.pathname)));
    }

    if (req.method === "GET" && url.pathname.startsWith("/cache/assets/")) {
      return await serveFile(res, path.join(__dirname, decodeURIComponent(url.pathname)));
    }

    if (req.method === "GET" && url.pathname.startsWith("/project-cache/")) {
      return await serveProjectCacheFile(res, url.pathname);
    }

    if (req.method === "GET") {
      const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
      return await serveFile(res, path.join(publicDir, decodeURIComponent(requestedPath)));
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected server error" });
  }
});

let usedPortFallback = false;
server.on("error", (error) => {
  if (error?.code === "EADDRINUSE" && config.port !== 0 && !usedPortFallback) {
    usedPortFallback = true;
    console.warn(`Port ${config.port} is unavailable. Selecting another local port.`);
    server.listen(0, serverHost);
    return;
  }
  throw error;
});
server.on("listening", logServerAddress);
server.listen(config.port, serverHost);

function logServerAddress() {
  const address = server.address();
  const activePort = typeof address === "object" && address ? address.port : config.port;
  console.log(`cc无限画布 is running at http://${serverHost}:${activePort}`);
}

export { server };

function publicSettings() {
  return {
    hasApiKey: Boolean(config.apiKey),
    hasGrsaiApiKey: Boolean(config.grsaiApiKey),
    hasAnyKey: hasAnyApiKey(),
    baseUrl: config.baseUrl,
    imageEndpoint: config.imageEndpoint,
    editEndpoint: config.editEndpoint,
    chatEndpoint: config.chatEndpoint,
    defaultModel: config.defaultModel,
    assistantModel: config.assistantModel,
    modelKeys: publicModelKeyStatus(),
    cacheDir: config.cacheDir,
    version: config.version,
    updateRepo: config.updateRepo
  };
}

function hasAnyApiKey() {
  return Boolean(config.apiKey) || Boolean(config.grsaiApiKey) || Object.values(config.modelApiKeys || {}).some(Boolean);
}

function loadModelApiKeys() {
  return Object.fromEntries(
    modelKeyModels.map((model) => [normalizeModelName(model), process.env[modelKeyEnvName(model)] || ""])
  );
}

function normalizeModelName(model) {
  return String(model || "").trim().toLowerCase();
}

function modelKeyEnvName(model) {
  return `YUNWU_MODEL_KEY_${normalizeModelName(model).toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
}

function publicModelKeyStatus() {
  return Object.fromEntries(modelKeyModels.map((model) => {
    const normalizedModel = normalizeModelName(model);
    return [normalizedModel, Boolean(config.modelApiKeys[normalizedModel])];
  }));
}

function mergeModelApiKeys(body) {
  const next = { ...config.modelApiKeys };
  const submitted = isPlainObject(body.modelApiKeys) ? body.modelApiKeys : {};
  for (const model of modelKeyModels) {
    const normalizedModel = normalizeModelName(model);
    const value = sanitizeOptionalText(submitted[normalizedModel]);
    if (value) next[normalizedModel] = value;
  }
  return next;
}

function apiKeyForModel(model) {
  if (isGrsaiImageModel(model)) return config.grsaiApiKey;
  return config.modelApiKeys[modelKeyBucket(model)] || config.apiKey;
}

function modelKeyBucket(model) {
  const normalizedModel = normalizeModelName(model || config.defaultModel);
  if (isGrokImageModel(normalizedModel)) return grokKeyModel;
  if (normalizedModel === assistantDefaultModel || normalizedModel.startsWith(`${assistantDefaultModel}-`)) return assistantDefaultModel;
  return normalizedModel;
}

function isGrokImageModel(model) {
  const normalized = normalizeModelName(model);
  return normalized.startsWith("grok-") && (normalized === "grok-image-image" || normalized.includes("-image"));
}

function isGrsaiImageModel(model) {
  return normalizeModelName(model).startsWith("nano-banana");
}

function isDreaminaImageModel(model) {
  const normalized = normalizeModelName(model);
  return normalized.startsWith("dreamina-") && !normalized.startsWith("dreamina-video-");
}

function isDreaminaVideoModel(model) {
  return normalizeModelName(model).startsWith("dreamina-video-");
}

function applyModelRequestDefaults(payload, mode = "create") {
  if (isGrsaiImageModel(payload.model)) return applyGrsaiRequestDefaults(payload);
  if (!isGrokImageModel(payload.model)) return payload;

  if (mode === "create") {
    if (!payload.response_format) payload.response_format = "url";
    if (!payload.size || payload.size === "auto") payload.size = "960x960";
    delete payload.format;
    return payload;
  }

  if (payload.size === "auto") delete payload.size;
  return payload;
}

function applyGrsaiRequestDefaults(payload) {
  const size = parseGrsaiSize(payload.size);
  delete payload.n;
  delete payload.size;
  delete payload.quality;
  delete payload.format;
  delete payload.response_format;
  payload.aspectRatio = payload.aspectRatio || size.aspectRatio;
  payload.imageSize = payload.imageSize || size.imageSize;
  payload.replyType = payload.replyType || "json";
  if (!Array.isArray(payload.images)) payload.images = [];
  return payload;
}

function parseGrsaiSize(sizeValue) {
  const raw = String(sizeValue || "").trim();
  if (!raw || raw === "auto") return { aspectRatio: "auto", imageSize: "1K" };

  const compact = raw.replace(/\s/g, "");
  const [ratioPart, imageSizePart] = compact.split(/[|@]/);
  if (/^\d+:\d+$/.test(ratioPart)) {
    return {
      aspectRatio: ratioPart,
      imageSize: normalizeGrsaiImageSize(imageSizePart) || "1K"
    };
  }

  const pixelMatch = compact.match(/^(\d+)x(\d+)$/i);
  if (!pixelMatch) return { aspectRatio: "auto", imageSize: normalizeGrsaiImageSize(raw) || "1K" };

  const width = Number(pixelMatch[1]);
  const height = Number(pixelMatch[2]);
  return {
    aspectRatio: pixelSizeToAspectRatio(width, height),
    imageSize: pixelSizeToGrsaiImageSize(width, height)
  };
}

function normalizeGrsaiImageSize(value) {
  const clean = String(value || "").trim().toUpperCase();
  return ["1K", "2K", "4K"].includes(clean) ? clean : "";
}

function pixelSizeToAspectRatio(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return "auto";
  const divisor = gcd(Math.round(width), Math.round(height));
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function pixelSizeToGrsaiImageSize(width, height) {
  const longest = Math.max(Number(width) || 0, Number(height) || 0);
  if (longest >= 2800) return "4K";
  if (longest >= 1700) return "2K";
  return "1K";
}

function gcd(a, b) {
  while (b) {
    const next = a % b;
    a = b;
    b = next;
  }
  return Math.max(a, 1);
}

function missingKeyMessage(model) {
  if (isGrsaiImageModel(model)) {
    return `Grsai API key is not configured for model ${model || grsaiDefaultModel}. Set it in Settings.`;
  }
  return `API key is not configured for model ${model || config.defaultModel}. Set a platform key or a model-specific key in Settings.`;
}

async function handleUpdateCheck(res) {
  const currentVersion = normalizeVersion(config.version);
  const repo = sanitizeRepoName(config.updateRepo);
  if (!repo) {
    return sendJson(res, 500, { error: "Update repository is not configured." });
  }

  const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;
  let response;
  try {
    response = await fetch(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": `cc-infinite-canvas/${config.version}`
      },
      signal: AbortSignal.timeout(30000)
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: `Unable to connect to GitHub Releases: ${error.message || error}`,
      repo,
      currentVersion
    });
  }

  if (response.status === 404) {
    return sendJson(res, 200, {
      repo,
      currentVersion,
      hasRelease: false,
      hasUpdate: false,
      message: "GitHub Releases 里还没有发布版本。"
    });
  }

  const text = await response.text();
  const release = tryParseJson(text);
  if (!response.ok) {
    return sendJson(res, response.status, {
      error: readUpstreamError(release, text) || "GitHub update check failed.",
      repo,
      currentVersion
    });
  }

  const latestVersion = normalizeVersion(release.tag_name || release.name || "");
  const asset = selectReleaseAsset(release.assets || []);
  sendJson(res, 200, {
    repo,
    currentVersion,
    latestVersion,
    hasRelease: true,
    hasUpdate: compareVersions(latestVersion, currentVersion) > 0,
    releaseName: release.name || release.tag_name || latestVersion,
    releaseUrl: release.html_url || `https://github.com/${repo}/releases/latest`,
    publishedAt: release.published_at || "",
    body: release.body || "",
    asset,
    checkedAt: new Date().toISOString()
  });
}

function sanitizeRepoName(value) {
  const repo = String(value || "").trim();
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ? repo : "";
}

function selectReleaseAsset(assets) {
  const candidates = assets
    .filter((asset) => asset?.browser_download_url && asset?.name)
    .map((asset) => ({
      name: asset.name,
      size: asset.size || 0,
      downloadUrl: asset.browser_download_url,
      contentType: asset.content_type || ""
    }));

  return (
    candidates.find((asset) => /\.exe$/i.test(asset.name)) ||
    candidates.find((asset) => /\.zip$/i.test(asset.name)) ||
    candidates[0] ||
    null
  );
}

async function handleUpdateDownload(res, requestUrl) {
  let assetUrl;
  let filename;
  try {
    assetUrl = validateUpdateAssetUrl(requestUrl.searchParams.get("url"));
    filename = sanitizeDownloadFilename(requestUrl.searchParams.get("name") || path.basename(new URL(assetUrl).pathname));
  } catch (error) {
    return sendJson(res, 400, { error: error.message || "Invalid update download URL." });
  }

  let upstream;
  try {
    upstream = await fetch(assetUrl, {
      headers: {
        Accept: "application/octet-stream",
        "User-Agent": `cc-infinite-canvas/${config.version}`
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10 * 60 * 1000)
    });
  } catch (error) {
    return sendJson(res, 502, { error: `Unable to download update: ${error.message || error}` });
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return sendJson(res, upstream.status || 502, {
      error: readUpstreamError(tryParseJson(text), text) || `Update download failed with HTTP ${upstream.status}.`
    });
  }

  const headers = {
    "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
    "Access-Control-Expose-Headers": "Content-Length, Content-Disposition"
  };
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers["Content-Length"] = contentLength;
  res.writeHead(200, headers);

  try {
    for await (const chunk of upstream.body) {
      if (!res.write(Buffer.from(chunk))) {
        await new Promise((resolve) => res.once("drain", resolve));
      }
    }
    res.end();
  } catch (error) {
    res.destroy(error);
  }
}

function validateUpdateAssetUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("更新文件地址为空。");

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("更新文件地址无效。");
  }

  const repo = sanitizeRepoName(config.updateRepo).toLowerCase();
  const pathname = decodeURIComponent(parsed.pathname).toLowerCase();
  if (parsed.protocol !== "https:" || parsed.hostname.toLowerCase() !== "github.com") {
    throw new Error("只允许下载 GitHub Release 附件。");
  }
  if (!repo || !pathname.startsWith(`/${repo}/releases/download/`)) {
    throw new Error("更新文件不属于当前配置的 GitHub 仓库。");
  }
  return parsed.href;
}

function sanitizeDownloadFilename(value) {
  const name = String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/gu, "_")
    .replace(/^\.+/u, "")
    .trim()
    .slice(0, 120);
  return name || "cc-infinite-canvas-update.exe";
}

function normalizeVersion(value) {
  return String(value || "0.0.0").trim().replace(/^v/i, "") || "0.0.0";
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const diff = (left[index] || 0) - (right[index] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function versionParts(value) {
  return normalizeVersion(value)
    .split(/[.+-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

async function handleSaveSettings(req, res) {
  const body = await readJsonBody(req);
  const nextSettings = {
    apiKey: sanitizeOptionalText(body.apiKey) || config.apiKey,
    grsaiApiKey: sanitizeOptionalText(body.grsaiApiKey) || config.grsaiApiKey,
    baseUrl: sanitizeOptionalText(body.baseUrl) || config.baseUrl,
    imageEndpoint: sanitizeOptionalText(body.imageEndpoint) || config.imageEndpoint,
    editEndpoint: sanitizeOptionalText(body.editEndpoint) || config.editEndpoint,
    chatEndpoint: sanitizeOptionalText(body.chatEndpoint) || config.chatEndpoint,
    defaultModel: sanitizeOptionalText(body.defaultModel) || config.defaultModel,
    assistantModel: sanitizeOptionalText(body.assistantModel) || config.assistantModel,
    modelApiKeys: mergeModelApiKeys(body),
    cacheDir: sanitizeCacheDir(body.cacheDir, config.cacheDir)
  };

  config.apiKey = nextSettings.apiKey;
  config.grsaiApiKey = nextSettings.grsaiApiKey;
  config.baseUrl = nextSettings.baseUrl;
  config.imageEndpoint = nextSettings.imageEndpoint;
  config.editEndpoint = nextSettings.editEndpoint;
  config.chatEndpoint = nextSettings.chatEndpoint;
  config.defaultModel = nextSettings.defaultModel;
  config.assistantModel = nextSettings.assistantModel;
  config.modelApiKeys = nextSettings.modelApiKeys;
  config.cacheDir = nextSettings.cacheDir;

  await writeSettingsEnv(nextSettings);
  sendJson(res, 200, publicSettings());
}

async function handleDreaminaStatus(res) {
  const status = await readDreaminaStatus();
  sendJson(res, status.installed ? 200 : 404, status);
}

async function handleDreaminaInstall(res) {
  try {
    if (process.platform === "win32") {
      const result = await installDreaminaWindows();
      return sendJson(res, 200, {
        ok: true,
        ...result,
        message: `即梦 CLI 已安装到 ${result.executable}，现在可以点击“登录即梦”。`
      });
    }

    await launchDreaminaTerminal(dreaminaInstallCommand(), "cc infinite canvas - Install Dreamina CLI");
    sendJson(res, 202, {
      ok: true,
      message: "已打开即梦 CLI 安装窗口，安装完成后回到这里点击“登录即梦”或“测试连接”。"
    });
  } catch (error) {
    sendJson(res, 500, { error: dreaminaErrorMessage(error) });
  }
}

async function handleDreaminaLogin(res) {
  try {
    const status = await readDreaminaStatus();
    if (!status.installed) {
      return sendJson(res, 404, { error: "未检测到 Dreamina CLI，请先点击“安装即梦 CLI”。" });
    }

    const executable = await dreaminaShellExecutable();
    await launchDreaminaTerminal(dreaminaLoginCommand(executable), "cc infinite canvas - Dreamina Login");
    sendJson(res, 202, {
      ok: true,
      message: "已打开即梦登录窗口，登录完成后回到这里点击“测试连接”。"
    });
  } catch (error) {
    sendJson(res, 500, { error: dreaminaErrorMessage(error) });
  }
}

async function readDreaminaStatus() {
  let version = "";
  let buildVersion = "";
  try {
    const versionResult = await runDreamina(["version"], { timeoutMs: 20000 });
    const versionData = parseDreaminaJson(versionResult.stdout);
    buildVersion = String(versionData?.version || extractDreaminaVersion(versionResult.stdout) || "");
    version = (await readDreaminaInstalledVersion()) || buildVersion;
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        installed: false,
        loggedIn: false,
        version: "",
        error: "Dreamina CLI is not installed or is not available in PATH."
      };
    }
    return { installed: true, loggedIn: false, version: "", error: dreaminaErrorMessage(error) };
  }

  try {
    const creditResult = await runDreamina(["user_credit"], { timeoutMs: 30000 });
    const credit = parseDreaminaJson(creditResult.stdout);
    return {
      installed: true,
      loggedIn: true,
      version,
      buildVersion,
      totalCredit: Number.isFinite(Number(credit?.total_credit)) ? Number(credit.total_credit) : null,
      vipLevel: String(credit?.vip_level || "")
    };
  } catch (error) {
    return {
      installed: true,
      loggedIn: false,
      version,
      buildVersion,
      error: dreaminaErrorMessage(error)
    };
  }
}

async function readDreaminaInstalledVersion() {
  try {
    const raw = await readFile(path.join(homedir(), ".dreamina_cli", "version.json"), "utf8");
    return String(JSON.parse(raw)?.version || "").trim();
  } catch {
    return "";
  }
}


function extractDreaminaVersion(text) {
  return String(text || "").match(/\b\d+\.\d+\.\d+\b/u)?.[0] || "";
}

function sanitizeOptionalText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function writeSettingsEnv(settings) {
  const updates = new Map([
    ["YUNWU_API_KEY", settings.apiKey],
    ["GRSAI_API_KEY", settings.grsaiApiKey],
    ["YUNWU_BASE_URL", settings.baseUrl],
    ["YUNWU_IMAGE_ENDPOINT", settings.imageEndpoint],
    ["YUNWU_EDIT_ENDPOINT", settings.editEndpoint],
    ["YUNWU_CHAT_ENDPOINT", settings.chatEndpoint],
    ["YUNWU_DEFAULT_MODEL", settings.defaultModel],
    ["YUNWU_ASSISTANT_MODEL", settings.assistantModel],
    [modelKeyEnvName("gpt-image-2"), settings.modelApiKeys["gpt-image-2"] || ""],
    [modelKeyEnvName("grok-image-image"), settings.modelApiKeys["grok-image-image"] || ""],
    [modelKeyEnvName(assistantDefaultModel), settings.modelApiKeys[assistantDefaultModel] || ""],
    ["CC_CANVAS_CACHE_DIR", settings.cacheDir]
  ]);
  const seen = new Set();
  let existing = "";

  try {
    existing = await readFile(envFile, "utf8");
  } catch {
    existing = "# Local settings saved by Yunwu Image Canvas\n";
  }

  const lines = existing.split(/\r?\n/);
  const nextLines = [];
  for (const line of lines) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
    const key = match?.[1];
    if (key && updates.has(key)) {
      if (!seen.has(key)) {
        nextLines.push(`${key}=${formatEnvValue(updates.get(key))}`);
      }
      seen.add(key);
      continue;
    }
    nextLines.push(line);
  }

  for (const [key, value] of updates) {
    if (!seen.has(key)) nextLines.push(`${key}=${formatEnvValue(value)}`);
  }

  await writeFile(envFile, `${nextLines.join("\n").replace(/\n+$/u, "")}\n`, "utf8");
}

function formatEnvValue(value = "") {
  const text = String(value);
  if (!text) return "";
  if (/[\s#"']/u.test(text)) return `"${text.replace(/"/g, '\\"')}"`;
  return text;
}

function resolveConfiguredPath(value) {
  const text = String(value || "").trim();
  if (!text) return defaultCacheDir;
  return path.resolve(text);
}

function sanitizeCacheDir(value, fallback) {
  const text = sanitizeOptionalText(value);
  if (!text) return fallback;

  const resolved = resolveConfiguredPath(text);
  if (isFilesystemRoot(resolved)) {
    throw new Error("缓存位置不能设置为磁盘根目录。");
  }
  return resolved;
}

function isFilesystemRoot(candidate) {
  const resolved = path.resolve(candidate);
  const parsed = path.parse(resolved);
  return resolved.toLowerCase() === parsed.root.toLowerCase();
}

function isPathInside(candidate, root) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  return !relative || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function normalizeProjectId(value) {
  const text = String(value || "").trim();
  const safe = text
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return safe || "default";
}

function projectIdFromUrl(url) {
  return normalizeProjectId(url.searchParams.get("projectId") || "default");
}

function projectDir(projectId) {
  return path.join(config.cacheDir, "canvases", normalizeProjectId(projectId));
}

function projectFile(projectId) {
  return path.join(projectDir(projectId), "project.json");
}

function projectOutputDir(projectId) {
  return path.join(projectDir(projectId), "outputs");
}

function projectAssetDir(projectId) {
  return path.join(projectDir(projectId), "assets");
}

function projectPublicPath(projectId, kind, filename) {
  return `/project-cache/${encodeURIComponent(normalizeProjectId(projectId))}/${kind}/${encodeURIComponent(filename)}`;
}

async function handleGenerate(req, res) {
  const contentType = req.headers["content-type"] || "";
  const isMultipart = contentType.includes("multipart/form-data");
  const body = isMultipart ? await readMultipartBody(req, contentType) : await readJsonBody(req);
  const prompt = String(body.prompt || "").trim();

  if (!prompt) {
    return sendJson(res, 400, { error: "Prompt is required." });
  }

  if (body.mode === "video" || isDreaminaVideoModel(body.model)) {
    return await handleDreaminaVideoGenerate(res, body, prompt);
  }

  if (body.mode === "edit" || isMultipart) {
    return await handleEdit(res, body);
  }

  return await handleCreate(res, body, prompt);
}

async function handleAssistantChat(req, res) {
  const body = await readJsonBody(req, { maxBytes: 16 * 1024 * 1024 });
  const model = sanitizeOptionalText(body.model) || config.assistantModel || assistantDefaultModel;
  const messages = normalizeAssistantMessages(body.messages);
  const mode = sanitizeOptionalText(body.mode) === "action_plan" ? "action_plan" : "chat";
  if (!messages.length) {
    return sendJson(res, 400, { error: "At least one assistant message is required." });
  }

  const apiKey = apiKeyForModel(model);
  if (!apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(model) });
  }

  const context = normalizeAssistantContext(body.context);
  const payload = pruneEmpty({
    model,
    messages: buildAssistantMessages(messages, context, mode),
    temperature: Number.isFinite(Number(body.temperature)) ? Number(body.temperature) : 0.7,
    stream: false
  });
  const apiUrl = buildApiUrl(config.baseUrl, config.chatEndpoint);

  let upstream;
  const assistantAbortController = new AbortController();
  const assistantTimeoutMs = assistantRequestTimeoutMs(model, mode);
  const assistantTimeout = setTimeout(
    () => assistantAbortController.abort(new Error(`Assistant request timed out after ${Math.round(assistantTimeoutMs / 1000)}s`)),
    assistantTimeoutMs
  );
  const abortAssistantOnClose = () => {
    if (!res.writableEnded) assistantAbortController.abort(new Error("Client stopped assistant request"));
  };
  res.once("close", abortAssistantOnClose);
  try {
    upstream = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: assistantAbortController.signal
    });
  } catch (error) {
    clearTimeout(assistantTimeout);
    res.off?.("close", abortAssistantOnClose);
    if (assistantAbortController.signal.aborted && (res.writableEnded || res.destroyed)) return;
    return sendJson(res, 502, {
      error: `Assistant request failed: ${error.message || error}`,
      request: { apiUrl, model }
    });
  }

  let responseText;
  try {
    responseText = await upstream.text();
  } catch (error) {
    clearTimeout(assistantTimeout);
    res.off?.("close", abortAssistantOnClose);
    if (assistantAbortController.signal.aborted && (res.writableEnded || res.destroyed)) return;
    return sendJson(res, 502, {
      error: `Assistant response failed: ${error.message || error}`,
      request: { apiUrl, model }
    });
  }
  clearTimeout(assistantTimeout);
  res.off?.("close", abortAssistantOnClose);
  const upstreamData = tryParseJson(responseText);
  if (!upstream.ok) {
    return sendJson(res, upstream.status, {
      error: readUpstreamError(upstreamData, responseText),
      status: upstream.status,
      upstream: upstreamData
    });
  }

  const content = extractAssistantText(upstreamData);
  if (!content) {
    return sendJson(res, 502, {
      error: "Assistant response did not include text content.",
      upstream: upstreamData
    });
  }

  const plan = mode === "action_plan" ? parseAssistantPlan(content) : null;
  sendJson(res, 200, {
    message: { role: "assistant", content: plan?.summary || content },
    plan,
    model,
    usage: upstreamData.usage || null
  });
}

function assistantRequestTimeoutMs(model, mode = "chat") {
  const normalized = normalizeModelName(model);
  if (normalized === assistantDefaultModel || normalized.startsWith(`${assistantDefaultModel}-`)) {
    return 10 * 60 * 1000;
  }
  if (mode === "action_plan") return 5 * 60 * 1000;
  return 4 * 60 * 1000;
}

async function handleAssistantBuiltInSkills(res) {
  const skills = await listBuiltInAssistantSkills();
  sendJson(res, 200, { skills });
}

async function listBuiltInAssistantSkills() {
  let entries;
  try {
    entries = await readdir(skillsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillRoot = path.join(skillsDir, entry.name);
    const skillFile = await findAssistantSkillFile(skillRoot);
    if (!skillFile) continue;

    try {
      const fileStat = await stat(skillFile);
      if (!fileStat.isFile() || fileStat.size > 300 * 1024) continue;
      const text = (await readFile(skillFile, "utf8")).trim().slice(0, 120000);
      if (!text) continue;
      skills.push({
        id: `builtin-${normalizeSkillId(entry.name)}`,
        name: assistantSkillTitle(text, skillFile),
        filename: path.basename(skillFile),
        size: Buffer.byteLength(text, "utf8"),
        updatedAt: fileStat.mtime.toISOString(),
        text
      });
    } catch {
      // Ignore malformed or unreadable bundled skills.
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

async function findAssistantSkillFile(skillRoot) {
  let entries;
  try {
    entries = await readdir(skillRoot, { withFileTypes: true });
  } catch {
    return "";
  }

  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const assistantFile = files.find((name) => /_助手导入版\.md$/u.test(name));
  if (assistantFile) return path.join(skillRoot, assistantFile);
  if (files.includes("SKILL.md")) return path.join(skillRoot, "SKILL.md");
  return "";
}

function assistantSkillTitle(text, filePath) {
  const heading = text.match(/^#\s+(.+)$/mu)?.[1];
  const fallback = path.basename(filePath, path.extname(filePath)).replace(/_助手导入版$/u, "");
  return sanitizeOptionalText(heading || fallback).slice(0, 160) || "内置 Skill";
}

function normalizeSkillId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "skill";
}

function normalizeAssistantMessages(messages) {
  const source = Array.isArray(messages) ? messages : [];
  return source
    .map(normalizeAssistantMessage)
    .filter((message) => {
      if (typeof message.content === "string") return message.content.trim();
      return Array.isArray(message.content) && message.content.length;
    })
    .slice(-18);
}

function normalizeAssistantMessage(message) {
  const role = ["assistant", "system", "user"].includes(message?.role) ? message.role : "user";
  const textParts = [String(message?.content || "").trim().slice(0, 16000)];
  const imageParts = [];

  for (const attachment of normalizeAssistantAttachments(message?.attachments)) {
    if (attachment.type === "skill") {
      textParts.push(`本地 Skill：${attachment.name}\n${attachment.text}`);
    } else if (attachment.type === "image" && role === "user") {
      imageParts.push({
        type: "image_url",
        image_url: { url: attachment.dataUrl }
      });
      const meta = [
        attachment.name ? `文件：${attachment.name}` : "",
        attachment.nodeId ? `节点：${attachment.nodeId}` : "",
        attachment.model ? `模型：${attachment.model}` : "",
        attachment.prompt ? `来源提示词：${attachment.prompt}` : ""
      ].filter(Boolean);
      if (meta.length) textParts.push(`画布图片参考：${meta.join("；")}`);
    }
  }

  const text = textParts.filter(Boolean).join("\n\n").trim();
  if (!imageParts.length) return { role, content: text };
  return {
    role,
    content: [{ type: "text", text }, ...imageParts]
  };
}

function normalizeAssistantAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  const normalized = [];
  for (const attachment of attachments.slice(0, 8)) {
    if (!isPlainObject(attachment)) continue;
    if (attachment.type === "image" && typeof attachment.dataUrl === "string" && attachment.dataUrl.startsWith("data:image/")) {
      normalized.push({
        type: "image",
        name: sanitizeOptionalText(attachment.name).slice(0, 120),
        nodeId: sanitizeOptionalText(attachment.nodeId).slice(0, 120),
        model: sanitizeOptionalText(attachment.model).slice(0, 120),
        prompt: sanitizeOptionalText(attachment.prompt).slice(0, 1200),
        dataUrl: attachment.dataUrl
      });
      continue;
    }

    if (attachment.type === "skill") {
      const text = String(attachment.text || "").trim().slice(0, 60000);
      if (!text) continue;
      normalized.push({
        type: "skill",
        name: sanitizeOptionalText(attachment.name).slice(0, 160) || "local-skill",
        text
      });
    }
  }
  return normalized;
}

function normalizeAssistantContext(context) {
  if (!isPlainObject(context)) return {};
  return {
    project: isPlainObject(context.project) ? context.project : {},
    selection: Array.isArray(context.selection) ? context.selection.slice(0, 80) : [],
    canvas: isPlainObject(context.canvas) ? context.canvas : {},
    recentNodes: Array.isArray(context.recentNodes) ? context.recentNodes.slice(0, 80) : []
  };
}

function buildAssistantMessages(messages, context, mode = "chat") {
  const contextLimit = mode === "action_plan" ? 48000 : 16000;
  const contextText = JSON.stringify(context, null, 2).slice(0, contextLimit);
  const baseMessages = [
    {
      role: "system",
      content:
        "你是 cc无限画布的画布助手，帮助用户管理画布、整理节点、优化生图/生视频提示词，并给出下一步创作建议。你只能依据提供的画布上下文、节点参数、提示词和生成记录判断；如果没有图片像素内容，不要声称已经看到了图片细节。回答要简洁、具体、可执行，默认使用中文。"
    },
    {
      role: "system",
      content: `当前画布上下文 JSON：\n${contextText}`
    },
    {
      role: "system",
      content:
        "如果用户消息包含 image_url 内容块，说明用户已把画布图片导入助手，你可以结合这些图片进行视觉分析；如果没有 image_url，就只能依据文本上下文判断。"
    },
  ];

  if (mode === "action_plan") {
    baseMessages.push({
      role: "system",
      content:
        "本轮必须只返回 JSON，不要使用 Markdown。JSON 格式：{\"summary\":\"一句话说明计划\",\"actions\":[...]}。允许的 action.type 只有：create_task、create_video_task、create_note、move_node、move_nodes、organize_nodes、organize_groups、update_task、update_note、update_notes、set_node_scale。禁止删除节点、禁止直接运行生成。最多 20 个动作。坐标使用画布世界坐标，必须根据节点 width/height 留出 48px 以上间距，避免重叠。修改已有节点时必须使用上下文里的真实 id。整理、排版、对齐但不需要分类时使用 organize_nodes，不要手写大量 move_node。用户要求分类、归类、分组、按人物/道具/场景/风格/用途整理，或要求标注/标题时，优先使用 organize_groups，让你根据节点的 prompt、filename、model、sourceTaskId 和上下文判断分组；如果不确定，放入“未分类”。用户要求修改文字标注的颜色、字号、内容时使用 update_note 或 update_notes；如果目标是“选中的文字标注”，update_notes 使用 scope:\"selected\"；如果目标是“全部文字标注”，使用 scope:\"all\"；如果目标是“人物名字/标题/分组名/某类标注”等模糊对象，必须根据 note.text、上下文和选中状态自行判断并返回具体 ids，不要让前端猜。颜色优先返回 #RRGGBB，也可返回中文颜色名。create_task 字段可含 mode、prompt、model、size、n、quality、format、x、y；create_video_task 字段可含 prompt、model、size、n、quality、x、y；create_note 字段可含 text、x、y、fontSize、color、width、height；move_node 字段为 id、x、y；move_nodes 字段为 items:[{id,x,y}]；organize_nodes 字段为 ids:[id]、columns、gap、normalizeMedia、maxMediaLongSide；organize_groups 字段为 groups:[{title,ids,columns}]、originX、originY、gap、groupGap、orientation、normalizeMedia、maxMediaLongSide、labelFontSize、labelColor，其中 orientation 可为 horizontal 或 vertical，labelFontSize 建议 40-64；update_task 字段为 id、prompt、model、size、n、quality、format、mode；update_note 字段为 id、text、color、fontSize、width、height；update_notes 字段为 ids、scope、color、fontSize、width、height；set_node_scale 字段为 id、scale。"
    });
  }

  return [...baseMessages, ...messages];
}

function extractAssistantText(data) {
  const messageContent = data?.choices?.[0]?.message?.content;
  if (typeof messageContent === "string") return messageContent.trim();
  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => (typeof part === "string" ? part : part?.text || part?.content || ""))
      .join("")
      .trim();
  }
  if (typeof data?.output_text === "string") return data.output_text.trim();
  if (Array.isArray(data?.output)) {
    return data.output
      .flatMap((item) => item?.content || [])
      .map((part) => part?.text || part?.content || "")
      .join("")
      .trim();
  }
  if (typeof data?.content === "string") return data.content.trim();
  return "";
}

function parseAssistantPlan(content) {
  const parsed = tryParseAssistantJson(content);
  if (!isPlainObject(parsed)) return null;
  const actions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 20).filter(isPlainObject) : [];
  return {
    summary: sanitizeOptionalText(parsed.summary) || "已生成可执行计划，请确认后应用。",
    actions
  };
}

function tryParseAssistantJson(content) {
  const text = String(content || "").trim();
  if (!text) return null;

  try {
    return JSON.parse(stripJsonFence(text));
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(stripJsonFence(text.slice(start, end + 1)));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function stripJsonFence(text) {
  return text.replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

async function handleListProjects(res) {
  const projects = [];
  const root = path.join(config.cacheDir, "canvases");

  try {
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const id = normalizeProjectId(entry.name);
      try {
        const raw = await readFile(projectFile(id), "utf8");
        const project = JSON.parse(raw);
        projects.push({
          id,
          name: sanitizeOptionalText(project.name) || id,
          savedAt: project.savedAt || "",
          nodeCount: Array.isArray(project.nodes) ? project.nodes.length : 0
        });
      } catch {
        // Skip incomplete project directories.
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (!projects.length) {
    try {
      const raw = await readFile(projectCacheFile, "utf8");
      const project = JSON.parse(raw);
      projects.push({
        id: "default",
        name: sanitizeOptionalText(project.name) || "默认画布",
        savedAt: project.savedAt || "",
        nodeCount: Array.isArray(project.nodes) ? project.nodes.length : 0
      });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  projects.sort((a, b) => String(b.savedAt).localeCompare(String(a.savedAt)));
  sendJson(res, 200, { projects, cacheDir: config.cacheDir });
}

async function handleGetProject(res, url) {
  const projectId = projectIdFromUrl(url);
  try {
    const raw = await readFile(projectFile(projectId), "utf8");
    return sendJson(res, 200, { project: normalizeProjectRecord(JSON.parse(raw), projectId) });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (projectId === "default") {
    try {
      const raw = await readFile(projectCacheFile, "utf8");
      return sendJson(res, 200, { project: normalizeProjectRecord(JSON.parse(raw), "default") });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  sendJson(res, 200, { project: null });
}

async function handleSaveProject(req, res, url) {
  const project = await readJsonBody(req, { maxBytes: 8 * 1024 * 1024 });
  const projectId = normalizeProjectId(project.id || url.searchParams.get("projectId") || "default");
  const safeProject = normalizeProjectRecord(project, projectId);
  safeProject.savedAt = new Date().toISOString();

  await mkdir(projectDir(projectId), { recursive: true });
  await writeFile(projectFile(projectId), JSON.stringify(safeProject, null, 2), "utf8");
  sendJson(res, 200, { ok: true, project: projectSummary(safeProject), savedAt: safeProject.savedAt });
}

function normalizeProjectRecord(project, fallbackId) {
  const id = normalizeProjectId(project?.id || fallbackId || "default");
  return {
    version: 2,
    id,
    name: sanitizeOptionalText(project?.name) || "未命名画布",
    savedAt: project?.savedAt || new Date().toISOString(),
    nodes: Array.isArray(project?.nodes) ? project.nodes : [],
    viewport: isPlainObject(project?.viewport) ? project.viewport : { x: 120, y: 90, zoom: 1 },
    nextZ: Number(project?.nextZ) || 1
  };
}

function projectSummary(project) {
  return {
    id: project.id,
    name: project.name,
    savedAt: project.savedAt,
    nodeCount: Array.isArray(project.nodes) ? project.nodes.length : 0
  };
}

async function handleCacheAssets(req, res) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return sendJson(res, 400, { error: "Asset cache expects multipart/form-data." });
  }

  const body = await readMultipartBody(req, contentType);
  const projectId = normalizeProjectId(body.projectId || "default");
  const files = Array.isArray(body.files) ? body.files : [];
  const assets = [];

  await mkdir(projectAssetDir(projectId), { recursive: true });

  for (const file of files) {
    if (!["image", "mask", "video"].includes(file.name)) continue;
    const saved = await saveUploadedAsset(file, projectId);
    assets.push({
      field: file.name,
      filename: saved.filename,
      originalName: file.filename,
      contentType: file.contentType,
      path: `canvases/${projectId}/assets/${saved.filename}`,
      url: projectPublicPath(projectId, "assets", saved.filename)
    });
  }

  sendJson(res, 200, { assets });
}

async function handleCreate(res, body, prompt) {
  if (isDreaminaVideoModel(body.model || config.defaultModel)) {
    return await handleDreaminaVideoGenerate(res, body, prompt);
  }

  if (isDreaminaImageModel(body.model || config.defaultModel)) {
    return await handleDreaminaGenerate(res, body, prompt);
  }

  if (isGrsaiImageModel(body.model || config.defaultModel)) {
    return await handleGrsaiGenerate(res, body, prompt);
  }

  const projectId = normalizeProjectId(body.projectId || "default");
  const extraParams = isPlainObject(body.extraParams) ? body.extraParams : {};
  const payload = pruneEmpty({
    model: body.model || config.defaultModel,
    prompt,
    n: Number(body.n || 1),
    size: body.size,
    quality: body.quality,
    format: body.format || body.outputFormat,
    ...extraParams
  });
  applyModelRequestDefaults(payload, "create");

  const apiUrl = buildApiUrl(body.baseUrl || config.baseUrl, body.endpointPath || config.imageEndpoint);
  const apiKey = apiKeyForModel(payload.model);
  if (!apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(payload.model) });
  }
  const startedAt = Date.now();

  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseText = await upstream.text();
  const upstreamData = tryParseJson(responseText);

  if (!upstream.ok) {
    return sendJson(res, upstream.status, {
      error: readUpstreamError(upstreamData, responseText),
      status: upstream.status,
      upstream: upstreamData
    });
  }

  const images = await normalizeAndPersistImages(upstreamData, body.format || "png", projectId);

  sendJson(res, 200, {
    durationMs: Date.now() - startedAt,
    request: { apiUrl, payload: { ...payload, prompt } },
    images,
    raw: upstreamData
  });
}

async function handleGrsaiGenerate(res, body, prompt, imageFiles = []) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const extraParams = parseExtraParamsValue(body.extraParams);
  const { images: extraImages, ...extraPayload } = extraParams;
  const size = parseGrsaiSize(body.size);
  const payload = pruneEmpty({
    model: body.model || grsaiDefaultModel,
    prompt,
    images: [...normalizeGrsaiImageRefs(extraImages), ...imageFiles.map(fileToDataUrl)],
    aspectRatio: size.aspectRatio,
    imageSize: size.imageSize,
    replyType: "json",
    ...extraPayload
  });
  applyModelRequestDefaults(payload, "create");

  const apiUrl = grsaiGenerateUrl(body);
  const apiKey = apiKeyForModel(payload.model);
  if (!apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(payload.model) });
  }
  const startedAt = Date.now();

  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseText = await upstream.text();
  const upstreamData = tryParseJson(responseText);

  if (!upstream.ok) {
    return sendJson(res, upstream.status, {
      error: readUpstreamError(upstreamData, responseText),
      status: upstream.status,
      upstream: upstreamData
    });
  }

  let finalData;
  try {
    finalData = await resolveGrsaiResult(upstreamData, apiUrl, apiKey);
  } catch (error) {
    return sendJson(res, 502, {
      error: error.message || "Grsai generation failed.",
      upstream: upstreamData
    });
  }

  const images = await normalizeAndPersistImages(finalData, body.format || "png", projectId);
  if (!images.length) {
    return sendJson(res, 502, {
      error: "Grsai response did not include an image URL.",
      upstream: finalData
    });
  }

  sendJson(res, 200, {
    durationMs: Date.now() - startedAt,
    request: { apiUrl, payload: { ...payload, prompt } },
    images,
    raw: finalData
  });
}

async function handleEdit(res, body) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const files = Array.isArray(body.files) ? body.files : [];
  const uploadedImages = files.filter((file) => file.name === "image");
  const uploadedMask = files.find((file) => file.name === "mask");
  const cachedImages = await loadCachedAssets(parseCachedAssetRefs(body.cachedImages), projectId);
  const cachedMask = (await loadCachedAssets(parseCachedAssetRefs(body.cachedMask), projectId)).at(0);
  const images = [...uploadedImages, ...cachedImages];
  const modelName = body.model || config.defaultModel;
  const requestImages = isGrokImageModel(modelName) ? images.slice(0, 1) : images;
  const mask = uploadedMask || cachedMask;

  if (!requestImages.length) {
    return sendJson(res, 400, { error: "At least one image file is required for edit mode." });
  }

  if (isDreaminaImageModel(modelName)) {
    return await handleDreaminaGenerate(res, body, body.prompt, requestImages.slice(0, 10));
  }

  if (isGrsaiImageModel(modelName)) {
    return await handleGrsaiGenerate(res, body, body.prompt, requestImages);
  }

  const form = new FormData();
  for (const image of requestImages) {
    form.append("image", new Blob([image.data], { type: image.contentType }), image.filename);
  }

  if (mask?.data?.length) {
    form.append("mask", new Blob([mask.data], { type: mask.contentType }), mask.filename);
  }

  const extraParams = parseExtraParamsValue(body.extraParams);
  const fields = pruneEmpty({
    model: modelName,
    prompt: body.prompt,
    n: body.n || "1",
    size: body.size,
    quality: body.quality,
    background: body.background,
    moderation: body.moderation,
    ...extraParams
  });
  applyModelRequestDefaults(fields, "edit");

  for (const [key, value] of Object.entries(fields)) {
    form.append(key, String(value));
  }

  const apiUrl = buildApiUrl(body.baseUrl || config.baseUrl, body.endpointPath || config.editEndpoint);
  const apiKey = apiKeyForModel(fields.model);
  if (!apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(fields.model) });
  }
  const startedAt = Date.now();
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    },
    body: form
  });

  const responseText = await upstream.text();
  const upstreamData = tryParseJson(responseText);

  if (!upstream.ok) {
    return sendJson(res, upstream.status, {
      error: readUpstreamError(upstreamData, responseText),
      status: upstream.status,
      upstream: upstreamData
    });
  }

  const resultImages = await normalizeAndPersistImages(upstreamData, body.format || "png", projectId);

  sendJson(res, 200, {
    durationMs: Date.now() - startedAt,
    request: {
      apiUrl,
      payload: {
        ...fields,
        image: requestImages.map((image) => image.filename),
        mask: mask?.filename
      }
    },
    images: resultImages,
    raw: upstreamData
  });
}

async function handleDreaminaGenerate(res, body, prompt, imageFiles = []) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const mode = imageFiles.length ? "edit" : "create";
  const command = mode === "edit" ? "image2image" : "text2image";
  const startedAt = Date.now();
  let inputDir = "";

  try {
    const modelVersion = dreaminaModelVersion(body.model);
    const size = parseDreaminaSize(body.size, modelVersion, mode);
    const extraParams = parseExtraParamsValue(body.extraParams);
    const session = normalizeDreaminaSession(extraParams.session);

    await mkdir(projectOutputDir(projectId), { recursive: true });
    const args = [command, `--prompt=${prompt}`, `--model_version=${modelVersion}`, `--ratio=${size.ratio}`];
    if (size.resolutionType) args.push(`--resolution_type=${size.resolutionType}`);
    if (session !== null) args.push(`--session=${session}`);

    if (mode === "edit") {
      inputDir = await mkdtemp(path.join(tmpdir(), "cc-dreamina-"));
      const imagePaths = await writeDreaminaInputFiles(imageFiles, inputDir);
      imagePaths.forEach((imagePath) => args.push(`--images=${imagePath}`));
    }

    args.push("--poll=30");
    const submitResult = await runDreamina(args, { timeoutMs: 90000 });
    const submitted = parseDreaminaJson(submitResult.stdout);
    const finalData = await resolveDreaminaResult(submitted, projectOutputDir(projectId));
    const images = await dreaminaResultImages(finalData, projectId);
    if (!images.length) {
      return sendJson(res, 502, {
        error: "Dreamina task completed without a downloadable image.",
        upstream: finalData
      });
    }

    sendJson(res, 200, {
      durationMs: Date.now() - startedAt,
      request: {
        provider: "dreamina-cli",
        command,
        modelVersion,
        ratio: size.ratio,
        resolutionType: size.resolutionType,
        referenceCount: imageFiles.length
      },
      images,
      raw: finalData
    });
  } catch (error) {
    sendJson(res, dreaminaErrorStatus(error), {
      error: dreaminaErrorMessage(error),
      upstream: error.data || undefined
    });
  } finally {
    if (inputDir && isPathInside(inputDir, tmpdir())) {
      await rm(inputDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

async function handleDreaminaVideoGenerate(res, body, prompt) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const files = Array.isArray(body.files) ? body.files : [];
  const uploadedImages = files.filter((file) => file.name === "image" && String(file.contentType || "").startsWith("image/"));
  const cachedImages = await loadCachedAssets(parseCachedAssetRefs(body.cachedImages), projectId);
  const imageFiles = [...cachedImages, ...uploadedImages]
    .filter((file) => String(file.contentType || "").startsWith("image/"))
    .slice(0, 9);
  const command = imageFiles.length ? "multimodal2video" : "text2video";
  const startedAt = Date.now();
  let inputDir = "";

  try {
    const extraParams = parseExtraParamsValue(body.extraParams);
    const modelVersion = dreaminaVideoModelVersion(extraParams.model_version || body.model);
    const duration = parseDreaminaVideoDuration(extraParams.duration || body.n);
    const ratio = parseDreaminaVideoRatio(extraParams.ratio || body.size);
    const videoResolution = parseDreaminaVideoResolution(
      extraParams.video_resolution || extraParams.resolution || body.quality,
      modelVersion
    );
    const session = normalizeDreaminaSession(extraParams.session);

    await mkdir(projectOutputDir(projectId), { recursive: true });
    const args = [
      command,
      `--prompt=${prompt}`,
      `--model_version=${modelVersion}`,
      `--duration=${duration}`,
      `--ratio=${ratio}`,
      `--video_resolution=${videoResolution}`
    ];
    if (session !== null) args.push(`--session=${session}`);

    if (imageFiles.length) {
      inputDir = await mkdtemp(path.join(tmpdir(), "cc-dreamina-video-"));
      const imagePaths = await writeDreaminaInputFiles(imageFiles, inputDir);
      imagePaths.forEach((imagePath) => args.push(`--image=${imagePath}`));
    }

    args.push("--poll=30");
    const submitResult = await runDreamina(args, { timeoutMs: 180000 });
    const submitted = parseDreaminaJson(submitResult.stdout);
    const finalData = await resolveDreaminaResult(submitted, projectOutputDir(projectId), {
      attempts: 90,
      waitMs: 4000
    });
    const videos = await dreaminaResultVideos(finalData, projectId);
    if (!videos.length) {
      return sendJson(res, 502, {
        error: "Dreamina task completed without a downloadable video.",
        upstream: finalData
      });
    }

    sendJson(res, 200, {
      durationMs: Date.now() - startedAt,
      request: {
        provider: "dreamina-cli",
        command,
        modelVersion,
        duration,
        ratio,
        videoResolution,
        referenceCount: imageFiles.length
      },
      videos,
      raw: finalData
    });
  } catch (error) {
    sendJson(res, dreaminaErrorStatus(error), {
      error: dreaminaErrorMessage(error),
      upstream: error.data || undefined
    });
  } finally {
    if (inputDir && isPathInside(inputDir, tmpdir())) {
      await rm(inputDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

function dreaminaModelVersion(model) {
  const version = normalizeModelName(model).replace(/^dreamina-/, "");
  if (!dreaminaModelVersions.has(version)) {
    throw new Error(`Unsupported Dreamina model version: ${version || model}`);
  }
  return version;
}

function parseDreaminaSize(value, modelVersion, mode) {
  const [rawRatio = "1:1", rawResolution = ""] = String(value || "1:1|2k").toLowerCase().split("|");
  const ratio = dreaminaRatios.has(rawRatio) ? rawRatio : "1:1";
  const allowed = mode === "edit" || Number(modelVersion) >= 4 ? new Set(["2k", "4k"]) : new Set(["1k", "2k"]);
  const fallback = allowed.has("2k") ? "2k" : [...allowed][0];
  return { ratio, resolutionType: allowed.has(rawResolution) ? rawResolution : fallback };
}

function dreaminaVideoModelVersion(model) {
  const version = normalizeModelName(model || "dreamina-video-seedance2.0fast").replace(/^dreamina-video-/, "");
  if (!dreaminaVideoModelVersions.has(version)) {
    throw new Error(`Unsupported Dreamina video model version: ${version || model}`);
  }
  return version;
}

function parseDreaminaVideoDuration(value) {
  const duration = Number.parseInt(value, 10);
  if (!Number.isFinite(duration)) return 5;
  return Math.min(15, Math.max(4, duration));
}

function parseDreaminaVideoRatio(value) {
  const ratio = String(value || "16:9").trim();
  return dreaminaVideoRatios.has(ratio) ? ratio : "16:9";
}

function parseDreaminaVideoResolution(value, modelVersion) {
  const resolution = String(value || "720p").trim().toLowerCase();
  if (resolution === "1080p" && String(modelVersion || "").includes("vip")) return "1080p";
  return "720p";
}

function normalizeDreaminaSession(value) {
  if (value === undefined || value === null || value === "") return null;
  const session = Number.parseInt(value, 10);
  return Number.isInteger(session) && session >= 0 ? session : null;
}

async function writeDreaminaInputFiles(files, directory) {
  const paths = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const extension = extensionFromMime(file.contentType) || extensionFromUrl(file.filename) || ".png";
    const filePath = path.join(directory, `reference-${index + 1}.${String(extension).replace(/^\./, "")}`);
    await writeFile(filePath, file.data);
    paths.push(filePath);
  }
  return paths;
}

async function resolveDreaminaResult(initialData, downloadDir, options = {}) {
  let current = initialData;
  const attempts = Number(options.attempts) || 48;
  const waitMs = Number(options.waitMs) || 2500;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const status = normalizeModelName(current?.gen_status);
    if (status === "fail" || status === "failed") {
      const error = new Error(current?.fail_reason || "Dreamina generation failed.");
      error.data = current;
      throw error;
    }

    const submitId = String(current?.submit_id || "").trim();
    if (!submitId) {
      const error = new Error("Dreamina CLI response did not include submit_id.");
      error.data = current;
      throw error;
    }

    if (status === "success" && (dreaminaLocalImageEntries(current).length || dreaminaLocalVideoEntries(current).length)) return current;

    const query = await runDreamina(
      ["query_result", `--submit_id=${submitId}`, `--download_dir=${downloadDir}`],
      { timeoutMs: 60000 }
    );
    current = parseDreaminaJson(query.stdout);
    if (normalizeModelName(current?.gen_status) === "success") return current;
    await delay(waitMs);
  }

  const error = new Error("Dreamina task is still running after waiting for the result.");
  error.data = current;
  throw error;
}

function dreaminaLocalImageEntries(data) {
  return Array.isArray(data?.result_json?.images) ? data.result_json.images.filter((item) => item?.path) : [];
}

async function dreaminaResultImages(data, projectId) {
  const outputRoot = projectOutputDir(projectId);
  const images = [];
  for (const item of dreaminaLocalImageEntries(data)) {
    const resolved = path.resolve(String(item.path || ""));
    if (!isPathInside(resolved, outputRoot)) continue;
    try {
      const fileStat = await stat(resolved);
      if (!fileStat.isFile()) continue;
      const filename = path.basename(resolved);
      images.push({
        type: "file",
        url: projectPublicPath(projectId, "outputs", filename),
        filename,
        width: Number(item.width) || undefined,
        height: Number(item.height) || undefined
      });
    } catch {
      // Ignore incomplete downloads and continue checking other result files.
    }
  }

  if (images.length) return images;
  return await normalizeAndPersistImages(data, "png", projectId);
}

function dreaminaLocalVideoEntries(data) {
  const entries = [];
  collectDreaminaVideoEntries(data, entries, new Set());
  const seen = new Set();
  return entries.filter((item) => {
    const key = item.path || item.url || item.download_url || item.video_url || "";
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectDreaminaVideoEntries(value, entries, visited) {
  if (!value || typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => collectDreaminaVideoEntries(item, entries, visited));
    return;
  }

  const pathValue = typeof value.path === "string" ? value.path : "";
  const urlValue = ["url", "download_url", "video_url", "cover_url"]
    .map((key) => (typeof value[key] === "string" ? value[key] : ""))
    .find((candidate) => isVideoReference(candidate));
  if (isVideoReference(pathValue) || urlValue) {
    entries.push({ ...value, url: urlValue || value.url });
  }

  for (const nested of Object.values(value)) {
    collectDreaminaVideoEntries(nested, entries, visited);
  }
}

function isVideoReference(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  try {
    const parsed = /^https?:\/\//i.test(text) ? new URL(text).pathname : text.split(/[?#]/)[0];
    return dreaminaVideoExtensions.has(path.extname(parsed).toLowerCase());
  } catch {
    return dreaminaVideoExtensions.has(path.extname(text.split(/[?#]/)[0]).toLowerCase());
  }
}

async function dreaminaResultVideos(data, projectId) {
  const outputRoot = projectOutputDir(projectId);
  const videos = [];
  for (const item of dreaminaLocalVideoEntries(data)) {
    const rawPath = String(item.path || "").trim();
    if (rawPath) {
      const resolved = path.resolve(rawPath);
      if (isPathInside(resolved, outputRoot)) {
        try {
          const fileStat = await stat(resolved);
          if (!fileStat.isFile()) continue;
          const filename = path.basename(resolved);
          videos.push({
            type: "file",
            url: projectPublicPath(projectId, "outputs", filename),
            filename,
            width: Number(item.width) || undefined,
            height: Number(item.height) || undefined,
            duration: Number(item.duration || item.duration_s || item.duration_sec) || undefined,
            format: path.extname(filename).replace(".", "").toLowerCase()
          });
          continue;
        } catch {
          // Ignore incomplete downloads and continue checking other result files.
        }
      }
    }

    const url = String(item.url || item.download_url || item.video_url || "").trim();
    if (/^https?:\/\//i.test(url) && isVideoReference(url)) {
      videos.push({
        type: "url",
        url,
        filename: videoFilenameFromUrl(url),
        width: Number(item.width) || undefined,
        height: Number(item.height) || undefined,
        duration: Number(item.duration || item.duration_s || item.duration_sec) || undefined,
        format: path.extname(new URL(url).pathname).replace(".", "").toLowerCase()
      });
    }
  }

  return videos;
}

function videoFilenameFromUrl(url) {
  try {
    const filename = path.basename(new URL(url).pathname);
    return filename || "dreamina-video.mp4";
  } catch {
    return "dreamina-video.mp4";
  }
}

function grsaiGenerateUrl(body) {
  return buildApiUrl(grsaiBaseUrl(body.baseUrl), grsaiEndpointPath(body.endpointPath));
}

function grsaiBaseUrl(value) {
  const clean = sanitizeOptionalText(value);
  if (!clean || clean === config.baseUrl || /yunwu/i.test(clean)) return grsaiDefaultBaseUrl;
  return clean;
}

function grsaiEndpointPath(value) {
  const clean = sanitizeOptionalText(value);
  if (!clean || clean === config.imageEndpoint || clean === config.editEndpoint || /^\/v1\/images\//i.test(clean)) {
    return grsaiGenerateEndpoint;
  }
  return clean;
}

function grsaiResultUrl(generateUrl, id) {
  const parsed = new URL(generateUrl);
  parsed.pathname = parsed.pathname.replace(/\/generate\/?$/i, "/result");
  if (parsed.pathname === new URL(generateUrl).pathname) parsed.pathname = grsaiResultEndpoint;
  parsed.search = "";
  parsed.searchParams.set("id", id);
  return parsed.toString();
}

function normalizeGrsaiImageRefs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter((item) => item && (/^https?:\/\//i.test(item) || item.startsWith("data:image/") || looksLikeImageBase64(item)));
}

function fileToDataUrl(file) {
  const contentType = file.contentType || "image/png";
  return `data:${contentType};base64,${Buffer.from(file.data || []).toString("base64")}`;
}

async function resolveGrsaiResult(initialData, apiUrl, apiKey) {
  let current = initialData;
  for (let attempt = 0; attempt <= 30; attempt++) {
    const status = normalizeModelName(current?.status);
    if (status === "failed" || status === "violation") {
      throw new Error(readUpstreamError(current, current?.error) || `Grsai task ${status}.`);
    }
    if (status === "succeeded" || hasImageCandidates(current)) return current;
    if (!current?.id || status !== "running") return current;

    await delay(2000);
    const response = await fetch(grsaiResultUrl(apiUrl, current.id), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json"
      }
    });
    const responseText = await response.text();
    const data = tryParseJson(responseText);
    if (!response.ok) {
      throw new Error(readUpstreamError(data, responseText));
    }
    current = data;
  }

  throw new Error("Grsai task is still running after waiting 60 seconds.");
}

function hasImageCandidates(data) {
  const candidates = [];
  collectImageCandidates(data, candidates);
  return candidates.length > 0;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runProcess(executable, args, options = {}) {
  const timeoutMs = Number(options.timeoutMs) || 60000;
  const maxOutputBytes = Number(options.maxOutputBytes) || 1024 * 1024;

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd || __dirname,
      windowsHide: true,
      shell: false,
      env: { ...process.env, ...(options.env || {}) }
    });
    const stdout = [];
    const stderr = [];
    let outputBytes = 0;
    let settled = false;
    let timer = null;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    const collect = (target) => (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutputBytes) {
        child.kill();
        const error = new Error(`${executable} returned too much output.`);
        error.code = "EOUTPUTLIMIT";
        finish(reject, error);
        return;
      }
      target.push(chunk);
    };

    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));
    child.on("error", (error) => finish(reject, error));
    child.on("close", (code) => {
      const result = {
        code,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8")
      };
      if (code === 0) return finish(resolve, result);
      const error = new Error(result.stderr.trim() || result.stdout.trim() || `${executable} exited with code ${code}.`);
      error.code = "EPROCESS";
      error.exitCode = code;
      error.result = result;
      finish(reject, error);
    });

    timer = setTimeout(() => {
      child.kill();
      const error = new Error(`${executable} timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
      error.code = "ETIMEDOUT";
      finish(reject, error);
    }, timeoutMs);
  });
}

async function runDreamina(args, options = {}) {
  const candidates = dreaminaExecutableCandidates();
  let missingError = null;
  for (const executable of candidates) {
    try {
      return await spawnDreamina(executable, args, options);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missingError = error;
    }
  }
  throw missingError || Object.assign(new Error("Dreamina CLI was not found."), { code: "ENOENT" });
}

async function dreaminaShellExecutable() {
  for (const executable of dreaminaExecutableCandidates()) {
    if (!path.isAbsolute(executable)) continue;
    try {
      const info = await stat(executable);
      if (info.isFile()) return executable;
    } catch {
      // Fall back to PATH resolution below.
    }
  }
  return process.platform === "win32" ? "dreamina.exe" : "dreamina";
}

async function installDreaminaWindows() {
  if (process.platform !== "win32") throw new Error("Windows native Dreamina installer is only available on Windows.");
  if (process.arch !== "x64") throw new Error(`暂不支持当前 Windows 架构: ${process.arch}`);

  const installDir = path.join(homedir(), "bin");
  const configDir = path.join(homedir(), ".dreamina_cli");
  const skillDir = path.join(configDir, "dreamina");
  const executable = path.join(installDir, "dreamina.exe");
  const tempDir = await mkdtemp(path.join(tmpdir(), "cc-dreamina-install-"));

  try {
    await mkdir(installDir, { recursive: true });
    await mkdir(skillDir, { recursive: true });

    const tempExecutable = path.join(tempDir, "dreamina.exe");
    const tempSkill = path.join(tempDir, "SKILL.md");
    const tempVersion = path.join(tempDir, "version.json");

    await downloadFileToPath(dreaminaWindowsBinaryUrl, tempExecutable);
    await downloadFileToPath(dreaminaSkillUrl, tempSkill);
    await downloadFileToPath(dreaminaVersionUrl, tempVersion);

    await rename(tempExecutable, executable);
    await rename(tempSkill, path.join(skillDir, "SKILL.md"));
    await rename(tempVersion, path.join(configDir, "version.json"));
    await ensureWindowsUserPath(installDir);
    ensureCurrentProcessPath(installDir);

    return { installDir, executable };
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function downloadFileToPath(url, destination) {
  const response = await fetch(url, {
    headers: {
      "user-agent": `cc-infinite-canvas/${config.version || "local"}`
    }
  });
  if (!response.ok) {
    throw new Error(`下载失败 (${response.status}): ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error(`下载内容为空: ${url}`);
  await writeFile(destination, buffer);
}

async function ensureWindowsUserPath(installDir) {
  const currentUserPath = await readWindowsUserPath();
  if (windowsPathContains(currentUserPath, installDir)) return;
  const nextPath = currentUserPath ? `${currentUserPath};${installDir}` : installDir;
  await runProcess("reg.exe", ["add", "HKCU\\Environment", "/v", "Path", "/t", "REG_EXPAND_SZ", "/d", nextPath, "/f"], {
    timeoutMs: 20000
  });
}

async function readWindowsUserPath() {
  try {
    const result = await runProcess("reg.exe", ["query", "HKCU\\Environment", "/v", "Path"], { timeoutMs: 10000 });
    const line = result.stdout.split(/\r?\n/u).find((item) => /\bPath\b/u.test(item) && /\bREG_/u.test(item));
    return String(line || "").replace(/^\s*Path\s+REG_\w+\s+/iu, "").trim();
  } catch {
    return "";
  }
}

function ensureCurrentProcessPath(installDir) {
  const key = Object.keys(process.env).find((name) => name.toLowerCase() === "path") || "Path";
  const current = process.env[key] || "";
  if (windowsPathContains(current, installDir)) return;
  process.env[key] = `${installDir};${current}`;
}

function windowsPathContains(value, entry) {
  const normalizedEntry = normalizeWindowsPathSegment(entry);
  return String(value || "")
    .split(";")
    .some((segment) => normalizeWindowsPathSegment(segment) === normalizedEntry);
}

function normalizeWindowsPathSegment(value) {
  return String(value || "").trim().replace(/[\\/]+$/u, "").toLowerCase();
}

function dreaminaInstallCommand() {
  return [
    "set -e",
    "curl -s https://jimeng.jianying.com/cli | bash",
    "echo",
    "echo 'Done. Return to cc infinite canvas and click Login Dreamina or Test connection.'"
  ].join("; ");
}

function dreaminaLoginCommand(executable) {
  if (process.platform === "win32") {
    return [
      "@echo off",
      "chcp 65001 >nul",
      "set \"PATH=%USERPROFILE%\\bin;%PATH%\"",
      "echo Starting Dreamina login...",
      `${quoteCmdArgument(executable)} login`,
      "echo.",
      "echo After login, return to cc infinite canvas and click Test connection.",
      "pause"
    ].join("\r\n");
  }

  return `${quotePosix(executable)} login; echo; echo 'After login, return to cc infinite canvas and click Test connection.'`;
}

async function launchDreaminaTerminal(command, title) {
  if (process.platform === "win32") {
    const scriptPath = path.join(tmpdir(), `cc-dreamina-${Date.now()}-${Math.random().toString(16).slice(2)}.cmd`);
    const script = `@echo off\r\ntitle ${sanitizeCmdTitle(title || "cc infinite canvas")}\r\n${command}\r\n`;
    await writeFile(scriptPath, script, "utf8");
    const child = spawn("cmd.exe", ["/c", "start", "", scriptPath], {
      cwd: __dirname,
      detached: true,
      stdio: "ignore",
      windowsHide: false,
      shell: false,
      env: { ...process.env, NO_COLOR: "1" }
    });
    child.unref();
    return;
  }

  const shell = process.env.SHELL || "bash";
  const child = spawn(shell, ["-lc", command], {
    cwd: __dirname,
    detached: true,
    stdio: "ignore",
    shell: false,
    env: { ...process.env, NO_COLOR: "1" }
  });
  child.unref();
}

function quoteCmdArgument(value) {
  return `"${String(value || "").replace(/"/g, "")}"`;
}

function sanitizeCmdTitle(value) {
  return String(value || "cc infinite canvas").replace(/[&|<>^"]/gu, "").trim() || "cc infinite canvas";
}

function quotePosix(value) {
  return `'${String(value || "").replace(/'/g, "'\\''")}'`;
}

function dreaminaExecutableCandidates() {
  const configured = sanitizeOptionalText(process.env.DREAMINA_CLI_PATH);
  const candidates = [configured];
  if (process.platform === "win32") candidates.push(path.join(homedir(), "bin", "dreamina.exe"), "dreamina.exe");
  else candidates.push(path.join(homedir(), ".local", "bin", "dreamina"), "dreamina");
  return [...new Set(candidates.filter(Boolean))];
}

function spawnDreamina(executable, args, options = {}) {
  const timeoutMs = Number(options.timeoutMs) || 60000;
  const maxOutputBytes = Number(options.maxOutputBytes) || 4 * 1024 * 1024;

  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: __dirname,
      windowsHide: true,
      shell: false,
      env: { ...process.env, NO_COLOR: "1" }
    });
    const stdout = [];
    const stderr = [];
    let outputBytes = 0;
    let settled = false;
    let timer = null;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    const collect = (target) => (chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > maxOutputBytes) {
        child.kill();
        const error = new Error("Dreamina CLI returned too much output.");
        error.code = "EOUTPUTLIMIT";
        finish(reject, error);
        return;
      }
      target.push(chunk);
    };

    child.stdout.on("data", collect(stdout));
    child.stderr.on("data", collect(stderr));
    child.on("error", (error) => finish(reject, error));
    child.on("close", (code) => {
      const result = {
        code,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8")
      };
      if (code === 0) return finish(resolve, result);
      const error = new Error(result.stderr.trim() || result.stdout.trim() || `Dreamina CLI exited with code ${code}.`);
      error.code = "EDREAMINA";
      error.exitCode = code;
      error.result = result;
      finish(reject, error);
    });

    timer = setTimeout(() => {
      child.kill();
      const error = new Error(`Dreamina CLI timed out after ${Math.round(timeoutMs / 1000)} seconds.`);
      error.code = "ETIMEDOUT";
      finish(reject, error);
    }, timeoutMs);
  });
}

function parseDreaminaJson(output) {
  const text = String(output || "").trim();
  if (!text) throw new Error("Dreamina CLI returned an empty response.");
  try {
    return JSON.parse(text);
  } catch {
    // Some CLI builds print a short status line before the JSON payload.
  }

  const starts = [text.indexOf("{"), text.indexOf("[")].filter((index) => index >= 0).sort((a, b) => a - b);
  for (const start of starts) {
    for (let end = text.length; end > start; end -= 1) {
      try {
        return JSON.parse(text.slice(start, end));
      } catch {
        // Keep narrowing until the complete JSON value is found.
      }
    }
  }
  throw new Error(`Dreamina CLI returned an unreadable response: ${text.slice(0, 800)}`);
}

function dreaminaErrorStatus(error) {
  if (error?.code === "ENOENT") return 503;
  const message = dreaminaErrorMessage(error);
  if (/login|oauth|unauthorized|未登录|登录态|授权/iu.test(message)) return 401;
  if (/invalid|unsupported|required|参数/iu.test(message)) return 400;
  return 502;
}

function dreaminaErrorMessage(error) {
  const message = String(error?.message || error || "Dreamina CLI failed.").trim();
  return message.slice(0, 1600);
}

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = stripEnvQuotes(rawValue.trim());
    }
  } catch {
    // Missing env files are fine for first run.
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

async function readJsonBody(req, options = {}) {
  const maxBytes = options.maxBytes || 2 * 1024 * 1024;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

async function readMultipartBody(req, contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];
  if (!boundary) {
    throw new Error("Multipart request is missing a boundary.");
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxMultipartBytes) {
      throw new Error("Uploaded files are too large.");
    }
    chunks.push(chunk);
  }

  return parseMultipartBuffer(Buffer.concat(chunks), boundary);
}

function parseMultipartBuffer(buffer, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = [];
  let cursor = buffer.indexOf(delimiter);

  while (cursor !== -1) {
    cursor += delimiter.length;
    if (buffer.slice(cursor, cursor + 2).toString() === "--") break;
    if (buffer.slice(cursor, cursor + 2).toString() === "\r\n") cursor += 2;

    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), cursor);
    if (headerEnd === -1) break;

    const rawHeaders = buffer.slice(cursor, headerEnd).toString("utf8");
    const nextBoundary = buffer.indexOf(delimiter, headerEnd + 4);
    if (nextBoundary === -1) break;

    let data = buffer.slice(headerEnd + 4, nextBoundary);
    if (data.slice(-2).toString() === "\r\n") data = data.slice(0, -2);

    const disposition = rawHeaders.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || "";
    const name = disposition.match(/name="([^"]+)"/)?.[1];
    const filename = disposition.match(/filename="([^"]*)"/)?.[1];
    const contentType = rawHeaders.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || "application/octet-stream";

    if (name && filename) {
      files.push({ name, filename, contentType, data });
    } else if (name) {
      fields[name] = data.toString("utf8");
    }

    cursor = nextBoundary;
  }

  return { ...fields, files };
}

async function saveUploadedAsset(file, projectId = "default") {
  const extension = extensionFromMime(file.contentType) || extensionFromUrl(file.filename) || "png";
  const filename = createOutputFilename(extension);
  const fullPath = path.join(projectAssetDir(projectId), filename);

  await writeFile(fullPath, file.data);
  return { filename };
}

function parseCachedAssetRefs(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (isPlainObject(value)) return [value];
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    if (isPlainObject(parsed)) return [parsed];
  } catch {
    return [];
  }

  return [];
}

async function loadCachedAssets(refs, projectId = "default") {
  const assets = [];
  const currentAssetDir = projectAssetDir(projectId);
  for (const ref of refs) {
    const filename = path.basename(String(ref.filename || ref.path || ""));
    if (!filename) continue;

    const currentPath = path.resolve(currentAssetDir, filename);
    const legacyPath = path.resolve(assetCacheDir, filename);
    const candidates = [];
    if (isPathInside(currentPath, currentAssetDir)) candidates.push(currentPath);
    if (isPathInside(legacyPath, assetCacheDir)) candidates.push(legacyPath);

    for (const readPath of candidates) {
      try {
        const data = await readFile(readPath);
        assets.push({
          name: ref.field || "image",
          filename: ref.originalName || filename,
          contentType: ref.contentType || mimeTypes.get(path.extname(filename).toLowerCase()) || "application/octet-stream",
          data
        });
        break;
      } catch {
        // Try the next compatible cache location.
      }
    }
  }
  return assets;
}

async function serveProjectCacheFile(res, pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const [, rawProjectId, kind, ...rest] = parts;
  const filename = path.basename(decodeURIComponent(rest.join("/")));
  if (!rawProjectId || !["assets", "outputs"].includes(kind) || !filename) {
    return sendText(res, 404, "Not found");
  }

  const projectId = normalizeProjectId(decodeURIComponent(rawProjectId));
  const root = kind === "assets" ? projectAssetDir(projectId) : projectOutputDir(projectId);
  return await serveFile(res, path.join(root, filename));
}

async function serveFile(res, filePath) {
  const resolved = path.resolve(filePath);
  const allowedPublic = isPathInside(resolved, publicDir);
  const allowedOutputs = isPathInside(resolved, outputDir);
  const allowedAssets = isPathInside(resolved, assetCacheDir);
  const allowedProjectCache = isPathInside(resolved, config.cacheDir);

  if (!allowedPublic && !allowedOutputs && !allowedAssets && !allowedProjectCache) {
    return sendText(res, 403, "Forbidden");
  }

  let fileStat;
  try {
    fileStat = await stat(resolved);
  } catch {
    return sendText(res, 404, "Not found");
  }

  if (!fileStat.isFile()) {
    return sendText(res, 404, "Not found");
  }

  const mime = mimeTypes.get(path.extname(resolved).toLowerCase()) || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": fileStat.size,
    "Cache-Control": allowedOutputs || allowedAssets ? "no-store" : "public, max-age=60"
  });
  createReadStream(resolved).pipe(res);
}

function sendJson(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload)
  });
  res.end(payload);
}

function sendText(res, status, text) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text)
  });
  res.end(text);
}

function buildApiUrl(baseUrl, endpointPath) {
  const endpoint = String(endpointPath || "").trim();
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  const cleanBase = String(baseUrl || "").replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

function pruneEmpty(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Number.isNaN(value)) return false;
      return true;
    })
  );
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

function readUpstreamError(data, fallback) {
  if (typeof data?.error === "string") return data.error;
  if (typeof data?.error?.message === "string") return data.error.message;
  if (typeof data?.message === "string") return data.message;
  return fallback || "The image API returned an error.";
}

async function normalizeAndPersistImages(data, preferredFormat, projectId = "default") {
  const candidates = [];
  const roots = Array.isArray(data?.data) ? data.data : Array.isArray(data?.images) ? data.images : [data];

  for (const item of roots) {
    collectImageCandidates(item, candidates);
  }

  const images = [];
  for (const candidate of dedupeImageCandidates(candidates)) {
    if (candidate.type === "url") {
      const saved = await saveUrlImage(candidate.value, preferredFormat, projectId);
      if (saved) {
        images.push({
          type: "file",
          url: saved.publicPath,
          filename: saved.filename,
          sourceUrl: candidate.value
        });
      } else {
        images.push({ type: "url", url: candidate.value });
      }
      continue;
    }

    const saved = await saveBase64Image(candidate.value, preferredFormat, projectId);
    images.push({ type: "file", url: saved.publicPath, filename: saved.filename });
  }

  return images;
}

function dedupeImageCandidates(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const cleanValue =
      candidate.type === "base64"
        ? String(candidate.value).replace(/\s/g, "")
        : String(candidate.value).trim();
    const key = `${candidate.type}:${cleanValue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectImageCandidates(value, candidates, seen = new Set()) {
  if (typeof value === "string") {
    collectStringImageCandidates(value, candidates);
    return;
  }

  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);

  const urlKeys = ["url", "image_url", "imageUrl", "uri"];
  const b64Keys = ["b64_json", "base64", "image_base64", "imageBase64", "image"];

  for (const key of urlKeys) {
    if (typeof value[key] === "string" && /^https?:\/\//i.test(value[key])) {
      candidates.push({ type: "url", value: value[key] });
    }
  }

  for (const key of b64Keys) {
    if (typeof value[key] === "string" && looksLikeImageBase64(value[key])) {
      candidates.push({ type: "base64", value: value[key] });
    }
  }

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child) collectImageCandidates(item, candidates, seen);
    } else {
      collectImageCandidates(child, candidates, seen);
    }
  }
}

function collectStringImageCandidates(value, candidates) {
  const urlMatches = value.match(/https?:\/\/[^\s"'<>）)]+/gi) || [];
  for (const url of urlMatches) {
    if (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(url) || url.includes("image")) {
      candidates.push({ type: "url", value: url });
    }
  }

  const dataUrlMatches = value.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/g) || [];
  for (const dataUrl of dataUrlMatches) {
    candidates.push({ type: "base64", value: dataUrl });
  }

  if (looksLikeImageBase64(value)) {
    candidates.push({ type: "base64", value });
  }
}

function looksLikeImageBase64(value) {
  const clean = (value.includes(",") ? value.split(",").at(-1) : value).replace(/\s/g, "");
  if (clean.length < 80 || clean.length % 4 === 1 || !/^[A-Za-z0-9+/=_-]+$/.test(clean)) {
    return false;
  }

  const header = Buffer.from(clean.replace(/-/g, "+").replace(/_/g, "/").slice(0, 64), "base64");
  const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  const isGif = header.subarray(0, 3).toString("ascii") === "GIF";
  const isWebp = header.subarray(0, 4).toString("ascii") === "RIFF" && header.subarray(8, 12).toString("ascii") === "WEBP";

  return isPng || isJpeg || isGif || isWebp;
}

async function saveBase64Image(value, preferredFormat, projectId = "default") {
  const mimeMatch = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  const mime = mimeMatch?.[1] || mimeFromFormat(preferredFormat);
  const extension = extensionFromMime(mime) || "png";
  const clean = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "").replace(/\s/g, "");
  const filename = createOutputFilename(extension);
  const fullPath = path.join(projectOutputDir(projectId), filename);

  await mkdir(projectOutputDir(projectId), { recursive: true });
  await writeFile(fullPath, Buffer.from(clean, "base64"));

  return { filename, publicPath: projectPublicPath(projectId, "outputs", filename) };
}

async function saveUrlImage(url, preferredFormat, projectId = "default") {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || "";
    if (!contentType.startsWith("image/")) return null;

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 80 * 1024 * 1024) return null;

    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 80 * 1024 * 1024) return null;

    const extension = extensionFromMime(contentType) || extensionFromUrl(url) || extensionFromMime(mimeFromFormat(preferredFormat));
    const filename = createOutputFilename(extension);
    const fullPath = path.join(projectOutputDir(projectId), filename);

    await mkdir(projectOutputDir(projectId), { recursive: true });
    await writeFile(fullPath, bytes);

    return { filename, publicPath: projectPublicPath(projectId, "outputs", filename) };
  } catch {
    return null;
  }
}

function createOutputFilename(extension) {
  return `${new Date().toISOString().replace(/[:.]/g, "-")}-${Math.random()
    .toString(16)
    .slice(2)}.${extension}`;
}

function mimeFromFormat(format) {
  if (format === "jpeg" || format === "jpg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function extensionFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/quicktime") return "mov";
  if (mime === "video/webm") return "webm";
  if (mime === "video/x-m4v") return "m4v";
  return "";
}

function extensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).replace(".", "").toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif", "svg", "mp4", "mov", "webm", "m4v"].includes(ext) ? ext : "";
  } catch {
    return "";
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseExtraParamsValue(value) {
  if (isPlainObject(value)) return value;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
