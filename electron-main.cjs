const { app, BrowserView, BrowserWindow, ipcMain, shell } = require("electron");
const { once } = require("node:events");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

loadEnvFile(path.join(__dirname, ".env.local"));

const preloadPath = path.join(__dirname, "electron-preload.cjs");
const logPath = path.join(__dirname, "electron-desktop.log");
const appIconPath = path.join(__dirname, "public", "assets", "app-icon.ico");
const chatGptPartition = "persist:cc-canvas-chatgpt";

let mainWindow = null;
let appUrl = "";
let localServer = null;
let photoshopBridgeServer = null;
let photoshopBridgeEvents = null;
let chatGptView = null;
let chatGptViewAttached = false;
let chatGptUrl = "";
let chatGptProxyRules = "";
let chatGptProxyAuth = null;

log("Electron main starting");
process.on("uncaughtException", (error) => log(`uncaughtException: ${error.stack || error.message || error}`));
process.on("unhandledRejection", (error) => log(`unhandledRejection: ${error?.stack || error?.message || error}`));
app.on("will-finish-launching", () => log("will finish launching"));
app.on("ready", () => log("ready event"));
app.on("before-quit", () => {
  log("before quit");
  if (localServer?.listening) localServer.close();
  if (photoshopBridgeServer?.listening) photoshopBridgeServer.close();
  photoshopBridgeEvents?.removeAllListeners?.("reference-selection-requested");
});
app.on("quit", (_event, code) => log(`quit code ${code}`));
app.on("web-contents-created", (_event, contents) => attachProxyAuth(contents));

