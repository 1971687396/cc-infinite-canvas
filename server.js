import http from "node:http";
import { spawn } from "node:child_process";
import { createHash, createHmac, randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { mkdir, mkdtemp, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createReadStream, createWriteStream, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import TosSdk from "@volcengine/tos-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const TosClient = TosSdk.default || TosSdk.TosClient;
const electronNativeImage = loadElectronNativeImage();
const packageInfo = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8"));
const publicDir = path.join(__dirname, "public");
const skillsDir = path.join(__dirname, "skills");
const outputDir = path.join(__dirname, "outputs");
const cacheDir = path.join(__dirname, "cache");
const assetCacheDir = path.join(cacheDir, "assets");
const projectCacheFile = path.join(cacheDir, "project.json");
const defaultCacheDir = cacheDir;
const envFile = path.join(__dirname, ".env.local");
const grokImageModel = "grok-imagine-image";
const legacyGrokImageModel = "grok-image-image";
const grokKeyModel = grokImageModel;
const geminiBananaImageModel = "gemini-3.1-flash-image-preview";
const geminiBananaImageAlias = "banana2";
const geminiNativeDefaultRatio = "1:1";
const geminiNativeDefaultImageSize = "4K";
const grsaiDefaultBaseUrl = "https://grsaiapi.com";
const grsaiGenerateEndpoint = "/v1/api/generate";
const grsaiResultEndpoint = "/v1/api/result";
const grsaiDefaultModel = "nano-banana-2";
const arkDefaultBaseUrl = "https://ark.cn-beijing.volces.com";
const arkOpenApiBaseUrl = "https://ark.cn-beijing.volcengineapi.com";
const arkOpenApiRegion = "cn-beijing";
const arkOpenApiService = "ark";
const arkOpenApiVersion = "2024-01-01";
const arkImageEndpoint = "/api/v3/images/generations";
const arkVideoEndpoint = "/api/v3/contents/generations/tasks";
const arkImageModels = [
  { model: "ark-seedream-5.0-pro", label: "Seedream 5.0 Pro", apiModel: "doubao-seedream-5-0-260128" },
  { model: "ark-seedream-5.0-lite", label: "Seedream 5.0 Lite", apiModel: "doubao-seedream-5-0-lite-260128" },
  { model: "ark-seedream-4.5", label: "Seedream 4.5", apiModel: "doubao-seedream-4-5-251128" },
  { model: "ark-seedream-4.0", label: "Seedream 4.0", apiModel: "doubao-seedream-4-0-250828" }
];
const arkVideoModels = [
  { model: "ark-seedance-2.0", label: "Seedance 2.0", apiModel: "doubao-seedance-2-0-260128" },
  { model: "ark-seedance-2.0-fast", label: "Seedance 2.0 Fast", apiModel: "doubao-seedance-2-0-fast-260128" },
  { model: "ark-seedance-2.0-mini", label: "Seedance 2.0 Mini", apiModel: "doubao-seedance-2-0-mini" }
];
const arkModelDefinitions = [...arkImageModels, ...arkVideoModels];
const arkModelNames = new Set(arkModelDefinitions.map(({ model }) => model));
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
const assistantKeyModels = [
  assistantDefaultModel,
  "gpt-5.6-sol",
  "gemini-3.5-flash",
  "claude-opus-4-8",
  "doubao-seed-2-1-turbo-260628",
  "grok-4.3",
  "deepseek-v4-pro"
];
const apiConnectionModelDefinitions = [
  { model: "gpt-image-2", label: "GPT Image 2", capability: "image", provider: "openai", presets: ["yunwu", "openai", "custom"] },
  { model: geminiBananaImageModel, label: "banana2", capability: "image", provider: "google", presets: ["yunwu", "google", "custom"] },
  { model: "grok-3-image", label: "Grok 3 Image", capability: "image", provider: "xai", presets: ["yunwu", "xai", "custom"] },
  { model: grokImageModel, label: "Grok Imagine Image", capability: "image", provider: "xai", presets: ["yunwu", "xai", "custom"] },
  { model: grsaiDefaultModel, label: "nano-banana-2 (Grsai)", capability: "image", provider: "grsai", presets: ["grsai", "custom"] },
  ...arkImageModels.map(({ model, label }) => ({ model, label, capability: "image", provider: "doubao", presets: ["doubao", "custom"] })),
  ...arkVideoModels.map(({ model, label }) => ({ model, label, capability: "video", provider: "doubao", presets: ["doubao", "custom"] })),
  ...assistantKeyModels.map((model) => ({
    model,
    label: model,
    capability: "chat",
    provider: assistantProviderForModel(model),
    presets: assistantPresetsForModel(model)
  }))
];
const modelKeyModels = [...new Set(apiConnectionModelDefinitions.map(({ model }) => normalizeModelAlias(model)))];
const connectionPresetCatalog = {
  yunwu: { label: "云雾平台", description: "云雾 OpenAI 兼容接口" },
  openai: { label: "OpenAI 官方", description: "OpenAI 官方 API" },
  google: { label: "Google Gemini 官方", description: "Gemini 原生 generateContent" },
  anthropic: { label: "Anthropic 官方", description: "Anthropic Messages API" },
  xai: { label: "xAI 官方", description: "xAI OpenAI 兼容接口" },
  deepseek: { label: "DeepSeek 官方", description: "DeepSeek OpenAI 兼容接口" },
  doubao: { label: "火山方舟官方", description: "方舟对话、图片与视频原生接口" },
  grsai: { label: "Grsai", description: "Grsai 异步生图接口" },
  custom: { label: "自定义 / 中转站", description: "自行填写协议、地址和接口" }
};
const serverHost = "127.0.0.1";
const photoshopBridgeHeader = "x-cc-canvas-bridge";
const photoshopBridgeHeaderValue = "psimageai";
const photoshopBridgePort = 32145;
const photoshopBridgeQueueLimit = 40;
const photoshopReferenceSelectionLimit = 15;
const photoshopReferenceSelectionTtlMs = 15 * 60 * 1000;
const photoshopBridgeEvents = new EventEmitter();
const projectWriteQueues = new Map();

let photoshopBridgeState = {
  inbox: [],
  outbox: [],
  activeProjectId: "default",
  activeProjectName: ""
};
let photoshopBridgeStatePath = "";
let photoshopReferenceSelection = null;

loadEnvFile(envFile);

const config = {
  port: Number(process.env.PORT || 3000),
  version: packageInfo.version || "0.0.0",
  updateRepo: process.env.CC_CANVAS_UPDATE_REPO || "1971687396/cc-infinite-canvas",
  apiKey: process.env.YUNWU_API_KEY || "",
  arkApiKey: process.env.VOLCENGINE_ARK_API_KEY || process.env.ARK_API_KEY || "",
  arkBaseUrl: process.env.VOLCENGINE_ARK_BASE_URL || arkDefaultBaseUrl,
  arkAccessKeyId: process.env.VOLCENGINE_ACCESS_KEY_ID || "",
  arkSecretAccessKey: process.env.VOLCENGINE_SECRET_ACCESS_KEY || "",
  arkAssetProject: process.env.VOLCENGINE_ARK_ASSET_PROJECT || "default",
  arkAssetGroupId: process.env.VOLCENGINE_ARK_ASSET_GROUP_ID || "",
  tosBucket: process.env.VOLCENGINE_TOS_BUCKET || "",
  tosRegion: process.env.VOLCENGINE_TOS_REGION || arkOpenApiRegion,
  tosEndpoint: process.env.VOLCENGINE_TOS_ENDPOINT || "",
  grsaiApiKey: process.env.GRSAI_API_KEY || "",
  baseUrl: process.env.YUNWU_BASE_URL || "https://yunwu.ai",
  imageEndpoint: process.env.YUNWU_IMAGE_ENDPOINT || "/v1/images/generations",
  editEndpoint: process.env.YUNWU_EDIT_ENDPOINT || "/v1/images/edits",
  chatEndpoint: process.env.YUNWU_CHAT_ENDPOINT || "/v1/chat/completions",
  defaultModel: normalizeModelAlias(process.env.YUNWU_DEFAULT_MODEL || "gpt-image-2"),
  assistantModel: process.env.YUNWU_ASSISTANT_MODEL || assistantDefaultModel,
  modelApiKeys: loadModelApiKeys(),
  cacheDir: sanitizeCacheDir(process.env.CC_CANVAS_CACHE_DIR || process.env.YUNWU_CACHE_DIR || defaultCacheDir, defaultCacheDir),
  photoshopBridgeEnabled: parseEnvBoolean(process.env.CC_CANVAS_PHOTOSHOP_BRIDGE_ENABLED, false)
};
config.modelConnections = loadModelConnections();

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

    if (req.method === "POST" && url.pathname === "/api/ark-assets/import") {
      return await handleArkAssetImport(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/ark-assets/status") {
      return await handleArkAssetStatus(req, res);
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

    if (req.method === "POST" && url.pathname === "/api/dreamina/relogin") {
      return await handleDreaminaRelogin(res);
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

    if (req.method === "GET" && url.pathname === "/api/assistant/chat-backup") {
      return await handleGetAssistantChatBackup(res, url);
    }

    if (req.method === "PUT" && url.pathname === "/api/assistant/chat-backup") {
      return await handleSaveAssistantChatBackup(req, res, url);
    }

    if (req.method === "POST" && url.pathname === "/api/assistant/extract-files") {
      return await handleAssistantExtractFiles(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/assistant/skills") {
      return await handleAssistantBuiltInSkills(res);
    }

    if (url.pathname.startsWith("/api/photoshop/")) {
      return await handlePhotoshopBridgeRequest(req, res, url);
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

const photoshopBridgeServer = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${serverHost}:${photoshopBridgePort}`}`);
    if (!url.pathname.startsWith("/api/photoshop/")) {
      return sendJson(res, 404, { error: "Not found." });
    }
    return await handlePhotoshopBridgeRequest(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Unexpected Photoshop bridge error" });
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

photoshopBridgeServer.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.warn(`Photoshop bridge port ${photoshopBridgePort} is already in use.`);
    return;
  }
  console.warn(`Photoshop bridge failed: ${error.message || error}`);
});
photoshopBridgeServer.on("listening", () => {
  console.log(`Photoshop bridge is running at http://${serverHost}:${photoshopBridgePort}`);
});
photoshopBridgeServer.listen(photoshopBridgePort, serverHost);

function logServerAddress() {
  const address = server.address();
  const activePort = typeof address === "object" && address ? address.port : config.port;
  console.log(`cc无限画布 is running at http://${serverHost}:${activePort}`);
}

export { server, photoshopBridgeServer, photoshopBridgeEvents };

function publicSettings() {
  return {
    hasApiKey: Boolean(config.apiKey),
    hasArkApiKey: Boolean(config.arkApiKey),
    hasArkAccessKeyId: Boolean(config.arkAccessKeyId),
    hasArkSecretAccessKey: Boolean(config.arkSecretAccessKey),
    hasArkAssetCredentials: Boolean(config.arkAccessKeyId && config.arkSecretAccessKey),
    hasGrsaiApiKey: Boolean(config.grsaiApiKey),
    hasAnyKey: hasAnyApiKey(),
    baseUrl: config.baseUrl,
    imageEndpoint: config.imageEndpoint,
    editEndpoint: config.editEndpoint,
    chatEndpoint: config.chatEndpoint,
    defaultModel: config.defaultModel,
    assistantModel: config.assistantModel,
    modelKeys: publicModelKeyStatus(),
    connectionModels: publicConnectionModels(),
    connectionPresets: connectionPresetCatalog,
    modelConnections: publicModelConnections(),
    arkBaseUrl: config.arkBaseUrl,
    arkAssetProject: config.arkAssetProject,
    arkAssetGroupId: config.arkAssetGroupId,
    tosBucket: config.tosBucket,
    tosRegion: config.tosRegion,
    tosEndpoint: config.tosEndpoint,
    arkModels: arkModelDefinitions.map(({ model, label, apiModel }) => ({
      model,
      label,
      apiModel: connectionForModel(model).apiModel || apiModel,
      capability: arkVideoModels.some((item) => item.model === model) ? "video" : "image"
    })),
    cacheDir: config.cacheDir,
    version: config.version,
    updateRepo: config.updateRepo,
    photoshopBridgePort,
    photoshopBridgeEnabled: Boolean(config.photoshopBridgeEnabled)
  };
}

function hasAnyApiKey() {
  return Boolean(config.apiKey) || Boolean(config.arkApiKey) || Boolean(config.grsaiApiKey) || Object.values(config.modelApiKeys || {}).some(Boolean);
}

function loadModelApiKeys() {
  const stored = decodeSettingsMap(process.env.CC_CANVAS_MODEL_KEYS_B64);
  const loaded = {
    ...stored,
    ...Object.fromEntries(
    modelKeyModels.map((model) => {
      const normalizedModel = normalizeModelName(model);
      const legacyValue =
        normalizedModel === grokKeyModel ? process.env[modelKeyEnvName(legacyGrokImageModel)] || "" : "";
      return [normalizedModel, process.env[modelKeyEnvName(model)] || stored[normalizedModel] || legacyValue];
    })
    )
  };
  if (!loaded["grok-3-image"] && loaded[grokKeyModel]) loaded["grok-3-image"] = loaded[grokKeyModel];
  return loaded;
}

function normalizeModelName(model) {
  return String(model || "").trim().toLowerCase();
}

function normalizeModelAlias(model) {
  const normalized = normalizeModelName(model);
  if (normalized === legacyGrokImageModel) return grokImageModel;
  if (normalized === geminiBananaImageAlias) return geminiBananaImageModel;
  return normalized;
}

function modelKeyEnvName(model) {
  return `YUNWU_MODEL_KEY_${normalizeModelName(model).toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
}

function publicModelKeyStatus() {
  const models = new Set([...modelKeyModels, ...Object.keys(config.modelApiKeys || {}), ...Object.keys(config.modelConnections || {})]);
  return Object.fromEntries([...models].map((model) => {
    const normalizedModel = normalizeModelName(model);
    return [normalizedModel, hasDedicatedApiKeyForModel(normalizedModel)];
  }));
}

function hasDedicatedApiKeyForModel(model) {
  const normalized = normalizeModelAlias(model);
  if (config.modelApiKeys[normalized]) return true;
  if (isGrsaiImageModel(normalized)) return Boolean(config.grsaiApiKey);
  return false;
}

function mergeModelApiKeys(body) {
  const next = { ...config.modelApiKeys };
  const submitted = isPlainObject(body.modelApiKeys) ? body.modelApiKeys : {};
  for (const [model, submittedValue] of Object.entries(submitted)) {
    const normalizedModel = normalizeModelAlias(model);
    if (!normalizedModel) continue;
    const legacyValue = normalizedModel === grokKeyModel ? submitted[legacyGrokImageModel] : "";
    const value = sanitizeOptionalText(submittedValue || legacyValue);
    if (value) next[normalizedModel] = value;
  }
  for (const model of Array.isArray(body.clearModelApiKeys) ? body.clearModelApiKeys : []) {
    const normalizedModel = normalizeModelAlias(model);
    if (normalizedModel) delete next[normalizedModel];
  }
  return next;
}

function apiKeyForModel(model) {
  const normalizedModel = normalizeModelAlias(model || config.defaultModel);
  if (config.modelApiKeys[normalizedModel]) return config.modelApiKeys[normalizedModel];
  if (isGrsaiImageModel(normalizedModel)) return config.grsaiApiKey || config.apiKey;
  if (isArkModel(normalizedModel)) return config.arkApiKey || config.apiKey;
  return config.apiKey;
}

function arkDefinition(model) {
  const normalized = normalizeModelAlias(model);
  return arkModelDefinitions.find((item) => item.model === normalized) || null;
}

function isArkModel(model) {
  return arkModelNames.has(normalizeModelAlias(model));
}

function isArkImageModel(model) {
  const normalized = normalizeModelAlias(model);
  return arkImageModels.some((item) => item.model === normalized);
}

function isArkVideoModel(model) {
  const normalized = normalizeModelAlias(model);
  return arkVideoModels.some((item) => item.model === normalized);
}

function assistantProviderForModel(model) {
  const normalized = normalizeModelName(model);
  if (normalized.includes("claude")) return "anthropic";
  if (normalized.includes("gemini")) return "google";
  if (normalized.includes("doubao")) return "doubao";
  if (normalized.includes("grok")) return "xai";
  if (normalized.includes("deepseek")) return "deepseek";
  return "openai";
}

function assistantPresetsForModel(model) {
  const provider = assistantProviderForModel(model);
  return [...new Set(["yunwu", provider, "custom"])];
}

function publicConnectionModels() {
  const definitions = [...apiConnectionModelDefinitions];
  const known = new Set(definitions.map(({ model }) => normalizeModelAlias(model)));
  for (const model of new Set([...Object.keys(config.modelConnections || {}), ...Object.keys(config.modelApiKeys || {})])) {
    const normalized = normalizeModelAlias(model);
    if (!normalized || known.has(normalized)) continue;
    definitions.push({
      model: normalized,
      label: normalized,
      capability: config.modelConnections[normalized]?.capability || "chat",
      provider: "custom",
      presets: ["custom"]
    });
  }
  return definitions.map((definition) => ({
    ...definition,
    presetDefaults: Object.fromEntries(
      definition.presets.map((preset) => [preset, defaultConnectionForModel(definition.model, preset)])
    )
  }));
}

function publicModelConnections() {
  return Object.fromEntries(
    publicConnectionModels().map(({ model }) => {
      const normalized = normalizeModelAlias(model);
      const profile = connectionForModel(normalized);
      return [normalized, { ...profile, hasKey: Boolean(apiKeyForModel(normalized)) }];
    })
  );
}

function loadModelConnections() {
  const stored = decodeSettingsMap(process.env.CC_CANVAS_MODEL_CONNECTIONS_B64);
  const models = new Set([...modelKeyModels, ...Object.keys(stored)]);
  return Object.fromEntries(
    [...models].map((model) => {
      const normalized = normalizeModelAlias(model);
      return [normalized, normalizeModelConnection(normalized, stored[normalized])];
    })
  );
}

function decodeSettingsMap(value) {
  const encoded = sanitizeOptionalText(value);
  if (!encoded) return {};
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function encodeSettingsMap(value) {
  return Buffer.from(JSON.stringify(value || {}), "utf8").toString("base64url");
}

function connectionDefinition(model) {
  const normalized = normalizeModelAlias(model);
  return apiConnectionModelDefinitions.find((item) => normalizeModelAlias(item.model) === normalized) || {
    model: normalized,
    label: normalized,
    capability: "chat",
    provider: "custom",
    presets: ["custom"]
  };
}

function defaultConnectionForModel(model, presetId = "yunwu") {
  const normalized = normalizeModelAlias(model);
  const definition = connectionDefinition(normalized);
  const ark = arkDefinition(normalized);
  const requestedPreset = sanitizeOptionalText(presetId).toLowerCase();
  const preset = definition.presets.includes(requestedPreset) ? requestedPreset : definition.presets[0] || "custom";
  const imageProtocol = normalized === geminiBananaImageModel ? "gemini-native" : normalized === grsaiDefaultModel ? "grsai" : "openai-images";
  const chatProtocol = "openai-chat";
  const defaults = {
    preset,
    capability: definition.capability,
    protocol: definition.capability === "image" ? imageProtocol : chatProtocol,
    authType: "bearer",
    apiModel: normalized,
    baseUrl: config?.baseUrl || "https://yunwu.ai",
    imageEndpoint: config?.imageEndpoint || "/v1/images/generations",
    editEndpoint: config?.editEndpoint || "/v1/images/edits",
    chatEndpoint: config?.chatEndpoint || "/v1/chat/completions",
    videoEndpoint: arkVideoEndpoint
  };
  if (ark) defaults.apiModel = ark.apiModel;
  if (normalized === geminiBananaImageModel) {
    defaults.imageEndpoint = "/v1beta/models/{model}:generateContent";
    defaults.editEndpoint = "/v1beta/models/{model}:generateContent";
  }

  if (preset === "openai") {
    return { ...defaults, baseUrl: "https://api.openai.com", protocol: definition.capability === "image" ? "openai-images" : "openai-chat" };
  }
  if (preset === "xai") {
    return { ...defaults, baseUrl: "https://api.x.ai", protocol: definition.capability === "image" ? "openai-images" : "openai-chat" };
  }
  if (preset === "google") {
    return {
      ...defaults,
      baseUrl: "https://generativelanguage.googleapis.com",
      protocol: "gemini-native",
      authType: "x-goog-api-key",
      imageEndpoint: "/v1beta/models/{model}:generateContent",
      editEndpoint: "/v1beta/models/{model}:generateContent",
      chatEndpoint: "/v1beta/models/{model}:generateContent"
    };
  }
  if (preset === "anthropic") {
    return { ...defaults, baseUrl: "https://api.anthropic.com", protocol: "anthropic-messages", authType: "x-api-key", chatEndpoint: "/v1/messages" };
  }
  if (preset === "deepseek") {
    return { ...defaults, baseUrl: "https://api.deepseek.com", protocol: "openai-chat", chatEndpoint: "/chat/completions" };
  }
  if (preset === "doubao") {
    if (definition.capability === "image") {
      return {
        ...defaults,
        baseUrl: config?.arkBaseUrl || arkDefaultBaseUrl,
        protocol: "ark-images",
        imageEndpoint: arkImageEndpoint,
        editEndpoint: arkImageEndpoint
      };
    }
    if (definition.capability === "video") {
      return {
        ...defaults,
        baseUrl: config?.arkBaseUrl || arkDefaultBaseUrl,
        protocol: "ark-video",
        videoEndpoint: arkVideoEndpoint
      };
    }
    return { ...defaults, baseUrl: "https://ark.cn-beijing.volces.com/api/v3", protocol: "openai-chat", chatEndpoint: "/chat/completions" };
  }
  if (preset === "grsai") {
    return {
      ...defaults,
      baseUrl: grsaiDefaultBaseUrl,
      protocol: "grsai",
      imageEndpoint: grsaiGenerateEndpoint,
      editEndpoint: grsaiGenerateEndpoint
    };
  }
  if (preset === "custom") return { ...defaults, preset: "custom" };
  return defaults;
}

function normalizeModelConnection(model, value) {
  const normalized = normalizeModelAlias(model);
  const input = isPlainObject(value) ? value : {};
  const fallback = defaultConnectionForModel(normalized, input.preset || connectionDefinition(normalized).presets[0]);
  const protocols = new Set(["openai-images", "openai-chat", "gemini-native", "anthropic-messages", "grsai", "ark-images", "ark-video"]);
  const authTypes = new Set(["bearer", "x-api-key", "x-goog-api-key", "none"]);
  return {
    preset: sanitizeOptionalText(input.preset) || fallback.preset,
    capability: ["image", "video", "chat"].includes(input.capability) ? input.capability : fallback.capability,
    protocol: protocols.has(input.protocol) ? input.protocol : fallback.protocol,
    authType: authTypes.has(input.authType) ? input.authType : fallback.authType,
    apiModel: sanitizeOptionalText(input.apiModel) || fallback.apiModel,
    baseUrl: sanitizeOptionalText(input.baseUrl) || fallback.baseUrl,
    imageEndpoint: sanitizeOptionalText(input.imageEndpoint) || fallback.imageEndpoint,
    editEndpoint: sanitizeOptionalText(input.editEndpoint) || fallback.editEndpoint,
    chatEndpoint: sanitizeOptionalText(input.chatEndpoint) || fallback.chatEndpoint,
    videoEndpoint: sanitizeOptionalText(input.videoEndpoint) || fallback.videoEndpoint || arkVideoEndpoint
  };
}

function mergeModelConnections(body) {
  const next = { ...config.modelConnections };
  const submitted = isPlainObject(body.modelConnections) ? body.modelConnections : {};
  for (const [model, value] of Object.entries(submitted)) {
    const normalized = normalizeModelAlias(model);
    if (normalized) next[normalized] = normalizeModelConnection(normalized, value);
  }
  return next;
}

function connectionForModel(model) {
  const normalized = normalizeModelAlias(model || config.defaultModel);
  return normalizeModelConnection(normalized, config.modelConnections?.[normalized]);
}

function resolvedConnection(model, body = {}, mode = "chat") {
  const normalized = normalizeModelAlias(model || config.defaultModel);
  let connection = connectionForModel(normalized);
  if (body.connectionOverride === true || body.connectionOverride === "true") {
    const endpoint = sanitizeOptionalText(body.endpointPath);
    connection = normalizeModelConnection(normalized, {
      ...connection,
      preset: "custom",
      protocol: sanitizeOptionalText(body.connectionProtocol) || connection.protocol,
      authType: sanitizeOptionalText(body.authType) || connection.authType,
      apiModel: sanitizeOptionalText(body.apiModel) || connection.apiModel,
      baseUrl: sanitizeOptionalText(body.baseUrl) || connection.baseUrl,
      imageEndpoint: mode === "create" && endpoint ? endpoint : connection.imageEndpoint,
      editEndpoint: mode === "edit" && endpoint ? endpoint : connection.editEndpoint,
      chatEndpoint: mode === "chat" && endpoint ? endpoint : connection.chatEndpoint,
      videoEndpoint: mode === "video" && endpoint ? endpoint : connection.videoEndpoint
    });
  }
  const endpoint = mode === "edit"
    ? connection.editEndpoint
    : mode === "create"
      ? connection.imageEndpoint
      : mode === "video"
        ? connection.videoEndpoint
        : connection.chatEndpoint;
  const endpointPath = String(endpoint || "").replaceAll("{model}", encodeURIComponent(connection.apiModel || normalized));
  return {
    ...connection,
    model: normalized,
    endpointPath,
    apiUrl: buildApiUrl(connection.baseUrl, endpointPath),
    apiKey: apiKeyForModel(normalized)
  };
}

function connectionAuthHeaders(connection, contentType = "application/json") {
  const headers = contentType ? { "Content-Type": contentType } : {};
  if (connection.authType === "x-api-key") {
    headers["x-api-key"] = connection.apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else if (connection.authType === "x-goog-api-key") {
    headers["x-goog-api-key"] = connection.apiKey;
  } else if (connection.authType !== "none") {
    headers.Authorization = `Bearer ${connection.apiKey}`;
  }
  return headers;
}

function modelKeyBucket(model) {
  const normalizedModel = normalizeModelAlias(model || config.defaultModel);
  if (isGrokImageModel(normalizedModel)) return grokKeyModel;
  if (isGeminiNativeImageModel(normalizedModel)) return geminiBananaImageModel;
  if (normalizedModel === assistantDefaultModel || normalizedModel.startsWith(`${assistantDefaultModel}-`)) return assistantDefaultModel;
  return normalizedModel;
}

function isGrokImageModel(model) {
  const normalized = normalizeModelAlias(model);
  return normalized.startsWith("grok-") && (normalized === grokImageModel || normalized.includes("-image"));
}

function isGeminiNativeImageModel(model) {
  const normalized = normalizeModelAlias(model);
  return normalized === geminiBananaImageModel || normalized.startsWith(`${geminiBananaImageModel}:`);
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
  if (isArkModel(model)) {
    return `火山方舟 API Key 未配置：${model}。请在设置 > 火山方舟 API 中填写。`;
  }
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
  const clearedModels = new Set((Array.isArray(body.clearModelApiKeys) ? body.clearModelApiKeys : []).map(normalizeModelAlias));
  const nextSettings = {
    apiKey: body.clearApiKey === true ? "" : sanitizeOptionalText(body.apiKey) || config.apiKey,
    arkApiKey: body.clearArkApiKey === true ? "" : sanitizeOptionalText(body.arkApiKey) || config.arkApiKey,
    arkBaseUrl: sanitizeOptionalText(body.arkBaseUrl) || config.arkBaseUrl || arkDefaultBaseUrl,
    arkAccessKeyId:
      body.clearArkAssetCredentials === true
        ? ""
        : sanitizeOptionalText(body.arkAccessKeyId) || config.arkAccessKeyId,
    arkSecretAccessKey:
      body.clearArkAssetCredentials === true
        ? ""
        : sanitizeOptionalText(body.arkSecretAccessKey) || config.arkSecretAccessKey,
    arkAssetProject: sanitizeOptionalText(body.arkAssetProject) || config.arkAssetProject || "default",
    arkAssetGroupId:
      body.clearArkAssetGroupId === true
        ? ""
        : sanitizeOptionalText(body.arkAssetGroupId) || config.arkAssetGroupId,
    tosBucket: sanitizeOptionalText(body.tosBucket),
    tosRegion: sanitizeOptionalText(body.tosRegion) || config.tosRegion || arkOpenApiRegion,
    tosEndpoint: sanitizeOptionalText(body.tosEndpoint),
    grsaiApiKey: clearedModels.has(grsaiDefaultModel) ? "" : sanitizeOptionalText(body.grsaiApiKey) || config.grsaiApiKey,
    baseUrl: sanitizeOptionalText(body.baseUrl) || config.baseUrl,
    imageEndpoint: sanitizeOptionalText(body.imageEndpoint) || config.imageEndpoint,
    editEndpoint: sanitizeOptionalText(body.editEndpoint) || config.editEndpoint,
    chatEndpoint: sanitizeOptionalText(body.chatEndpoint) || config.chatEndpoint,
    defaultModel: normalizeModelAlias(sanitizeOptionalText(body.defaultModel) || config.defaultModel),
    assistantModel: sanitizeOptionalText(body.assistantModel) || config.assistantModel,
    modelApiKeys: mergeModelApiKeys(body),
    modelConnections: mergeModelConnections(body),
    cacheDir: sanitizeCacheDir(body.cacheDir, config.cacheDir),
    photoshopBridgeEnabled:
      typeof body.photoshopBridgeEnabled === "boolean" ? body.photoshopBridgeEnabled : config.photoshopBridgeEnabled
  };

  config.apiKey = nextSettings.apiKey;
  config.arkApiKey = nextSettings.arkApiKey;
  config.arkBaseUrl = nextSettings.arkBaseUrl;
  config.arkAccessKeyId = nextSettings.arkAccessKeyId;
  config.arkSecretAccessKey = nextSettings.arkSecretAccessKey;
  config.arkAssetProject = nextSettings.arkAssetProject;
  config.arkAssetGroupId = nextSettings.arkAssetGroupId;
  config.tosBucket = nextSettings.tosBucket;
  config.tosRegion = nextSettings.tosRegion;
  config.tosEndpoint = nextSettings.tosEndpoint;
  config.grsaiApiKey = nextSettings.grsaiApiKey;
  config.baseUrl = nextSettings.baseUrl;
  config.imageEndpoint = nextSettings.imageEndpoint;
  config.editEndpoint = nextSettings.editEndpoint;
  config.chatEndpoint = nextSettings.chatEndpoint;
  config.defaultModel = nextSettings.defaultModel;
  config.assistantModel = nextSettings.assistantModel;
  config.modelApiKeys = nextSettings.modelApiKeys;
  config.modelConnections = nextSettings.modelConnections;
  config.cacheDir = nextSettings.cacheDir;
  config.photoshopBridgeEnabled = nextSettings.photoshopBridgeEnabled;

  await writeSettingsEnv(nextSettings);
  sendJson(res, 200, publicSettings());
}

async function handleArkAssetImport(req, res) {
  try {
    requireArkAssetCredentials();
    const body = await readJsonBody(req);
    const projectId = normalizeProjectId(body.projectId || "default");
    const projectName = sanitizeOptionalText(body.projectName) || config.arkAssetProject || "default";
    const inputItems = Array.isArray(body.items) ? body.items.slice(0, 12) : [];
    if (!inputItems.length) {
      return sendJson(res, 400, { error: "请先选择至少一张画布图片。" });
    }

    let groupId = sanitizeOptionalText(body.groupId) || config.arkAssetGroupId;
    if (!groupId) {
      const groupName = (sanitizeOptionalText(body.groupName) || "cc无限画布虚拟人像").slice(0, 64);
      const group = await arkOpenApiRequest("CreateAssetGroup", {
        Name: groupName,
        Description: "cc无限画布导入的 AI 生成人像素材",
        GroupType: "AIGC",
        ProjectName: projectName
      });
      groupId = sanitizeOptionalText(group?.Id || group?.id);
      if (!groupId) throw new Error("方舟已响应，但未返回 Asset Group ID。请到方舟控制台确认素材库授权书状态。");
      config.arkAssetGroupId = groupId;
      config.arkAssetProject = projectName;
      await writeSettingsEnv(config);
    }

    const items = [];
    for (let index = 0; index < inputItems.length; index += 1) {
      const item = inputItems[index] || {};
      const clientId = sanitizeOptionalText(item.clientId) || randomUUID();
      try {
        const prepared = await prepareArkAssetSource(item, projectId);
        const filename = sanitizeDownloadFilename(item.filename || prepared.filename || `虚拟人像-${index + 1}.png`);
        const result = await arkOpenApiRequest("CreateAsset", {
          GroupId: groupId,
          URL: prepared.url,
          Name: filename.slice(0, 64),
          AssetType: "Image",
          ProjectName: projectName
        });
        const assetId = sanitizeOptionalText(result?.Id || result?.id);
        if (!assetId) throw new Error("方舟已响应，但未返回 Asset ID。请检查素材库权限。 ");
        items.push({
          clientId,
          assetId,
          assetUri: `asset://${assetId}`,
          status: "Processing",
          sourceMode: prepared.sourceMode,
          error: ""
        });
      } catch (error) {
        items.push({
          clientId,
          assetId: "",
          assetUri: "",
          status: "Failed",
          sourceMode: "",
          error: arkAssetErrorMessage(error)
        });
      }
    }

    const successCount = items.filter((item) => item.assetId).length;
    sendJson(res, successCount ? 200 : 422, {
      ok: successCount > 0,
      groupId,
      projectName,
      items
    });
  } catch (error) {
    sendJson(res, 500, { error: arkAssetErrorMessage(error) });
  }
}

