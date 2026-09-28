import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, open, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
loadLocalAgentEnvironment(path.join(moduleDir, ".env.local"));
const configuredCacheDirectory = path.resolve(process.env.CC_CANVAS_CACHE_DIR || path.join(moduleDir, "cache"));
const defaultDescriptorFile = path.join(configuredCacheDirectory, "agent-control.json");
const defaultTokenFile = path.join(configuredCacheDirectory, "agent-control-token");
let activeConnection = null;
let connectionPromise = null;

export class AgentControlError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "AgentControlError";
    this.status = Number(options.status) || 0;
    this.data = options.data;
  }
}

export async function ensureCanvasAgentService(options = {}) {
  if (activeConnection && await connectionIsReady(activeConnection)) return activeConnection;
  if (connectionPromise) return await connectionPromise;
  connectionPromise = resolveCanvasConnection(options);
  try {
    activeConnection = await connectionPromise;
    return activeConnection;
  } finally {
    connectionPromise = null;
  }
}

export async function agentControlRequest(route, options = {}) {
  const connection = await ensureCanvasAgentService(options);
  let result = await requestWithConnection(connection, route, options);
  if (result.status === 401 && options.retryAuth !== false) {
    activeConnection = null;
    const refreshed = await ensureCanvasAgentService(options);
    result = await requestWithConnection(refreshed, route, { ...options, retryAuth: false });
  }
  if (!result.ok) {
    throw new AgentControlError(result.data?.error || `Agent Control API returned HTTP ${result.status}.`, {
      status: result.status,
      data: result.data
    });
  }
  return result.data;
}

export async function cacheLocalAsset(projectId, filePath, kind = "image") {
  const resolved = path.resolve(String(filePath || ""));
  const info = await stat(resolved);
  if (!info.isFile()) throw new AgentControlError(`Asset path is not a file: ${resolved}`);
  if (info.size > 512 * 1024 * 1024) throw new AgentControlError("Agent asset import is limited to 512 MB per file.");
  const field = ["image", "mask", "video", "audio"].includes(kind) ? kind : "image";
  const bytes = await readFile(resolved);
  const form = new FormData();
  form.append(field, new Blob([bytes], { type: mimeTypeForFile(resolved, field) }), path.basename(resolved));
  const response = await agentControlRequest(`/projects/${encodeURIComponent(projectId)}/assets`, {
    method: "POST",
    body: form,
    timeoutMs: 10 * 60 * 1000
  });
  return response.assets?.[0] || null;
}

export function publicAgentConnection(connection = activeConnection) {
  if (!connection) return null;
  return {
    baseUrl: connection.baseUrl,
    descriptorFile: connection.descriptorFile,
    tokenFile: connection.tokenFile,
    pid: connection.pid || null
  };
}

async function resolveCanvasConnection(options) {
  const descriptorFile = path.resolve(process.env.CC_CANVAS_AGENT_DESCRIPTOR || defaultDescriptorFile);
  const existing = await readDescriptorConnection(descriptorFile);
  if (existing && await connectionIsReady(existing)) return existing;

  const fallback = await fallbackConnection(descriptorFile);
  if (await connectionIsReady(fallback)) return fallback;

  if (options.autoStart === false || process.env.CC_CANVAS_AGENT_AUTO_START === "0") {
    throw new AgentControlError("cc Infinite Canvas is not running. Start the desktop app or enable Agent auto-start.");
  }

  const startupLock = await acquireStartupLock(`${descriptorFile}.startup.lock`);
  try {
    if (startupLock.acquired) startCanvasServer(descriptorFile);
    const deadline = Date.now() + Math.max(3000, Number(options.startupTimeoutMs) || 15000);
    let lastConnection = fallback;
    while (Date.now() < deadline) {
      await delay(150);
      lastConnection = await readDescriptorConnection(descriptorFile) || lastConnection;
      if (lastConnection && await connectionIsReady(lastConnection)) return lastConnection;
    }
  } finally {
    await startupLock.release();
  }
  throw new AgentControlError(
    `Unable to start the cc Infinite Canvas background service. Check ${path.join(moduleDir, "server.js")} and the configured port.`
  );
}

