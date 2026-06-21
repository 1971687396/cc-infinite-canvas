import http from "node:http";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createReadStream, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageInfo = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8"));
const publicDir = path.join(__dirname, "public");
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
const modelKeyModels = ["gpt-image-2", "grok-image-image"];
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
  defaultModel: process.env.YUNWU_DEFAULT_MODEL || "gpt-image-2",
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
  [".svg", "image/svg+xml"]
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

    if (req.method === "GET" && url.pathname === "/api/update/check") {
      return await handleUpdateCheck(res);
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
    defaultModel: config.defaultModel,
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
  return normalizedModel;
}

function isGrokImageModel(model) {
  return normalizeModelName(model).startsWith("grok-");
}

function isGrsaiImageModel(model) {
  return normalizeModelName(model).startsWith("nano-banana");
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
    defaultModel: sanitizeOptionalText(body.defaultModel) || config.defaultModel,
    modelApiKeys: mergeModelApiKeys(body),
    cacheDir: sanitizeCacheDir(body.cacheDir, config.cacheDir)
  };

  config.apiKey = nextSettings.apiKey;
  config.grsaiApiKey = nextSettings.grsaiApiKey;
  config.baseUrl = nextSettings.baseUrl;
  config.imageEndpoint = nextSettings.imageEndpoint;
  config.editEndpoint = nextSettings.editEndpoint;
  config.defaultModel = nextSettings.defaultModel;
  config.modelApiKeys = nextSettings.modelApiKeys;
  config.cacheDir = nextSettings.cacheDir;

  await writeSettingsEnv(nextSettings);
  sendJson(res, 200, publicSettings());
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
    ["YUNWU_DEFAULT_MODEL", settings.defaultModel],
    [modelKeyEnvName("gpt-image-2"), settings.modelApiKeys["gpt-image-2"] || ""],
    [modelKeyEnvName("grok-image-image"), settings.modelApiKeys["grok-image-image"] || ""],
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

  if (body.mode === "edit" || isMultipart) {
    return await handleEdit(res, body);
  }

  return await handleCreate(res, body, prompt);
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
    if (!["image", "mask"].includes(file.name)) continue;
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
    if (size > 90 * 1024 * 1024) {
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
  const extension = extensionFromMime(file.contentType) || extensionFromUrl(file.filename);
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
  const extension = extensionFromMime(mime);
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
  return "png";
}

function extensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).replace(".", "").toLowerCase();
    return ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext) ? ext : "";
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