async function handleArkAssetStatus(req, res) {
  try {
    requireArkAssetCredentials();
    const body = await readJsonBody(req);
    const projectName = sanitizeOptionalText(body.projectName) || config.arkAssetProject || "default";
    const inputItems = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
    const items = [];
    for (const item of inputItems) {
      const assetId = sanitizeOptionalText(item?.assetId);
      if (!assetId) continue;
      try {
        const result = await arkOpenApiRequest("GetAsset", { Id: assetId, ProjectName: projectName });
        const status = sanitizeOptionalText(result?.Status || result?.status) || "Processing";
        const resultError = result?.Error || result?.error;
        items.push({
          clientId: sanitizeOptionalText(item?.clientId),
          assetId,
          assetUri: status === "Active" ? `asset://${assetId}` : "",
          status,
          error: resultError ? arkAssetErrorMessage(resultError) : ""
        });
      } catch (error) {
        items.push({
          clientId: sanitizeOptionalText(item?.clientId),
          assetId,
          assetUri: "",
          status: "Failed",
          error: arkAssetErrorMessage(error)
        });
      }
    }
    sendJson(res, 200, { ok: true, projectName, items });
  } catch (error) {
    sendJson(res, 500, { error: arkAssetErrorMessage(error) });
  }
}

function requireArkAssetCredentials() {
  if (!config.arkAccessKeyId || !config.arkSecretAccessKey) {
    throw new Error("请先在设置 > 火山方舟中填写 Access Key ID 和 Secret Access Key。");
  }
}