function startCanvasServer(descriptorFile) {
  const child = spawn(process.execPath, [path.join(moduleDir, "server.js")], {
    cwd: moduleDir,
    detached: true,
    windowsHide: true,
    stdio: "ignore",
    env: {
      ...process.env,
      CC_CANVAS_AGENT_DESCRIPTOR: descriptorFile
    }
  });
  child.unref();
}

async function acquireStartupLock(filename) {
  await mkdir(path.dirname(filename), { recursive: true });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const handle = await open(filename, "wx", 0o600);
      await handle.writeFile(`${process.pid}\n${new Date().toISOString()}\n`, "utf8");
      return {
        acquired: true,
        release: async () => {
          await handle.close().catch(() => {});
          await rm(filename, { force: true }).catch(() => {});
        }
      };
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
      try {
        const info = await stat(filename);
        if (Date.now() - info.mtimeMs > 30000) {
          await rm(filename, { force: true });
          continue;
        }
      } catch {
        continue;
      }
      break;
    }
  }
  return { acquired: false, release: async () => {} };
}

async function readDescriptorConnection(descriptorFile) {
  try {
    const descriptor = JSON.parse(await readFile(descriptorFile, "utf8"));
    const port = Number(descriptor.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
    const tokenFile = path.resolve(descriptor.tokenFile || defaultTokenFile);
    const token = await readAgentToken(tokenFile);
    if (!token) return null;
    return {
      baseUrl: String(descriptor.baseUrl || `http://127.0.0.1:${port}`).replace(/\/+$/, ""),
      token,
      tokenFile,
      descriptorFile,
      pid: Number(descriptor.pid) || null
    };
  } catch {
    return null;
  }
}

async function fallbackConnection(descriptorFile) {
  const tokenFile = path.resolve(process.env.CC_CANVAS_AGENT_TOKEN_FILE || defaultTokenFile);
  const token = await readAgentToken(tokenFile);
  return {
    baseUrl: `http://127.0.0.1:${normalizePort(process.env.CC_CANVAS_AGENT_PORT || process.env.PORT || 3000)}`,
    token,
    tokenFile,
    descriptorFile,
    pid: null
  };
}

async function readAgentToken(tokenFile) {
  const fromEnvironment = String(process.env.CC_CANVAS_AGENT_TOKEN || "").trim();
  if (fromEnvironment) return fromEnvironment;
  try {
    return String(await readFile(tokenFile, "utf8")).trim();
  } catch {
    return "";
  }
}

async function connectionIsReady(connection) {
  if (!connection?.token || !connection?.baseUrl) return false;
  try {
    const response = await fetch(`${connection.baseUrl}/api/agent/v1/status`, {
      headers: { Authorization: `Bearer ${connection.token}` },
      signal: AbortSignal.timeout(1500)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function requestWithConnection(connection, route, options) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${connection.token}`);
  let body = options.body;
  if (body !== undefined && body !== null && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  const response = await fetch(`${connection.baseUrl}/api/agent/v1${route.startsWith("/") ? route : `/${route}`}`, {
    method: options.method || (body === undefined ? "GET" : "POST"),
    headers,
    body,
    signal: AbortSignal.timeout(Math.max(1000, Number(options.timeoutMs) || 30000))
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `HTTP ${response.status}` };
  }
  return { ok: response.ok, status: response.status, data };
}

function mimeTypeForFile(filename, fallbackKind) {
  const extension = path.extname(filename).toLowerCase();
  const byExtension = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg"
  };
  if (byExtension[extension]) return byExtension[extension];
  return fallbackKind === "video" ? "video/mp4" : fallbackKind === "audio" ? "audio/mpeg" : "image/png";
}

function normalizePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 3000;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadLocalAgentEnvironment(filename) {
  try {
    const content = readFileSync(filename, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  } catch {
    // The desktop app also works without an env file.
  }
}