app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-features", "BlockInsecurePrivateNetworkRequests");
app.commandLine.appendSwitch("disable-gpu");
app.setName("cc无限画布");
if (process.platform === "win32") app.setAppUserModelId("ccInfiniteCanvas");

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    log("app ready");
    await ensureServer();
    createMainWindow();
  }).catch((error) => {
    log(`startup failed: ${error.stack || error.message || error}`);
    app.quit();
  });
}

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function ensureServer() {
  process.env.PORT = "0";
  const serverModule = await import(pathToFileURL(path.join(__dirname, "server.js")).href);
  localServer = serverModule.server;
  photoshopBridgeServer = serverModule.photoshopBridgeServer;
  photoshopBridgeEvents = serverModule.photoshopBridgeEvents;
  photoshopBridgeEvents?.on?.("reference-selection-requested", focusMainWindow);
  if (!localServer) throw new Error("The embedded server module did not export a server instance.");
  if (!localServer.listening) await once(localServer, "listening");

  const address = localServer.address();
  if (!address || typeof address === "string" || !address.port) {
    throw new Error("The embedded server did not receive a local port.");
  }
  appUrl = `http://127.0.0.1:${address.port}`;
  log(`embedded server ready at ${appUrl}`);

  const started = Date.now();
  while (!(await isServerReady())) {
    if (Date.now() - started > 12000) throw new Error(`Local server did not start at ${appUrl}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function focusMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function isServerReady() {
  if (!appUrl) return Promise.resolve(false);
  return new Promise((resolve) => {
    const request = http.get(appUrl, (response) => {
      response.resume();
      resolve(response.statusCode >= 200 && response.statusCode < 500);
    });
    request.on("error", () => resolve(false));
    request.setTimeout(800, () => {
      request.destroy();
      resolve(false);
    });
  });
}

function createMainWindow() {
  log("creating main window");
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 620,
    title: "cc无限画布",
    backgroundColor: "#111417",
    autoHideMenuBar: true,
    icon: fs.existsSync(appIconPath) ? appIconPath : undefined,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.loadURL(appUrl);
  mainWindow.on("closed", () => {
    mainWindow = null;
    chatGptView = null;
    chatGptViewAttached = false;
  });
}

function log(message) {
  try {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);
  } catch {
    // Logging must never stop the desktop shell from starting.
  }
}

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\"/g, '"');
  }
}

function ensureChatGptView() {
  if (!mainWindow) return null;
  if (chatGptView) return chatGptView;

  chatGptView = new BrowserView({
    webPreferences: {
      partition: chatGptPartition,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  chatGptView.webContents.setWindowOpenHandler(({ url }) => {
    if (!/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return {
      action: "allow",
      overrideBrowserWindowOptions: createChatGptPopupOptions(mainWindow)
    };
  });

  chatGptView.webContents.on("did-create-window", (window) => {
    window.webContents.setWindowOpenHandler(({ url }) => {
      if (!/^https?:\/\//i.test(url)) {
        shell.openExternal(url);
        return { action: "deny" };
      }
      return {
        action: "allow",
        overrideBrowserWindowOptions: createChatGptPopupOptions(window)
      };
    });
  });

  return chatGptView;
}

function createChatGptPopupOptions(parent) {
  return {
    parent,
    width: 1060,
    height: 820,
    minWidth: 720,
    minHeight: 520,
    title: "ChatGPT 登录",
    backgroundColor: "#ffffff",
    webPreferences: {
      partition: chatGptPartition,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  };
}

function attachProxyAuth(contents) {
  contents.on("login", (event, _details, authInfo, callback) => {
    if (!authInfo?.isProxy || !chatGptProxyAuth?.username) return;
    event.preventDefault();
    callback(chatGptProxyAuth.username, chatGptProxyAuth.password || "");
  });
}

async function showChatGptView(payload = {}) {
  if (!mainWindow) return;

  const bounds = normalizeBounds(payload.bounds);
  if (!bounds) {
    hideChatGptView();
    return;
  }

  const url = normalizeChatGptUrl(payload.url);
  const view = ensureChatGptView();
  if (!view) return;
  const proxyChanged = await applyChatGptProxy(view, payload.proxy);

  if (!chatGptViewAttached) {
    mainWindow.addBrowserView(view);
    chatGptViewAttached = true;
  }

  if (chatGptUrl !== url || proxyChanged) {
    chatGptUrl = url;
    view.webContents.loadURL(url);
  }

  view.setBounds(bounds);
  view.webContents.setIgnoreMouseEvents(!payload.interactive, { forward: true });
}

async function applyChatGptProxy(view, proxyValue) {
  const proxy = normalizeProxyConfig(proxyValue);
  const authChanged =
    (chatGptProxyAuth?.username || "") !== (proxy.auth?.username || "") ||
    (chatGptProxyAuth?.password || "") !== (proxy.auth?.password || "");

  if (chatGptProxyRules === proxy.rules && !authChanged) return false;

  chatGptProxyRules = proxy.rules;
  chatGptProxyAuth = proxy.auth;

  await view.webContents.session.setProxy(
    proxy.rules ? { proxyRules: proxy.rules, proxyBypassRules: "<local>" } : { proxyRules: "direct://" }
  );
  if (typeof view.webContents.session.closeAllConnections === "function") {
    await view.webContents.session.closeAllConnections();
  }
  log(proxy.rules ? "ChatGPT proxy enabled" : "ChatGPT proxy disabled");
  return true;
}

function hideChatGptView() {
  if (!mainWindow || !chatGptView || !chatGptViewAttached) return;
  mainWindow.removeBrowserView(chatGptView);
  chatGptViewAttached = false;
}

function normalizeBounds(bounds) {
  if (!bounds || typeof bounds !== "object") return null;
  const x = Math.round(Number(bounds.x));
  const y = Math.round(Number(bounds.y));
  const width = Math.round(Number(bounds.width));
  const height = Math.round(Number(bounds.height));
  if (![x, y, width, height].every(Number.isFinite)) return null;
  if (width < 80 || height < 80) return null;

  const [windowWidth, windowHeight] = mainWindow?.getContentSize() || [0, 0];
  const left = clamp(x, 0, windowWidth);
  const top = clamp(y, 0, windowHeight);
  const right = clamp(x + width, 0, windowWidth);
  const bottom = clamp(y + height, 0, windowHeight);
  const clippedWidth = Math.round(right - left);
  const clippedHeight = Math.round(bottom - top);
  if (clippedWidth < 80 || clippedHeight < 80) return null;
  return { x: left, y: top, width: clippedWidth, height: clippedHeight };
}

function normalizeChatGptUrl(value) {
  try {
    const parsed = new URL(String(value || "https://chatgpt.com/"), "https://chatgpt.com/");
    const allowedHost = parsed.hostname === "chatgpt.com" || parsed.hostname.endsWith(".chatgpt.com");
    if (parsed.protocol === "https:" && allowedHost) return parsed.href;
  } catch {
    // Use the official ChatGPT entrypoint when the renderer sends a bad value.
  }
  return "https://chatgpt.com/";
}

function normalizeProxyConfig(value) {
  const raw = String(value || "").trim();
  if (!raw || /^(direct|none|off)$/i.test(raw)) return { rules: "", auth: null };

  try {
    const parsed = new URL(raw.includes("://") ? raw : `http://${raw}`);
    const host = parsed.host;
    if (!host) return { rules: "", auth: null };

    const auth = parsed.username
      ? {
          username: decodeURIComponent(parsed.username),
          password: decodeURIComponent(parsed.password || "")
        }
      : null;
    const protocol = parsed.protocol.replace(":", "").toLowerCase();

    if (protocol === "socks" || protocol === "socks5") {
      return { rules: `socks5://${host}`, auth };
    }
    if (protocol === "socks4") {
      return { rules: `socks4://${host}`, auth };
    }
    if (protocol === "http" || protocol === "https") {
      return { rules: `http=${host};https=${host}`, auth };
    }
  } catch (error) {
    log(`Invalid ChatGPT proxy ignored: ${error.message}`);
  }

  return { rules: "", auth: null };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

ipcMain.on("chatgpt:show", (_event, payload) => {
  showChatGptView(payload).catch((error) => log(`show ChatGPT failed: ${error.stack || error.message || error}`));
});
ipcMain.on("chatgpt:hide", hideChatGptView);
ipcMain.on("chatgpt:reload", () => {
  chatGptView?.webContents.reloadIgnoringCache();
});
ipcMain.on("open-external", (_event, url) => {
  const externalUrl = normalizeExternalUrl(url);
  if (externalUrl) shell.openExternal(externalUrl);
});

function normalizeExternalUrl(value) {
  try {
    const parsed = new URL(String(value || ""));
    if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.href;
  } catch {
    // Ignore invalid renderer URLs.
  }
  return "";
}