async function prepareArkAssetSource(item, projectId) {
  const sourceUrl = sanitizeOptionalText(item?.sourceUrl);
  if (isPublicArkAssetUrl(sourceUrl)) {
    return { url: sourceUrl, sourceMode: "source-url", filename: item.filename || filenameFromUrl(sourceUrl) };
  }

  if (!config.tosBucket) {
    throw new Error("这张图片只存在于本地。请先在设置 > 火山方舟中配置 TOS 存储桶，才能上传并转为素材。");
  }

  const localSource = await readCanvasImageSource(projectId, item?.url);
  const filename = sanitizeDownloadFilename(item?.filename || localSource.filename || "virtual-human.png");
  const extension = path.extname(filename).toLowerCase() || extensionForMime(localSource.contentType);
  const objectName = `${path.basename(filename, path.extname(filename))}${extension}`;
  const month = new Date().toISOString().slice(0, 7);
  const key = `cc-infinite-canvas/ark-assets/${month}/${randomUUID()}-${objectName}`;
  const clientOptions = {
    accessKeyId: config.arkAccessKeyId,
    accessKeySecret: config.arkSecretAccessKey,
    region: config.tosRegion || arkOpenApiRegion,
    bucket: config.tosBucket
  };
  if (config.tosEndpoint) clientOptions.endpoint = config.tosEndpoint.replace(/^https?:\/\//iu, "").replace(/\/$/u, "");
  const client = new TosClient(clientOptions);
  if (localSource.filePath) {
    await client.putObjectFromFile({ key, filePath: localSource.filePath, contentType: localSource.contentType });
  } else {
    await client.putObject({ key, body: localSource.bytes, contentType: localSource.contentType });
  }
  const url = client.getPreSignedUrl({ key, method: "GET", expires: 24 * 60 * 60 });
  return { url, sourceMode: "tos", filename };
}

async function readCanvasImageSource(projectId, value) {
  const raw = sanitizeOptionalText(value);
  const data = parseImageDataUrl(raw);
  if (data) return { bytes: data.bytes, contentType: data.contentType, filename: `image${extensionForMime(data.contentType)}` };

  const filePath = resolveCanvasImageFile(projectId, raw);
  if (!filePath) throw new Error("没有找到这张图片的本地缓存文件，请重新导入图片后再试。");
  const fileInfo = await stat(filePath);
  if (!fileInfo.isFile()) throw new Error("图片缓存路径不是文件。");
  if (fileInfo.size > 30 * 1024 * 1024) throw new Error("方舟素材图片必须小于 30 MB。");
  return {
    filePath,
    filename: path.basename(filePath),
    contentType: mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream"
  };
}

function resolveCanvasImageFile(projectId, value) {
  if (!value) return "";
  let pathname;
  try {
    pathname = new URL(value, "http://127.0.0.1").pathname;
  } catch {
    return "";
  }
  const parts = pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part));
  let candidate = "";
  if (parts[0] === "project-cache" && parts.length >= 4 && ["assets", "outputs"].includes(parts[2])) {
    const embeddedProjectId = normalizeProjectId(parts[1]);
    const root = parts[2] === "assets" ? projectAssetDir(embeddedProjectId) : projectOutputDir(embeddedProjectId);
    candidate = path.join(root, path.basename(parts.slice(3).join("/")));
  } else if (parts[0] === "outputs" && parts[1]) {
    candidate = path.join(outputDir, path.basename(parts.slice(1).join("/")));
  } else if (parts[0] === "cache" && parts[1] === "assets" && parts[2]) {
    candidate = path.join(assetCacheDir, path.basename(parts.slice(2).join("/")));
  } else if (parts[0] === "assets" && parts[1]) {
    candidate = path.join(projectAssetDir(projectId), path.basename(parts.slice(1).join("/")));
  }
  const resolved = candidate ? path.resolve(candidate) : "";
  if (!resolved) return "";
  return [config.cacheDir, outputDir, assetCacheDir].some((root) => isPathInside(resolved, root)) ? resolved : "";
}

function parseImageDataUrl(value) {
  const match = String(value || "").match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+)$/iu);
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 30 * 1024 * 1024) throw new Error("图片数据无效或超过 30 MB。");
  return { contentType: match[1].toLowerCase(), bytes };
}

function extensionForMime(contentType) {
  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
    "image/gif": ".gif",
    "image/tiff": ".tiff",
    "image/heic": ".heic",
    "image/heif": ".heif"
  };
  return extensions[String(contentType || "").toLowerCase()] || ".png";
}

function filenameFromUrl(value) {
  try {
    return path.basename(decodeURIComponent(new URL(value).pathname)) || "virtual-human.png";
  } catch {
    return "virtual-human.png";
  }
}

function isPublicArkAssetUrl(value) {
  if (!/^https?:\/\//iu.test(value)) return false;
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    if (["localhost", "0.0.0.0", "::1"].includes(hostname) || hostname.startsWith("127.")) return false;
    if (/^10\./u.test(hostname) || /^192\.168\./u.test(hostname)) return false;
    const private172 = hostname.match(/^172\.(\d{1,3})\./u);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return false;
    return true;
  } catch {
    return false;
  }
}

async function arkOpenApiRequest(action, payload) {
  const body = JSON.stringify(payload || {});
  const target = new URL(arkOpenApiBaseUrl);
  const query = canonicalQuery({ Action: action, Version: arkOpenApiVersion });
  const xDate = new Date().toISOString().replace(/[:-]|\.\d{3}/gu, "");
  const shortDate = xDate.slice(0, 8);
  const contentHash = sha256Hex(body);
  const signedHeaders = "host;x-content-sha256;x-date";
  const canonicalHeaders = `host:${target.host}\nx-content-sha256:${contentHash}\nx-date:${xDate}\n`;
  const canonicalRequest = `POST\n/\n${query}\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`;
  const credentialScope = `${shortDate}/${arkOpenApiRegion}/${arkOpenApiService}/request`;
  const stringToSign = `HMAC-SHA256\n${xDate}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`;
  const dateKey = hmacSha256(config.arkSecretAccessKey, shortDate);
  const regionKey = hmacSha256(dateKey, arkOpenApiRegion);
  const serviceKey = hmacSha256(regionKey, arkOpenApiService);
  const signingKey = hmacSha256(serviceKey, "request");
  const signature = hmacSha256(signingKey, stringToSign).toString("hex");
  const authorization = `HMAC-SHA256 Credential=${config.arkAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(`${arkOpenApiBaseUrl}/?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Content-Sha256": contentHash,
      "X-Date": xDate,
      Authorization: authorization
    },
    body
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`方舟素材接口返回了无法解析的内容（HTTP ${response.status}）。`);
  }
  const metadataError = data?.ResponseMetadata?.Error;
  if (!response.ok || metadataError) {
    const code = metadataError?.Code || data?.Code || "ArkAssetRequestFailed";
    const message = metadataError?.Message || data?.Message || `HTTP ${response.status}`;
    throw new Error(`${code}: ${message}`);
  }
  return data?.Result || {};
}

function canonicalQuery(values) {
  return Object.entries(values)
    .map(([key, value]) => [rfc3986Encode(key), rfc3986Encode(value)])
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function rfc3986Encode(value) {
  return encodeURIComponent(String(value)).replace(/[!'()*]/gu, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmacSha256(key, value) {
  return createHmac("sha256", key).update(value).digest();
}

function arkAssetErrorMessage(error) {
  const code = sanitizeOptionalText(error?.code || error?.Code);
  const message = sanitizeOptionalText(error?.message || error?.Message || String(error || "素材入库失败"));
  return code && !message.includes(code) ? `${code}: ${message}` : message;
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
        message: `即梦 CLI 已安装或更新到 ${result.executable}。`
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

async function handleDreaminaRelogin(res) {
  try {
    const status = await readDreaminaStatus();
    if (!status.installed) {
      return sendJson(res, 404, { error: "未检测到 Dreamina CLI，请先点击“安装/更新 CLI”。" });
    }

    const executable = await dreaminaShellExecutable();
    await launchDreaminaTerminal(dreaminaLoginCommand(executable, "relogin"), "cc infinite canvas - Switch Dreamina Account");
    sendJson(res, 202, {
      ok: true,
      message: "已打开即梦切换账号窗口，请在新授权流程中登录目标账号。"
    });
  } catch (error) {
    sendJson(res, 500, { error: dreaminaErrorMessage(error) });
  }
}

async function readDreaminaStatus() {
  let version = "";
  let buildVersion = "";
  let textImageModels = [];
  let imageEditModels = [];
  try {
    const versionResult = await runDreamina(["version"], { timeoutMs: 20000 });
    const versionData = parseDreaminaJson(versionResult.stdout);
    buildVersion = String(versionData?.version || extractDreaminaVersion(versionResult.stdout) || "");
    version = (await readDreaminaInstalledVersion()) || buildVersion;
    const modelSupport = await readDreaminaImageModelSupport();
    textImageModels = modelSupport.textImageModels;
    imageEditModels = modelSupport.imageEditModels;
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
      textImageModels,
      imageEditModels,
      totalCredit: Number.isFinite(Number(credit?.total_credit)) ? Number(credit.total_credit) : null,
      vipLevel: String(credit?.vip_level || "")
    };
  } catch (error) {
    return {
      installed: true,
      loggedIn: false,
      version,
      buildVersion,
      textImageModels,
      imageEditModels,
      error: dreaminaErrorMessage(error)
    };
  }
}

async function readDreaminaImageModelSupport() {
  try {
    const [textResult, editResult] = await Promise.all([
      runDreamina(["text2image", "--help"], { timeoutMs: 20000 }),
      runDreamina(["image2image", "--help"], { timeoutMs: 20000 })
    ]);
    return {
      textImageModels: extractDreaminaModelVersions(textResult.stdout),
      imageEditModels: extractDreaminaModelVersions(editResult.stdout)
    };
  } catch {
    return {
      textImageModels: [...dreaminaModelVersions],
      imageEditModels: [...dreaminaModelVersions].filter((version) => Number(version) >= 4)
    };
  }
}

function extractDreaminaModelVersions(text) {
  const match = String(text || "").match(/model_version\s*:\s*([^\r\n]+)/iu);
  if (!match) return [];
  return [...new Set(match[1].match(/\b\d+(?:\.\d+)+\b/gu) || [])].sort(compareDreaminaVersions);
}

function compareDreaminaVersions(left, right) {
  return right.localeCompare(left, undefined, { numeric: true, sensitivity: "base" });
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

function parseEnvBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

async function writeSettingsEnv(settings) {
  const updates = new Map([
    ["YUNWU_API_KEY", settings.apiKey],
    ["VOLCENGINE_ARK_API_KEY", settings.arkApiKey],
    ["VOLCENGINE_ARK_BASE_URL", settings.arkBaseUrl],
    ["VOLCENGINE_ACCESS_KEY_ID", settings.arkAccessKeyId],
    ["VOLCENGINE_SECRET_ACCESS_KEY", settings.arkSecretAccessKey],
    ["VOLCENGINE_ARK_ASSET_PROJECT", settings.arkAssetProject],
    ["VOLCENGINE_ARK_ASSET_GROUP_ID", settings.arkAssetGroupId],
    ["VOLCENGINE_TOS_BUCKET", settings.tosBucket],
    ["VOLCENGINE_TOS_REGION", settings.tosRegion],
    ["VOLCENGINE_TOS_ENDPOINT", settings.tosEndpoint],
    ["GRSAI_API_KEY", settings.grsaiApiKey],
    ["YUNWU_BASE_URL", settings.baseUrl],
    ["YUNWU_IMAGE_ENDPOINT", settings.imageEndpoint],
    ["YUNWU_EDIT_ENDPOINT", settings.editEndpoint],
    ["YUNWU_CHAT_ENDPOINT", settings.chatEndpoint],
    ["YUNWU_DEFAULT_MODEL", settings.defaultModel],
    ["YUNWU_ASSISTANT_MODEL", settings.assistantModel],
    ["CC_CANVAS_MODEL_KEYS_B64", encodeSettingsMap(settings.modelApiKeys)],
    ["CC_CANVAS_MODEL_CONNECTIONS_B64", encodeSettingsMap(settings.modelConnections)],
    ["CC_CANVAS_CACHE_DIR", settings.cacheDir],
    ["CC_CANVAS_PHOTOSHOP_BRIDGE_ENABLED", settings.photoshopBridgeEnabled ? "1" : "0"]
  ]);
  for (const model of modelKeyModels) {
    const key = normalizeModelName(model);
    updates.set(modelKeyEnvName(key), settings.modelApiKeys[key] || "");
  }
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

function projectPendingFile(projectId) {
  return path.join(projectDir(projectId), "project.pending.json");
}

function projectBackupFile(projectId) {
  return path.join(projectDir(projectId), "project.backup.json");
}

function assistantChatFile(projectId) {
  return path.join(projectDir(projectId), "assistant-chat.json");
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
  body.model = normalizeModelAlias(body.model || config.defaultModel);
  const prompt = String(body.prompt || "").trim();

  if (!prompt) {
    return sendJson(res, 400, { error: "Prompt is required." });
  }

  if (isArkVideoModel(body.model) || (body.mode === "video" && resolvedConnection(body.model, body, "video").protocol === "ark-video")) {
    return await handleArkVideoGenerate(res, body, prompt);
  }

  if (body.mode === "video" || isDreaminaVideoModel(body.model)) {
    return await handleDreaminaVideoGenerate(res, body, prompt);
  }

  if (body.mode === "edit" || isMultipart) {
    return await handleEdit(res, body);
  }

  return await handleCreate(res, body, prompt);
}

async function handleAssistantChat(req, res, options = {}) {
  const body = await readJsonBody(req, { maxBytes: 16 * 1024 * 1024 });
  const model = sanitizeOptionalText(body.model) || config.assistantModel || assistantDefaultModel;
  const messages = normalizeAssistantMessages(body.messages);
  const requestedMode = sanitizeOptionalText(options.mode || body.mode);
  const mode = requestedMode === "action_plan"
    ? "action_plan"
    : requestedMode === "photoshop_agent"
      ? "photoshop_agent"
      : "chat";
  if (!messages.length) {
    return sendJson(res, 400, { error: "At least one assistant message is required." });
  }

  if (mode === "photoshop_agent") {
    const normalizedModel = normalizeModelAlias(model);
    const isConfiguredChatModel = publicConnectionModels().some(
      (definition) => definition.capability === "chat" && normalizeModelAlias(definition.model) === normalizedModel
    );
    if (!isConfiguredChatModel) {
      return sendJson(res, 400, { error: `模型 ${model} 没有可供 PS Agent 使用的文本连接。` });
    }
  }

  const connectionBody = mode === "photoshop_agent" ? { ...body, connectionOverride: false } : body;
  const connection = resolvedConnection(model, connectionBody, "chat");
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(model) });
  }
  if (!["openai-chat", "gemini-native", "anthropic-messages"].includes(connection.protocol)) {
    return sendJson(res, 400, { error: `模型 ${model} 当前连接协议 ${connection.protocol} 不支持助手对话。` });
  }

  const context = normalizeAssistantContext(body.context);
  const temperature = Number.isFinite(Number(body.temperature)) ? Number(body.temperature) : 0.7;
  const assistantMessages = buildAssistantMessages(messages, context, mode);
  const payload = buildAssistantRequestPayload(connection, assistantMessages, temperature);
  const apiUrl = connection.apiUrl;

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
      headers: connectionAuthHeaders(connection),
      body: JSON.stringify(payload),
      signal: assistantAbortController.signal
    });
  } catch (error) {
    clearTimeout(assistantTimeout);
    res.off?.("close", abortAssistantOnClose);
    if (assistantAbortController.signal.aborted && (res.writableEnded || res.destroyed)) return;
    return sendJson(res, 502, {
      error: `Assistant request failed: ${error.message || error}`,
      request: { apiUrl, model, protocol: connection.protocol }
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
      request: { apiUrl, model, protocol: connection.protocol }
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
  const toolPlanValues = extractAssistantToolPlanValues(upstreamData);
  if (!content && !toolPlanValues.length) {
    return sendJson(res, 502, {
      error: "Assistant response did not include text content.",
      upstream: upstreamData
    });
  }

  if (mode === "photoshop_agent") {
    const parsedPhotoshopPlan = parsePhotoshopAgentResult(content, toolPlanValues);
    return sendJson(res, 200, {
      message: { role: "assistant", content: parsedPhotoshopPlan.content },
      photoshopPlan: parsedPhotoshopPlan.plan,
      model,
      usage: upstreamData.usage || null
    });
  }

  const parsedAssistantPlan = parseAssistantPlanResult(content, toolPlanValues);
  sendJson(res, 200, {
    message: { role: "assistant", content: parsedAssistantPlan.content },
    plan: parsedAssistantPlan.plan,
    model,
    usage: upstreamData.usage || null
  });
}

async function handleGetAssistantChatBackup(res, url) {
  const projectId = projectIdFromUrl(url);
  try {
    const raw = await readFile(assistantChatFile(projectId), "utf8");
    const backup = normalizeAssistantChatBackup(JSON.parse(raw), projectId);
    return sendJson(res, 200, { backup });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  sendJson(res, 200, {
    backup: {
      version: 1,
      projectId,
      savedAt: "",
      messages: []
    }
  });
}

async function handleSaveAssistantChatBackup(req, res, url) {
  const body = await readJsonBody(req, { maxBytes: 8 * 1024 * 1024 });
  const projectId = normalizeProjectId(body.projectId || url.searchParams.get("projectId") || "default");
  const backup = normalizeAssistantChatBackup(body, projectId);
  backup.savedAt = new Date().toISOString();

  await mkdir(projectDir(projectId), { recursive: true });
  await writeFile(assistantChatFile(projectId), JSON.stringify(backup, null, 2), "utf8");
  sendJson(res, 200, { ok: true, savedAt: backup.savedAt, count: backup.messages.length });
}

async function handleAssistantExtractFiles(req, res) {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return sendJson(res, 400, { error: "File extraction expects multipart/form-data." });
  }

  const body = await readMultipartBody(req, contentType);
  const uploads = Array.isArray(body.files) ? body.files.filter((file) => file.name === "files" || file.name === "file") : [];
  const files = [];
  const errors = [];

  for (const file of uploads.slice(0, 5)) {
    try {
      files.push(extractAssistantDocument(file));
    } catch (error) {
      errors.push({
        name: file.filename || "unknown",
        error: String(error?.message || error || "文件解析失败").slice(0, 300)
      });
    }
  }

  sendJson(res, 200, { files: files.filter((file) => file.text), errors });
}

function extractAssistantDocument(file) {
  const maxBytes = 5 * 1024 * 1024;
  const name = sanitizeOptionalText(file.filename || "local-file").slice(0, 180) || "local-file";
  const data = Buffer.from(file.data || []);
  if (!data.length) throw new Error("文件为空");
  if (data.length > maxBytes) throw new Error("文件超过 5MB");

  const extension = path.extname(name).toLowerCase();
  let text = "";
  let kind = "文本";

  if (extension === ".docx") {
    text = extractDocxText(data);
    kind = "DOCX";
  } else if (isAssistantTextDocument(extension, file.contentType)) {
    text = stripUtf8Bom(data.toString("utf8"));
    kind = extension ? extension.slice(1).toUpperCase() : "文本";
  } else {
    throw new Error("暂不支持该文件格式");
  }

  text = normalizeExtractedDocumentText(text).slice(0, 120000);
  if (!text.trim()) throw new Error("没有提取到可读取文本");
  return {
    name,
    size: data.length,
    kind,
    text
  };
}

function isAssistantTextDocument(extension, contentType = "") {
  const textExtensions = new Set([".txt", ".md", ".markdown", ".json", ".csv", ".tsv", ".srt", ".ass", ".log", ".yaml", ".yml"]);
  if (textExtensions.has(extension)) return true;
  return /^text\//iu.test(contentType || "");
}

function stripUtf8Bom(text) {
  return String(text || "").replace(/^\uFEFF/u, "");
}

function extractDocxText(buffer) {
  const entries = readZipEntries(buffer);
  const names = ["word/document.xml", "word/footnotes.xml", "word/endnotes.xml", "word/comments.xml"];
  return names
    .map((name) => entries.get(name))
    .filter(Boolean)
    .map((entry) => docxXmlToText(entry.toString("utf8")))
    .filter(Boolean)
    .join("\n\n");
}

function readZipEntries(buffer) {
  const end = findZipEndOfCentralDirectory(buffer);
  if (end < 0) throw new Error("DOCX 文件结构无效");
  const entryCount = buffer.readUInt16LE(end + 10);
  let cursor = buffer.readUInt32LE(end + 16);
  const entries = new Map();

  for (let index = 0; index < entryCount && cursor < buffer.length; index += 1) {
    if (buffer.readUInt32LE(cursor) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(cursor + 10);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localHeaderOffset = buffer.readUInt32LE(cursor + 42);
    const name = buffer.subarray(cursor + 46, cursor + 46 + fileNameLength).toString("utf8");
    const data = readZipEntryData(buffer, localHeaderOffset, compressedSize, method);
    entries.set(name, data);
    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findZipEndOfCentralDirectory(buffer) {
  const min = Math.max(0, buffer.length - 0xffff - 22);
  for (let index = buffer.length - 22; index >= min; index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) return index;
  }
  return -1;
}

function readZipEntryData(buffer, localHeaderOffset, compressedSize, method) {
  if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) throw new Error("DOCX 条目无效");
  const fileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
  const extraLength = buffer.readUInt16LE(localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + fileNameLength + extraLength;
  const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
  if (method === 0) return compressed;
  if (method === 8) return inflateRawSync(compressed);
  throw new Error("DOCX 压缩格式不支持");
}

function docxXmlToText(xml) {
  return decodeXmlEntities(
    String(xml || "")
      .replace(/<w:tab\/>/gu, "\t")
      .replace(/<w:br\/>/gu, "\n")
      .replace(/<\/w:p>/gu, "\n")
      .replace(/<\/w:tr>/gu, "\n")
      .replace(/<[^>]+>/gu, "")
  );
}

function decodeXmlEntities(text) {
  return String(text || "")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, '"')
    .replace(/&apos;/gu, "'");
}

function normalizeExtractedDocumentText(text) {
  return String(text || "")
    .replace(/\r\n?/gu, "\n")
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{4,}/gu, "\n\n\n")
    .trim();
}

function normalizeAssistantChatBackup(value, fallbackProjectId) {
  const projectId = normalizeProjectId(value?.projectId || fallbackProjectId || "default");
  const messages = Array.isArray(value?.messages) ? value.messages : Array.isArray(value) ? value : [];
  return {
    version: 1,
    projectId,
    savedAt: sanitizeOptionalText(value?.savedAt),
    messages: messages.slice(-80).map(normalizeAssistantStoredMessage).filter(Boolean)
  };
}

function normalizeAssistantStoredMessage(message) {
  if (!isPlainObject(message)) return null;
  const role = ["assistant", "system", "user"].includes(message.role) ? message.role : "user";
  const content = sanitizeOptionalText(message.content).slice(0, 24000);
  if (!content && !Array.isArray(message.attachments)) return null;
  return pruneEmpty({
    id: sanitizeOptionalText(message.id).slice(0, 120),
    role,
    content,
    attachments: normalizeAssistantStoredAttachments(message.attachments),
    plan: isPlainObject(message.plan) ? message.plan : null,
    error: Boolean(message.error),
    stopped: Boolean(message.stopped),
    retryOf: sanitizeOptionalText(message.retryOf).slice(0, 120),
    mode: message.mode === "action_plan" ? "action_plan" : "chat",
    createdAt: sanitizeOptionalText(message.createdAt).slice(0, 80)
  });
}

function normalizeAssistantStoredAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .slice(0, 12)
    .map((attachment) => {
      if (!isPlainObject(attachment)) return null;
      if (attachment.type === "image") {
        return pruneEmpty({
          type: "image",
          name: sanitizeOptionalText(attachment.name).slice(0, 160),
          nodeId: sanitizeOptionalText(attachment.nodeId).slice(0, 160),
          model: sanitizeOptionalText(attachment.model).slice(0, 160),
          prompt: sanitizeOptionalText(attachment.prompt).slice(0, 1600),
          key: sanitizeOptionalText(attachment.key).slice(0, 220)
        });
      }
      if (attachment.type === "file") {
        const text = sanitizeOptionalText(attachment.text).slice(0, 120000);
        if (!text) return null;
        return pruneEmpty({
          type: "file",
          name: sanitizeOptionalText(attachment.name).slice(0, 180) || "local-file",
          kind: sanitizeOptionalText(attachment.kind).slice(0, 40) || "文本",
          size: Number(attachment.size) || Buffer.byteLength(text, "utf8"),
          key: sanitizeOptionalText(attachment.key).slice(0, 220),
          text
        });
      }
      return null;
    })
    .filter(Boolean);
}

function assistantRequestTimeoutMs(model, mode = "chat") {
  const normalized = normalizeModelName(model);
  if (normalized.startsWith("gpt-5.")) {
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
    } else if (attachment.type === "file") {
      textParts.push(`本地文件：${attachment.name}\n类型：${attachment.kind || "文本"}\n大小：${attachment.size || 0} bytes\n\n${attachment.text}`);
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
      continue;
    }

    if (attachment.type === "file") {
      const text = String(attachment.text || "").trim().slice(0, 120000);
      if (!text) continue;
      normalized.push({
        type: "file",
        name: sanitizeOptionalText(attachment.name).slice(0, 180) || "local-file",
        kind: sanitizeOptionalText(attachment.kind).slice(0, 40) || "文本",
        size: Number(attachment.size) || Buffer.byteLength(text, "utf8"),
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
    recentNodes: Array.isArray(context.recentNodes) ? context.recentNodes.slice(0, 80) : [],
    photoshop: isPlainObject(context.photoshop) ? context.photoshop : {}
  };
}

function buildAssistantMessages(messages, context, mode = "chat") {
  if (mode === "photoshop_agent") {
    return buildPhotoshopAgentMessages(messages, context);
  }
  const contextLimit = mode === "action_plan" ? 48000 : 16000;
  const contextText = JSON.stringify(context, null, 2).slice(0, contextLimit);
  const baseMessages = [
    {
      role: "system",
      content:
        "你是 cc无限画布的画布助手，帮助用户管理画布、整理节点、优化生图/生视频提示词，并给出下一步创作建议。你不是外部网页助手，而是在为本地无限画布生成可执行建议或 JSON 操作计划。画布术语：生图节点/图片生成节点=task 节点，可用 create_task 创建；视频节点/生视频节点=video-task 节点，可用 create_video_task 创建；文字标注/文字节点/note=note 节点，可用 create_note 创建；图片节点=image；视频文件节点=video。你只能依据提供的画布上下文、节点参数、提示词和生成记录判断；如果没有图片像素内容，不要声称已经看到了图片细节。回答要简洁、具体、可执行，默认使用中文。"
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
    {
      role: "system",
      content:
        "画布可用能力表：create_note 用于文字标注、分析报告、提示词、说明、清单和标题；create_task 用于创建生图/作图/图片生成节点，图生图或参考图场景使用 mode:\"edit\"；create_video_task 用于创建生视频/视频生成节点；organize_nodes 用于普通整理排版；organize_groups 用于按人物、道具、场景、风格、用途等分类整理并生成分组标题；update_note/update_notes 用于改文字内容、字号和颜色；update_task 用于改生图节点参数；set_node_scale 用于调整图片或视频缩放。用户说“输出到画布、放到画布、写到画布、做成节点”时，不等于固定创建文字标注，必须根据语境选择动作：文本类结果才用 create_note，图片生成需求用 create_task，视频生成需求用 create_video_task，素材整理需求用 organize_nodes 或 organize_groups。"
    },
    {
      role: "system",
      content:
        "如果你准备让画布执行操作，绝不能只回复“已识别到 N 个画布操作，请确认后应用”。必须同时给出具体操作 JSON，格式可以是 {\"summary\":\"...\",\"actions\":[...]}，也可以是 [{\"type\":\"create_note\",...}]，或 [{\"type\":\"function\",\"name\":\"create_note\",\"parameters\":{...}}]。如果只是普通聊天建议，才可以不返回 JSON。"
    },
  ];

  if (mode === "action_plan") {
    baseMessages.push({
      role: "system",
      content:
        "本轮必须只返回 JSON，不要使用 Markdown，也不要解释你没有接口、没有权限、需要查看代码或需要用户先说明系统。你已经拥有前端支持的画布操作接口，只需要返回计划 JSON，前端会执行。JSON 格式：{\"summary\":\"一句话说明计划\",\"actions\":[...]}。允许的 action.type 只有：create_task、create_video_task、create_note、move_node、move_nodes、organize_nodes、organize_groups、update_task、update_note、update_notes、set_node_scale。禁止删除节点、禁止直接运行生成。最多 20 个动作。术语映射必须牢记：用户说“生图节点、图片生成节点、生成图片节点、作图节点”就是 create_task；用户说“图生图节点、参考图生图节点”也是 create_task 但 mode 应为 \"edit\"；用户说“生视频节点、视频生成节点”就是 create_video_task；用户说“文字标注、文字节点、提示词节点”就是 create_note。用户说“创建生图节点，将提示词填进去/把提示词填进去”时，应创建 create_task，并把用户消息中的提示词、选中的 note.text、选中 task.prompt 或最近上下文里明确的提示词填入 prompt；如果选中节点是 image/成图/结果图，用户说“这个节点已经是图片了，新建一个/再来一个/另建一个”或类似表达时，也必须返回 create_task，复用该图片的 prompt/model/size 等可用生成信息，把用户或上下文中的补充要求合并到 prompt，并把新节点放在该图片附近或下方；不要只解释不能改图片参数。如果确实没有提示词，就创建 prompt 为空的生图节点，而不是拒绝。坐标使用画布世界坐标，必须根据节点 width/height 留出 48px 以上间距，避免重叠。修改已有节点时必须使用上下文里的真实 id。整理、排版、对齐但不需要分类时使用 organize_nodes，不要手写大量 move_node。用户要求分类、归类、分组、按人物/道具/场景/风格/用途整理，或要求标注/标题时，优先使用 organize_groups，让你根据节点的 prompt、filename、model、sourceTaskId 和上下文判断分组；如果不确定，放入“未分类”。用户要求修改文字标注的颜色、字号、内容时使用 update_note 或 update_notes；如果目标是“选中的文字标注”，update_notes 使用 scope:\"selected\"；如果目标是“全部文字标注”，使用 scope:\"all\"；如果目标是“人物名字/标题/分组名/某类标注”等模糊对象，必须根据 note.text、上下文和选中状态自行判断并返回具体 ids，不要让前端猜。颜色优先返回 #RRGGBB，也可返回中文颜色名。create_task 字段可含 mode、prompt、model、size、n、quality、format、x、y；create_video_task 字段可含 prompt、model、size、n、quality、x、y；create_note 字段可含 text、x、y、fontSize、color、width、height；move_node 字段为 id、x、y；move_nodes 字段为 items:[{id,x,y}]；organize_nodes 字段为 ids:[id]、columns、gap、normalizeMedia、maxMediaLongSide；organize_groups 字段为 groups:[{title,ids,columns}]、originX、originY、gap、groupGap、orientation、normalizeMedia、maxMediaLongSide、labelFontSize、labelColor，其中 orientation 可为 horizontal 或 vertical，labelFontSize 建议 40-64；update_task 字段为 id、prompt、model、size、n、quality、format、mode；update_note 字段为 id、text、color、fontSize、width、height；update_notes 字段为 ids、scope、color、fontSize、width、height；set_node_scale 字段为 id、scale。"
    });
    baseMessages.push({
      role: "system",
      content:
        "再次强调：不要把“输出到画布”机械理解为 create_note。先判断用户要输出的对象是什么：分析报告、文字说明、提示词、标题、清单等文本产物用 create_note；要生成图片或创建作图任务用 create_task；要生成视频用 create_video_task；要整理现有图片、视频、文字和任务节点用 organize_nodes/organize_groups；要修改现有节点用 update_* 或 set_node_scale。"
    });
  }

  return [...baseMessages, ...messages];
}

function buildPhotoshopAgentMessages(messages, context) {
  const contextText = JSON.stringify(context?.photoshop || {}, null, 2).slice(0, 36000);
  return [
    {
      role: "system",
      content:
        "你是 PS Image AI 的 Photoshop Agent。你可以依据当前文档、选区和图层上下文，为用户拟定可由插件执行的安全操作计划。默认使用中文，先理解用户想修改的对象和程度；上下文没有像素预览时，不要声称看见了具体画面细节。不要输出 batchPlay、JavaScript、脚本、文件操作或未列入白名单的命令。"
    },
    {
      role: "system",
      content: `当前 Photoshop 上下文 JSON：\n${contextText}`
    },
    {
      role: "system",
      content:
        "当用户要求实际调整 Photoshop 文档时，只返回一个 JSON 对象，不要使用 Markdown：{\"message\":\"给用户的简短说明\",\"summary\":\"计划标题\",\"actions\":[...]}。允许的 action.type 只有：select_layer、rename_layer、duplicate_layer、set_layer_visibility、set_layer_opacity、create_layer、brightness_contrast、hue_saturation、gaussian_blur、invert、desaturate、prepare_ai_edit、prepare_ai_create。最多 12 个动作。除 create_layer 和 prepare_ai_* 外，layerId 省略时表示当前活动图层；要操作指定图层时必须使用上下文中的真实 layerId。字段：select_layer={layerId}；rename_layer={layerId,name}；duplicate_layer={layerId,name?}；set_layer_visibility={layerId,visible}；set_layer_opacity={layerId,opacity(0-100)}；create_layer={name?,opacity?}；brightness_contrast={layerId,brightness(-150..150),contrast(-100..100)}；hue_saturation={layerId,hue(-180..180),saturation(-100..100),lightness(-100..100)}；gaussian_blur={layerId,radius(0.1..250)}；invert/desaturate={layerId}；prepare_ai_edit/prepare_ai_create={prompt}，这两项只会把提示词填入插件，不会直接付费生成。禁止删除、合并、栅格化、裁切、缩放文档或运行付费生成。"
    },
    {
      role: "system",
      content:
        "如果用户只是咨询、让你解释方法或请求超出白名单的能力，直接正常回答，不要伪造动作。若请求有歧义，先提一个简短澄清问题，actions 返回空数组或不返回。"
    },
    ...messages
  ];
}

function buildAssistantRequestPayload(connection, messages, temperature) {
  if (connection.protocol === "anthropic-messages") {
    const system = messages
      .filter((message) => message.role === "system")
      .map((message) => assistantContentText(message.content))
      .filter(Boolean)
      .join("\n\n");
    return pruneEmpty({
      model: connection.apiModel,
      max_tokens: 8192,
      system,
      messages: messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: assistantContentParts(message.content).map(assistantPartToAnthropic).filter(Boolean)
        })),
      temperature
    });
  }

  if (connection.protocol === "gemini-native") {
    const systemText = messages
      .filter((message) => message.role === "system")
      .map((message) => assistantContentText(message.content))
      .filter(Boolean)
      .join("\n\n");
    return pruneEmpty({
      systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents: messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: assistantContentParts(message.content).map(assistantPartToGemini).filter(Boolean)
        })),
      generationConfig: { temperature }
    });
  }

  return pruneEmpty({
    model: connection.apiModel,
    messages,
    temperature,
    stream: false
  });
}

function assistantContentParts(content) {
  if (Array.isArray(content)) return content;
  if (typeof content === "string") return [{ type: "text", text: content }];
  return [];
}

function assistantContentText(content) {
  return assistantContentParts(content)
    .map((part) => (typeof part === "string" ? part : part?.text || part?.content || ""))
    .filter(Boolean)
    .join("\n");
}

function assistantImageUrl(part) {
  if (!isPlainObject(part)) return "";
  if (typeof part.image_url === "string") return part.image_url;
  return sanitizeOptionalText(part.image_url?.url || part.url);
}

function assistantPartToAnthropic(part) {
  if (typeof part === "string") return { type: "text", text: part };
  const imageUrl = assistantImageUrl(part);
  if (imageUrl) {
    const dataMatch = imageUrl.match(/^data:([^;,]+);base64,(.+)$/su);
    if (dataMatch) {
      return { type: "image", source: { type: "base64", media_type: dataMatch[1], data: dataMatch[2] } };
    }
    if (/^https?:\/\//i.test(imageUrl)) return { type: "image", source: { type: "url", url: imageUrl } };
  }
  const text = part?.text || part?.content || "";
  return text ? { type: "text", text: String(text) } : null;
}

function assistantPartToGemini(part) {
  if (typeof part === "string") return { text: part };
  const imageUrl = assistantImageUrl(part);
  if (imageUrl) {
    const dataMatch = imageUrl.match(/^data:([^;,]+);base64,(.+)$/su);
    if (dataMatch) return { inlineData: { mimeType: dataMatch[1], data: dataMatch[2] } };
    if (/^https?:\/\//i.test(imageUrl)) return { fileData: { fileUri: imageUrl, mimeType: "image/*" } };
  }
  const text = part?.text || part?.content || "";
  return text ? { text: String(text) } : null;
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
  if (Array.isArray(data?.content)) {
    return data.content
      .map((part) => (typeof part === "string" ? part : part?.text || part?.content || ""))
      .join("")
      .trim();
  }
  const geminiParts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(geminiParts)) {
    return geminiParts.map((part) => part?.text || "").join("").trim();
  }
  return "";
}

function extractAssistantToolPlanValues(data) {
  const values = [];
  const addToolCall = (call) => {
    if (!isPlainObject(call)) return;
    const source = isPlainObject(call.function)
      ? call.function
      : isPlainObject(call.function_call)
        ? call.function_call
        : call;
    const name = sanitizeOptionalText(source.name || call.name || call.type).slice(0, 160);
    const args =
      source.arguments ??
      source.args ??
      source.params ??
      source.parameters ??
      source.input ??
      call.arguments ??
      call.args ??
      call.params ??
      call.parameters ??
      call.input ??
      null;
    if (!name && args == null) return;
    values.push({ name, arguments: args });
  };

  const choices = Array.isArray(data?.choices) ? data.choices : [];
  for (const choice of choices) {
    const message = choice?.message;
    if (!isPlainObject(message)) continue;
    addToolCall(message.function_call);
    if (Array.isArray(message.tool_calls)) {
      for (const call of message.tool_calls) addToolCall(call);
    }
  }

  addToolCall(data?.function_call);
  if (Array.isArray(data?.tool_calls)) {
    for (const call of data.tool_calls) addToolCall(call);
  }

  if (Array.isArray(data?.output)) {
    for (const item of data.output) {
      if (isPlainObject(item) && /(?:function|tool)_?call/iu.test(String(item.type || ""))) {
        addToolCall(item);
      }
      const content = Array.isArray(item?.content) ? item.content : [];
      for (const part of content) {
        if (isPlainObject(part) && /(?:function|tool)_?call/iu.test(String(part.type || ""))) {
          addToolCall(part);
        }
      }
    }
  }

  return values;
}

function parseAssistantPlan(content) {
  return parseAssistantPlanResult(content).plan;
}

function parseAssistantPlanResult(content, extraValues = []) {
  const text = String(content || "").trim();
  const candidates = assistantJsonCandidates(text);
  const actions = [];
  const seenActions = new Set();
  const planRanges = [];
  let summary = "";

  const addParsedPlan = (parsed, range = null) => {
    const candidateActions = normalizeAssistantPlanActions(parsed);
    if (!candidateActions.length) return;

    if (!summary) summary = assistantPlanSummary(parsed);
    if (range) planRanges.push(range);

    for (const action of candidateActions) {
      const key = JSON.stringify(action);
      if (seenActions.has(key)) continue;
      seenActions.add(key);
      if (actions.length < 20) actions.push(action);
    }
  };

  for (const candidate of candidates) {
    const parsed = tryParseStrictJson(candidate.json);
    addParsedPlan(parsed, [candidate.start, candidate.end]);
  }

  for (const value of Array.isArray(extraValues) ? extraValues : []) {
    addParsedPlan(value);
  }

  if (!actions.length) {
    return { plan: null, content: text };
  }
  const plan = {
    summary: summary || `已识别到 ${actions.length} 个画布操作，请确认后应用。`,
    actions
  };
  const cleanedContent = removeAssistantPlanRanges(text, planRanges);
  return {
    plan,
    content: isAssistantPlanSummaryOnly(cleanedContent) ? plan.summary : cleanedContent || plan.summary
  };
}

const photoshopAgentActionTypes = new Set([
  "select_layer",
  "rename_layer",
  "duplicate_layer",
  "set_layer_visibility",
  "set_layer_opacity",
  "create_layer",
  "brightness_contrast",
  "hue_saturation",
  "gaussian_blur",
  "invert",
  "desaturate",
  "prepare_ai_edit",
  "prepare_ai_create"
]);

function parsePhotoshopAgentResult(content, extraValues = []) {
  const text = String(content || "").trim();
  const actions = [];
  const seen = new Set();
  const ranges = [];
  let summary = "";
  let message = "";

  const addValue = (value, range = null) => {
    const normalized = normalizePhotoshopAgentPlan(value);
    if (!normalized) return;
    if (!summary && normalized.summary) summary = normalized.summary;
    if (!message && normalized.message) message = normalized.message;
    if (range) ranges.push(range);
    for (const action of normalized.actions) {
      const key = JSON.stringify(action);
      if (seen.has(key) || actions.length >= 12) continue;
      seen.add(key);
      actions.push(action);
    }
  };

  for (const candidate of assistantJsonCandidates(text)) {
    addValue(tryParseStrictJson(candidate.json), [candidate.start, candidate.end]);
  }
  for (const value of Array.isArray(extraValues) ? extraValues : []) addValue(value);

  const cleaned = removeAssistantPlanRanges(text, ranges);
  const responseContent = message || cleaned || summary || (actions.length ? `已准备 ${actions.length} 个 Photoshop 操作。` : text);
  return {
    content: responseContent,
    plan: actions.length
      ? {
          summary: summary || `准备执行 ${actions.length} 个 Photoshop 操作`,
          actions
        }
      : null
  };
}

function normalizePhotoshopAgentPlan(value) {
  if (!value) return null;
  let candidates = [];
  let summary = "";
  let message = "";

  if (Array.isArray(value)) {
    candidates = value;
  } else if (isPlainObject(value)) {
    summary = sanitizeOptionalText(value.summary).slice(0, 240);
    message = sanitizeOptionalText(value.message || value.content).slice(0, 2000);
    if (Array.isArray(value.actions)) {
      candidates = value.actions;
    } else {
      const type = photoshopAgentActionType(value);
      if (photoshopAgentActionTypes.has(type)) candidates = [value];
      else {
        const args = parseAssistantActionArguments(value);
        if (args) return normalizePhotoshopAgentPlan({ ...args, message, summary });
      }
    }
  }

  const actions = candidates.map(normalizePhotoshopAgentAction).filter(Boolean).slice(0, 12);
  if (!actions.length && !message && !summary) return null;
  return { actions, summary, message };
}

function photoshopAgentActionType(action) {
  const values = [action?.type, action?.name, action?.action, action?.tool]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return values.find((value) => photoshopAgentActionTypes.has(value)) || values[0] || "";
}

function normalizePhotoshopAgentAction(action) {
  if (!isPlainObject(action)) return null;
  const type = photoshopAgentActionType(action);
  const args = parseAssistantActionArguments(action);
  const source = args ? { ...args, type } : { ...action, type };
  if (!photoshopAgentActionTypes.has(type)) return null;

  const layerId = positiveInteger(source.layerId ?? source.targetLayerId ?? source.id);
  if (type === "select_layer") return layerId ? { type, layerId } : null;
  if (type === "rename_layer") {
    const name = sanitizeOptionalText(source.name).slice(0, 180);
    return name ? pruneEmpty({ type, layerId, name }) : null;
  }
  if (type === "duplicate_layer") {
    return pruneEmpty({ type, layerId, name: sanitizeOptionalText(source.name).slice(0, 180) });
  }
  if (type === "set_layer_visibility") {
    if (typeof source.visible !== "boolean") return null;
    return pruneEmpty({ type, layerId, visible: source.visible });
  }
  if (type === "set_layer_opacity") {
    return pruneEmpty({ type, layerId, opacity: boundedNumber(source.opacity, 0, 100, 100) });
  }
  if (type === "create_layer") {
    return pruneEmpty({
      type,
      name: sanitizeOptionalText(source.name).slice(0, 180) || "Agent 新图层",
      opacity: boundedNumber(source.opacity, 0, 100, 100)
    });
  }
  if (type === "brightness_contrast") {
    return pruneEmpty({
      type,
      layerId,
      brightness: boundedNumber(source.brightness, -150, 150, 0),
      contrast: boundedNumber(source.contrast, -100, 100, 0)
    });
  }
  if (type === "hue_saturation") {
    return pruneEmpty({
      type,
      layerId,
      hue: boundedNumber(source.hue, -180, 180, 0),
      saturation: boundedNumber(source.saturation, -100, 100, 0),
      lightness: boundedNumber(source.lightness, -100, 100, 0)
    });
  }
  if (type === "gaussian_blur") {
    return pruneEmpty({ type, layerId, radius: boundedNumber(source.radius, 0.1, 250, 1) });
  }
  if (type === "invert" || type === "desaturate") return pruneEmpty({ type, layerId });
  if (type === "prepare_ai_edit" || type === "prepare_ai_create") {
    const prompt = sanitizeOptionalText(source.prompt).slice(0, 12000);
    return prompt ? { type, prompt } : null;
  }
  return null;
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function boundedNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function assistantPlanSummary(parsed) {
  if (isPlainObject(parsed)) {
    const directSummary = sanitizeOptionalText(parsed.summary);
    if (directSummary) return directSummary;
    const args = parseAssistantActionArguments(parsed);
    if (isPlainObject(args)) return sanitizeOptionalText(args.summary);
  }
  return "";
}

function isAssistantPlanSummaryOnly(value) {
  return /^已识别到\s*\d+\s*个画布操作，请确认后应用。?$/u.test(String(value || "").trim());
}

const assistantPlanActionTypes = new Set([
  "create_task",
  "create_video_task",
  "create_note",
  "move_node",
  "move_nodes",
  "organize_nodes",
  "organize_groups",
  "update_task",
  "update_note",
  "update_notes",
  "set_node_scale"
]);

function normalizeAssistantPlanActions(parsed) {
  let candidates = [];
  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (isPlainObject(parsed) && Array.isArray(parsed.actions)) {
    candidates = parsed.actions;
  } else if (isPlainObject(parsed) && assistantPlanActionTypes.has(assistantPlanActionType(parsed))) {
    candidates = [parsed];
  } else if (isPlainObject(parsed)) {
    const args = parseAssistantActionArguments(parsed);
    if (args) return normalizeAssistantPlanActions(args);
  }

  return candidates
    .map(normalizeAssistantPlanAction)
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeAssistantPlanAction(action) {
  if (!isPlainObject(action)) return null;
  const type = assistantPlanActionType(action);

  const args = parseAssistantActionArguments(action);
  if (!assistantPlanActionTypes.has(type)) {
    if (args) return normalizeAssistantPlanActions(args)[0] || null;
    return null;
  }
  const normalized = args ? { ...args, type } : { ...action, type };
  delete normalized.name;
  delete normalized.action;
  delete normalized.tool;
  delete normalized.arguments;
  delete normalized.args;
  delete normalized.params;
  delete normalized.parameters;
  delete normalized.input;
  return normalized;
}

function assistantPlanActionType(action) {
  const values = [action?.type, action?.name, action?.action, action?.tool]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return values.find((value) => assistantPlanActionTypes.has(value)) || values[0] || "";
}

function parseAssistantActionArguments(action) {
  const raw =
    action.arguments ??
    action.args ??
    action.params ??
    action.parameters ??
    action.input ??
    null;
  if (isPlainObject(raw)) return raw;
  if (typeof raw !== "string") return null;
  const parsed = tryParseStrictJson(raw);
  return isPlainObject(parsed) ? parsed : null;
}

function tryParseAssistantJson(content) {
  for (const candidate of assistantJsonCandidates(content)) {
    const parsed = tryParseStrictJson(candidate.json);
    if (parsed) return parsed;
  }
  return null;
}

function tryParseStrictJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function stripJsonFence(text) {
  return text.replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

function assistantJsonCandidates(content) {
  const text = String(content || "");
  const candidates = [];
  const seen = new Set();
  const fencedRanges = [];
  const addCandidate = (json, start, end) => {
    const trimmed = stripJsonFence(json);
    if (!trimmed) return;
    const key = `${start}:${end}:${trimmed.length}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ json: trimmed, start, end });
  };

  for (const match of text.matchAll(/```(?:json)?\s*([\s\S]*?)```/giu)) {
    const start = match.index || 0;
    const end = start + match[0].length;
    fencedRanges.push([start, end]);
    addCandidate(match[1], start, end);
  }

  const whole = text.trim();
  if (whole) addCandidate(whole, text.indexOf(whole), text.indexOf(whole) + whole.length);

  for (let index = 0; index < text.length; index += 1) {
    if (isIndexInRanges(index, fencedRanges)) continue;
    const char = text[index];
    if (char !== "{" && char !== "[") continue;
    const block = readBalancedJsonCandidate(text, index);
    if (!block) continue;
    addCandidate(block.json, index, block.end);
    index = block.end - 1;
  }

  return candidates;
}

function readBalancedJsonCandidate(text, start) {
  const opener = text[start];
  const closer = opener === "{" ? "}" : "]";
  const stack = [closer];
  let inString = false;
  let escaped = false;

  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }
    if (char !== "}" && char !== "]") continue;
    if (char !== stack.pop()) return null;
    if (!stack.length) {
      const end = index + 1;
      return { json: text.slice(start, end), end };
    }
  }

  return null;
}

function isIndexInRanges(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function removeAssistantPlanRanges(text, ranges) {
  if (!ranges.length) return String(text || "").trim();
  const merged = ranges
    .map(([start, end]) => [Math.max(0, start), Math.min(text.length, end)])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0])
    .reduce((list, range) => {
      const last = list[list.length - 1];
      if (last && range[0] <= last[1]) {
        last[1] = Math.max(last[1], range[1]);
      } else {
        list.push([...range]);
      }
      return list;
    }, []);

  let output = "";
  let cursor = 0;
  for (const [start, end] of merged) {
    output += text.slice(cursor, start);
    cursor = end;
  }
  output += text.slice(cursor);
  return output
    .replace(/[ \t]+\n/gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

async function handleListProjects(res) {
  const projects = [];
  const recoveredProjects = [];
  const unrecoverableProjects = [];
  const root = path.join(config.cacheDir, "canvases");

  try {
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const id = normalizeProjectId(entry.name);
      try {
        const result = await readRecoverableProject(id, { repair: true });
        if (!result?.project) {
          unrecoverableProjects.push(id);
          continue;
        }
        const project = result.project;
        projects.push({
          id,
          name: sanitizeOptionalText(project.name) || id,
          savedAt: project.savedAt || "",
          nodeCount: Array.isArray(project.nodes) ? project.nodes.length : 0,
          recovered: result.recovered
        });
        if (result.recovered) recoveredProjects.push(id);
      } catch {
        unrecoverableProjects.push(id);
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
  sendJson(res, 200, { projects, recoveredProjects, unrecoverableProjects, cacheDir: config.cacheDir });
}

async function handleGetProject(res, url) {
  const projectId = projectIdFromUrl(url);
  try {
    const result = await readRecoverableProject(projectId, { repair: true });
    if (result?.project) {
      return sendJson(res, 200, { project: result.project, recovered: result.recovered, recoverySource: result.source });
    }
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

  await queueProjectWrite(projectId, () => writeProjectRecordAtomic(projectId, safeProject));
  sendJson(res, 200, { ok: true, project: projectSummary(safeProject), savedAt: safeProject.savedAt });
}

async function readRecoverableProject(projectId, options = {}) {
  const id = normalizeProjectId(projectId);
  const sources = [
    { source: "primary", file: projectFile(id), priority: 2 },
    { source: "pending", file: projectPendingFile(id), priority: 3 },
    { source: "backup", file: projectBackupFile(id), priority: 1 }
  ];
  const candidates = [];

  for (const source of sources) {
    const candidate = await readProjectCandidate(source.file, id, source.source, source.priority);
    if (candidate) candidates.push(candidate);
  }
  if (!candidates.length) return null;

  candidates.sort((left, right) => right.savedTime - left.savedTime || right.priority - left.priority);
  const selected = candidates[0];
  const primary = candidates.find((candidate) => candidate.source === "primary");
  const shouldRepair = selected.source !== "primary" || !primary || selected.savedTime > primary.savedTime;

  if (options.repair !== false && shouldRepair) {
    await queueProjectWrite(id, () => writeProjectRecordAtomic(id, selected.project, { backupCurrent: false }));
  }
  if (options.repair !== false && selected.source !== "pending") {
    await rm(projectPendingFile(id), { force: true }).catch(() => {});
  }

  return {
    project: selected.project,
    source: selected.source,
    recovered: shouldRepair
  };
}

async function readProjectCandidate(filename, projectId, source, priority) {
  try {
    const [raw, info] = await Promise.all([readFile(filename, "utf8"), stat(filename)]);
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed) || !Array.isArray(parsed.nodes)) return null;
    const project = normalizeProjectRecord(parsed, projectId);
    project.savedAt = sanitizeOptionalText(parsed.savedAt) || info.mtime.toISOString();
    const parsedTime = Date.parse(project.savedAt);
    return {
      project,
      source,
      priority,
      savedTime: Number.isFinite(parsedTime) ? parsedTime : info.mtimeMs
    };
  } catch {
    return null;
  }
}

async function writeProjectRecordAtomic(projectId, project, options = {}) {
  const id = normalizeProjectId(projectId);
  const directory = projectDir(id);
  const primary = projectFile(id);
  const backup = projectBackupFile(id);
  await mkdir(directory, { recursive: true });

  if (options.backupCurrent !== false) {
    try {
      const currentRaw = await readFile(primary, "utf8");
      const current = JSON.parse(currentRaw);
      if (isPlainObject(current) && Array.isArray(current.nodes)) {
        await writeTextAtomic(backup, `${backup}.pending`, currentRaw);
      }
    } catch {
      // A missing or corrupt primary must not replace the last valid backup.
    }
  }

  await writeTextAtomic(primary, projectPendingFile(id), JSON.stringify(project, null, 2));
}

async function writeTextAtomic(target, pending, content) {
  const handle = await open(pending, "w");
  try {
    await handle.writeFile(content, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(pending, target);
}

async function queueProjectWrite(projectId, operation) {
  const id = normalizeProjectId(projectId);
  const previous = projectWriteQueues.get(id) || Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  projectWriteQueues.set(id, current);
  try {
    return await current;
  } finally {
    if (projectWriteQueues.get(id) === current) projectWriteQueues.delete(id);
  }
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

async function handlePhotoshopBridgeRequest(req, res, url) {
  applyPhotoshopBridgeCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const thumbnailRequest = req.method === "GET" && url.pathname.startsWith("/api/photoshop/canvas-images/");
  const hasHeaderCredential = req.headers[photoshopBridgeHeader] === photoshopBridgeHeaderValue;
  const hasThumbnailCredential = thumbnailRequest && url.searchParams.get("bridge") === photoshopBridgeHeaderValue;
  if (!hasHeaderCredential && !hasThumbnailCredential) {
    return sendJson(res, 403, { error: "Photoshop bridge request was rejected." });
  }

  if (req.method === "GET" && url.pathname === "/api/photoshop/status") {
    if (config.photoshopBridgeEnabled) {
      await ensurePhotoshopBridgeState();
      noteActivePhotoshopProject(url);
    }
    return sendJson(res, 200, {
      ok: Boolean(config.photoshopBridgeEnabled),
      enabled: Boolean(config.photoshopBridgeEnabled),
      port: photoshopBridgePort,
      inboxCount: config.photoshopBridgeEnabled ? photoshopBridgeState.inbox.length : 0,
      outboxCount: config.photoshopBridgeEnabled ? photoshopBridgeState.outbox.length : 0,
      activeProjectId: photoshopBridgeState.activeProjectId,
      activeProjectName: photoshopBridgeState.activeProjectName
    });
  }

  if (!config.photoshopBridgeEnabled) {
    return sendJson(res, 503, { error: "Photoshop integration is disabled in cc无限画布 settings." });
  }

  await ensurePhotoshopBridgeState();
  noteActivePhotoshopProject(url);

  if (req.method === "GET" && url.pathname === "/api/photoshop/assistant/config") {
    return handlePhotoshopAssistantConfig(res);
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/assistant/settings/open") {
    return await handlePhotoshopAssistantSettingsOpen(req, res);
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/assistant/chat") {
    return await handleAssistantChat(req, res, { mode: "photoshop_agent" });
  }

  if (req.method === "GET" && url.pathname === "/api/photoshop/canvas-images") {
    return await handlePhotoshopCanvasImageList(res, url);
  }
  if (thumbnailRequest) {
    return await servePhotoshopCanvasImage(res, url);
  }

  if (req.method === "POST" && url.pathname === "/api/photoshop/inbox") {
    return await handlePhotoshopInboxPush(req, res);
  }
  if (req.method === "GET" && url.pathname === "/api/photoshop/inbox") {
    return await handlePhotoshopQueueList(res, "inbox");
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/inbox/ack") {
    return await handlePhotoshopQueueAck(req, res, "inbox");
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/outbox") {
    return await handlePhotoshopOutboxPush(req, res);
  }
  if (req.method === "GET" && url.pathname === "/api/photoshop/outbox") {
    return await handlePhotoshopQueueList(res, "outbox");
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/outbox/ack") {
    return await handlePhotoshopQueueAck(req, res, "outbox");
  }
  if (req.method === "GET" && url.pathname.startsWith("/api/photoshop/assets/")) {
    return await servePhotoshopBridgeAsset(res, url.pathname);
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/reference-selection/request") {
    return handlePhotoshopReferenceSelectionCreate(res);
  }
  if (req.method === "GET" && url.pathname === "/api/photoshop/reference-selection/request") {
    return handlePhotoshopReferenceSelectionRequest(res);
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/reference-selection/complete") {
    return await handlePhotoshopReferenceSelectionComplete(req, res);
  }
  if (req.method === "POST" && url.pathname === "/api/photoshop/reference-selection/cancel") {
    return await handlePhotoshopReferenceSelectionCancel(req, res);
  }
  if (req.method === "GET" && url.pathname === "/api/photoshop/reference-selection/result") {
    return handlePhotoshopReferenceSelectionResult(res, url);
  }

  sendJson(res, 404, { error: "Photoshop bridge endpoint was not found." });
}

function handlePhotoshopAssistantConfig(res) {
  const seenModels = new Set();
  const models = publicConnectionModels()
    .filter((definition) => definition.capability === "chat")
    .filter((definition) => {
      const model = normalizeModelAlias(definition.model);
      if (!model || seenModels.has(model)) return false;
      seenModels.add(model);
      return true;
    })
    .map((definition) => {
      const model = normalizeModelAlias(definition.model);
      const connection = connectionForModel(model);
      return {
        model,
        label: definition.label || model,
        provider: definition.provider || assistantProviderForModel(model),
        preset: connection.preset,
        protocol: connection.protocol,
        hasKey: Boolean(apiKeyForModel(model))
      };
    });
  const configuredModel = normalizeModelAlias(config.assistantModel || assistantDefaultModel);
  const assistantModel = models.some((item) => item.model === configuredModel)
    ? configuredModel
    : models.find((item) => item.hasKey)?.model || models[0]?.model || assistantDefaultModel;
  sendJson(res, 200, { enabled: true, assistantModel, models });
}

async function handlePhotoshopAssistantSettingsOpen(req, res) {
  const body = await readJsonBody(req, { maxBytes: 16 * 1024 });
  const requestedModel = normalizeModelAlias(body.model || config.assistantModel || assistantDefaultModel);
  const model = publicConnectionModels().some(
    (definition) => definition.capability === "chat" && normalizeModelAlias(definition.model) === requestedModel
  )
    ? requestedModel
    : normalizeModelAlias(config.assistantModel || assistantDefaultModel);
  const opened = photoshopBridgeEvents.emit("assistant-settings-requested", { model });
  sendJson(res, 200, { ok: true, opened, model });
}

function applyPhotoshopBridgeCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  if (origin) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-CC-Canvas-Bridge, X-CC-Filename, X-CC-Source-Label"
  );
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function noteActivePhotoshopProject(url) {
  const rawProjectId = String(url.searchParams.get("projectId") || "").trim();
  if (!rawProjectId) return;
  photoshopBridgeState.activeProjectId = normalizeProjectId(rawProjectId);
  photoshopBridgeState.activeProjectName = sanitizeOptionalText(url.searchParams.get("projectName")).slice(0, 180);
}

function photoshopBridgeRoot() {
  return path.join(config.cacheDir, "photoshop-bridge");
}

function photoshopBridgeQueueFile() {
  return path.join(photoshopBridgeRoot(), "queue.json");
}

function photoshopBridgeAssetDir(channel) {
  return path.join(photoshopBridgeRoot(), channel === "outbox" ? "outbox" : "inbox");
}

async function ensurePhotoshopBridgeState() {
  const nextStatePath = photoshopBridgeQueueFile();
  if (photoshopBridgeStatePath === nextStatePath) return;

  photoshopBridgeStatePath = nextStatePath;
  photoshopBridgeState = {
    inbox: [],
    outbox: [],
    activeProjectId: "default",
    activeProjectName: ""
  };
  await mkdir(photoshopBridgeAssetDir("inbox"), { recursive: true });
  await mkdir(photoshopBridgeAssetDir("outbox"), { recursive: true });

  try {
    const stored = JSON.parse(await readFile(nextStatePath, "utf8"));
    photoshopBridgeState = {
      inbox: normalizePhotoshopBridgeItems(stored?.inbox),
      outbox: normalizePhotoshopBridgeItems(stored?.outbox),
      activeProjectId: normalizeProjectId(stored?.activeProjectId || "default"),
      activeProjectName: sanitizeOptionalText(stored?.activeProjectName).slice(0, 180)
    };
  } catch {
    // A new cache starts with empty bridge queues.
  }
}

function normalizePhotoshopBridgeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const filename = path.basename(String(item?.filename || ""));
      if (!filename) return null;
      return {
        id: sanitizeOptionalText(item.id) || filename,
        filename,
        originalName: sanitizeBridgeFilename(item.originalName || filename),
        contentType: sanitizeOptionalText(item.contentType) || "image/png",
        sourceLabel: sanitizeOptionalText(item.sourceLabel).slice(0, 180),
        createdAt: item.createdAt || new Date().toISOString(),
        contentHash: sanitizeOptionalText(item.contentHash)
      };
    })
    .filter(Boolean)
    .slice(-photoshopBridgeQueueLimit);
}

async function savePhotoshopBridgeState() {
  await mkdir(photoshopBridgeRoot(), { recursive: true });
  await writeFile(photoshopBridgeQueueFile(), JSON.stringify(photoshopBridgeState, null, 2), "utf8");
}

async function handlePhotoshopCanvasImageList(res, url) {
  const projectId = normalizeProjectId(
    url.searchParams.get("projectId") || photoshopBridgeState.activeProjectId || "default"
  );
  const project = await readPhotoshopBridgeProject(projectId);
  if (!project) {
    return sendJson(res, 200, {
      project: { id: projectId, name: photoshopBridgeState.activeProjectName || projectId },
      images: []
    });
  }

  const images = project.nodes
    .filter((node) => node?.type === "image" && String(node.image?.url || "").trim())
    .sort((a, b) => (Number(b.z) || 0) - (Number(a.z) || 0))
    .slice(0, 240)
    .map((node) => publicPhotoshopCanvasImage(node, projectId));

  sendJson(res, 200, {
    project: { id: project.id, name: project.name },
    images,
    count: images.length
  });
}

function publicPhotoshopCanvasImage(node, projectId) {
  const filename = sanitizeBridgeFilename(node.image?.filename || `canvas-${node.id}.png`);
  const params = new URLSearchParams({
    projectId,
    bridge: photoshopBridgeHeaderValue
  });
  const assetPath = `/api/photoshop/canvas-images/${encodeURIComponent(String(node.id))}`;
  const downloadUrl = `${assetPath}?${params}`;
  params.set("thumbnail", "1");
  const thumbnailUrl = `${assetPath}?${params}`;
  return {
    id: String(node.id),
    filename,
    prompt: sanitizeOptionalText(node.image?.prompt).slice(0, 240),
    model: sanitizeOptionalText(node.image?.model).slice(0, 120),
    width: Math.max(0, Number(node.originalWidth) || 0),
    height: Math.max(0, Number(node.originalHeight) || 0),
    createdAt: node.createdAt || "",
    thumbnailUrl,
    downloadUrl
  };
}

function handlePhotoshopReferenceSelectionCreate(res) {
  const now = Date.now();
  photoshopReferenceSelection = {
    id: `ps-ref-${now}-${Math.random().toString(16).slice(2)}`,
    status: "pending",
    projectId: photoshopBridgeState.activeProjectId || "default",
    projectName: photoshopBridgeState.activeProjectName || "",
    createdAt: new Date(now).toISOString(),
    expiresAt: now + photoshopReferenceSelectionTtlMs,
    images: []
  };
  photoshopBridgeEvents.emit("reference-selection-requested", photoshopReferenceSelection);
  sendJson(res, 201, { request: publicPhotoshopReferenceSelection(photoshopReferenceSelection) });
}

function handlePhotoshopReferenceSelectionRequest(res) {
  const request = activePhotoshopReferenceSelection();
  sendJson(res, 200, {
    request: request?.status === "pending" ? publicPhotoshopReferenceSelection(request) : null
  });
}

async function handlePhotoshopReferenceSelectionComplete(req, res) {
  const body = await readJsonBody(req, { maxBytes: 256 * 1024 });
  const request = activePhotoshopReferenceSelection();
  if (!request || request.status !== "pending" || String(body.requestId || "") !== request.id) {
    return sendJson(res, 409, { error: "Photoshop reference selection request is no longer active." });
  }

  const projectId = normalizeProjectId(body.projectId || request.projectId || photoshopBridgeState.activeProjectId || "default");
  const nodeIds = new Set(dedupeTextValues(body.nodeIds).slice(0, photoshopReferenceSelectionLimit));
  if (!nodeIds.size) return sendJson(res, 400, { error: "Select at least one canvas image." });

  const project = await readPhotoshopBridgeProject(projectId);
  if (!project) return sendJson(res, 404, { error: "Canvas project was not found." });
  const images = project.nodes
    .filter((node) => node?.type === "image" && nodeIds.has(String(node.id)) && String(node.image?.url || "").trim())
    .map((node) => publicPhotoshopCanvasImage(node, projectId));
  if (!images.length) return sendJson(res, 400, { error: "The selection does not contain usable canvas images." });

  request.status = "complete";
  request.projectId = projectId;
  request.projectName = project.name || request.projectName;
  request.images = images;
  request.completedAt = new Date().toISOString();
  sendJson(res, 200, { request: publicPhotoshopReferenceSelection(request), images });
}

async function handlePhotoshopReferenceSelectionCancel(req, res) {
  const body = await readJsonBody(req, { maxBytes: 64 * 1024 });
  const requestId = String(body.requestId || "");
  if (photoshopReferenceSelection && (!requestId || photoshopReferenceSelection.id === requestId)) {
    photoshopReferenceSelection = null;
  }
  sendJson(res, 200, { ok: true });
}

function handlePhotoshopReferenceSelectionResult(res, url) {
  const request = activePhotoshopReferenceSelection();
  const requestId = String(url.searchParams.get("requestId") || "");
  if (!request || request.id !== requestId) {
    return sendJson(res, 200, { status: "expired", images: [] });
  }
  sendJson(res, 200, {
    status: request.status,
    request: publicPhotoshopReferenceSelection(request),
    images: request.status === "complete" ? request.images : []
  });
}

function activePhotoshopReferenceSelection() {
  if (!photoshopReferenceSelection) return null;
  if (Date.now() <= photoshopReferenceSelection.expiresAt) return photoshopReferenceSelection;
  photoshopReferenceSelection = null;
  return null;
}

function publicPhotoshopReferenceSelection(request) {
  return {
    id: request.id,
    status: request.status,
    projectId: request.projectId,
    projectName: request.projectName,
    createdAt: request.createdAt,
    completedAt: request.completedAt || ""
  };
}

async function servePhotoshopCanvasImage(res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const nodeId = decodeURIComponent(parts.slice(3).join("/"));
  const projectId = normalizeProjectId(
    url.searchParams.get("projectId") || photoshopBridgeState.activeProjectId || "default"
  );
  const project = await readPhotoshopBridgeProject(projectId);
  const node = project?.nodes?.find((item) => item?.type === "image" && String(item.id) === nodeId);
  const imageUrl = String(node?.image?.url || "").trim();
  if (!imageUrl) return sendText(res, 404, "Not found");
  const thumbnail = url.searchParams.get("thumbnail") === "1";

  const pathname = photoshopCanvasImagePathname(imageUrl);
  if (pathname?.startsWith("/project-cache/")) {
    return await serveProjectCacheFile(res, pathname, { imageThumbnail: thumbnail });
  }
  if (pathname?.startsWith("/outputs/") || pathname?.startsWith("/cache/assets/")) {
    return await serveFile(res, path.join(__dirname, decodeURIComponent(pathname)), { imageThumbnail: thumbnail });
  }
  if (pathname?.startsWith("/assets/")) {
    return await serveFile(res, path.join(publicDir, decodeURIComponent(pathname)), { imageThumbnail: thumbnail });
  }

  const loaded = await loadPhotoshopBridgeImage(imageUrl, `${serverHost}:${config.port}`);
  if (!loaded?.bytes?.length) return sendText(res, 404, "Not found");
  const thumbnailImage = thumbnail ? createPhotoshopThumbnail(loaded.bytes) : null;
  const responseBytes = thumbnailImage?.bytes || loaded.bytes;
  const responseType = thumbnailImage?.contentType || loaded.contentType || "image/png";
  res.writeHead(200, {
    "Content-Type": responseType,
    "Content-Length": responseBytes.length,
    "Cache-Control": "no-store"
  });
  res.end(responseBytes);
}

async function readPhotoshopBridgeProject(projectId) {
  try {
    const raw = await readFile(projectFile(projectId), "utf8");
    return normalizeProjectRecord(JSON.parse(raw), projectId);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (projectId !== "default") return null;
  try {
    const raw = await readFile(projectCacheFile, "utf8");
    return normalizeProjectRecord(JSON.parse(raw), "default");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return null;
  }
}

function photoshopCanvasImagePathname(imageUrl) {
  try {
    return new URL(imageUrl, "http://127.0.0.1").pathname;
  } catch {
    return "";
  }
}

async function handlePhotoshopInboxPush(req, res) {
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (!contentType.startsWith("image/")) {
    return sendJson(res, 400, { error: "Photoshop bridge only accepts image files." });
  }

  const bytes = await readBinaryBody(req, 120 * 1024 * 1024);
  if (!bytes.length) return sendJson(res, 400, { error: "Photoshop exported an empty image." });

  await ensurePhotoshopBridgeState();
  const originalName = decodeBridgeHeader(req.headers["x-cc-filename"]) || `photoshop-${Date.now()}.png`;
  const sourceLabel = decodeBridgeHeader(req.headers["x-cc-source-label"]);
  const extension = extensionFromMime(contentType) || extensionFromUrl(originalName) || "png";
  const filename = createOutputFilename(extension);
  await writeFile(path.join(photoshopBridgeAssetDir("inbox"), filename), bytes);

  const item = {
    id: createPhotoshopBridgeId(),
    filename,
    originalName: sanitizeBridgeFilename(originalName),
    contentType,
    sourceLabel: sanitizeOptionalText(sourceLabel).slice(0, 180),
    createdAt: new Date().toISOString(),
    contentHash: imageContentHash(bytes)
  };
  photoshopBridgeState.inbox.push(item);
  await trimPhotoshopBridgeQueue("inbox");
  await savePhotoshopBridgeState();
  sendJson(res, 201, { ok: true, item: publicPhotoshopBridgeItem(item, "inbox") });
}

async function handlePhotoshopOutboxPush(req, res) {
  const body = await readJsonBody(req, { maxBytes: 120 * 1024 * 1024 });
  const imageUrl = sanitizeOptionalText(body.imageUrl || body.url);
  if (!imageUrl) return sendJson(res, 400, { error: "Canvas image URL is required." });

  const loaded = await loadPhotoshopBridgeImage(imageUrl, req.headers.host);
  if (!loaded?.bytes?.length) {
    return sendJson(res, 502, { error: "Unable to read the canvas image for Photoshop." });
  }

  await ensurePhotoshopBridgeState();
  const originalName = sanitizeBridgeFilename(body.filename || extensionFilenameFromUrl(imageUrl, loaded.contentType));
  const extension = extensionFromMime(loaded.contentType) || extensionFromUrl(originalName) || "png";
  const filename = createOutputFilename(extension);
  await writeFile(path.join(photoshopBridgeAssetDir("outbox"), filename), loaded.bytes);

  const item = {
    id: createPhotoshopBridgeId(),
    filename,
    originalName,
    contentType: loaded.contentType,
    sourceLabel: sanitizeOptionalText(body.sourceLabel || "cc无限画布").slice(0, 180),
    createdAt: new Date().toISOString(),
    contentHash: imageContentHash(loaded.bytes)
  };
  photoshopBridgeState.outbox.push(item);
  await trimPhotoshopBridgeQueue("outbox");
  await savePhotoshopBridgeState();
  sendJson(res, 201, {
    ok: true,
    queueCount: photoshopBridgeState.outbox.length,
    item: publicPhotoshopBridgeItem(item, "outbox")
  });
}

async function handlePhotoshopQueueList(res, channel) {
  await ensurePhotoshopBridgeState();
  const items = photoshopBridgeState[channel]
    .slice(0, 12)
    .map((item) => publicPhotoshopBridgeItem(item, channel));
  sendJson(res, 200, { items, count: photoshopBridgeState[channel].length });
}

async function handlePhotoshopQueueAck(req, res, channel) {
  const body = await readJsonBody(req, { maxBytes: 512 * 1024 });
  const ids = new Set(dedupeTextValues(body.ids || [body.id]));
  if (!ids.size) return sendJson(res, 400, { error: "At least one bridge item id is required." });

  await ensurePhotoshopBridgeState();
  const removed = photoshopBridgeState[channel].filter((item) => ids.has(item.id));
  photoshopBridgeState[channel] = photoshopBridgeState[channel].filter((item) => !ids.has(item.id));
  await Promise.all(
    removed.map((item) => rm(path.join(photoshopBridgeAssetDir(channel), item.filename), { force: true }).catch(() => {}))
  );
  await savePhotoshopBridgeState();
  sendJson(res, 200, { ok: true, removed: removed.length, remaining: photoshopBridgeState[channel].length });
}

async function trimPhotoshopBridgeQueue(channel) {
  const overflow = Math.max(0, photoshopBridgeState[channel].length - photoshopBridgeQueueLimit);
  if (!overflow) return;
  const removed = photoshopBridgeState[channel].splice(0, overflow);
  await Promise.all(
    removed.map((item) => rm(path.join(photoshopBridgeAssetDir(channel), item.filename), { force: true }).catch(() => {}))
  );
}

function publicPhotoshopBridgeItem(item, channel) {
  return {
    ...item,
    url: `/api/photoshop/assets/${channel}/${encodeURIComponent(item.filename)}`
  };
}

async function servePhotoshopBridgeAsset(res, pathname) {
  await ensurePhotoshopBridgeState();
  const parts = pathname.split("/").filter(Boolean);
  const channel = parts[3] === "outbox" ? "outbox" : parts[3] === "inbox" ? "inbox" : "";
  const filename = path.basename(decodeURIComponent(parts.slice(4).join("/")));
  if (!channel || !filename) return sendText(res, 404, "Not found");
  return await serveFile(res, path.join(photoshopBridgeAssetDir(channel), filename));
}

async function loadPhotoshopBridgeImage(imageUrl, host) {
  if (/^data:image\//i.test(imageUrl)) {
    const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s);
    if (!match) return null;
    const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
    if (!bytes.length || bytes.length > 120 * 1024 * 1024) return null;
    return { bytes, contentType: match[1].toLowerCase() };
  }

  let url;
  try {
    url = new URL(imageUrl, `http://${host || `${serverHost}:${config.port}`}`);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol)) return null;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || "";
    const extension = extensionFromUrl(url.href);
    if (!contentType.startsWith("image/") && !["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) return null;
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 120 * 1024 * 1024) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 120 * 1024 * 1024) return null;
    return { bytes, contentType: contentType.startsWith("image/") ? contentType : mimeTypes.get(`.${extension}`) || "image/png" };
  } catch {
    return null;
  }
}

function createPhotoshopBridgeId() {
  return `ps-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function decodeBridgeHeader(value) {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function sanitizeBridgeFilename(value) {
  const filename = path.basename(String(value || "image.png"))
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return filename.slice(0, 180) || "image.png";
}

function extensionFilenameFromUrl(url, contentType) {
  const extension = extensionFromUrl(url) || extensionFromMime(contentType) || "png";
  return `cc-canvas-${Date.now()}.${extension}`;
}

function dedupeTextValues(values) {
  return Array.from(new Set((Array.isArray(values) ? values : []).map((value) => sanitizeOptionalText(value)).filter(Boolean)));
}

async function handleCreate(res, body, prompt) {
  const requestedModel = body.model || config.defaultModel;
  if (isArkVideoModel(requestedModel)) {
    return await handleArkVideoGenerate(res, body, prompt);
  }
  if (isDreaminaVideoModel(requestedModel)) {
    return await handleDreaminaVideoGenerate(res, body, prompt);
  }

  if (isDreaminaImageModel(requestedModel)) {
    return await handleDreaminaGenerate(res, body, prompt);
  }

  const connection = resolvedConnection(requestedModel, body, "create");
  if (connection.protocol === "ark-images") return await handleArkImageGenerate(res, body, prompt, [], connection);
  if (connection.protocol === "gemini-native") return await handleGeminiNativeGenerate(res, body, prompt, [], connection);
  if (connection.protocol === "grsai") return await handleGrsaiGenerate(res, body, prompt, [], connection);
  if (connection.protocol !== "openai-images") {
    return sendJson(res, 400, { error: `模型 ${requestedModel} 当前连接协议 ${connection.protocol} 不支持生图。` });
  }

  const projectId = normalizeProjectId(body.projectId || "default");
  const extraParams = isPlainObject(body.extraParams) ? body.extraParams : {};
  const payload = pruneEmpty({
    model: connection.apiModel,
    prompt,
    n: Number(body.n || 1),
    size: body.size,
    quality: body.quality,
    format: body.format || body.outputFormat,
    ...extraParams
  });
  applyModelRequestDefaults(payload, "create");

  const apiUrl = connection.apiUrl;
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(requestedModel) });
  }
  const startedAt = Date.now();

  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: connectionAuthHeaders(connection),
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

async function handleGrsaiGenerate(res, body, prompt, imageFiles = [], suppliedConnection = null) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const extraParams = parseExtraParamsValue(body.extraParams);
  const { images: extraImages, ...extraPayload } = extraParams;
  const size = parseGrsaiSize(body.size);
  const payload = pruneEmpty({
    model: suppliedConnection?.apiModel || body.model || grsaiDefaultModel,
    prompt,
    images: [...normalizeGrsaiImageRefs(extraImages), ...imageFiles.map(fileToDataUrl)],
    aspectRatio: size.aspectRatio,
    imageSize: size.imageSize,
    replyType: "json",
    ...extraPayload
  });
  applyModelRequestDefaults(payload, "create");

  const connection = suppliedConnection || resolvedConnection(body.model || grsaiDefaultModel, body, "create");
  const apiUrl = connection.apiUrl || grsaiGenerateUrl(body);
  const apiKey = connection.apiKey;
  if (!apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(body.model || grsaiDefaultModel) });
  }
  const startedAt = Date.now();

  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: connectionAuthHeaders(connection),
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

async function handleArkImageGenerate(res, body, prompt, imageFiles = [], suppliedConnection = null) {
  const modelName = normalizeModelAlias(body.model);
  const projectId = normalizeProjectId(body.projectId || "default");
  const connection = suppliedConnection || resolvedConnection(modelName, body, imageFiles.length ? "edit" : "create");
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(modelName) });
  }

  const extraParams = parseExtraParamsValue(body.extraParams);
  const count = Math.min(15, Math.max(1, Number.parseInt(body.n, 10) || 1));
  const proModel = modelName === "ark-seedream-5.0-pro";
  const supportsSequential = !proModel;
  const optimizeMode = normalizeArkOptimizeMode(body.quality, modelName);
  const payload = pruneEmpty({
    model: connection.apiModel,
    prompt,
    image: imageFiles.length ? imageFiles.slice(0, arkImageReferenceLimit(modelName)).map(fileToDataUrl) : undefined,
    size: normalizeArkImageSize(body.size, modelName),
    response_format: "url",
    watermark: false,
    optimize_prompt_options: optimizeMode ? { mode: optimizeMode } : undefined,
    output_format: proModel && ["png", "jpeg"].includes(String(body.format || "").toLowerCase())
      ? String(body.format).toLowerCase()
      : undefined,
    sequential_image_generation: supportsSequential && count > 1 ? "auto" : undefined,
    sequential_image_generation_options: supportsSequential && count > 1 ? { max_images: count } : undefined,
    ...extraParams
  });
  const startedAt = Date.now();

  const upstream = await fetch(connection.apiUrl, {
    method: "POST",
    headers: connectionAuthHeaders(connection),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(180000)
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
  if (!images.length) {
    return sendJson(res, 502, {
      error: "火山方舟已返回结果，但没有识别到图片数据。",
      upstream: upstreamData
    });
  }

  sendJson(res, 200, {
    durationMs: Date.now() - startedAt,
    request: {
      provider: "volcengine-ark",
      apiUrl: connection.apiUrl,
      payload: { ...payload, image: imageFiles.length ? `<${imageFiles.length} reference image(s)>` : undefined }
    },
    images,
    raw: upstreamData
  });
}

function arkImageReferenceLimit(model) {
  return normalizeModelAlias(model) === "ark-seedream-5.0-pro" ? 10 : 14;
}

function normalizeArkOptimizeMode(value, model) {
  const requested = String(value || "").trim().toLowerCase();
  if (!requested) return "";
  if (requested === "fast" && ["ark-seedream-5.0-lite", "ark-seedream-4.5"].includes(normalizeModelAlias(model))) {
    return "standard";
  }
  return ["standard", "fast"].includes(requested) ? requested : "";
}

function normalizeArkImageSize(value, model) {
  const requested = String(value || "").trim().toUpperCase();
  const normalizedModel = normalizeModelAlias(model);
  const tiers = normalizedModel === "ark-seedream-5.0-pro"
    ? new Set(["1K", "2K"])
    : normalizedModel === "ark-seedream-5.0-lite"
      ? new Set(["2K", "3K", "4K"])
      : normalizedModel === "ark-seedream-4.5"
        ? new Set(["2K", "4K"])
        : new Set(["1K", "2K", "4K"]);
  if (tiers.has(requested)) return requested;
  const dimensions = requested.match(/^(\d{3,5})X(\d{3,5})$/u);
  if (dimensions) {
    const width = Number(dimensions[1]);
    const height = Number(dimensions[2]);
    const pixels = width * height;
    const ratio = width / height;
    const limits = normalizedModel === "ark-seedream-5.0-pro"
      ? { minPixels: 3686400, maxPixels: 4624220 }
      : normalizedModel === "ark-seedream-4.0"
        ? { minPixels: 921600, maxPixels: 16777216 }
        : { minPixels: 3686400, maxPixels: 16777216 };
    if (pixels >= limits.minPixels && pixels <= limits.maxPixels && ratio >= 1 / 16 && ratio <= 16) {
      return requested.toLowerCase();
    }
    return closestArkImageSize(width, height, normalizedModel);
  }
  return "2K";
}

function closestArkImageSize(width, height, model) {
  const proSizes = [
    [2048, 2048], [2368, 1776], [1776, 2368], [2816, 1584],
    [1584, 2816], [2496, 1664], [1664, 2496], [3136, 1344]
  ];
  const standard2kSizes = [
    [2048, 2048], [2304, 1728], [1728, 2304], [2848, 1600],
    [1600, 2848], [2496, 1664], [1664, 2496], [3136, 1344]
  ];
  const requestedRatio = width / height;
  const requestedPixels = width * height;
  const candidates = model === "ark-seedream-5.0-pro" ? proSizes : standard2kSizes;
  candidates.sort((left, right) => {
    const leftRatioDelta = Math.abs(Math.log((left[0] / left[1]) / requestedRatio));
    const rightRatioDelta = Math.abs(Math.log((right[0] / right[1]) / requestedRatio));
    if (leftRatioDelta !== rightRatioDelta) return leftRatioDelta - rightRatioDelta;
    return Math.abs(Math.log((left[0] * left[1]) / requestedPixels))
      - Math.abs(Math.log((right[0] * right[1]) / requestedPixels));
  });
  return `${candidates[0][0]}x${candidates[0][1]}`;
}

async function handleGeminiNativeGenerate(res, body, prompt, imageFiles = [], suppliedConnection = null) {
  const projectId = normalizeProjectId(body.projectId || "default");
  const extraParams = parseExtraParamsValue(body.extraParams);
  const payload = buildGeminiNativePayload(prompt, imageFiles, extraParams, body);
  const connection = suppliedConnection || resolvedConnection(body.model || geminiBananaImageModel, body, imageFiles.length ? "edit" : "create");
  const apiUrl = connection.apiUrl;
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(body.model) });
  }
  const startedAt = Date.now();

  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: connectionAuthHeaders(connection),
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
  if (!images.length) {
    return sendJson(res, 502, {
      error: "Gemini native response did not include an image.",
      upstream: upstreamData
    });
  }

  sendJson(res, 200, {
    durationMs: Date.now() - startedAt,
    request: {
      apiUrl,
      payload: summarizeGeminiNativePayload(payload, imageFiles.length)
    },
    images,
    raw: upstreamData
  });
}

function buildGeminiNativePayload(prompt, imageFiles = [], extraParams = {}, body = {}) {
  const extra = isPlainObject(extraParams) ? { ...extraParams } : {};
  const customContents = Array.isArray(extra.contents) ? extra.contents : null;
  delete extra.contents;
  const parts = [
    { text: prompt },
    ...imageFiles
      .filter((file) => String(file.contentType || "").startsWith("image/"))
      .map(fileToGeminiInlinePart)
  ];

  const imageConfig = parseGeminiNativeImageConfig(body);
  const defaultGenerationConfig = {
    response_modalities: ["IMAGE", "TEXT"],
    imageConfig
  };
  const userGenerationConfig = isPlainObject(extra.generationConfig) ? extra.generationConfig : {};
  delete extra.generationConfig;
  const mergedGenerationConfig = {
    ...defaultGenerationConfig,
    ...userGenerationConfig,
    imageConfig: {
      ...imageConfig,
      ...(isPlainObject(userGenerationConfig.imageConfig) ? userGenerationConfig.imageConfig : {})
    }
  };

  return pruneEmpty({
    contents: customContents || [{ role: "user", parts }],
    generationConfig: mergedGenerationConfig,
    ...extra
  });
}

function parseGeminiNativeImageConfig(body = {}) {
  const rawSize = String(body.size || "").trim();
  const rawQuality = String(body.quality || "").trim().toUpperCase();
  const [ratioPart, imageSizePart = ""] = rawSize.split(/[|@]/);
  const aspectRatio = /^\d+:\d+$/.test(ratioPart) ? ratioPart : geminiNativeDefaultRatio;
  const imageSize = normalizeGeminiNativeImageSize(rawQuality) || normalizeGeminiNativeImageSize(imageSizePart) || geminiNativeDefaultImageSize;
  return { aspectRatio, imageSize };
}

function normalizeGeminiNativeImageSize(value) {
  const clean = String(value || "").trim().toUpperCase();
  return ["1K", "2K", "4K"].includes(clean) ? clean : "";
}

function fileToGeminiInlinePart(file) {
  return {
    inlineData: {
      mimeType: file.contentType || "image/png",
      data: Buffer.from(file.data || []).toString("base64")
    }
  };
}

function summarizeGeminiNativePayload(payload, referenceCount = 0) {
  return {
    ...payload,
    contents: Array.isArray(payload.contents)
      ? payload.contents.map((content) => ({
          ...content,
          parts: Array.isArray(content.parts)
            ? content.parts.map((part) =>
                part?.inlineData || part?.inline_data
                  ? { inlineData: { mimeType: part.inlineData?.mimeType || part.inline_data?.mime_type || "image/*", data: `<${referenceCount} reference image(s)>` } }
                  : part
              )
            : content.parts
        }))
      : payload.contents
  };
}

function geminiNativeEndpointPath(body) {
  const clean = sanitizeOptionalText(body.endpointPath);
  if (/^\/v1beta\/models\/.+:generateContent$/i.test(clean)) return clean;
  const model = normalizeModelAlias(body.model || geminiBananaImageModel);
  return `/v1beta/models/${model}:generateContent`;
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

  const connection = resolvedConnection(modelName, body, "edit");
  if (connection.protocol === "ark-images") return await handleArkImageGenerate(res, body, body.prompt, requestImages, connection);
  if (connection.protocol === "gemini-native") return await handleGeminiNativeGenerate(res, body, body.prompt, requestImages, connection);
  if (connection.protocol === "grsai") return await handleGrsaiGenerate(res, body, body.prompt, requestImages, connection);
  if (connection.protocol !== "openai-images") {
    return sendJson(res, 400, { error: `模型 ${modelName} 当前连接协议 ${connection.protocol} 不支持图片编辑。` });
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
    model: connection.apiModel,
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

  const apiUrl = connection.apiUrl;
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(modelName) });
  }
  const startedAt = Date.now();
  const upstream = await fetch(apiUrl, {
    method: "POST",
    headers: { ...connectionAuthHeaders(connection, ""), Accept: "application/json" },
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

async function handleArkVideoGenerate(res, body, prompt) {
  const modelName = normalizeModelAlias(body.model);
  const projectId = normalizeProjectId(body.projectId || "default");
  const files = Array.isArray(body.files) ? body.files : [];
  const uploadedImages = files.filter((file) => file.name === "image" && String(file.contentType || "").startsWith("image/"));
  const cachedImages = await loadCachedAssets(parseCachedAssetRefs(body.cachedImages), projectId);
  const arkAssetUris = parseArkAssetUris(body.arkAssetUris).slice(0, 9);
  const imageFiles = [...cachedImages, ...uploadedImages]
    .filter((file) => String(file.contentType || "").startsWith("image/"))
    .slice(0, Math.max(0, 9 - arkAssetUris.length));
  const connection = resolvedConnection(modelName, body, "video");
  if (connection.protocol !== "ark-video") {
    return sendJson(res, 400, { error: `模型 ${modelName} 当前连接协议 ${connection.protocol} 不支持火山方舟视频生成。` });
  }
  if (!connection.apiKey) {
    return sendJson(res, 500, { error: missingKeyMessage(modelName) });
  }

  const extraParams = parseExtraParamsValue(body.extraParams);
  const content = [{ type: "text", text: prompt }];
  for (const assetUri of arkAssetUris) {
    content.push({
      type: "image_url",
      image_url: { url: assetUri },
      role: "reference_image"
    });
  }
  for (const image of imageFiles) {
    content.push({
      type: "image_url",
      image_url: { url: fileToDataUrl(image) },
      role: "reference_image"
    });
  }
  const payload = pruneEmpty({
    model: connection.apiModel,
    content,
    resolution: normalizeArkVideoResolution(body.quality, modelName),
    ratio: normalizeArkVideoRatio(body.size),
    duration: normalizeArkVideoDuration(body.n),
    generate_audio: extraParams.generate_audio === undefined ? true : Boolean(extraParams.generate_audio),
    watermark: extraParams.watermark === undefined ? false : Boolean(extraParams.watermark),
    return_last_frame: Boolean(extraParams.return_last_frame),
    ...extraParams
  });
  const startedAt = Date.now();

  try {
    const created = await fetchArkJson(connection.apiUrl, connection, {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 180000
    });
    const taskId = String(created?.id || "").trim();
    if (!taskId) {
      const error = new Error("火山方舟创建视频任务后未返回任务 ID。");
      error.data = created;
      throw error;
    }
    const finalData = await pollArkVideoTask(connection, taskId);
    const videoUrl = String(finalData?.content?.video_url || "").trim();
    if (!videoUrl) {
      const error = new Error("火山方舟视频任务已完成，但没有返回视频地址。");
      error.data = finalData;
      throw error;
    }
    const video = await persistArkVideo(videoUrl, projectId, finalData);
    sendJson(res, 200, {
      durationMs: Date.now() - startedAt,
      request: {
        provider: "volcengine-ark",
        apiUrl: connection.apiUrl,
        taskId,
        virtualHumanAssetCount: arkAssetUris.length,
        payload: { ...payload, content: summarizeArkVideoContent(content) }
      },
      videos: [video],
      raw: finalData
    });
  } catch (error) {
    sendJson(res, Number(error.status) || 502, {
      error: error.message || "火山方舟视频生成失败。",
      upstream: error.data || undefined
    });
  }
}

function normalizeArkVideoRatio(value) {
  const ratio = String(value || "16:9").trim().toLowerCase();
  const allowed = new Set(["adaptive", "16:9", "4:3", "1:1", "3:4", "9:16", "21:9"]);
  return allowed.has(ratio) ? ratio : "16:9";
}

function normalizeArkVideoDuration(value) {
  const duration = Number.parseInt(value, 10);
  return Number.isFinite(duration) ? Math.min(15, Math.max(4, duration)) : 5;
}

function normalizeArkVideoResolution(value, model) {
  const resolution = String(value || "720p").trim().toLowerCase();
  const normalized = normalizeModelAlias(model);
  if (normalized === "ark-seedance-2.0" && ["480p", "720p", "1080p", "4k"].includes(resolution)) return resolution;
  if (["480p", "720p"].includes(resolution)) return resolution;
  return "720p";
}

async function fetchArkJson(url, connection, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: connectionAuthHeaders(connection),
    body: options.body,
    signal: AbortSignal.timeout(Number(options.timeoutMs) || 60000)
  });
  const responseText = await response.text();
  const data = tryParseJson(responseText);
  if (!response.ok) {
    const error = new Error(readUpstreamError(data, responseText));
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function pollArkVideoTask(connection, taskId) {
  const url = `${connection.apiUrl.replace(/\/+$/u, "")}/${encodeURIComponent(taskId)}`;
  let current = null;
  for (let attempt = 0; attempt < 180; attempt += 1) {
    if (attempt) await delay(3000);
    current = await fetchArkJson(url, connection, { timeoutMs: 60000 });
    const status = normalizeModelName(current?.status);
    if (status === "succeeded") return current;
    if (["failed", "expired", "cancelled"].includes(status)) {
      const error = new Error(readUpstreamError(current, current?.error?.message) || `火山方舟视频任务状态：${status}`);
      error.data = current;
      throw error;
    }
  }
  const error = new Error("火山方舟视频任务等待超时，可使用任务 ID 在方舟控制台继续查询。");
  error.data = current;
  throw error;
}

async function persistArkVideo(url, projectId, taskData = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(10 * 60 * 1000) });
  if (!response.ok || !response.body) throw new Error(`火山方舟视频下载失败（HTTP ${response.status}）。`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 1024 * 1024 * 1024) throw new Error("火山方舟视频超过 1GB，已停止本地缓存。");
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "video/mp4";
  const urlExtension = extensionFromUrl(url);
  const extension = dreaminaVideoExtensions.has(`.${urlExtension}`) ? urlExtension : extensionFromMime(contentType) || "mp4";
  const filename = createOutputFilename(extension);
  const outputRoot = projectOutputDir(projectId);
  const outputPath = path.join(outputRoot, filename);
  await mkdir(outputRoot, { recursive: true });
  try {
    await pipeline(response.body, createWriteStream(outputPath));
  } catch (error) {
    await rm(outputPath, { force: true }).catch(() => {});
    throw error;
  }
  return {
    type: "file",
    url: projectPublicPath(projectId, "outputs", filename),
    filename,
    sourceUrl: url,
    width: Number(taskData?.content?.width) || undefined,
    height: Number(taskData?.content?.height) || undefined,
    duration: Number(taskData?.duration) || undefined,
    format: extension
  };
}

function summarizeArkVideoContent(content) {
  return content.map((item) => item.type === "image_url"
    ? { type: item.type, role: item.role, image_url: { url: "<reference image>" } }
    : item);
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
  if (!dreaminaModelVersions.has(version) && !/^\d+(?:\.\d+)+$/u.test(version)) {
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

function dreaminaLoginCommand(executable, action = "login") {
  const command = action === "relogin" ? "relogin" : "login";
  if (process.platform === "win32") {
    return [
      "@echo off",
      "chcp 65001 >nul",
      "set \"PATH=%USERPROFILE%\\bin;%PATH%\"",
      command === "relogin" ? "echo Switching Dreamina account..." : "echo Starting Dreamina login...",
      `${quoteCmdArgument(executable)} ${command}`,
      "echo.",
      "echo After login, return to cc infinite canvas and click Test connection.",
      "pause"
    ].join("\r\n");
  }

  return `${quotePosix(executable)} ${command}; echo; echo 'After login, return to cc infinite canvas and click Test connection.'`;
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
  const text = stripAnsi(String(output || "")).replace(/\u0000/gu, "").trim();
  if (!text) throw new Error("Dreamina CLI returned an empty response.");
  try {
    return JSON.parse(text);
  } catch {
    // Some CLI builds mix colored diagnostic logs with the JSON payload.
  }

  let lastValue = null;
  let cursor = 0;
  while (cursor < text.length) {
    const start = nextDreaminaJsonStart(text, cursor);
    if (start < 0) break;
    const end = dreaminaJsonValueEnd(text, start);
    if (end < 0) {
      cursor = start + 1;
      continue;
    }
    try {
      lastValue = JSON.parse(text.slice(start, end));
      cursor = end;
    } catch {
      cursor = start + 1;
    }
  }
  if (lastValue !== null) return lastValue;
  throw new Error(`Dreamina CLI returned an unreadable response: ${text.slice(0, 800)}`);
}

function stripAnsi(value) {
  return String(value || "").replace(/\u001b\[[0-?]*[ -/]*[@-~]/gu, "");
}

function nextDreaminaJsonStart(text, offset) {
  for (let index = offset; index < text.length; index += 1) {
    if ((text[index] === "{" || text[index] === "[") && text[index - 1] !== "\\") return index;
  }
  return -1;
}

function dreaminaJsonValueEnd(text, start) {
  const stack = [text[start]];
  let inString = false;
  let escaped = false;

  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      continue;
    }
    if (character === "{" || character === "[") {
      stack.push(character);
      continue;
    }
    if (character !== "}" && character !== "]") continue;
    const opening = stack.pop();
    if ((opening === "{" && character !== "}") || (opening === "[" && character !== "]")) return -1;
    if (!stack.length) return index + 1;
  }
  return -1;
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

async function readBinaryBody(req, maxBytes = 120 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
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

async function serveProjectCacheFile(res, pathname, options = {}) {
  const parts = pathname.split("/").filter(Boolean);
  const [, rawProjectId, kind, ...rest] = parts;
  const filename = path.basename(decodeURIComponent(rest.join("/")));
  if (!rawProjectId || !["assets", "outputs"].includes(kind) || !filename) {
    return sendText(res, 404, "Not found");
  }

  const projectId = normalizeProjectId(decodeURIComponent(rawProjectId));
  const root = kind === "assets" ? projectAssetDir(projectId) : projectOutputDir(projectId);
  return await serveFile(res, path.join(root, filename), options);
}

async function serveFile(res, filePath, options = {}) {
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
  if (options.imageThumbnail && mime.startsWith("image/") && electronNativeImage) {
    const sourceBytes = await readFile(resolved);
    const thumbnail = createPhotoshopThumbnail(sourceBytes);
    if (thumbnail) {
      res.writeHead(200, {
        "Content-Type": thumbnail.contentType,
        "Content-Length": thumbnail.bytes.length,
        "Cache-Control": "private, max-age=60"
      });
      res.end(thumbnail.bytes);
      return;
    }
  }
  res.writeHead(200, {
    "Content-Type": mime,
    "Content-Length": fileStat.size,
    "Cache-Control": "no-store"
  });
  createReadStream(resolved).pipe(res);
}

function loadElectronNativeImage() {
  if (!process.versions.electron) return null;
  try {
    return require("electron").nativeImage || null;
  } catch {
    return null;
  }
}

function createPhotoshopThumbnail(bytes) {
  if (!electronNativeImage || !bytes?.length) return null;
  try {
    const source = electronNativeImage.createFromBuffer(Buffer.from(bytes));
    if (source.isEmpty()) return null;
    const size = source.getSize();
    const longestEdge = Math.max(size.width, size.height);
    if (!longestEdge) return null;
    const scale = Math.min(1, 360 / longestEdge);
    const thumbnail = scale < 1
      ? source.resize({
        width: Math.max(1, Math.round(size.width * scale)),
        height: Math.max(1, Math.round(size.height * scale)),
        quality: "good"
      })
      : source;
    const output = thumbnail.toPNG();
    return output?.length ? { bytes: output, contentType: "image/png" } : null;
  } catch {
    return null;
  }
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
          sourceUrl: candidate.value,
          contentHash: saved.contentHash
        });
      } else {
        images.push({ type: "url", url: candidate.value });
      }
      continue;
    }

    const saved = await saveBase64Image(candidate.value, preferredFormat, projectId);
    images.push({ type: "file", url: saved.publicPath, filename: saved.filename, contentHash: saved.contentHash });
  }

  return images;
}

function dedupeImageCandidates(candidates) {
  const seen = new Set();
  return candidates.filter((candidate) => {
    const cleanValue =
      candidate.type === "base64"
        ? String(candidate.value).replace(/^data:[^;,]+;base64,/i, "").replace(/\s/g, "")
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
  const inlineData = value.inlineData || value.inline_data;

  if (isPlainObject(inlineData)) {
    const mimeType = String(inlineData.mimeType || inlineData.mime_type || "").trim();
    const data = String(inlineData.data || "").trim();
    if (mimeType.startsWith("image/") && looksLikeImageBase64(data)) {
      candidates.push({ type: "base64", value: `data:${mimeType};base64,${data}` });
    }
  }

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
  const bytes = Buffer.from(clean, "base64");
  const contentHash = imageContentHash(bytes);
  const filename = createOutputFilename(extension);
  const fullPath = path.join(projectOutputDir(projectId), filename);

  await mkdir(projectOutputDir(projectId), { recursive: true });
  await writeFile(fullPath, bytes);

  return { filename, publicPath: projectPublicPath(projectId, "outputs", filename), contentHash };
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
    const contentHash = imageContentHash(bytes);
    const filename = createOutputFilename(extension);
    const fullPath = path.join(projectOutputDir(projectId), filename);

    await mkdir(projectOutputDir(projectId), { recursive: true });
    await writeFile(fullPath, bytes);

    return { filename, publicPath: projectPublicPath(projectId, "outputs", filename), contentHash };
  } catch {
    return null;
  }
}

function imageContentHash(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
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

function parseArkAssetUris(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(/[\r\n,]+/u);
          } catch {
            return value.split(/[\r\n,]+/u);
          }
        })()
      : [];
  const seen = new Set();
  const uris = [];
  for (const entry of values) {
    const raw = String(entry || "").trim();
    if (!raw) continue;
    const uri = raw.startsWith("asset://") ? raw : `asset://${raw}`;
    if (!/^asset:\/\/[A-Za-z0-9._-]+$/u.test(uri) || seen.has(uri)) continue;
    seen.add(uri);
    uris.push(uri);
  }
  return uris;
}
