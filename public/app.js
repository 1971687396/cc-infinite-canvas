const storageKeyPrefix = "cc-infinite-canvas-project-v1";
const currentProjectStorageKey = "cc-infinite-canvas-current-project";
const storageKey = "yunwu-image-canvas-v2";
const legacyStorageKey = "yunwu-image-canvas-v1";
const minZoom = 0.02;
const maxZoom = 24;
const defaultTaskWidth = 420;
const defaultVideoTaskWidth = 440;
const defaultImageScale = 0.5;
const defaultVideoWidth = 480;
const defaultVideoHeight = 270;
const defaultVideoScale = 0.75;
const defaultNoteWidth = 300;
const defaultNoteHeight = 64;
const minNoteWidth = 96;
const minNoteHeight = 44;
const maxNoteWidth = 1600;
const maxNoteHeight = 1400;
const minNoteFontSize = 10;
const maxNoteFontSize = 240;
const chatGptUrl = "https://chatgpt.com/";
const defaultChatGptWidth = 760;
const defaultChatGptHeight = 620;
const minChatGptWidth = 360;
const minChatGptHeight = 260;
const maxChatGptWidth = 1400;
const maxChatGptHeight = 1100;

const addTaskButton = document.querySelector("#addTaskButton");
const addDreaminaVideoButton = document.querySelector("#addDreaminaVideoButton");
const addEditTaskButton = document.querySelector("#addEditTaskButton");
const addGrokTaskButton = document.querySelector("#addGrokTaskButton");
const addGrokEditTaskButton = document.querySelector("#addGrokEditTaskButton");
const clearCanvasButton = document.querySelector("#clearCanvasButton");
const generateAllButton = document.querySelector("#generateAllButton");
const addNoteButton = document.querySelector("#addNoteButton");
const addChatGptButton = document.querySelector("#addChatGptButton");
const resetViewButton = document.querySelector("#resetViewButton");
const zoomInButton = document.querySelector("#zoomInButton");
const zoomOutButton = document.querySelector("#zoomOutButton");
const settingsButton = document.querySelector("#settingsButton");
const checkUpdateButton = document.querySelector("#checkUpdateButton");
const newProjectButton = document.querySelector("#newProjectButton");
const saveProjectButton = document.querySelector("#saveProjectButton");
const projectNameInput = document.querySelector("#projectNameInput");
const projectSelect = document.querySelector("#projectSelect");
const zoomLevel = document.querySelector("#zoomLevel");
const keyStatus = document.querySelector("#keyStatus");
const requestMeta = document.querySelector("#requestMeta");
const emptyState = document.querySelector("#emptyState");
const canvasViewport = document.querySelector("#canvasViewport");
const canvasStage = document.querySelector("#canvasStage");
const minimap = document.querySelector("#minimap");
const minimapWorld = document.querySelector("#minimapWorld");
const minimapView = document.querySelector("#minimapView");
const rawResponse = document.querySelector("#rawResponse");
const selectionToolbar = document.querySelector("#selectionToolbar");
const selectionMeta = document.querySelector("#selectionMeta");
const selectionScaleInput = document.querySelector("#selectionScaleInput");
const applySelectionScaleButton = document.querySelector("#applySelectionScaleButton");
const reusePromptButton = document.querySelector("#reusePromptButton");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsForm = document.querySelector("#settingsForm");
const closeSettingsButton = document.querySelector("#closeSettingsButton");
const settingsApiKey = document.querySelector("#settingsApiKey");
const settingsGptImageKey = document.querySelector("#settingsGptImageKey");
const settingsGrokImageKey = document.querySelector("#settingsGrokImageKey");
const settingsGrsaiApiKey = document.querySelector("#settingsGrsaiApiKey");
const settingsBaseUrl = document.querySelector("#settingsBaseUrl");
const settingsImageEndpoint = document.querySelector("#settingsImageEndpoint");
const settingsEditEndpoint = document.querySelector("#settingsEditEndpoint");
const settingsDefaultModel = document.querySelector("#settingsDefaultModel");
const settingsCacheDir = document.querySelector("#settingsCacheDir");
const settingsStatus = document.querySelector("#settingsStatus");
const dreaminaStatusText = document.querySelector("#dreaminaStatusText");
const dreaminaAccountMeta = document.querySelector("#dreaminaAccountMeta");
const dreaminaInstallButton = document.querySelector("#dreaminaInstallButton");
const dreaminaLoginButton = document.querySelector("#dreaminaLoginButton");
const dreaminaRefreshButton = document.querySelector("#dreaminaRefreshButton");
const dreaminaActionProgress = document.querySelector("#dreaminaActionProgress");
const dreaminaActionBar = document.querySelector("#dreaminaActionBar");
const dreaminaActionText = document.querySelector("#dreaminaActionText");
const copyDreaminaInstallButton = document.querySelector("#copyDreaminaInstallButton");
const copyDreaminaLoginButton = document.querySelector("#copyDreaminaLoginButton");
const updateDialog = document.querySelector("#updateDialog");
const closeUpdateButton = document.querySelector("#closeUpdateButton");
const updateStatus = document.querySelector("#updateStatus");
const currentVersionText = document.querySelector("#currentVersionText");
const latestVersionText = document.querySelector("#latestVersionText");
const updateAssetText = document.querySelector("#updateAssetText");
const updateReleaseNotes = document.querySelector("#updateReleaseNotes");
const updateRepoText = document.querySelector("#updateRepoText");
const updateDownloadProgress = document.querySelector("#updateDownloadProgress");
const updateDownloadBar = document.querySelector("#updateDownloadBar");
const updateDownloadPercent = document.querySelector("#updateDownloadPercent");
const updateDownloadBytes = document.querySelector("#updateDownloadBytes");
const openReleaseButton = document.querySelector("#openReleaseButton");
const downloadUpdateButton = document.querySelector("#downloadUpdateButton");

const gptSizeOptions = [
  ["auto", "auto"],
  ["1024x1024", "1024x1024 (1:1, 1K)"],
  ["2048x2048", "2048x2048 (1:1, 2K)"],
  ["2880x2880", "2880x2880 (1:1, 4K)"],
  ["1280x720", "1280x720 (16:9, 1K)"],
  ["2048x1152", "2048x1152 (16:9, 2K)"],
  ["3840x2160", "3840x2160 (16:9, 4K)"],
  ["720x1280", "720x1280 (9:16, 1K)"],
  ["1152x2048", "1152x2048 (9:16, 2K)"],
  ["2160x3840", "2160x3840 (9:16, 4K)"],
  ["1152x864", "1152x864 (4:3, 1K)"],
  ["2304x1728", "2304x1728 (4:3, 2K)"],
  ["3264x2448", "3264x2448 (4:3, 4K)"],
  ["864x1152", "864x1152 (3:4, 1K)"],
  ["1728x2304", "1728x2304 (3:4, 2K)"],
  ["2448x3264", "2448x3264 (3:4, 4K)"],
  ["1456x624", "1456x624 (21:9, 1K)"],
  ["2912x1248", "2912x1248 (21:9, 2K)"],
  ["3840x1648", "3840x1648 (21:9, 4K)"],
  ["624x1456", "624x1456 (9:21, 1K)"],
  ["1248x2912", "1248x2912 (9:21, 2K)"],
  ["1648x3840", "1648x3840 (9:21, 4K)"]
];

const grokSizeOptions = [
  ["960x960", "960x960 (1:1)"],
  ["720x1280", "720x1280 (9:16)"],
  ["1280x720", "1280x720 (16:9)"],
  ["1168x784", "1168x784 (3:2)"],
  ["784x1168", "784x1168 (2:3)"]
];

const qualityOptions = [
  ["", "不传"],
  ["auto", "auto"],
  ["low", "low"],
  ["medium", "medium"],
  ["high", "high"]
];

const formatOptions = [
  ["png", "png"],
  ["jpeg", "jpeg"],
  ["webp", "webp"],
  ["", "不传"]
];

const backgroundOptions = [
  ["", "不传"],
  ["auto", "auto"],
  ["opaque", "opaque"],
  ["transparent", "transparent"]
];

const moderationOptions = [
  ["", "不传"],
  ["auto", "auto"],
  ["low", "low"]
];

const grokDefaultModel = "grok-3-image";
const grokDefaultSize = "960x960";
const grsaiDefaultModel = "nano-banana-2";
const grsaiDefaultBaseUrl = "https://grsaiapi.com";
const grsaiGenerateEndpoint = "/v1/api/generate";
const grsaiDefaultSize = "1:1|1K";
const dreaminaDefaultModel = "dreamina-5.0";
const dreaminaDefaultSize = "1:1|2k";
const dreaminaVideoDefaultModel = "dreamina-video-seedance2.0fast";
const dreaminaVideoDefaultRatio = "16:9";
const dreaminaVideoDefaultDuration = "5";
const dreaminaVideoDefaultResolution = "720p";
const grokModelOptions = [
  ["grok-3-image", "grok-3-image"],
  ["grok-image-image", "grok-image-image"]
];
const grsaiSizeOptions = [
  ["auto", "auto"],
  ["1:1|1K", "1:1 (1K)"],
  ["1:1|2K", "1:1 (2K)"],
  ["1:1|4K", "1:1 (4K)"],
  ["16:9|1K", "16:9 (1K)"],
  ["16:9|2K", "16:9 (2K)"],
  ["16:9|4K", "16:9 (4K)"],
  ["9:16|1K", "9:16 (1K)"],
  ["9:16|2K", "9:16 (2K)"],
  ["9:16|4K", "9:16 (4K)"],
  ["4:3|1K", "4:3 (1K)"],
  ["3:4|1K", "3:4 (1K)"],
  ["3:2|1K", "3:2 (1K)"],
  ["2:3|1K", "2:3 (1K)"],
  ["5:4|1K", "5:4 (1K)"],
  ["4:5|1K", "4:5 (1K)"],
  ["21:9|1K", "21:9 (1K)"],
  ["1:4|1K", "1:4 (1K)"],
  ["4:1|1K", "4:1 (1K)"],
  ["1:8|1K", "1:8 (1K)"],
  ["8:1|1K", "8:1 (1K)"]
];
const dreaminaModelOptions = ["5.0", "4.7", "4.6", "4.5", "4.1", "4.0", "3.1", "3.0"].map((version) => [
  `dreamina-${version}`,
  `即梦 ${version}`
]);
const dreaminaRatios = ["21:9", "16:9", "3:2", "4:3", "1:1", "3:4", "2:3", "9:16"];
const dreaminaVideoModelOptions = [
  ["dreamina-video-seedance2.0fast", "Seedance 2.0 Fast"],
  ["dreamina-video-seedance2.0", "Seedance 2.0"],
  ["dreamina-video-seedance2.0mini", "Seedance 2.0 Mini"],
  ["dreamina-video-seedance2.0_vip", "Seedance 2.0 VIP"],
  ["dreamina-video-seedance2.0fast_vip", "Seedance 2.0 Fast VIP"]
];
const dreaminaVideoRatioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"].map((ratio) => [ratio, ratio]);
const dreaminaVideoResolutionOptions = [
  ["720p", "720p"],
  ["1080p", "1080p（VIP）"]
];
const taskModelOptions = [
  ["gpt-image-2", "gpt-image-2"],
  [grsaiDefaultModel, grsaiDefaultModel],
  ...grokModelOptions,
  ...dreaminaModelOptions
];

const fileStore = new Map();
const selectedNodeIds = new Set();
const undoLimit = 80;
const undoStack = [];
const nodeClipboard = {
  nodes: [],
  bounds: null,
  pasteCount: 0,
  files: new Map()
};

let config = {};
let saveTimer = 0;
let isLoadingProject = true;
let isRestoringHistory = false;
let isSpacePressed = false;
let createMenu = null;
let pendingCreatePoint = null;
let selectionBox = null;
let minimapBounds = { x: -400, y: -300, width: 1200, height: 900 };
let referencePickTargetNodeId = null;
let editingNoteId = null;
let latestUpdateInfo = null;
let suppressChatGptHost = false;
let lastHistorySnapshot = "";
let currentProjectId = "default";
let currentProjectName = "未命名画布";
let projectList = [];
let dreaminaStatus = { installed: false, loggedIn: false };
let lastCanvasPointer = null;
let canvasState = {
  nodes: [],
  viewport: { x: 120, y: 90, zoom: 1 },
  nextZ: 1
};

init();

async function init() {
  createContextMenu();
  bindCanvasEvents();
  bindMinimapEvents();

  try {
    await refreshRuntimeConfig();
  } catch (error) {
    showToast(error.message || "配置读取失败");
  }

  isLoadingProject = false;
  await refreshProjectList();
  const preferredProjectId = localStorage.getItem(currentProjectStorageKey) || projectList[0]?.id || "default";
  await loadProjectById(preferredProjectId, { initial: true });
  refreshDreaminaStatus();
  checkForUpdates({ automatic: true });
}

addTaskButton.addEventListener("click", () => addTaskNode("create"));
addDreaminaVideoButton?.addEventListener("click", () => addDreaminaVideoNode());
addEditTaskButton?.addEventListener("click", () => addTaskNode("edit"));
addGrokTaskButton?.addEventListener("click", () => addGrokTaskNode("create"));
addGrokEditTaskButton?.addEventListener("click", () => addGrokTaskNode("edit"));

generateAllButton.addEventListener("click", () => {
  const runnable = canvasState.nodes.filter((node) => isRunnableTask(node));
  if (!runnable.length) {
    showToast("没有可生成的任务节点");
    return;
  }
  runnable.forEach((node) => generateNode(node.id));
});

addNoteButton.addEventListener("click", addNoteNode);
addChatGptButton?.addEventListener("click", addChatGptNode);
clearCanvasButton.addEventListener("click", clearCanvas);
resetViewButton.addEventListener("click", resetViewport);
zoomInButton.addEventListener("click", () => zoomAtCenter(canvasState.viewport.zoom * 1.2));
zoomOutButton.addEventListener("click", () => zoomAtCenter(canvasState.viewport.zoom / 1.2));
newProjectButton.addEventListener("click", () => createNewProject());
saveProjectButton.addEventListener("click", () => saveProjectNow());
projectSelect.addEventListener("change", () => switchProject(projectSelect.value));
projectNameInput.addEventListener("change", () => renameCurrentProject(projectNameInput.value));
projectNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    projectNameInput.blur();
  }
});
settingsButton.addEventListener("click", openSettingsDialog);
checkUpdateButton?.addEventListener("click", () => checkForUpdates());
closeSettingsButton.addEventListener("click", () => closeSettingsDialog());
settingsDialog.addEventListener("close", resumeChatGptHost);
dreaminaInstallButton?.addEventListener("click", () => runDreaminaAction("install"));
dreaminaLoginButton?.addEventListener("click", () => runDreaminaAction("login"));
dreaminaRefreshButton?.addEventListener("click", () => refreshDreaminaStatus({ notify: true }));
copyDreaminaInstallButton?.addEventListener("click", () => copyDreaminaCommand("curl -s https://jimeng.jianying.com/cli | bash"));
copyDreaminaLoginButton?.addEventListener("click", () => copyDreaminaCommand("dreamina login"));
closeUpdateButton?.addEventListener("click", () => closeUpdateDialog());
updateDialog?.addEventListener("close", resumeChatGptHost);
openReleaseButton?.addEventListener("click", () => {
  if (latestUpdateInfo?.releaseUrl) window.open(latestUpdateInfo.releaseUrl, "_blank", "noreferrer");
});
downloadUpdateButton?.addEventListener("click", () => {
  downloadLatestUpdate();
});

async function refreshRuntimeConfig() {
  const response = await fetch("/api/config");
  const data = await readJsonResponse(response);
  if (!response.ok || data.parseError) throw new Error(data.error || "配置读取失败");
  config = data;
  setKeyStatus(config.hasAnyKey ?? config.hasApiKey);
  return config;
}
settingsForm.addEventListener("submit", saveSettings);
applySelectionScaleButton.addEventListener("click", applySelectionScale);
reusePromptButton.addEventListener("click", reusePromptFromSelection);
selectionScaleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applySelectionScale();
  }
});

function addTaskNode(mode = "create", point = null, options = {}) {
  const center = point || getViewportCenterWorld();
  const offset = point ? 0 : canvasState.nodes.length % 8;
  const node = createDefaultTaskNode(mode);
  if (options.preset === "grok") node.model = isGrokModelName(node.model) ? node.model : grokDefaultModel;
  applyTaskModelDefaults(node, { force: options.preset === "grok" });
  if (options.prompt) node.prompt = options.prompt;

  node.x = Math.round(center.x - node.width / 2 + offset * 28);
  node.y = Math.round(center.y - 210 + offset * 28);
  node.z = ++canvasState.nextZ;

  canvasState.nodes.push(node);
  selectOnly(node.id, { revealControls: true });
  saveCanvasState();
  updateCanvasMeta();
  return node;
}

function addGrokTaskNode(mode = "create", point = null) {
  return addTaskNode(mode, point, { preset: "grok" });
}

function addDreaminaVideoNode(point = null) {
  const center = point || getViewportCenterWorld();
  const offset = point ? 0 : canvasState.nodes.length % 8;
  const node = createDefaultVideoTaskNode();
  node.x = Math.round(center.x - node.width / 2 + offset * 28);
  node.y = Math.round(center.y - 190 + offset * 28);
  node.z = ++canvasState.nextZ;

  canvasState.nodes.push(node);
  selectOnly(node.id, { focusSelector: ".node-prompt" });
  saveCanvasState();
  updateCanvasMeta();
  return node;
}

function applyTaskNodePreset(node, preset) {
  if (preset === "grok") {
    node.model = isGrokModelName(node.model) ? node.model : grokDefaultModel;
  }
  applyTaskModelDefaults(node, { force: preset === "grok" });
}

function applyTaskModelDefaults(node, options = {}) {
  const wasGrok = node.provider === "grok";
  const wasGrsai = node.provider === "grsai";
  const wasDreamina = node.provider === "dreamina";
  const isGrok = isGrokModelName(node.model);
  const isGrsai = isGrsaiModelName(node.model);
  const isDreamina = isDreaminaModelName(node.model);
  node.provider = isGrok ? "grok" : isGrsai ? "grsai" : isDreamina ? "dreamina" : "";

  if (isDreamina) {
    if (node.mode === "edit" && Number(dreaminaModelVersion(node.model)) < 4) {
      node.model = dreaminaDefaultModel;
    }
    if (!isSizeAllowedForModel(node.size, node.model, node.mode)) {
      node.size = defaultSizeForModel(node.model, node.mode);
    }
    node.n = "1";
    node.quality = "";
    node.format = "png";
    node.background = "";
    node.moderation = "";
    node.baseUrl = "";
    node.endpointPath = "dreamina-cli";
    node.extraParams = isPlainObject(node.extraParams) ? { ...node.extraParams } : {};
    delete node.extraParams.response_format;
    delete node.extraParams.replyType;
  } else if (isGrsai) {
    node.model = isGrsaiModelName(node.model) ? node.model : grsaiDefaultModel;
    if (!isSizeAllowedForModel(node.size, node.model, node.mode)) {
      node.size = defaultSizeForModel(node.model, node.mode);
    }
    node.quality = "";
    node.format = "png";
    node.baseUrl = isGrsaiBaseUrl(node.baseUrl) ? node.baseUrl : grsaiDefaultBaseUrl;
    node.endpointPath = grsaiGenerateEndpoint;
    node.extraParams = isPlainObject(node.extraParams) ? { ...node.extraParams } : {};
    node.extraParams.replyType = node.extraParams.replyType || "json";
    delete node.extraParams.response_format;
  } else if (isGrok) {
    node.model = isGrokModelName(node.model) ? node.model : grokDefaultModel;
    if (wasGrsai || wasDreamina) {
      node.baseUrl = config.baseUrl || "https://yunwu.ai";
      node.endpointPath = defaultEndpointForMode(node.mode);
    }
    if (node.mode === "edit") {
      node.size = "";
    } else if (!isSizeAllowedForModel(node.size, node.model, node.mode)) {
      node.size = defaultSizeForModel(node.model, node.mode);
    }
    node.quality = "";
    node.format = "png";
    node.extraParams = isPlainObject(node.extraParams) ? { ...node.extraParams } : {};
    if (node.mode === "create") {
      node.extraParams.response_format = node.extraParams.response_format || "url";
    } else if (options.force || options.modeChanged || options.modelChanged) {
      delete node.extraParams.response_format;
    }
  } else {
    node.model = node.model || config.defaultModel || "gpt-image-2";
    if (!isSizeAllowedForModel(node.size, node.model, node.mode)) {
      node.size = defaultSizeForModel(node.model, node.mode);
    }
    if (wasGrok || wasGrsai || wasDreamina || options.modelChanged) {
      node.extraParams = isPlainObject(node.extraParams) ? { ...node.extraParams } : {};
      delete node.extraParams.response_format;
      delete node.extraParams.replyType;
    }
    if ((wasGrsai || wasDreamina) && options.modelChanged) {
      node.baseUrl = config.baseUrl || "https://yunwu.ai";
      node.endpointPath = defaultEndpointForMode(node.mode);
    }
  }

  node.extraParamsText = JSON.stringify(node.extraParams, null, 2);
}

function isGrokModelName(model) {
  return String(model || "").trim().toLowerCase().startsWith("grok-");
}

function isGrsaiModelName(model) {
  return String(model || "").trim().toLowerCase().startsWith("nano-banana");
}

function isDreaminaModelName(model) {
  const normalized = String(model || "").trim().toLowerCase();
  return normalized.startsWith("dreamina-") && !normalized.startsWith("dreamina-video-");
}

function isDreaminaVideoModelName(model) {
  return String(model || "").trim().toLowerCase().startsWith("dreamina-video-");
}

function dreaminaModelVersion(model) {
  return String(model || "").trim().toLowerCase().replace(/^dreamina-/, "");
}

function isGrsaiBaseUrl(value) {
  return /grsai/i.test(String(value || ""));
}

function sizeOptionsForModel(model, mode = "create") {
  if (isDreaminaModelName(model)) return dreaminaSizeOptionsForModel(model, mode);
  if (isGrsaiModelName(model)) return grsaiSizeOptions;
  return isGrokModelName(model) ? grokSizeOptions : gptSizeOptions;
}

function dreaminaSizeOptionsForModel(model, mode = "create") {
  const resolutions = mode === "edit" || Number(dreaminaModelVersion(model)) >= 4 ? ["2k", "4k"] : ["1k", "2k"];
  return dreaminaRatios.flatMap((ratio) =>
    resolutions.map((resolution) => [`${ratio}|${resolution}`, `${ratio} (${resolution.toUpperCase()})`])
  );
}

function defaultSizeForModel(model, mode = "create") {
  if (isDreaminaModelName(model)) return dreaminaDefaultSize;
  if (isGrsaiModelName(model)) return grsaiDefaultSize;
  if (isGrokModelName(model)) return mode === "create" ? grokDefaultSize : "";
  return "auto";
}

function isSizeAllowedForModel(size, model, mode = "create") {
  if (!size) return true;
  return sizeOptionsForModel(model, mode).some(([value]) => value === size);
}

function createDefaultTaskNode(mode = "create") {
  const normalizedMode = mode === "edit" ? "edit" : "create";
  return {
    id: createId(),
    type: "task",
    provider: "",
    prompt: "",
    model: config.defaultModel || "gpt-image-2",
    n: "1",
    size: "auto",
    quality: "",
    format: "png",
    baseUrl: config.baseUrl || "https://yunwu.ai",
    endpointPath: defaultEndpointForMode(normalizedMode),
    mode: normalizedMode,
    background: "",
    moderation: "",
    extraParams: {},
    extraParamsText: "{}",
    cachedImages: [],
    cachedMask: null,
    cacheStatus: normalizedMode === "edit" ? "pending" : "none",
    sessionFiles: [],
    sessionMask: "",
    images: [],
    status: "idle",
    error: "",
    durationMs: null,
    debugOpen: false,
    width: defaultTaskWidth,
    x: 0,
    y: 0,
    z: 1,
    createdAt: new Date().toISOString()
  };
}

function createDefaultVideoTaskNode() {
  return {
    id: createId(),
    type: "video-task",
    provider: "dreamina",
    prompt: "",
    model: dreaminaVideoDefaultModel,
    n: dreaminaVideoDefaultDuration,
    size: dreaminaVideoDefaultRatio,
    quality: dreaminaVideoDefaultResolution,
    format: "mp4",
    baseUrl: "",
    endpointPath: "dreamina-video-cli",
    mode: "video",
    extraParams: {},
    extraParamsText: "{}",
    cachedImages: [],
    cacheStatus: "pending",
    sessionFiles: [],
    videos: [],
    status: "idle",
    error: "",
    durationMs: null,
    debugOpen: true,
    width: defaultVideoTaskWidth,
    x: 0,
    y: 0,
    z: 1,
    createdAt: new Date().toISOString()
  };
}

function addNoteNode(point = null) {
  const center = point || getViewportCenterWorld();
  const offset = point ? 0 : canvasState.nodes.length % 8;
  const node = {
    id: createId(),
    type: "note",
    text: "",
    fontSize: 22,
    color: "#202124",
    width: defaultNoteWidth,
    height: defaultNoteHeight,
    x: Math.round(center.x - defaultNoteWidth / 2 + offset * 22),
    y: Math.round(center.y - 60 + offset * 22),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };

  canvasState.nodes.push(node);
  editingNoteId = node.id;
  selectOnly(node.id, { focusSelector: ".note-editor" });
  saveCanvasState();
  updateCanvasMeta();
}

function addChatGptNode(point = null) {
  const center = point || getViewportCenterWorld();
  const offset = point ? 0 : canvasState.nodes.length % 8;
  const node = {
    id: createId(),
    type: "chatgpt",
    url: chatGptUrl,
    proxy: "",
    interactive: false,
    width: defaultChatGptWidth,
    height: defaultChatGptHeight,
    x: Math.round(center.x - defaultChatGptWidth / 2 + offset * 26),
    y: Math.round(center.y - defaultChatGptHeight / 2 + offset * 26),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };

  canvasState.nodes.push(node);
  selectOnly(node.id);
  saveCanvasState();
  updateCanvasMeta();
  return node;
}

async function generateNode(nodeId) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.status === "running") return;
  if (node.type === "video-task") return await generateVideoNode(nodeId);
  if (node.type !== "task") return;

  if (!node.prompt.trim()) {
    showToast("节点提示词不能为空");
    return;
  }

  if (!syncNodeExtraParams(node)) return;

  if (node.mode === "edit" && fileStore.get(node.id)?.images?.length) {
    await cacheEditFiles(node.id);
  }

  node.status = "running";
  node.error = "";
  node.debugOpen = false;
  node.z = ++canvasState.nextZ;
  selectedNodeIds.delete(node.id);
  updateNode(node);
  saveCanvasState({ history: false });
  updateCanvasMeta();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      ...buildNodeRequest(node)
    });
    const data = await response.json();
    rawResponse.textContent = JSON.stringify(data.raw || data, null, 2);

    if (!response.ok) {
      throw new Error(data.error || "生成失败");
    }

    const incoming = (data.images || []).map((image) => normalizeNodeImage(image, node));
    if (!incoming.length) {
      throw new Error("接口已返回，但没有识别到图片字段");
    }

    const previousImages = node.images || [];
    const previousKeys = new Set(previousImages.map(getImageKey).filter(Boolean));
    const newImages = incoming.filter((image) => !previousKeys.has(getImageKey(image)));
    node.images = dedupeNodeImages([...previousImages, ...incoming]);
    createImageNodesForTask(node, newImages);
    node.status = "done";
    node.durationMs = data.durationMs;
    node.error = "";
    removeGeneratedTaskNode(node.id);
  } catch (error) {
    node.status = "error";
    node.error = error.message || "生成失败";
    showToast(node.error);
  } finally {
    renderCanvas();
    saveCanvasState();
    updateCanvasMeta();
  }
}

async function generateVideoNode(nodeId) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "video-task" || node.status === "running") return;

  if (!node.prompt.trim()) {
    showToast("视频节点提示词不能为空");
    return;
  }

  if (!syncNodeExtraParams(node)) return;
  if (fileStore.get(node.id)?.images?.length) {
    await cacheEditFiles(node.id);
  }

  node.status = "running";
  node.error = "";
  node.z = ++canvasState.nextZ;
  selectedNodeIds.delete(node.id);
  updateNode(node);
  saveCanvasState({ history: false });
  updateCanvasMeta();

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      ...buildNodeRequest(node)
    });
    const data = await response.json();
    rawResponse.textContent = JSON.stringify(data.raw || data, null, 2);

    if (!response.ok) {
      throw new Error(data.error || "视频生成失败");
    }

    const incoming = (data.videos || []).map((video) => normalizeNodeVideo(video, node));
    if (!incoming.length) {
      throw new Error("即梦已返回，但没有识别到视频文件");
    }

    node.videos = dedupeNodeVideos([...(node.videos || []), ...incoming]);
    createVideoNodesForTask(node, incoming);
    node.status = "done";
    node.durationMs = data.durationMs;
    node.error = "";
    removeGeneratedTaskNode(node.id);
  } catch (error) {
    node.status = "error";
    node.error = error.message || "视频生成失败";
    showToast(node.error);
  } finally {
    renderCanvas();
    saveCanvasState();
    updateCanvasMeta();
  }
}

function removeGeneratedTaskNode(nodeId) {
  canvasState.nodes = canvasState.nodes.filter((item) => item.id !== nodeId);
  selectedNodeIds.delete(nodeId);
  fileStore.delete(nodeId);
  if (referencePickTargetNodeId === nodeId) referencePickTargetNodeId = null;
}

function buildNodeRequest(node) {
  if (node.type === "video-task") {
    const storedFiles = fileStore.get(node.id);
    if (storedFiles?.images?.length) {
      const formData = new FormData();
      appendNodeFields(formData, node, { includeCachedAssets: true });
      storedFiles.images.slice(0, 9).forEach((file) => formData.append("image", file));
      return { body: formData };
    }

    return {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildNodePayload(node))
    };
  }

  if (node.mode === "edit") {
    const storedFiles = fileStore.get(node.id);
    const hasUploadedImages = Boolean(storedFiles?.images?.length);
    const hasUploadedMask = Boolean(storedFiles?.mask);
    if (hasUploadedImages || (hasUploadedMask && node.cachedImages?.length)) {
      const formData = new FormData();
      appendNodeFields(formData, node, { includeCachedAssets: true });
      if (hasUploadedImages) storedFiles.images.forEach((file) => formData.append("image", file));
      if (storedFiles.mask) formData.append("mask", storedFiles.mask);
      return { body: formData };
    }

    if (node.cachedImages?.length) {
      return {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNodePayload(node))
      };
    }

    throw new Error("编辑节点缺少参考图片，请在节点里选择图片");
  }

  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildNodePayload(node))
  };
}

function buildNodePayload(node) {
  return {
    projectId: currentProjectId,
    mode: node.mode,
    prompt: node.prompt.trim(),
    model: node.model,
    n: node.n,
    size: node.size,
    quality: node.quality,
    format: node.format,
    background: node.background,
    moderation: node.moderation,
    baseUrl: node.baseUrl,
    endpointPath: node.endpointPath || defaultEndpointForMode(node.mode),
    extraParams: node.extraParams || {},
    cachedImages: node.cachedImages || [],
    cachedMask: node.cachedMask ? [node.cachedMask] : []
  };
}

function appendNodeFields(formData, node, options = {}) {
  formData.append("projectId", currentProjectId);
  formData.append("mode", node.mode);
  formData.append("prompt", node.prompt.trim());
  formData.append("model", node.model);
  formData.append("n", node.n);
  formData.append("size", node.size);
  formData.append("quality", node.quality || "");
  formData.append("format", node.format || "");
  formData.append("background", node.background || "");
  formData.append("moderation", node.moderation || "");
  formData.append("baseUrl", node.baseUrl);
  formData.append("endpointPath", node.endpointPath || defaultEndpointForMode(node.mode));
  formData.append("extraParams", JSON.stringify(node.extraParams || {}));
  if (options.includeCachedAssets && node.cachedImages?.length) {
    formData.append("cachedImages", JSON.stringify(node.cachedImages));
  }
  if (options.includeCachedAssets && node.cachedMask) {
    formData.append("cachedMask", JSON.stringify([node.cachedMask]));
  }
}

function normalizeNodeImage(image, node) {
  const generation = buildGenerationSnapshot(node);
  return {
    id: createId(),
    url: image.url,
    filename: image.filename || "generated-image",
    sourceUrl: image.sourceUrl || "",
    prompt: node.prompt,
    model: node.model,
    size: node.size,
    width: Number(image.width) || undefined,
    height: Number(image.height) || undefined,
    format: node.format || "",
    generation,
    createdAt: new Date().toISOString()
  };
}

function buildGenerationSnapshot(node) {
  return {
    mode: node.mode === "edit" ? "edit" : "create",
    prompt: node.prompt || "",
    model: node.model || config.defaultModel || "gpt-image-2",
    n: String(node.n || "1"),
    size: node.size || "auto",
    quality: node.quality || "",
    format: node.format || "png",
    background: node.background || "",
    moderation: node.moderation || "",
    baseUrl: node.baseUrl || config.baseUrl || "https://yunwu.ai",
    endpointPath: node.endpointPath || defaultEndpointForMode(node.mode),
    extraParams: clonePlainValue(node.extraParams || {}),
    cachedImages: clonePlainValue(node.cachedImages || []),
    cachedMask: node.cachedMask ? clonePlainValue(node.cachedMask) : null
  };
}

function dedupeNodeImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    const key = getImageKey(image);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getImageKey(image) {
  return image?.sourceUrl || image?.url || image?.filename || "";
}

function normalizeNodeVideo(video, node) {
  const generation = buildGenerationSnapshot(node);
  return {
    id: createId(),
    url: video.url,
    filename: video.filename || "dreamina-video.mp4",
    sourceUrl: video.sourceUrl || "",
    prompt: node.prompt,
    model: node.model,
    size: node.size,
    format: video.format || "mp4",
    width: Number(video.width) || undefined,
    height: Number(video.height) || undefined,
    duration: Number(video.duration) || Number(node.n) || undefined,
    generation,
    createdAt: new Date().toISOString()
  };
}

function getVideoKey(video) {
  return video?.sourceUrl || video?.url || video?.filename || "";
}

function dedupeNodeVideos(videos) {
  const seen = new Set();
  return videos.filter((video) => {
    const key = getVideoKey(video);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createImageNodesForTask(taskNode, images) {
  if (!images.length) return;

  const existingKeys = new Set(
    canvasState.nodes
      .filter((node) => node.type === "image")
      .map((node) => node.sourceImageKey)
      .filter(Boolean)
  );

  let cursorY = taskNode.y;
  const x = taskNode.x + (taskNode.width || defaultTaskWidth) + 48;

  for (const image of images) {
    const key = getImageKey(image);
    if (key && existingKeys.has(key)) continue;

    const dimensions = parseImageDimensions(image, taskNode.size);
    const node = {
      id: createId(),
      type: "image",
      image,
      sourceTaskId: taskNode.id,
      sourceImageKey: key,
      originalWidth: dimensions.width || 512,
      originalHeight: dimensions.height || 512,
      scale: defaultImageScale,
      x,
      y: cursorY,
      z: ++canvasState.nextZ,
      createdAt: new Date().toISOString()
    };

    canvasState.nodes.push(node);
    existingKeys.add(key);
    cursorY += node.originalHeight * node.scale + 32;
  }
}

function createVideoNodesForTask(taskNode, videos) {
  if (!videos.length) return;

  const existingKeys = new Set(
    canvasState.nodes
      .filter((node) => node.type === "video")
      .map((node) => node.sourceVideoKey)
      .filter(Boolean)
  );

  let cursorY = taskNode.y;
  const x = taskNode.x + (taskNode.width || defaultVideoTaskWidth) + 48;

  for (const video of videos) {
    const key = getVideoKey(video);
    if (key && existingKeys.has(key)) continue;

    const dimensions = parseVideoDimensions(video, taskNode.size);
    const node = {
      id: createId(),
      type: "video",
      video,
      sourceTaskId: taskNode.id,
      sourceVideoKey: key,
      originalWidth: dimensions.width,
      originalHeight: dimensions.height,
      scale: defaultVideoScale,
      x,
      y: cursorY,
      z: ++canvasState.nextZ,
      createdAt: new Date().toISOString()
    };

    canvasState.nodes.push(node);
    existingKeys.add(key);
    cursorY += node.originalHeight * node.scale + 32;
  }
}

function parseImageSize(size) {
  const match = String(size || "").match(/^(\d+)x(\d+)$/i);
  if (!match) return { width: 512, height: 512 };
  return {
    width: Number(match[1]) || 512,
    height: Number(match[2]) || 512
  };
}

function parseImageDimensions(image, fallbackSize) {
  const width = Number(image?.width);
  const height = Number(image?.height);
  if (width > 0 && height > 0) return { width, height };
  return parseImageSize(image?.size || fallbackSize);
}

function parseVideoDimensions(video, fallbackRatio = "16:9") {
  const width = Number(video?.width);
  const height = Number(video?.height);
  if (width > 0 && height > 0) return { width, height };
  const [ratioW, ratioH] = String(fallbackRatio || "16:9").split(":").map((value) => Number(value) || 0);
  if (ratioW > 0 && ratioH > 0) {
    const base = 480;
    return { width: base, height: Math.round((base * ratioH) / ratioW) };
  }
  return { width: defaultVideoWidth, height: defaultVideoHeight };
}

async function cacheEditFiles(nodeId) {
  const storedFiles = fileStore.get(nodeId);
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || (!storedFiles?.images?.length && !storedFiles?.mask)) return;

  const formData = new FormData();
  formData.append("projectId", currentProjectId);
  (storedFiles.images || []).forEach((file) => formData.append("image", file));
  if (storedFiles.mask) formData.append("mask", storedFiles.mask);

  try {
    const response = await fetch("/api/cache-assets", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "素材缓存失败");

    const assets = data.assets || [];
    const imageAssets = assets.filter((asset) => asset.field === "image");
    if (imageAssets.length) node.cachedImages = dedupeAssetRefs([...(node.cachedImages || []), ...imageAssets]);
    const maskAsset = assets.find((asset) => asset.field === "mask");
    node.cachedMask = maskAsset || node.cachedMask || null;
    node.cacheStatus = node.cachedImages.length ? "ready" : "session-only";

    const nextStored = { ...storedFiles };
    if (imageAssets.length) delete nextStored.images;
    if (maskAsset) delete nextStored.mask;
    if (nextStored.images?.length || nextStored.mask) fileStore.set(node.id, nextStored);
    else fileStore.delete(node.id);
  } catch {
    node.cacheStatus = "session-only";
  }

  updateNode(node);
  saveCanvasState();
}

function dedupeAssetRefs(assets) {
  const seen = new Set();
  return assets.filter((asset) => {
    const key = asset?.url || asset?.path || asset?.filename || asset?.originalName || "";
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function syncNodeExtraParams(node) {
  const raw = (node.extraParamsText ?? "{}").trim();
  if (!raw) {
    node.extraParams = {};
    node.extraParamsText = "{}";
    return true;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("额外 JSON 参数必须是对象");
    }
    node.extraParams = parsed;
    return true;
  } catch (error) {
    showToast(error.message || "额外 JSON 参数格式错误");
    return false;
  }
}

function setKeyStatus(hasApiKey, dreaminaReady = false) {
  const ready = Boolean(hasApiKey || dreaminaReady);
  keyStatus.classList.toggle("ready", ready);
  keyStatus.classList.toggle("missing", !ready);
  keyStatus.textContent = hasApiKey ? "Key 已配置" : dreaminaReady ? "即梦已登录" : "Key 未配置";
}

function openSettingsDialog() {
  settingsApiKey.value = "";
  settingsGptImageKey.value = "";
  settingsGrokImageKey.value = "";
  settingsGrsaiApiKey.value = "";
  settingsGptImageKey.placeholder = config.modelKeys?.["gpt-image-2"] ? "已配置，留空不修改" : "留空则使用平台总 Key";
  settingsGrokImageKey.placeholder = config.modelKeys?.["grok-image-image"] ? "已配置，留空不修改" : "留空则使用平台总 Key";
  settingsGrsaiApiKey.placeholder = config.hasGrsaiApiKey ? "已配置，留空不修改" : "填写 Grsai API Key";
  settingsBaseUrl.value = config.baseUrl || "https://yunwu.ai";
  settingsImageEndpoint.value = config.imageEndpoint || "/v1/images/generations";
  settingsEditEndpoint.value = config.editEndpoint || "/v1/images/edits";
  settingsDefaultModel.value = config.defaultModel || "gpt-image-2";
  settingsCacheDir.value = config.cacheDir || "";
  settingsStatus.textContent = config.hasApiKey ? "Key 已配置" : "Key 未配置";
  const modelKeyCount = Object.values(config.modelKeys || {}).filter(Boolean).length;
  const keyCount = Number(Boolean(config.hasApiKey)) + Number(Boolean(config.hasGrsaiApiKey)) + modelKeyCount;
  settingsStatus.textContent = keyCount ? `Key 已配置（${keyCount} 个）` : "Key 未配置";
  pauseChatGptHost();
  settingsDialog.showModal();
  refreshDreaminaStatus();
}

function closeSettingsDialog() {
  if (settingsDialog.open) settingsDialog.close();
  else resumeChatGptHost();
}

async function refreshDreaminaStatus(options = {}) {
  if (!dreaminaStatusText) return null;
  dreaminaStatusText.textContent = "检测中";
  setDreaminaBusy(true);
  try {
    const response = await fetch("/api/dreamina/status");
    const data = await readJsonResponse(response);
    renderDreaminaStatus(data);
    if (options.notify) showToast(data.loggedIn ? "即梦登录状态正常" : data.error || "即梦尚未登录");
    return data;
  } catch (error) {
    const data = { installed: false, loggedIn: false, error: error.message || "即梦状态读取失败" };
    renderDreaminaStatus(data);
    if (options.notify) showToast(data.error);
    return data;
  } finally {
    setDreaminaBusy(false);
  }
}

function renderDreaminaStatus(data = {}) {
  const installed = Boolean(data.installed);
  const loggedIn = Boolean(data.loggedIn);
  dreaminaStatus = { ...data, installed, loggedIn };
  dreaminaStatusText.textContent = !installed ? "未安装" : loggedIn ? "已登录" : "未登录";

  const meta = [];
  if (data.version) meta.push(`v${data.version}`);
  if (Number.isFinite(data.totalCredit)) meta.push(`余额 ${data.totalCredit}`);
  if (data.vipLevel) meta.push(data.vipLevel);
  if (!meta.length && data.error) meta.push(data.error);
  dreaminaAccountMeta.textContent = meta.join(" · ");

  config.dreaminaLoggedIn = loggedIn;
  setKeyStatus(Boolean(config.hasAnyKey ?? config.hasApiKey), loggedIn);
  updateDreaminaButtons();
}

function updateDreaminaButtons(isBusy = false, action = "") {
  if (dreaminaInstallButton) {
    dreaminaInstallButton.disabled = isBusy;
    dreaminaInstallButton.textContent =
      isBusy && action === "install" ? "安装中..." : dreaminaStatus.installed ? "重新安装 CLI" : "安装即梦 CLI";
  }
  if (dreaminaLoginButton) {
    dreaminaLoginButton.disabled = isBusy || !dreaminaStatus.installed;
    dreaminaLoginButton.textContent = isBusy && action === "login" ? "打开中..." : "登录即梦";
  }
  if (dreaminaRefreshButton) dreaminaRefreshButton.disabled = isBusy;
}

function setDreaminaBusy(isBusy, action = "") {
  updateDreaminaButtons(isBusy, action);
}

async function runDreaminaAction(action) {
  const actionText = action === "install" ? "安装即梦 CLI" : "登录即梦";
  setDreaminaBusy(true, action);
  renderDreaminaActionStatus(action);
  showToast(action === "install" ? "正在安装即梦 CLI..." : "正在打开即梦登录窗口...");
  try {
    const response = await fetch(`/api/dreamina/${action}`, { method: "POST" });
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || `${actionText}启动失败`);
    finishDreaminaAction(action, data);
    showToast(data.message || `${actionText}窗口已打开`);
    window.setTimeout(() => refreshDreaminaStatus(), action === "install" ? 500 : 4000);
  } catch (error) {
    failDreaminaAction(action, error);
    showToast(error.message || `${actionText}启动失败`);
  } finally {
    setDreaminaBusy(false);
  }
}

function renderDreaminaActionStatus(action) {
  if (!dreaminaStatusText || !dreaminaAccountMeta) return;
  if (action === "install") {
    dreaminaStatusText.textContent = "安装中";
    dreaminaAccountMeta.textContent = "正在下载并安装官方 Dreamina CLI，请稍候...";
    setDreaminaActionProgress("正在下载并安装官方 Dreamina CLI，请保持软件开启...", "active");
    return;
  }
  dreaminaStatusText.textContent = "登录中";
  dreaminaAccountMeta.textContent = "正在打开登录窗口；完成登录后点击“测试连接”。";
  setDreaminaActionProgress("正在打开即梦登录窗口；如果没有弹出窗口，请稍后再点一次。", "active");
}

function finishDreaminaAction(action, data = {}) {
  if (action === "install") {
    const pathText = data.executable || data.installDir || "";
    setDreaminaActionProgress(pathText ? `安装完成：${pathText}` : "安装完成，可以点击“登录即梦”。", "done");
    dreaminaStatusText.textContent = "已安装";
    dreaminaAccountMeta.textContent = "安装完成，正在刷新检测状态...";
    return;
  }
  setDreaminaActionProgress("登录窗口已打开，完成登录后点击“测试连接”。", "done");
}

function failDreaminaAction(action, error) {
  const actionText = action === "install" ? "安装失败" : "登录窗口打开失败";
  setDreaminaActionProgress(`${actionText}：${error.message || error || "未知错误"}`, "error");
}

function setDreaminaActionProgress(message, state = "active") {
  if (!dreaminaActionProgress || !dreaminaActionText) return;
  dreaminaActionProgress.hidden = false;
  dreaminaActionProgress.classList.toggle("is-active", state === "active");
  dreaminaActionProgress.classList.toggle("is-done", state === "done");
  dreaminaActionProgress.classList.toggle("is-error", state === "error");
  if (dreaminaActionBar) dreaminaActionBar.style.width = state === "active" ? "" : state === "done" || state === "error" ? "100%" : "0%";
  dreaminaActionText.textContent = message;
}

async function copyDreaminaCommand(command) {
  try {
    await navigator.clipboard.writeText(command);
    showToast("命令已复制");
  } catch {
    const input = document.createElement("textarea");
    input.value = command;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
    showToast("命令已复制");
  }
}

async function saveSettings(event) {
  event.preventDefault();
  settingsStatus.textContent = "保存中";

  try {
    const payload = {
      apiKey: settingsApiKey.value.trim(),
      grsaiApiKey: settingsGrsaiApiKey.value.trim(),
      modelApiKeys: {
        "gpt-image-2": settingsGptImageKey.value.trim(),
        "grok-image-image": settingsGrokImageKey.value.trim()
      },
      baseUrl: settingsBaseUrl.value.trim(),
      imageEndpoint: settingsImageEndpoint.value.trim(),
      editEndpoint: settingsEditEndpoint.value.trim(),
      defaultModel: settingsDefaultModel.value.trim(),
      cacheDir: settingsCacheDir.value.trim()
    };

    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "设置保存失败");

    config = {
      ...config,
      hasApiKey: data.hasApiKey,
      hasGrsaiApiKey: data.hasGrsaiApiKey,
      hasAnyKey: data.hasAnyKey,
      baseUrl: data.baseUrl,
      imageEndpoint: data.imageEndpoint,
      editEndpoint: data.editEndpoint,
      defaultModel: data.defaultModel,
      modelKeys: data.modelKeys,
      cacheDir: data.cacheDir
    };
    setKeyStatus(config.hasAnyKey ?? config.hasApiKey, config.dreaminaLoggedIn);
    await refreshProjectList();
    settingsApiKey.value = "";
    settingsGptImageKey.value = "";
    settingsGrokImageKey.value = "";
    settingsGrsaiApiKey.value = "";
    settingsStatus.textContent = "已保存";
    showToast("设置已保存");
  } catch (error) {
    settingsStatus.textContent = error.message || "保存失败";
  }
}

async function checkForUpdates(options = {}) {
  const automatic = Boolean(options.automatic);
  if (!updateDialog) return;

  if (!config.version || !config.updateRepo) {
    try {
      await refreshRuntimeConfig();
    } catch {
      // The update check below will surface the actionable error.
    }
  }

  latestUpdateInfo = null;
  updateStatus.textContent = "正在检查 GitHub Releases...";
  currentVersionText.textContent = config.version ? `v${config.version}` : "-";
  latestVersionText.textContent = "-";
  updateAssetText.textContent = "-";
  updateReleaseNotes.textContent = "";
  updateReleaseNotes.hidden = true;
  updateRepoText.textContent = config.updateRepo || "";
  openReleaseButton.disabled = true;
  downloadUpdateButton.disabled = true;
  resetUpdateDownloadProgress();
  if (!automatic) {
    checkUpdateButton.disabled = true;
    openUpdateDialog();
  }

  try {
    const response = await fetch("/api/update/check");
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || "检查更新失败");

    latestUpdateInfo = data;
    config = {
      ...config,
      version: data.currentVersion || config.version,
      updateRepo: data.repo || config.updateRepo
    };

    currentVersionText.textContent = data.currentVersion ? `v${data.currentVersion}` : "-";
    latestVersionText.textContent = data.latestVersion ? `v${data.latestVersion}` : "-";
    updateRepoText.textContent = data.repo ? `GitHub: ${data.repo}` : "";
    updateAssetText.textContent = data.asset
      ? `${data.asset.name} (${formatBytes(data.asset.size)})`
      : "未找到 exe/zip 附件";
    updateReleaseNotes.textContent = data.body || "";
    updateReleaseNotes.hidden = !data.body;

    if (!data.hasRelease) {
      updateStatus.textContent = data.message || "还没有找到 GitHub Release。";
      if (!automatic) showToast("还没有找到 GitHub Release");
      return;
    }

    openReleaseButton.disabled = !data.releaseUrl;
    downloadUpdateButton.disabled = !(data.hasUpdate && data.asset?.downloadUrl);

    if (data.hasUpdate) {
      updateStatus.textContent = data.asset
        ? `发现新版本 v${data.latestVersion}，可以下载更新。`
        : `发现新版本 v${data.latestVersion}，但 Release 没有可下载附件。`;
      if (!updateDialog.open) openUpdateDialog();
      showToast(`发现新版本 v${data.latestVersion}`);
    } else {
      updateStatus.textContent = "当前已经是最新版本。";
      if (!automatic) showToast("当前已经是最新版本");
    }
  } catch (error) {
    updateStatus.textContent = error.message || "检查更新失败";
    if (!automatic) showToast(updateStatus.textContent);
  } finally {
    checkUpdateButton.disabled = false;
  }
}

async function downloadLatestUpdate() {
  const asset = latestUpdateInfo?.asset;
  if (!asset?.downloadUrl) {
    if (latestUpdateInfo?.releaseUrl) window.open(latestUpdateInfo.releaseUrl, "_blank", "noreferrer");
    return;
  }

  downloadUpdateButton.disabled = true;
  openReleaseButton.disabled = true;
  setUpdateDownloadProgress(0, 0, Number(asset.size) || 0);
  updateStatus.textContent = "正在下载更新...";

  try {
    const params = new URLSearchParams({
      url: asset.downloadUrl,
      name: asset.name || "cc-infinite-canvas-update.exe"
    });
    const response = await fetch(`/api/update/download?${params.toString()}`);
    if (!response.ok) {
      const data = await readJsonResponse(response);
      throw new Error(data.error || "下载更新失败");
    }
    if (!response.body) throw new Error("当前环境不支持显示下载进度");

    const total = Number(response.headers.get("content-length")) || Number(asset.size) || 0;
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const reader = response.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.byteLength;
      setUpdateDownloadProgress(total ? received / total : 0, received, total);
    }

    setUpdateDownloadProgress(1, received, total || received);
    saveDownloadedUpdate(new Blob(chunks, { type: contentType }), asset.name || "cc-infinite-canvas-update.exe");
    updateStatus.textContent = "下载完成，请运行安装程序完成更新。";
    showToast("更新下载完成");
  } catch (error) {
    updateStatus.textContent = error.message || "下载更新失败";
    showToast(updateStatus.textContent);
  } finally {
    downloadUpdateButton.disabled = !(latestUpdateInfo?.hasUpdate && latestUpdateInfo?.asset?.downloadUrl);
    openReleaseButton.disabled = !latestUpdateInfo?.releaseUrl;
  }
}

function resetUpdateDownloadProgress() {
  if (updateDownloadProgress) updateDownloadProgress.hidden = true;
  if (updateDownloadBar) updateDownloadBar.style.width = "0%";
  if (updateDownloadPercent) updateDownloadPercent.textContent = "0%";
  if (updateDownloadBytes) updateDownloadBytes.textContent = "-";
}

function setUpdateDownloadProgress(ratio, received, total) {
  const safeRatio = clamp(Number(ratio) || 0, 0, 1);
  if (updateDownloadProgress) updateDownloadProgress.hidden = false;
  if (updateDownloadBar) updateDownloadBar.style.width = `${Math.round(safeRatio * 100)}%`;
  if (updateDownloadPercent) updateDownloadPercent.textContent = `${Math.round(safeRatio * 100)}%`;
  if (updateDownloadBytes) {
    updateDownloadBytes.textContent = total
      ? `${formatBytes(received)} / ${formatBytes(total)}`
      : `${formatBytes(received)} 已下载`;
  }
}

function saveDownloadedUpdate(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function openUpdateDialog() {
  if (!updateDialog || updateDialog.open) return;
  pauseChatGptHost();
  updateDialog.showModal();
}

function closeUpdateDialog() {
  if (updateDialog?.open) updateDialog.close();
  else resumeChatGptHost();
}

function pauseChatGptHost() {
  if (!hasDesktopChatGptHost()) return;
  suppressChatGptHost = true;
  window.ccCanvasDesktop.hideChatGpt();
}

function resumeChatGptHost() {
  if (!suppressChatGptHost) return;
  suppressChatGptHost = false;
  syncChatGptHostSoon();
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    const fallback = text.trim().slice(0, 300);
    const message =
      response.status === 404 && fallback === "Not found"
        ? "本地更新接口未找到，请重启应用或重新安装最新版。"
        : fallback || `HTTP ${response.status}`;
    return {
      parseError: true,
      error: message
    };
  }
}

function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function applySelectionScale() {
  const scalableNodes = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id) && ["image", "video"].includes(node.type));
  if (!scalableNodes.length) {
    showToast("选区里没有可缩放的图片或视频节点");
    return;
  }

  const scale = clamp((Number(selectionScaleInput.value) || 50) / 100, 0.05, 4);
  for (const node of scalableNodes) {
    node.scale = node.type === "video" ? Math.max(scale, 0.1) : scale;
  }

  renderCanvas();
  saveCanvasState();
}

function reusePromptFromSelection() {
  const sourceImage = getSelectedImagesWithPrompt()[0];
  if (!sourceImage) {
    showToast("选中的图片没有可复用的提示词");
    return;
  }

  reusePromptFromImage(sourceImage.id);
}

function reusePromptFromImage(imageNodeId) {
  const sourceImage = canvasState.nodes.find((node) => node.id === imageNodeId && node.type === "image");
  const generation = getImageGeneration(sourceImage);
  if (!sourceImage || !generation?.prompt) {
    showToast("这张图片没有可复用的提示词");
    return;
  }

  const selectedTasks = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id) && node.type === "task");
  if (selectedTasks.length) {
    for (const task of selectedTasks) {
      applyGenerationToTask(task, generation);
    }
    renderCanvas();
    saveCanvasState();
    showToast(`提示词和生成参数已复用到 ${selectedTasks.length} 个节点`);
    return;
  }

  const scale = Number(sourceImage.scale) || defaultImageScale;
  const imageWidth = Math.max(1, Number(sourceImage.originalWidth) || 512) * scale;
  const point = {
    x: sourceImage.x + imageWidth + 56 + defaultTaskWidth / 2,
    y: sourceImage.y + 210
  };
  const task = addTaskNode(generation.mode, point, { prompt: generation.prompt });
  applyGenerationToTask(task, generation);
  updateNode(task);
  saveCanvasState();
  showToast("已用图片提示词和参数创建新生图节点");
}

function getSelectedImagesWithPrompt() {
  return canvasState.nodes.filter((node) => selectedNodeIds.has(node.id) && node.type === "image" && getImagePrompt(node));
}

function getImagePrompt(node) {
  return String(node?.image?.generation?.prompt || node?.image?.prompt || "").trim();
}

function getImageGeneration(node) {
  const image = node?.image || {};
  const generation = isPlainObject(image.generation) ? image.generation : {};
  const prompt = String(generation.prompt || image.prompt || "").trim();
  if (!prompt) return null;

  const mode = generation.mode === "edit" ? "edit" : "create";
  return {
    mode,
    prompt,
    model: generation.model || image.model || config.defaultModel || "gpt-image-2",
    n: String(generation.n || "1"),
    size: generation.size || image.size || "auto",
    quality: generation.quality || "",
    format: generation.format || image.format || "png",
    background: generation.background || "",
    moderation: generation.moderation || "",
    baseUrl: generation.baseUrl || config.baseUrl || "https://yunwu.ai",
    endpointPath: generation.endpointPath || defaultEndpointForMode(mode),
    extraParams: isPlainObject(generation.extraParams) ? clonePlainValue(generation.extraParams) : {},
    cachedImages: Array.isArray(generation.cachedImages) ? clonePlainValue(generation.cachedImages) : [],
    cachedMask: generation.cachedMask ? clonePlainValue(generation.cachedMask) : null
  };
}

function applyGenerationToTask(task, generation) {
  task.mode = generation.mode === "edit" ? "edit" : "create";
  task.model = generation.model || config.defaultModel || "gpt-image-2";
  task.baseUrl = generation.baseUrl || config.baseUrl || "https://yunwu.ai";
  task.endpointPath = generation.endpointPath || defaultEndpointForMode(task.mode);
  applyTaskModelDefaults(task, { modeChanged: true, modelChanged: true });

  task.prompt = generation.prompt || "";
  task.n = String(generation.n || "1");
  task.size = generation.size || defaultSizeForModel(task.model, task.mode);
  task.quality = generation.quality || "";
  task.format = generation.format || "png";
  task.background = generation.background || "";
  task.moderation = generation.moderation || "";
  task.extraParams = isPlainObject(generation.extraParams) ? clonePlainValue(generation.extraParams) : {};
  task.extraParamsText = JSON.stringify(task.extraParams, null, 2);
  applyTaskModelDefaults(task, { modeChanged: true, modelChanged: true });
  task.cachedImages = Array.isArray(generation.cachedImages) ? dedupeAssetRefs(clonePlainValue(generation.cachedImages)) : [];
  task.cachedMask = generation.cachedMask ? clonePlainValue(generation.cachedMask) : null;
  task.sessionFiles = [];
  task.sessionMask = "";
  fileStore.delete(task.id);
  task.cacheStatus = task.mode === "edit" ? (task.cachedImages.length ? "ready" : "pending") : "none";
  task.status = "idle";
  task.error = "";
  task.durationMs = null;
  task.debugOpen = false;
}

function updateSelectionToolbar() {
  const selected = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id));
  if (!selected.length) {
    selectionToolbar.hidden = true;
    return;
  }

  const selectedImages = selected.filter((node) => node.type === "image");
  const selectedVideos = selected.filter((node) => node.type === "video");
  const scalableNodes = [...selectedImages, ...selectedVideos];
  selectionToolbar.hidden = false;
  selectionMeta.textContent = scalableNodes.length
    ? `已选中 ${selected.length} 项 · ${selectedImages.length} 张图片 · ${selectedVideos.length} 个视频`
    : `已选中 ${selected.length} 项`;

  const canScaleImages = scalableNodes.length > 0;
  const canReusePrompt = getSelectedImagesWithPrompt().length > 0;
  selectionScaleInput.disabled = !canScaleImages;
  applySelectionScaleButton.disabled = !canScaleImages;
  reusePromptButton.disabled = !canReusePrompt;

  if (canScaleImages && document.activeElement !== selectionScaleInput) {
    const averageScale =
      scalableNodes.reduce((sum, node) => sum + (Number(node.scale) || (node.type === "video" ? defaultVideoScale : defaultImageScale)), 0) /
      scalableNodes.length;
    selectionScaleInput.value = String(Math.round(averageScale * 100));
  }
}

function bindCanvasEvents() {
  canvasViewport.addEventListener("pointerdown", handleCanvasPointerDown);
  canvasViewport.addEventListener("pointermove", rememberCanvasPointer);
  canvasViewport.addEventListener("dblclick", handleCanvasDoubleClick);
  canvasViewport.addEventListener("wheel", handleWheel, { passive: false });
  canvasViewport.addEventListener("dragover", handleCanvasDragOver);
  canvasViewport.addEventListener("dragleave", handleCanvasDragLeave);
  canvasViewport.addEventListener("drop", handleCanvasDrop);
  document.addEventListener("paste", handleDocumentPaste);

  window.addEventListener("keydown", (event) => {
    if (handleCanvasShortcut(event)) return;
    if (event.code !== "Space" || isInteractiveElement(event.target) || settingsDialog.open) return;
    event.preventDefault();
    isSpacePressed = true;
    canvasViewport.classList.add("pan-mode");
  });

  window.addEventListener("keyup", (event) => {
    if (event.code !== "Space") return;
    isSpacePressed = false;
    canvasViewport.classList.remove("pan-mode");
  });
  window.addEventListener("resize", syncChatGptHostSoon);

  document.addEventListener("pointerdown", (event) => {
    if (createMenu && !createMenu.hidden && !createMenu.contains(event.target)) {
      hideCreateMenu();
    }
  });
}

function handleCanvasShortcut(event) {
  if (settingsDialog.open) return false;

  const key = event.key.toLowerCase();
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "s") {
    event.preventDefault();
    saveProjectNow();
    return true;
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "n") {
    event.preventDefault();
    createNewProject();
    return true;
  }

  if (isInteractiveElement(event.target)) return false;

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "c") {
    event.preventDefault();
    copySelectedNodesToClipboard();
    return true;
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z") {
    event.preventDefault();
    undoCanvasChange();
    return true;
  }

  if ((event.key === "Delete" || event.key === "Backspace") && selectedNodeIds.size) {
    event.preventDefault();
    deleteSelectedNodes();
    return true;
  }

  return false;
}

function rememberCanvasPointer(event) {
  lastCanvasPointer = { clientX: event.clientX, clientY: event.clientY };
}

function bindMinimapEvents() {
  if (!minimap) return;

  const jump = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const point = getMinimapWorldPoint(event.clientX, event.clientY);
    centerViewportOnWorld(point.x, point.y);
  };

  minimap.addEventListener("pointerdown", (event) => {
    jump(event);
    minimap.setPointerCapture?.(event.pointerId);

    const move = (moveEvent) => jump(moveEvent);
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  });
}

function handleCanvasDragOver(event) {
  if (!hasCanvasMediaFiles(event.dataTransfer?.items)) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
  canvasViewport.classList.add("is-file-over");
}

function handleCanvasDragLeave(event) {
  if (canvasViewport.contains(event.relatedTarget)) return;
  canvasViewport.classList.remove("is-file-over");
}

async function handleCanvasDrop(event) {
  const files = Array.from(event.dataTransfer?.files || []).filter(isCanvasMediaFile);
  if (!files.length) return;

  event.preventDefault();
  event.stopPropagation();
  canvasViewport.classList.remove("is-file-over");
  hideCreateMenu();

  const point = getWorldPointFromClient(event.clientX, event.clientY);
  await addLocalMediaFilesToCanvas(files, point);
}

function handleDocumentPaste(event) {
  if (settingsDialog.open || updateDialog?.open) return;

  const imageFiles = clipboardImageFiles(event.clipboardData);
  if (imageFiles.length) {
    event.preventDefault();
    event.stopPropagation();
    hideCreateMenu();
    addLocalImageFilesToCanvas(imageFiles, getCanvasPastePoint());
    return;
  }

  if (isInteractiveElement(event.target)) return;
  if (!nodeClipboard.nodes.length) return;

  event.preventDefault();
  event.stopPropagation();
  pasteNodesFromClipboard();
}

function clipboardImageFiles(clipboardData) {
  const items = Array.from(clipboardData?.items || []);
  const files = items
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter(Boolean);

  if (!files.length) {
    files.push(...Array.from(clipboardData?.files || []).filter((file) => file.type.startsWith("image/")));
  }

  return files.map((file, index) => normalizeClipboardImageFile(file, index));
}

function normalizeClipboardImageFile(file, index) {
  if (file.name) return file;
  const type = file.type || "image/png";
  const extension = type.includes("jpeg") ? "jpg" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "png";
  return new File([file], `clipboard-image-${Date.now()}-${index + 1}.${extension}`, {
    type,
    lastModified: Date.now()
  });
}

function getCanvasPastePoint() {
  if (lastCanvasPointer) {
    const rect = canvasViewport.getBoundingClientRect();
    const inside =
      lastCanvasPointer.clientX >= rect.left &&
      lastCanvasPointer.clientX <= rect.right &&
      lastCanvasPointer.clientY >= rect.top &&
      lastCanvasPointer.clientY <= rect.bottom;
    if (inside) return getWorldPointFromClient(lastCanvasPointer.clientX, lastCanvasPointer.clientY);
  }
  return getViewportCenterWorld();
}

function hasCanvasMediaFiles(items) {
  return Array.from(items || []).some(
    (item) => item.kind === "file" && (item.type.startsWith("image/") || item.type.startsWith("video/") || !item.type)
  );
}

function isCanvasMediaFile(file) {
  return isCanvasImageFile(file) || isCanvasVideoFile(file);
}

function isCanvasImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

function isCanvasVideoFile(file) {
  if (file?.type?.startsWith("video/")) return true;
  const extension = fileExtension(file?.name);
  return ["mp4", "mov", "webm", "m4v"].includes(extension);
}

async function addLocalImageFilesToCanvas(files, point) {
  return await addLocalMediaFilesToCanvas(files.filter(isCanvasImageFile), point);
}

async function addLocalMediaFilesToCanvas(files, point) {
  const mediaFiles = files.filter(isCanvasMediaFile);
  if (!mediaFiles.length) return;

  const formData = new FormData();
  formData.append("projectId", currentProjectId);
  for (const file of mediaFiles) {
    formData.append(isCanvasVideoFile(file) ? "video" : "image", file);
  }

  let metadata;
  try {
    metadata = await Promise.all(mediaFiles.map(readLocalMediaMetadata));
  } catch {
    metadata = mediaFiles.map((file) =>
      isCanvasVideoFile(file) ? { width: defaultVideoWidth, height: defaultVideoHeight, duration: 0 } : { width: 512, height: 512 }
    );
  }

  try {
    const response = await fetch("/api/cache-assets", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "本地图片缓存失败");

    const assets = (data.assets || []).filter((asset) => ["image", "video"].includes(asset.field));
    if (!assets.length) throw new Error("没有识别到可用媒体文件");

    let cursorX = point.x;
    let cursorY = point.y;
    let rowHeight = 0;
    const createdIds = [];
    let imageCount = 0;
    let videoCount = 0;

    for (const [index, asset] of assets.entries()) {
      const dim = metadata[index] || (asset.field === "video" ? { width: defaultVideoWidth, height: defaultVideoHeight } : { width: 512, height: 512 });
      const isVideo = asset.field === "video";
      const scale = isVideo ? defaultVideoScale : defaultImageScale;
      const node = isVideo
        ? createLocalVideoNode(asset, dim, cursorX, cursorY)
        : createLocalImageNode(asset, dim, cursorX, cursorY);

      canvasState.nodes.push(node);
      createdIds.push(node.id);
      if (isVideo) videoCount += 1;
      else imageCount += 1;

      rowHeight = Math.max(rowHeight, dim.height * scale);
      if (index > 0 && index % 3 === 2) {
        cursorX = point.x;
        cursorY += rowHeight + 32;
        rowHeight = 0;
      } else {
        cursorX += dim.width * scale + 32;
      }
    }

    selectedNodeIds.clear();
    createdIds.forEach((id) => selectedNodeIds.add(id));
    renderCanvas();
    saveCanvasState();
    showToast(localMediaToastText(imageCount, videoCount));
  } catch (error) {
    showToast(error.message || "拖入媒体失败");
  }
}

function createLocalImageNode(asset, dim, x, y) {
  const image = {
    id: createId(),
    type: "file",
    url: asset.url || `/${asset.path}`,
    filename: asset.originalName || asset.filename || "local-image",
    sourceUrl: "",
    prompt: "本地图片",
    model: "local",
    size: `${dim.width}x${dim.height}`,
    format: imageFormatFromContentType(asset.contentType),
    cachedAsset: asset,
    createdAt: new Date().toISOString()
  };

  return {
    id: createId(),
    type: "image",
    image,
    sourceTaskId: "",
    sourceImageKey: asset.filename || image.url,
    originalWidth: dim.width,
    originalHeight: dim.height,
    scale: defaultImageScale,
    x: Math.round(x),
    y: Math.round(y),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };
}

function createLocalVideoNode(asset, dim, x, y) {
  const video = {
    id: createId(),
    type: "file",
    url: asset.url || `/${asset.path}`,
    filename: asset.originalName || asset.filename || "local-video",
    sourceUrl: "",
    prompt: "本地视频",
    model: "local",
    size: `${dim.width}x${dim.height}`,
    format: videoFormatFromContentType(asset.contentType, asset.originalName || asset.filename),
    width: dim.width,
    height: dim.height,
    duration: Number(dim.duration) || undefined,
    cachedAsset: asset,
    createdAt: new Date().toISOString()
  };

  return {
    id: createId(),
    type: "video",
    video,
    sourceTaskId: "",
    sourceVideoKey: asset.filename || video.url,
    originalWidth: dim.width,
    originalHeight: dim.height,
    scale: defaultVideoScale,
    x: Math.round(x),
    y: Math.round(y),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };
}

function localMediaToastText(imageCount, videoCount) {
  const parts = [];
  if (imageCount) parts.push(`${imageCount} 张本地图片`);
  if (videoCount) parts.push(`${videoCount} 个本地视频`);
  return `${parts.join("、")}已加入画布`;
}

function readLocalMediaMetadata(file) {
  return isCanvasVideoFile(file) ? readVideoFileMetadata(file) : readImageFileDimensions(file);
}

function readImageFileDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth || 512,
        height: image.naturalHeight || 512
      };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image dimension read failed"));
    };
    image.src = url;
  });
}

function readVideoFileMetadata(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const cleanup = () => URL.revokeObjectURL(url);
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      const dimensions = {
        width: video.videoWidth || defaultVideoWidth,
        height: video.videoHeight || defaultVideoHeight,
        duration: Number.isFinite(video.duration) ? Math.round(video.duration * 10) / 10 : 0
      };
      cleanup();
      resolve(dimensions);
    };
    video.onerror = () => {
      cleanup();
      resolve({ width: defaultVideoWidth, height: defaultVideoHeight, duration: 0 });
    };
    video.src = url;
  });
}

function imageFormatFromContentType(contentType = "") {
  if (contentType.includes("jpeg")) return "jpeg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "png";
}

function videoFormatFromContentType(contentType = "", filename = "") {
  if (contentType.includes("quicktime")) return "mov";
  if (contentType.includes("webm")) return "webm";
  if (contentType.includes("x-m4v")) return "m4v";
  if (contentType.includes("mp4")) return "mp4";
  return fileExtension(filename) || "mp4";
}

function fileExtension(filename = "") {
  const clean = String(filename || "")
    .split("?")[0]
    .split("#")[0];
  if (!clean.includes(".")) return "";
  return clean.split(".").pop().toLowerCase();
}

function updateMinimap() {
  if (!minimap || !minimapWorld || !minimapView) return;

  minimapBounds = computeMinimapBounds();
  minimapWorld.replaceChildren();

  for (const node of canvasState.nodes) {
    const bounds = getNodeBounds(node);
    const item = document.createElement("span");
    item.className = `minimap-node minimap-node-${node.type}`;
    placeMinimapItem(item, bounds);
    minimapWorld.append(item);
  }

  const viewportRect = getViewportWorldRect();
  placeMinimapItem(minimapView, viewportRect);
}

function computeMinimapBounds() {
  const rects = canvasState.nodes.map(getNodeBounds);
  rects.push(getViewportWorldRect());

  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.width));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.height));
  const padding = 240;

  return {
    x: minX - padding,
    y: minY - padding,
    width: Math.max(maxX - minX + padding * 2, 900),
    height: Math.max(maxY - minY + padding * 2, 650)
  };
}

function placeMinimapItem(element, rect) {
  const left = ((rect.x - minimapBounds.x) / minimapBounds.width) * 100;
  const top = ((rect.y - minimapBounds.y) / minimapBounds.height) * 100;
  const width = (rect.width / minimapBounds.width) * 100;
  const height = (rect.height / minimapBounds.height) * 100;

  element.style.left = `${clamp(left, -20, 120)}%`;
  element.style.top = `${clamp(top, -20, 120)}%`;
  element.style.width = `${Math.max(width, 1.2)}%`;
  element.style.height = `${Math.max(height, 1.2)}%`;
}

function getMinimapWorldPoint(clientX, clientY) {
  const rect = minimap.getBoundingClientRect();
  const localX = clamp((clientX - rect.left) / rect.width, 0, 1);
  const localY = clamp((clientY - rect.top) / rect.height, 0, 1);
  return {
    x: minimapBounds.x + localX * minimapBounds.width,
    y: minimapBounds.y + localY * minimapBounds.height
  };
}

function centerViewportOnWorld(x, y) {
  const rect = canvasViewport.getBoundingClientRect();
  canvasState.viewport.x = rect.width / 2 - x * canvasState.viewport.zoom;
  canvasState.viewport.y = rect.height / 2 - y * canvasState.viewport.zoom;
  applyViewport();
  saveCanvasState();
}

function getViewportWorldRect() {
  const rect = canvasViewport.getBoundingClientRect();
  return {
    x: -canvasState.viewport.x / canvasState.viewport.zoom,
    y: -canvasState.viewport.y / canvasState.viewport.zoom,
    width: rect.width / canvasState.viewport.zoom,
    height: rect.height / canvasState.viewport.zoom
  };
}

function handleCanvasPointerDown(event) {
  if (event.target.closest(".minimap")) return;
  if (event.button === 1 || (event.button === 0 && isSpacePressed)) {
    hideCreateMenu();
    startPan(event);
    return;
  }

  if (event.target.closest(".canvas-node")) return;
  hideCreateMenu();

  if (event.button !== 0) return;
  startMarqueeSelect(event);
}

function handleCanvasDoubleClick(event) {
  if (event.target.closest(".minimap")) return;
  if (isSpacePressed) return;
  if (event.target.closest(".canvas-node")) return;
  event.preventDefault();
  pendingCreatePoint = getWorldPointFromClient(event.clientX, event.clientY);
  showCreateMenu(event.clientX, event.clientY);
}

function startPan(event) {
  event.preventDefault();
  const start = {
    x: event.clientX,
    y: event.clientY,
    panX: canvasState.viewport.x,
    panY: canvasState.viewport.y
  };

  canvasViewport.classList.add("is-panning");

  const move = (moveEvent) => {
    canvasState.viewport.x = start.panX + moveEvent.clientX - start.x;
    canvasState.viewport.y = start.panY + moveEvent.clientY - start.y;
    applyViewport();
  };

  const stop = () => {
    canvasViewport.classList.remove("is-panning");
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    saveCanvasState();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function startMarqueeSelect(event) {
  event.preventDefault();
  const start = { x: event.clientX, y: event.clientY };
  let moved = false;

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - start.x;
    const dy = moveEvent.clientY - start.y;
    if (!moved && Math.hypot(dx, dy) < 5) return;
    moved = true;
    updateSelectionBox(start.x, start.y, moveEvent.clientX, moveEvent.clientY);
  };

  const stop = (upEvent) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    removeSelectionBox();

    if (!moved) {
      clearSelection();
      return;
    }

    const worldRect = rectFromWorldPoints(
      getWorldPointFromClient(start.x, start.y),
      getWorldPointFromClient(upEvent.clientX, upEvent.clientY)
    );
    selectNodesInRect(worldRect, upEvent.shiftKey || upEvent.ctrlKey || upEvent.metaKey);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function updateSelectionBox(startX, startY, endX, endY) {
  if (!selectionBox) {
    selectionBox = document.createElement("div");
    selectionBox.className = "selection-rect";
    canvasViewport.append(selectionBox);
    canvasViewport.classList.add("is-selecting");
  }

  const viewportRect = canvasViewport.getBoundingClientRect();
  const left = Math.min(startX, endX) - viewportRect.left;
  const top = Math.min(startY, endY) - viewportRect.top;
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
}

function removeSelectionBox() {
  if (selectionBox) selectionBox.remove();
  selectionBox = null;
  canvasViewport.classList.remove("is-selecting");
}

function handleWheel(event) {
  if (shouldLetFieldHandleWheel(event)) return;
  event.preventDefault();
  const delta =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? event.deltaY * 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? event.deltaY * 320
        : event.deltaY;
  const factor = clamp(Math.exp(-delta * 0.0015), 0.5, 2);
  zoomAtPoint(canvasState.viewport.zoom * factor, event.clientX, event.clientY);
}

function shouldLetFieldHandleWheel(event) {
  const field = event.target.closest?.("textarea, input, select, [contenteditable='true']");
  if (!field) return false;
  if (field.matches("textarea, [contenteditable='true']") || field.scrollHeight > field.clientHeight) {
    event.stopPropagation();
    return true;
  }
  return false;
}

function zoomAtCenter(nextZoom) {
  const rect = canvasViewport.getBoundingClientRect();
  zoomAtPoint(nextZoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
}

function zoomAtPoint(nextZoom, clientX, clientY) {
  const zoom = normalizeZoom(nextZoom);
  const point = getWorldPointFromClient(clientX, clientY);
  const rect = canvasViewport.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;

  canvasState.viewport.zoom = zoom;
  canvasState.viewport.x = localX - point.x * zoom;
  canvasState.viewport.y = localY - point.y * zoom;
  applyViewport();
  saveCanvasState();
}

function applyViewport() {
  const x = Number(canvasState.viewport.x) || 0;
  const y = Number(canvasState.viewport.y) || 0;
  const zoom = normalizeZoom(canvasState.viewport.zoom);
  canvasState.viewport = { x, y, zoom };
  canvasViewport.style.setProperty("--pan-x", x);
  canvasViewport.style.setProperty("--pan-y", y);
  canvasViewport.style.setProperty("--zoom", zoom);
  canvasViewport.style.setProperty("--screen-scale", 1 / Math.max(zoom, minZoom));
  canvasStage.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
  zoomLevel.textContent = formatZoomLabel(zoom);
  updateMinimap();
  syncChatGptHostSoon();
}

function normalizeZoom(value) {
  const zoom = Number(value);
  return clamp(Number.isFinite(zoom) && zoom > 0 ? zoom : 1, minZoom, maxZoom);
}

function formatZoomLabel(zoom) {
  const percent = zoom * 100;
  if (percent < 10) return `${percent.toFixed(1)}%`;
  if (percent >= 1000) return `${Math.round(percent / 100) / 10}k%`;
  return `${Math.round(percent)}%`;
}

function resetViewport() {
  canvasState.viewport = { x: 120, y: 90, zoom: 1 };
  applyViewport();
  saveCanvasState();
}

function renderCanvas() {
  syncNoteEditingWithSelection();
  canvasStage.replaceChildren();

  for (const node of canvasState.nodes) {
    canvasStage.append(createCanvasNode(node));
  }

  emptyState.hidden = canvasState.nodes.length > 0;
  updateCanvasMeta();
  updateSelectionToolbar();
  updateMinimap();
  syncChatGptHostSoon();
}

function updateNode(node) {
  const previous = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  if (previous) previous.replaceWith(createCanvasNode(node));
  syncChatGptHostSoon();
}

function createCanvasNode(node) {
  if (node.type === "note") return createNoteNode(node);
  if (node.type === "image") return createImageNode(node);
  if (node.type === "video") return createVideoNode(node);
  if (node.type === "video-task") return createVideoTaskNode(node);
  if (node.type === "chatgpt") return createChatGptNode(node);
  return createTaskNode(node);
}

function createChatGptNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const nativeHost = hasDesktopChatGptHost();
  node.width = clamp(Number(node.width) || defaultChatGptWidth, minChatGptWidth, maxChatGptWidth);
  node.height = clamp(Number(node.height) || defaultChatGptHeight, minChatGptHeight, maxChatGptHeight);

  const tile = document.createElement("article");
  tile.className = [
    "canvas-node",
    "chatgpt-node",
    selected ? "is-selected" : "",
    node.interactive ? "is-interactive" : ""
  ]
    .filter(Boolean)
    .join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${node.width}px`;
  tile.style.height = `${node.height}px`;
  tile.style.zIndex = node.z;

  const frameWrap = document.createElement("div");
  frameWrap.className = "chatgpt-frame-wrap";

  if (nativeHost) {
    frameWrap.append(createChatGptNativePlaceholder(selected));
  } else {
    frameWrap.append(createChatGptBrowserFallback(node));
  }

  const shield = document.createElement("div");
  shield.className = "chatgpt-frame-shield";
  shield.hidden = !nativeHost || (selected && node.interactive);
  shield.title = selected ? "双击进入 ChatGPT 交互" : "点击选中 ChatGPT 节点";
  shield.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    node.interactive = true;
    updateNode(node);
    saveCanvasState();
  });

  const hint = document.createElement("span");
  hint.textContent = selected ? "双击进入 ChatGPT" : "ChatGPT";
  shield.append(hint);

  frameWrap.append(shield);

  if (selected) {
    tile.append(createChatGptToolbar(node));
  }

  tile.append(frameWrap);

  if (selected) {
    tile.append(createChatGptResizeHandle(node));
  }

  tile.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
  return tile;
}

function createChatGptToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "chatgpt-toolbar";
  toolbar.addEventListener("pointerdown", (event) => event.stopPropagation());

  const moveHandle = document.createElement("button");
  moveHandle.type = "button";
  moveHandle.className = "chatgpt-move-handle";
  moveHandle.textContent = "拖动";
  moveHandle.title = "按住拖动 ChatGPT 节点";
  moveHandle.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    startNodeDrag(event, node.id, { force: true });
  });

  const interaction = document.createElement("button");
  interaction.type = "button";
  interaction.textContent = node.interactive ? "移动" : "交互";
  interaction.title = node.interactive ? "切回节点拖动模式" : "进入 ChatGPT 页面交互";
  interaction.addEventListener("click", () => {
    node.interactive = !node.interactive;
    updateNode(node);
    saveCanvasState();
  });

  const proxy = createChatGptProxyField(node);

  const open = document.createElement("button");
  open.type = "button";
  open.textContent = "打开官网";
  open.addEventListener("click", () => openChatGptExternal(node.url));

  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.textContent = "刷新";
  refresh.addEventListener("click", () => {
    node.reloadKey = Date.now();
    updateNode(node);
    window.ccCanvasDesktop?.reloadChatGpt?.();
  });

  const duplicate = document.createElement("button");
  duplicate.type = "button";
  duplicate.textContent = "复制";
  duplicate.addEventListener("click", () => duplicateNode(node.id));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => deleteNodes([node.id]));

  toolbar.append(moveHandle, interaction, proxy, open, refresh, duplicate, remove);
  return toolbar;
}

function createChatGptProxyField(node) {
  const input = document.createElement("input");
  input.className = "chatgpt-proxy-input";
  input.type = "text";
  input.value = node.proxy || "";
  input.placeholder = "代理 127.0.0.1:7890";
  input.title = "仅用于这个 ChatGPT 节点，例如 http://127.0.0.1:7890 或 socks5://127.0.0.1:7890；留空直连";
  input.spellcheck = false;
  input.addEventListener("pointerdown", (event) => event.stopPropagation());

  const commit = () => {
    const nextProxy = input.value.trim();
    if ((node.proxy || "") === nextProxy) return;
    node.proxy = nextProxy;
    node.reloadKey = Date.now();
    saveCanvasState();
    syncChatGptHostSoon();
  };

  input.addEventListener("change", commit);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      input.blur();
    }
    if (event.key === "Escape") {
      input.value = node.proxy || "";
      input.blur();
    }
  });

  return input;
}

function createChatGptResizeHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "chatgpt-resize-handle";
  handle.title = "拖动调整 ChatGPT 面板";
  handle.setAttribute("aria-label", "拖动调整 ChatGPT 面板");
  handle.addEventListener("pointerdown", (event) => startChatGptResize(event, node.id));
  return handle;
}

function startChatGptResize(event, nodeId) {
  event.preventDefault();
  event.stopPropagation();

  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "chatgpt") return;

  const start = {
    x: event.clientX,
    y: event.clientY,
    width: Number(node.width) || defaultChatGptWidth,
    height: Number(node.height) || defaultChatGptHeight
  };

  const move = (moveEvent) => {
    const dx = moveEvent.clientX - start.x;
    const dy = moveEvent.clientY - start.y;
    node.width = Math.round(clamp(start.width + dx, minChatGptWidth, maxChatGptWidth));
    node.height = Math.round(clamp(start.height + dy, minChatGptHeight, maxChatGptHeight));

    const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
    if (tile) {
      tile.style.width = `${node.width}px`;
      tile.style.height = `${node.height}px`;
    }
    updateMinimap();
    syncChatGptHostSoon();
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    updateNode(node);
    saveCanvasState();
    updateMinimap();
    syncChatGptHostSoon();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function normalizeChatGptUrl(value) {
  try {
    const parsed = new URL(String(value || chatGptUrl), chatGptUrl);
    if (parsed.protocol === "https:" && (parsed.hostname === "chatgpt.com" || parsed.hostname.endsWith(".chatgpt.com"))) {
      return parsed.href;
    }
  } catch {
    // Fall back to the official ChatGPT entrypoint.
  }
  return chatGptUrl;
}

function chatGptFrameSrc(node) {
  const src = normalizeChatGptUrl(node.url);
  if (!node.reloadKey) return src;
  try {
    const parsed = new URL(src);
    parsed.searchParams.set("cc_canvas_reload", node.reloadKey);
    return parsed.href;
  } catch {
    return src;
  }
}

function createChatGptNativePlaceholder(selected) {
  const panel = document.createElement("div");
  panel.className = "chatgpt-native-placeholder";

  const title = document.createElement("strong");
  title.textContent = selected ? "ChatGPT 桌面视图加载中" : "ChatGPT 桌面视图";

  const text = document.createElement("p");
  text.textContent = selected ? "如果没有显示，请稍等或点刷新。" : "选中节点后显示官网聊天页。";

  panel.append(title, text);
  return panel;
}

function createChatGptBrowserFallback(node) {
  const panel = document.createElement("div");
  panel.className = "chatgpt-browser-fallback";

  const title = document.createElement("strong");
  title.textContent = "普通浏览器不能内嵌 ChatGPT 官网";

  const text = document.createElement("p");
  text.textContent = "ChatGPT 官网禁止被 iframe 放进其他网页。要在画布内使用 Plus 登录态，请用桌面测试模式启动。";

  const actions = document.createElement("div");
  actions.className = "chatgpt-fallback-actions";

  const open = document.createElement("button");
  open.type = "button";
  open.textContent = "打开官网";
  open.addEventListener("click", () => openChatGptExternal(node.url));

  actions.append(open);
  panel.append(title, text, actions);
  return panel;
}

function hasDesktopChatGptHost() {
  return typeof window.ccCanvasDesktop?.showChatGpt === "function";
}

function openChatGptExternal(url) {
  const normalized = normalizeChatGptUrl(url);
  if (typeof window.ccCanvasDesktop?.openExternal === "function") {
    window.ccCanvasDesktop.openExternal(normalized);
    return;
  }
  window.open(normalized, "_blank", "noreferrer");
}

let chatGptHostSyncFrame = 0;

function syncChatGptHostSoon() {
  if (!hasDesktopChatGptHost()) return;
  if (chatGptHostSyncFrame) return;
  chatGptHostSyncFrame = window.requestAnimationFrame(() => {
    chatGptHostSyncFrame = 0;
    syncChatGptHostNow();
  });
}

function syncChatGptHostNow() {
  if (!hasDesktopChatGptHost()) return;
  if (suppressChatGptHost || settingsDialog.open || updateDialog?.open) {
    window.ccCanvasDesktop.hideChatGpt();
    return;
  }

  const node = canvasState.nodes.find((item) => item.type === "chatgpt" && selectedNodeIds.has(item.id));
  if (!node) {
    window.ccCanvasDesktop.hideChatGpt();
    return;
  }

  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  const frameWrap = tile?.querySelector(".chatgpt-frame-wrap");
  if (!frameWrap) {
    window.ccCanvasDesktop.hideChatGpt();
    return;
  }

  const rect = frameWrap.getBoundingClientRect();
  const viewportRect = canvasViewport.getBoundingClientRect();
  const left = Math.max(rect.left, viewportRect.left);
  const top = Math.max(rect.top, viewportRect.top);
  const right = Math.min(rect.right, viewportRect.right);
  const bottom = Math.min(rect.bottom, viewportRect.bottom);
  const width = right - left;
  const height = bottom - top;

  if (width < 80 || height < 80) {
    window.ccCanvasDesktop.hideChatGpt();
    return;
  }

  window.ccCanvasDesktop.showChatGpt({
    url: normalizeChatGptUrl(node.url),
    proxy: node.proxy || "",
    interactive: Boolean(node.interactive),
    bounds: { x: left, y: top, width, height }
  });
}

function createVideoNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const scale = Number(node.scale) || defaultVideoScale;
  const width = Math.max(1, Number(node.originalWidth) || defaultVideoWidth);
  const height = Math.max(1, Number(node.originalHeight) || defaultVideoHeight);

  const tile = document.createElement("article");
  tile.className = ["canvas-node", "video-node", selected ? "is-selected" : ""].filter(Boolean).join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${Math.round(width * scale)}px`;
  tile.style.height = `${Math.round(height * scale)}px`;
  tile.style.zIndex = node.z;

  const video = document.createElement("video");
  video.src = node.video?.url || "";
  video.controls = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.addEventListener("loadedmetadata", () => {
    if (!video.videoWidth || !video.videoHeight) return;
    if (node.originalWidth === video.videoWidth && node.originalHeight === video.videoHeight) return;
    node.originalWidth = video.videoWidth;
    node.originalHeight = video.videoHeight;
    tile.style.width = `${Math.round(node.originalWidth * (Number(node.scale) || defaultVideoScale))}px`;
    tile.style.height = `${Math.round(node.originalHeight * (Number(node.scale) || defaultVideoScale))}px`;
    saveCanvasState();
    updateMinimap();
  });

  tile.append(video);
  if (selected) {
    tile.append(createVideoToolbar(node), createVideoInfoPanel(node), createVideoResizeHandle(node));
  }

  tile.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
  return tile;
}

function createVideoToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "image-toolbar video-toolbar";

  const scaleInput = document.createElement("input");
  scaleInput.type = "number";
  scaleInput.min = "10";
  scaleInput.max = "400";
  scaleInput.step = "5";
  scaleInput.value = String(Math.round((Number(node.scale) || defaultVideoScale) * 100));
  scaleInput.title = "缩放百分比";
  scaleInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  scaleInput.addEventListener("input", () => {
    node.scale = clamp((Number(scaleInput.value) || 100) / 100, 0.1, 4);
    updateNode(node);
    updateSelectionToolbar();
    saveCanvasState();
    updateMinimap();
  });

  const open = document.createElement("a");
  open.href = node.video?.url || "#";
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = "打开";

  const download = document.createElement("a");
  download.href = node.video?.url || "#";
  download.download = node.video?.filename || "dreamina-video.mp4";
  download.textContent = "下载";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => deleteNodes([node.id]));

  toolbar.append(scaleInput, open, download, remove);
  return toolbar;
}

function createVideoInfoPanel(node) {
  const panel = document.createElement("div");
  panel.className = "image-prompt-panel video-info-panel";
  panel.addEventListener("pointerdown", (event) => event.stopPropagation());

  const text = document.createElement("p");
  text.className = "image-prompt-text";
  text.textContent = node.video?.prompt || "即梦视频";

  const meta = document.createElement("p");
  meta.className = "image-prompt-meta";
  meta.textContent = [node.video?.model, node.video?.size, node.video?.duration ? `${node.video.duration}s` : ""]
    .filter(Boolean)
    .join(" · ");

  panel.append(text, meta);
  return panel;
}

function createVideoResizeHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "image-resize-handle video-resize-handle";
  handle.title = "拖动缩放";
  handle.setAttribute("aria-label", "拖动缩放视频");
  handle.addEventListener("pointerdown", (event) => startVideoResize(event, node.id));
  return handle;
}

function startVideoResize(event, nodeId) {
  event.preventDefault();
  event.stopPropagation();

  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "video") return;

  const start = {
    x: event.clientX,
    y: event.clientY,
    scale: Number(node.scale) || defaultVideoScale,
    width: Math.max(1, Number(node.originalWidth) || defaultVideoWidth),
    height: Math.max(1, Number(node.originalHeight) || defaultVideoHeight),
    zoom: canvasState.viewport.zoom
  };

  const move = (moveEvent) => {
    const dx = (moveEvent.clientX - start.x) / start.zoom;
    const dy = (moveEvent.clientY - start.y) / start.zoom;
    const targetScale = Math.max(
      (start.width * start.scale + dx) / start.width,
      (start.height * start.scale + dy) / start.height
    );
    node.scale = clamp(targetScale, 0.1, 4);

    const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
    if (tile) {
      tile.style.width = `${Math.round(start.width * node.scale)}px`;
      tile.style.height = `${Math.round(start.height * node.scale)}px`;
    }
    updateMinimap();
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    updateNode(node);
    updateSelectionToolbar();
    saveCanvasState();
    updateMinimap();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function createImageNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const scale = Number(node.scale) || defaultImageScale;
  const width = Math.max(1, Number(node.originalWidth) || 512);
  const height = Math.max(1, Number(node.originalHeight) || 512);

  const tile = document.createElement("article");
  tile.className = ["canvas-node", "image-node", selected ? "is-selected" : ""].filter(Boolean).join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${Math.round(width * scale)}px`;
  tile.style.height = `${Math.round(height * scale)}px`;
  tile.style.zIndex = node.z;

  const img = document.createElement("img");
  img.alt = node.image?.prompt || "generated image";
  img.src = node.image?.url || "";
  img.draggable = false;
  img.addEventListener("load", () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    if (node.originalWidth === img.naturalWidth && node.originalHeight === img.naturalHeight) return;
    node.originalWidth = img.naturalWidth;
    node.originalHeight = img.naturalHeight;
    tile.style.width = `${Math.round(node.originalWidth * (Number(node.scale) || 1))}px`;
    tile.style.height = `${Math.round(node.originalHeight * (Number(node.scale) || 1))}px`;
    saveCanvasState();
    updateMinimap();
  });

  tile.append(img);

  if (selected) {
    tile.append(createImageToolbar(node), createImagePromptPanel(node), createImageResizeHandle(node));
  }

  tile.addEventListener("pointerdown", (event) => {
    if (referencePickTargetNodeId && event.button === 0 && !isInteractiveElement(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      useCanvasImagesAsReference(referencePickTargetNodeId, [node.id]);
      referencePickTargetNodeId = null;
      return;
    }
    startNodeDrag(event, node.id);
  });
  return tile;
}

function createImageToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "image-toolbar";

  const scaleInput = document.createElement("input");
  scaleInput.type = "number";
  scaleInput.min = "5";
  scaleInput.max = "400";
  scaleInput.step = "5";
  scaleInput.value = String(Math.round((Number(node.scale) || 1) * 100));
  scaleInput.title = "缩放百分比";
  scaleInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  scaleInput.addEventListener("input", () => {
    node.scale = clamp((Number(scaleInput.value) || 100) / 100, 0.05, 4);
    updateNode(node);
    updateSelectionToolbar();
    saveCanvasState();
    updateMinimap();
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "100%";
  reset.addEventListener("click", () => {
    node.scale = 1;
    updateNode(node);
    updateSelectionToolbar();
    saveCanvasState();
    updateMinimap();
  });

  const open = document.createElement("a");
  open.href = node.image?.url || "#";
  open.target = "_blank";
  open.rel = "noreferrer";
  open.textContent = "打开";

  const download = document.createElement("a");
  download.href = node.image?.url || "#";
  download.download = node.image?.filename || "generated-image";
  download.textContent = "下载";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    deleteNodes([node.id]);
  });

  toolbar.append(scaleInput, reset, open, download, remove);
  return toolbar;
}

function createImagePromptPanel(node) {
  const panel = document.createElement("div");
  panel.className = "image-prompt-panel";
  panel.addEventListener("pointerdown", (event) => event.stopPropagation());

  const prompt = getImagePrompt(node);
  const text = document.createElement("p");
  text.className = "image-prompt-text";
  text.textContent = prompt || "无提示词";

  const meta = document.createElement("p");
  meta.className = "image-prompt-meta";
  meta.textContent = [node.image?.model, node.image?.size, node.image?.format].filter(Boolean).join(" · ");

  const actions = document.createElement("div");
  actions.className = "image-prompt-actions";

  const reuse = document.createElement("button");
  reuse.type = "button";
  reuse.textContent = "复用提示词";
  reuse.disabled = !prompt;
  reuse.addEventListener("click", () => reusePromptFromImage(node.id));

  actions.append(reuse);
  panel.append(text, meta, actions);
  return panel;
}

function createImageResizeHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "image-resize-handle";
  handle.title = "拖动缩放";
  handle.setAttribute("aria-label", "拖动缩放图片");
  handle.addEventListener("pointerdown", (event) => startImageResize(event, node.id));
  return handle;
}

function startImageResize(event, nodeId) {
  event.preventDefault();
  event.stopPropagation();

  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "image") return;

  const start = {
    x: event.clientX,
    y: event.clientY,
    scale: Number(node.scale) || 1,
    width: Math.max(1, Number(node.originalWidth) || 512),
    height: Math.max(1, Number(node.originalHeight) || 512),
    zoom: canvasState.viewport.zoom
  };

  const move = (moveEvent) => {
    const dx = (moveEvent.clientX - start.x) / start.zoom;
    const dy = (moveEvent.clientY - start.y) / start.zoom;
    const targetScale = Math.max(
      (start.width * start.scale + dx) / start.width,
      (start.height * start.scale + dy) / start.height
    );
    node.scale = clamp(targetScale, 0.05, 4);

    const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
    if (tile) {
      tile.style.width = `${Math.round(start.width * node.scale)}px`;
      tile.style.height = `${Math.round(start.height * node.scale)}px`;
    }
    updateMinimap();
    syncChatGptHostSoon();
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    updateNode(node);
    updateSelectionToolbar();
    saveCanvasState();
    updateMinimap();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function createTaskNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const compact = false;

  const tile = document.createElement("article");
  tile.className = [
    "canvas-node",
    "task-node",
    `status-${node.status || "idle"}`,
    selected ? "is-selected" : "",
    compact ? "is-compact" : ""
  ]
    .filter(Boolean)
    .join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${node.width || defaultTaskWidth}px`;
  tile.style.zIndex = node.z;

  if (selected) {
    tile.append(createTaskHeader(node), createPromptField(node), createDebugPanel(node));
  }

  tile.append(createImageArea(node, selected));

  if (selected) {
    tile.append(createErrorLine(node));
  }

  tile.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
  return tile;
}

function createVideoTaskNode(node) {
  const selected = selectedNodeIds.has(node.id);

  const tile = document.createElement("article");
  tile.className = [
    "canvas-node",
    "task-node",
    "video-task-node",
    `status-${node.status || "idle"}`,
    selected ? "is-selected" : ""
  ]
    .filter(Boolean)
    .join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${node.width || defaultVideoTaskWidth}px`;
  tile.style.zIndex = node.z;

  if (selected) {
    tile.append(createVideoTaskHeader(node), createPromptField(node), createVideoTaskSettings(node), createVideoReferenceFields(node));
  }

  tile.append(createVideoTaskStatusArea(node));

  if (selected) {
    tile.append(createErrorLine(node));
  }

  tile.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
  return tile;
}

function createVideoTaskHeader(node) {
  const header = document.createElement("div");
  header.className = "task-header video-task-header";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = statusText(node.status);

  const title = document.createElement("strong");
  title.className = "video-task-title";
  title.textContent = "即梦视频";

  const meta = document.createElement("span");
  meta.className = "node-meta";
  meta.textContent = [videoModelLabel(node.model), node.size, `${node.n || dreaminaVideoDefaultDuration}s`, node.quality].filter(Boolean).join(" · ");

  header.append(status, title, meta, createTaskActions(node));
  return header;
}

function createVideoTaskSettings(node) {
  const settings = document.createElement("div");
  settings.className = "node-config-grid video-config-grid";
  settings.append(
    createSelectField("模型", node, "model", dreaminaVideoModelOptions, {
      onChange: (value) => {
        if (!String(value).includes("_vip") && node.quality === "1080p") node.quality = "720p";
        updateNode(node);
      }
    }),
    createSelectField("比例", node, "size", dreaminaVideoRatioOptions),
    createNumberField("时长（秒）", node, "n", { min: 4, max: 15, step: 1 }),
    createSelectField("清晰度", node, "quality", dreaminaVideoResolutionOptions)
  );

  const advanced = document.createElement("details");
  advanced.className = "node-advanced node-field-full";
  advanced.open = Boolean(node.debugOpen);
  advanced.addEventListener("toggle", () => {
    node.debugOpen = advanced.open;
    saveCanvasState();
  });
  const summary = document.createElement("summary");
  summary.textContent = "高级";
  const extraParams = document.createElement("textarea");
  extraParams.className = "node-extra-json";
  extraParams.rows = 3;
  extraParams.spellcheck = false;
  extraParams.value = node.extraParamsText ?? JSON.stringify(node.extraParams || {}, null, 2);
  extraParams.addEventListener("pointerdown", (event) => event.stopPropagation());
  extraParams.addEventListener("input", () => {
    node.extraParamsText = extraParams.value;
    saveCanvasState();
  });
  advanced.append(summary, createField("额外 JSON 参数", extraParams, "node-field-full"));
  settings.append(advanced);
  return settings;
}

function createVideoReferenceFields(node) {
  const panel = document.createElement("div");
  panel.className = "edit-assets video-reference-assets";

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/png,image/jpeg,image/webp";
  imageInput.multiple = true;
  imageInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  imageInput.addEventListener("change", () => {
    let files = Array.from(imageInput.files || []);
    const stored = fileStore.get(node.id) || {};
    const remaining = Math.max(0, 9 - (node.cachedImages?.length || 0) - (stored.images?.length || 0));
    if (files.length > remaining) showToast("即梦视频最多使用 9 张参考图片");
    files = files.slice(0, remaining);
    const nextFiles = [...(stored.images || []), ...files];
    fileStore.set(node.id, { ...stored, images: nextFiles });
    node.sessionFiles = [...(node.sessionFiles || []), ...files.map((file) => file.name)];
    node.cacheStatus = files.length ? "caching" : "pending";
    updateNode(node);
    saveCanvasState();
    if (files.length) cacheEditFiles(node.id);
  });

  const referenceActions = document.createElement("div");
  referenceActions.className = "reference-actions";

  const useSelected = document.createElement("button");
  useSelected.type = "button";
  useSelected.textContent = "使用选中图片";
  useSelected.addEventListener("click", () => useSelectedCanvasImagesAsReference(node.id));

  const pickFromCanvas = document.createElement("button");
  pickFromCanvas.type = "button";
  pickFromCanvas.textContent = referencePickTargetNodeId === node.id ? "点击画布图片" : "从画布选择";
  pickFromCanvas.addEventListener("click", () => {
    referencePickTargetNodeId = node.id;
    showToast("请点击画布中的图片作为视频参考图");
    updateNode(node);
  });

  referenceActions.append(useSelected, pickFromCanvas);
  panel.append(
    createField("参考图片（最多 9 张，可选）", imageInput, "node-field-full"),
    referenceActions,
    createVideoReferenceThumbnails(node),
    createVideoReferenceSummary(node)
  );
  return panel;
}

function createVideoReferenceThumbnails(node) {
  const strip = document.createElement("div");
  strip.className = "reference-thumbs";
  const images = node.cachedImages || [];
  if (!images.length) {
    strip.hidden = true;
    return strip;
  }

  for (const [index, image] of images.entries()) {
    const item = document.createElement("div");
    item.className = "reference-thumb";

    const preview = document.createElement("span");
    preview.className = "reference-thumb-preview";
    const img = document.createElement("img");
    img.src = image.url || `/${image.path}`;
    img.alt = image.originalName || image.filename || `参考图 ${index + 1}`;
    preview.append(img);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "reference-thumb-remove";
    remove.textContent = "×";
    remove.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      node.cachedImages = (node.cachedImages || []).filter((_, itemIndex) => itemIndex !== index);
      node.cacheStatus = node.cachedImages.length ? "ready" : "pending";
      updateNode(node);
      saveCanvasState();
    });

    item.append(preview, remove);
    strip.append(item);
  }
  return strip;
}

function createVideoReferenceSummary(node) {
  const summary = document.createElement("p");
  summary.className = "asset-summary";
  const cached = node.cachedImages?.length || 0;
  const session = (fileStore.get(node.id)?.images?.length || 0) + (node.sessionFiles?.length || 0);
  summary.textContent = cached || session ? `${cached} 张已缓存参考图，${session} 张待缓存/本次选择` : "未选择参考图时将使用文生视频。";
  return summary;
}

function createVideoTaskStatusArea(node) {
  const area = document.createElement("div");
  area.className = "node-image-area video-task-status-area";
  if (node.status === "running") {
    const loading = document.createElement("div");
    loading.className = "node-loading";
    const text = document.createElement("span");
    text.textContent = "即梦视频生成中";
    const progress = document.createElement("div");
    progress.className = "node-progress";
    progress.append(document.createElement("span"));
    loading.append(text, progress);
    area.append(loading);
    return area;
  }

  const placeholder = document.createElement("div");
  placeholder.className = "node-placeholder";
  placeholder.textContent = node.error || "待生成视频";
  area.append(placeholder);
  return area;
}

function videoModelLabel(model) {
  return dreaminaVideoModelOptions.find(([value]) => value === model)?.[1] || String(model || "").replace(/^dreamina-video-/u, "");
}

function createTaskHeader(node) {
  const header = document.createElement("div");
  header.className = "task-header";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = statusText(node.status);

  const modeTabs = document.createElement("div");
  modeTabs.className = "node-mode-tabs";
  modeTabs.append(createModeButton(node, "create", "创建"), createModeButton(node, "edit", "编辑"));

  const meta = document.createElement("span");
  meta.className = "node-meta";
  meta.textContent = [node.model, node.size, node.format, cacheStatusText(node)].filter(Boolean).join(" · ");

  header.append(status, modeTabs, meta, createTaskActions(node));
  return header;
}

function createPromptField(node) {
  const prompt = document.createElement("textarea");
  prompt.className = "node-prompt";
  prompt.rows = 4;
  prompt.value = node.prompt || "";
  prompt.placeholder = "输入这个节点的提示词";
  prompt.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    if (!selectedNodeIds.has(node.id)) {
      event.preventDefault();
      selectOnly(node.id, { focusSelector: ".node-prompt" });
    }
  });
  prompt.addEventListener("input", () => {
    node.prompt = prompt.value;
    saveCanvasState();
  });
  return prompt;
}

function createDebugPanel(node) {
  const debug = document.createElement("details");
  debug.className = "node-debug";
  debug.open = Boolean(node.debugOpen);
  debug.addEventListener("toggle", () => {
    node.debugOpen = debug.open;
    saveCanvasState();
  });

  const summary = document.createElement("summary");
  summary.textContent = "调试参数";

  const settings = document.createElement("div");
  settings.className = "node-config-grid";
  const modelField = createTaskModelField(node);
  if (isDreaminaModelName(node.model)) {
    settings.append(modelField, createSelectField("尺寸", node, "size", sizeOptionsForModel(node.model, node.mode)));
  } else {
    settings.append(
      modelField,
      createNumberField("数量", node, "n", { min: 1, max: 10 }),
      createSelectField("尺寸", node, "size", sizeOptionsForModel(node.model, node.mode)),
      createSelectField("质量", node, "quality", qualityOptions),
      createSelectField("格式", node, "format", formatOptions),
      createTextField("接口路径", node, "endpointPath")
    );
  }

  if (node.mode === "edit" && !isDreaminaModelName(node.model)) {
    settings.append(
      createSelectField("背景", node, "background", backgroundOptions),
      createSelectField("审核", node, "moderation", moderationOptions)
    );
  }

  const advanced = document.createElement("details");
  advanced.className = "node-advanced";
  const advancedSummary = document.createElement("summary");
  advancedSummary.textContent = "高级";
  const advancedGrid = document.createElement("div");
  advancedGrid.className = "node-config-grid";
  if (!isDreaminaModelName(node.model)) {
    advancedGrid.append(createTextField("Base URL", node, "baseUrl", "node-field-full"));
  }

  const extraParams = document.createElement("textarea");
  extraParams.className = "node-extra-json";
  extraParams.rows = 4;
  extraParams.spellcheck = false;
  extraParams.value = node.extraParamsText ?? JSON.stringify(node.extraParams || {}, null, 2);
  extraParams.addEventListener("pointerdown", (event) => event.stopPropagation());
  extraParams.addEventListener("input", () => {
    node.extraParamsText = extraParams.value;
    saveCanvasState();
  });
  advancedGrid.append(createField("额外 JSON 参数", extraParams, "node-field-full"));
  advanced.append(advancedSummary, advancedGrid);

  debug.append(summary);
  if (node.mode === "edit") debug.append(createEditAssetFields(node));
  debug.append(settings, advanced);
  return debug;
}

function createImageArea(node, selected) {
  const imageArea = document.createElement("div");
  imageArea.className = "node-image-area";

  if (node.status === "running") {
    const loading = document.createElement("div");
    loading.className = "node-loading";

    const text = document.createElement("span");
    text.textContent = isDreaminaModelName(node.model) ? "即梦生成中" : "生成中";

    const progress = document.createElement("div");
    progress.className = "node-progress";
    progress.append(document.createElement("span"));

    loading.append(text, progress);
    imageArea.append(loading);
    return imageArea;
  }

  if (node.images?.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "node-placeholder";
    placeholder.textContent = `${node.images.length} 张图片已放到画布`;
    imageArea.append(placeholder);
    return imageArea;
  }

  const placeholder = document.createElement("div");
  placeholder.className = "node-placeholder";
  placeholder.textContent = node.error || (node.mode === "edit" ? "等待参考图" : "待生成");
  imageArea.append(placeholder);
  return imageArea;
}

function createTaskActions(node) {
  const actions = document.createElement("div");
  actions.className = "node-actions";

  const generate = document.createElement("button");
  generate.type = "button";
  generate.textContent = node.status === "running" ? "生成中" : "生成";
  generate.disabled = node.status === "running";
  generate.addEventListener("click", () => generateNode(node.id));

  const duplicate = document.createElement("button");
  duplicate.type = "button";
  duplicate.textContent = "复制";
  duplicate.addEventListener("click", () => duplicateNode(node.id));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    deleteNodes([node.id]);
  });

  actions.append(generate, duplicate, remove);
  return actions;
}

function createErrorLine(node) {
  const error = document.createElement("p");
  error.className = "node-error";
  error.textContent = node.status === "error" ? node.error : "";
  return error;
}

function createModeButton(node, mode, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = node.mode === mode ? "active" : "";
  button.textContent = label;
  button.addEventListener("click", () => {
    if (node.mode === mode) return;
    node.mode = mode;
    node.endpointPath = defaultEndpointForMode(mode);
    applyTaskModelDefaults(node, { modeChanged: true });
    node.cacheStatus = mode === "edit" ? (node.cachedImages?.length ? "ready" : "pending") : "none";
    node.debugOpen = mode === "edit";
    updateNode(node);
    saveCanvasState();
    updateCanvasMeta();
  });
  return button;
}

function createEditAssetFields(node) {
  const panel = document.createElement("div");
  panel.className = "edit-assets";

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/png,image/jpeg,image/webp";
  imageInput.multiple = true;
  imageInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  imageInput.addEventListener("change", () => {
    let files = Array.from(imageInput.files || []);
    const stored = fileStore.get(node.id) || {};
    if (isDreaminaModelName(node.model)) {
      const remaining = Math.max(0, 10 - (node.cachedImages?.length || 0) - (stored.images?.length || 0));
      if (files.length > remaining) showToast("即梦图生图最多使用 10 张参考图片");
      files = files.slice(0, remaining);
    }
    const nextFiles = [...(stored.images || []), ...files];
    fileStore.set(node.id, { ...stored, images: nextFiles });
    node.sessionFiles = [...(node.sessionFiles || []), ...files.map((file) => file.name)];
    node.cacheStatus = files.length ? "caching" : "pending";
    updateNode(node);
    saveCanvasState();
    if (files.length) cacheEditFiles(node.id);
  });

  const maskInput = document.createElement("input");
  maskInput.type = "file";
  maskInput.accept = "image/png";
  maskInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  maskInput.addEventListener("change", () => {
    const stored = fileStore.get(node.id) || {};
    const mask = maskInput.files?.[0] || null;
    fileStore.set(node.id, { ...stored, mask });
    node.sessionMask = mask?.name || "";
    node.cachedMask = null;
    if (stored.images?.length) node.cacheStatus = "caching";
    updateNode(node);
    saveCanvasState();
    if (stored.images?.length) cacheEditFiles(node.id);
  });

  const summary = document.createElement("p");
  summary.className = "asset-summary";
  summary.textContent = assetSummaryText(node);

  const thumbnails = createReferenceThumbnails(node);

  const referenceActions = document.createElement("div");
  referenceActions.className = "reference-actions";

  const useSelected = document.createElement("button");
  useSelected.type = "button";
  useSelected.textContent = "使用选中图片";
  useSelected.addEventListener("click", () => useSelectedCanvasImagesAsReference(node.id));

  const pickFromCanvas = document.createElement("button");
  pickFromCanvas.type = "button";
  pickFromCanvas.textContent = referencePickTargetNodeId === node.id ? "点击画布图片" : "从画布选择";
  pickFromCanvas.addEventListener("click", () => {
    referencePickTargetNodeId = node.id;
    showToast("请点击画布中的图片作为参考图");
    updateNode(node);
  });

  referenceActions.append(useSelected, pickFromCanvas);

  panel.append(createField(isDreaminaModelName(node.model) ? "参考图片（最多 10 张）" : "参考图片", imageInput, "node-field-full"));
  if (!isDreaminaModelName(node.model)) {
    panel.append(createField("蒙版 PNG", maskInput, "node-field-full"));
  }
  panel.append(referenceActions, thumbnails, summary);

  return panel;
}

function createReferenceThumbnails(node) {
  const strip = document.createElement("div");
  strip.className = "reference-thumbs";

  const images = node.cachedImages || [];
  if (!images.length) {
    strip.hidden = true;
    return strip;
  }

  for (const [index, image] of images.entries()) {
    const item = document.createElement("div");
    item.className = "reference-thumb";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "reference-thumb-preview";
    button.title = "放大标注局部重绘区域";
    button.addEventListener("click", () => openReferenceMaskEditor(node.id, index));

    const img = document.createElement("img");
    img.src = image.url || `/${image.path}`;
    img.alt = image.originalName || image.filename || `参考图 ${index + 1}`;
    button.append(img);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "reference-thumb-remove";
    remove.textContent = "×";
    remove.title = "删除参考图";
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      removeReferenceImage(node.id, index);
    });

    item.append(button, remove);
    strip.append(item);
  }

  return strip;
}

function removeReferenceImage(nodeId, index) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "task") return;

  node.cachedImages = (node.cachedImages || []).filter((_, imageIndex) => imageIndex !== index);
  node.sessionFiles = (node.sessionFiles || []).filter((_, imageIndex) => imageIndex !== index);

  const stored = fileStore.get(node.id);
  if (stored?.images?.length) {
    const nextImages = stored.images.filter((_, imageIndex) => imageIndex !== index);
    fileStore.set(node.id, { ...stored, images: nextImages });
  }

  node.cacheStatus = node.cachedImages.length ? "ready" : "pending";
  updateNode(node);
  saveCanvasState();
}

function openReferenceMaskEditor(nodeId, imageIndex) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  const imageRef = node?.cachedImages?.[imageIndex];
  const imageUrl = imageRef?.url || (imageRef?.path ? `/${imageRef.path}` : "");
  if (!node || !imageUrl) {
    showToast("参考图还没有缓存完成");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "mask-editor-overlay";

  const editor = document.createElement("section");
  editor.className = "mask-editor";

  const toolbar = document.createElement("div");
  toolbar.className = "mask-editor-toolbar";

  const title = document.createElement("strong");
  title.textContent = "局部重绘标注";

  const brushLabel = document.createElement("label");
  brushLabel.textContent = "笔刷";
  const brush = document.createElement("input");
  brush.type = "range";
  brush.min = "8";
  brush.max = "160";
  brush.value = "48";
  brushLabel.append(brush);

  const clear = document.createElement("button");
  clear.type = "button";
  clear.textContent = "清空";

  const save = document.createElement("button");
  save.type = "button";
  save.textContent = "保存蒙版";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "关闭";

  toolbar.append(title, brushLabel, clear, save, close);

  const stage = document.createElement("div");
  stage.className = "mask-editor-stage";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = imageRef.originalName || imageRef.filename || "参考图";

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.className = "mask-editor-canvas";

  stage.append(image, overlayCanvas);
  editor.append(toolbar, stage);
  overlay.append(editor);
  document.body.append(overlay);

  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");
  const overlayContext = overlayCanvas.getContext("2d");
  let isDrawing = false;

  const closeEditor = () => overlay.remove();
  close.addEventListener("click", closeEditor);
  overlay.addEventListener("pointerdown", (event) => {
    if (event.target === overlay) closeEditor();
  });

  const resetMaskCanvas = () => {
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    maskContext.globalCompositeOperation = "source-over";
    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskContext.fillStyle = "#ffffff";
    maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };

  const initializeMaskEditor = () => {
    const naturalWidth = image.naturalWidth || 512;
    const naturalHeight = image.naturalHeight || 512;
    const maxWidth = Math.min(window.innerWidth - 80, 1100);
    const maxHeight = Math.min(window.innerHeight - 170, 760);
    const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
    const displayWidth = Math.max(1, Math.round(naturalWidth * scale));
    const displayHeight = Math.max(1, Math.round(naturalHeight * scale));

    stage.style.width = `${displayWidth}px`;
    stage.style.height = `${displayHeight}px`;
    image.style.width = `${displayWidth}px`;
    image.style.height = `${displayHeight}px`;
    overlayCanvas.width = naturalWidth;
    overlayCanvas.height = naturalHeight;
    overlayCanvas.style.width = `${displayWidth}px`;
    overlayCanvas.style.height = `${displayHeight}px`;
    maskCanvas.width = naturalWidth;
    maskCanvas.height = naturalHeight;
    resetMaskCanvas();
  };

  image.addEventListener("load", initializeMaskEditor);
  if (image.complete && image.naturalWidth) initializeMaskEditor();

  const pointFromEvent = (event) => {
    const rect = overlayCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * overlayCanvas.width,
      y: ((event.clientY - rect.top) / rect.height) * overlayCanvas.height
    };
  };

  const drawPoint = (event) => {
    const point = pointFromEvent(event);
    const radius = Number(brush.value) / 2;

    overlayContext.globalCompositeOperation = "source-over";
    overlayContext.fillStyle = "rgba(230, 64, 48, 0.42)";
    overlayContext.beginPath();
    overlayContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
    overlayContext.fill();

    maskContext.globalCompositeOperation = "destination-out";
    maskContext.beginPath();
    maskContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
    maskContext.fill();
  };

  overlayCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isDrawing = true;
    overlayCanvas.setPointerCapture?.(event.pointerId);
    drawPoint(event);
  });

  overlayCanvas.addEventListener("pointermove", (event) => {
    if (!isDrawing) return;
    drawPoint(event);
  });

  const stopDrawing = () => {
    isDrawing = false;
  };
  overlayCanvas.addEventListener("pointerup", stopDrawing);
  overlayCanvas.addEventListener("pointercancel", stopDrawing);
  clear.addEventListener("click", resetMaskCanvas);
  save.addEventListener("click", () => {
    maskCanvas.toBlob((blob) => {
      if (!blob) {
        showToast("蒙版生成失败");
        return;
      }

      const file = new File([blob], `mask-${Date.now()}.png`, { type: "image/png" });
      const stored = fileStore.get(node.id) || {};
      fileStore.set(node.id, { ...stored, mask: file });
      node.sessionMask = file.name;
      node.cachedMask = null;
      if (node.cachedImages?.length || stored.images?.length) node.cacheStatus = "caching";
      updateNode(node);
      saveCanvasState();
      cacheEditFiles(node.id);
      closeEditor();
      showToast("局部重绘蒙版已保存");
    }, "image/png");
  });
}

async function useSelectedCanvasImagesAsReference(targetNodeId) {
  const imageNodeIds = Array.from(selectedNodeIds).filter((id) => {
    const node = canvasState.nodes.find((item) => item.id === id);
    return node?.type === "image";
  });

  if (!imageNodeIds.length) {
    showToast("请先选中画布中的图片节点");
    return;
  }

  await useCanvasImagesAsReference(targetNodeId, imageNodeIds);
}

async function useCanvasImagesAsReference(targetNodeId, imageNodeIds) {
  const target = canvasState.nodes.find((node) => node.id === targetNodeId);
  const imageNodes = imageNodeIds
    .map((id) => canvasState.nodes.find((node) => node.id === id))
    .filter((node) => node?.type === "image" && node.image?.url);

  if (!target || !["task", "video-task"].includes(target.type)) return;
  if (!imageNodes.length) {
    showToast("没有可用的画布图片");
    return;
  }

  try {
    let files = await Promise.all(imageNodes.map(imageNodeToFile));
    const stored = fileStore.get(target.id) || {};
    if (target.type === "video-task") {
      const remaining = Math.max(0, 9 - (target.cachedImages?.length || 0) - (stored.images?.length || 0));
      if (!remaining) {
        showToast("即梦视频最多使用 9 张参考图片");
        return;
      }
      if (files.length > remaining) showToast("即梦视频最多使用 9 张参考图片，已自动截取");
      files = files.slice(0, remaining);
    }
    const nextFiles = [...(stored.images || []), ...files];
    fileStore.set(target.id, {
      ...stored,
      images: nextFiles
    });

    if (target.type === "task") {
      target.mode = "edit";
      target.endpointPath = defaultEndpointForMode("edit");
      applyTaskModelDefaults(target, { modeChanged: true });
    }
    target.sessionFiles = [...(target.sessionFiles || []), ...files.map((file) => file.name)];
    target.cacheStatus = "caching";
    target.debugOpen = true;
    selectedNodeIds.clear();
    selectedNodeIds.add(target.id);
    updateNode(target);
    saveCanvasState();

    await cacheEditFiles(target.id);
    renderCanvas();
    showToast(`${files.length} 张画布图片已设为${target.type === "video-task" ? "视频" : ""}参考图`);
  } catch (error) {
    showToast(error.message || "设置参考图失败");
  }
}

async function imageNodeToFile(node) {
  const response = await fetch(node.image.url);
  if (!response.ok) throw new Error("画布图片读取失败");

  const blob = await response.blob();
  const type = blob.type || contentTypeFromFormat(node.image.format);
  const filename = node.image.filename || `${node.id}.${extensionFromContentType(type)}`;
  return new File([blob], filename, { type });
}

function contentTypeFromFormat(format = "") {
  if (format === "jpeg" || format === "jpg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  if (format === "gif") return "image/gif";
  return "image/png";
}

function extensionFromContentType(contentType = "") {
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "png";
}

function createNoteNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const editing = selected && editingNoteId === node.id;
  const width = clamp(Number(node.width) || defaultNoteWidth, minNoteWidth, maxNoteWidth);
  const height = clamp(Number(node.height) || defaultNoteHeight, minNoteHeight, maxNoteHeight);
  const tile = document.createElement("article");
  tile.className = ["canvas-node", "note-node", selected ? "is-selected" : "", editing ? "is-editing" : ""]
    .filter(Boolean)
    .join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${width}px`;
  tile.style.setProperty("--note-min-height", `${height}px`);
  tile.style.zIndex = node.z;

  if (selected) {
    tile.append(createNoteToolbar(node));
  }

  tile.append(editing ? createNoteEditor(node) : createNoteDisplay(node));

  if (selected) {
    tile.append(createNoteResizeHandle(node));
  }

  tile.addEventListener("dblclick", (event) => {
    if (isInteractiveElement(event.target) && !event.target.classList?.contains("note-display")) return;
    event.preventDefault();
    event.stopPropagation();
    startNoteEdit(node.id);
  });
  tile.addEventListener("pointerdown", (event) => {
    if (event.detail > 1) return;
    startNodeDrag(event, node.id);
  });
  return tile;
}

function createLegacyNoteNode(node) {
  const selected = selectedNodeIds.has(node.id);
  const tile = document.createElement("article");
  tile.className = ["canvas-node", "note-node", selected ? "is-selected" : ""].filter(Boolean).join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${node.width || 300}px`;
  tile.style.zIndex = node.z;

  if (selected) {
    tile.append(createNoteToolbar(node));
  }

  const text = document.createElement("textarea");
  text.className = "note-text";
  text.value = node.text || "";
  text.placeholder = "输入文字";
  text.spellcheck = false;
  text.style.fontSize = `${node.fontSize || 22}px`;
  text.style.color = node.color || "#202124";
  text.addEventListener("pointerdown", (event) => {
    if (!selectedNodeIds.has(node.id)) {
      event.preventDefault();
      selectOnly(node.id, { focusSelector: ".note-text" });
      return;
    }
    event.stopPropagation();
  });
  text.addEventListener("focus", () => {
    if (!selectedNodeIds.has(node.id)) selectOnly(node.id);
  });
  text.addEventListener("input", () => {
    node.text = text.value;
    saveCanvasState();
  });

  tile.append(text);
  tile.addEventListener("pointerdown", (event) => startNodeDrag(event, node.id));
  return tile;
}

function createNoteDisplay(node) {
  const text = document.createElement("div");
  text.className = "note-text note-display";
  if (!node.text) text.classList.add("is-empty");
  text.textContent = node.text || "双击输入文字";
  text.tabIndex = 0;
  text.title = "双击编辑文字";
  text.style.fontSize = `${node.fontSize || 22}px`;
  text.style.color = node.color || "#202124";
  text.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !selectedNodeIds.has(node.id)) return;
    event.preventDefault();
    event.stopPropagation();
    startNoteEdit(node.id);
  });
  return text;
}

function createNoteEditor(node) {
  const text = document.createElement("textarea");
  text.className = "note-text note-editor";
  text.value = node.text || "";
  text.placeholder = "输入文字";
  text.spellcheck = false;
  text.style.fontSize = `${node.fontSize || 22}px`;
  text.style.color = node.color || "#202124";
  text.addEventListener("pointerdown", (event) => event.stopPropagation());
  text.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || ((event.ctrlKey || event.metaKey) && event.key === "Enter")) {
      event.preventDefault();
      finishNoteEdit(node.id);
    }
  });
  text.addEventListener("blur", () => finishNoteEdit(node.id));
  text.addEventListener("input", () => {
    node.text = text.value;
    autoResizeNoteEditor(text, node);
    saveCanvasState();
    updateMinimap();
  });
  window.requestAnimationFrame(() => {
    text.focus();
    autoResizeNoteEditor(text, node);
  });
  return text;
}

function startNoteEdit(nodeId) {
  const node = canvasState.nodes.find((item) => item.id === nodeId && item.type === "note");
  if (!node) return;

  editingNoteId = nodeId;
  selectOnly(nodeId, { focusSelector: ".note-editor" });
}

function finishNoteEdit(nodeId) {
  if (editingNoteId !== nodeId) return;

  editingNoteId = null;
  const node = canvasState.nodes.find((item) => item.id === nodeId && item.type === "note");
  if (node) {
    updateNode(node);
    saveCanvasState();
    updateMinimap();
  } else {
    renderCanvas();
  }
}

function syncNoteEditingWithSelection() {
  if (editingNoteId && !selectedNodeIds.has(editingNoteId)) {
    editingNoteId = null;
  }
}

function autoResizeNoteEditor(text, node) {
  const minHeight = clamp(Number(node.height) || defaultNoteHeight, minNoteHeight, maxNoteHeight);
  text.style.minHeight = `${minHeight}px`;
  text.style.height = "auto";
  const height = Math.max(minHeight, text.scrollHeight || minHeight);
  text.style.height = `${height}px`;
  if (height > (Number(node.height) || 0)) {
    node.height = Math.min(height, maxNoteHeight);
  }
}

function createNoteResizeHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "note-resize-handle";
  handle.title = "拖动调整文字框大小";
  handle.setAttribute("aria-label", "拖动调整文字框大小");
  handle.addEventListener("pointerdown", (event) => startNoteResize(event, node.id));
  return handle;
}

function startNoteResize(event, nodeId) {
  event.preventDefault();
  event.stopPropagation();

  const node = canvasState.nodes.find((item) => item.id === nodeId && item.type === "note");
  if (!node) return;

  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  const text = tile?.querySelector(".note-text");
  const start = {
    x: event.clientX,
    y: event.clientY,
    width: Number(node.width) || tile?.offsetWidth || defaultNoteWidth,
    height: Number(node.height) || text?.offsetHeight || defaultNoteHeight,
    fontSize: Number(node.fontSize) || 22,
    editing: editingNoteId === nodeId,
    zoom: canvasState.viewport.zoom
  };

  const move = (moveEvent) => {
    const dx = (moveEvent.clientX - start.x) / start.zoom;
    const dy = (moveEvent.clientY - start.y) / start.zoom;
    node.width = Math.round(clamp(start.width + dx, minNoteWidth, maxNoteWidth));
    node.height = Math.round(clamp(start.height + dy, minNoteHeight, maxNoteHeight));
    if (!start.editing) {
      const widthRatio = node.width / start.width;
      const heightRatio = node.height / start.height;
      const fontScale = Math.max(widthRatio, heightRatio);
      node.fontSize = Math.round(clamp(start.fontSize * fontScale, minNoteFontSize, maxNoteFontSize));
    }

    if (tile) {
      tile.style.width = `${node.width}px`;
      tile.style.setProperty("--note-min-height", `${node.height}px`);
    }
    if (text) {
      text.style.minHeight = `${node.height}px`;
      text.style.fontSize = `${node.fontSize || 22}px`;
      if (text instanceof HTMLTextAreaElement) autoResizeNoteEditor(text, node);
    }
    const sizeInput = tile?.querySelector(".note-toolbar input[type='number']");
    if (sizeInput && !start.editing) sizeInput.value = String(node.fontSize || 22);
    updateMinimap();
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    saveCanvasState();
    updateMinimap();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function applyNoteFontSize(node, value, options = {}) {
  const nextSize = Math.round(clamp(value, minNoteFontSize, maxNoteFontSize));
  node.fontSize = nextSize;

  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  tile?.querySelectorAll(".note-text").forEach((text) => {
    text.style.fontSize = `${nextSize}px`;
    if (text instanceof HTMLTextAreaElement) autoResizeNoteEditor(text, node);
  });

  if (options.syncInput) {
    const input = tile?.querySelector(".note-toolbar input[type='number']");
    if (input) input.value = String(nextSize);
  }

  saveCanvasState();
  updateMinimap();
}

function commitNoteFontSize(node, input) {
  const raw = String(input.value || "").trim();
  const fallback = Number(node.fontSize) || 22;
  const value = raw ? Number(raw) : fallback;
  const nextSize = Math.round(clamp(Number.isFinite(value) ? value : fallback, minNoteFontSize, maxNoteFontSize));
  input.value = String(nextSize);
  applyNoteFontSize(node, nextSize);
}

function createNoteToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "note-toolbar";

  const sizeInput = document.createElement("input");
  sizeInput.type = "number";
  sizeInput.min = String(minNoteFontSize);
  sizeInput.max = String(maxNoteFontSize);
  sizeInput.value = String(node.fontSize || 22);
  sizeInput.title = "字号";
  sizeInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  sizeInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    commitNoteFontSize(node, sizeInput);
  });
  sizeInput.addEventListener("input", () => {
    const value = Number(sizeInput.value);
    if (Number.isFinite(value) && value >= minNoteFontSize && value <= maxNoteFontSize) {
      applyNoteFontSize(node, value);
    }
  });
  sizeInput.addEventListener("blur", () => commitNoteFontSize(node, sizeInput));

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = node.color || "#202124";
  colorInput.title = "颜色";
  colorInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  colorInput.addEventListener("input", () => {
    node.color = colorInput.value;
    updateNode(node);
    saveCanvasState();
  });

  const duplicate = document.createElement("button");
  duplicate.type = "button";
  duplicate.textContent = "复制";
  duplicate.addEventListener("click", () => duplicateNode(node.id));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => {
    deleteNodes([node.id]);
  });

  toolbar.append(sizeInput, colorInput, duplicate, remove);
  return toolbar;
}

function createField(label, control, className = "") {
  const field = document.createElement("label");
  field.className = ["node-field", className].filter(Boolean).join(" ");

  const text = document.createElement("span");
  text.textContent = label;

  field.append(text, control);
  return field;
}

function createTaskModelField(node) {
  return createSelectField("模型", node, "model", taskModelOptions, {
    onChange: () => {
      applyTaskModelDefaults(node, { modelChanged: true });
      updateNode(node);
    }
  });
}

function createTextField(label, node, key, className = "") {
  const input = document.createElement("input");
  input.type = "text";
  if (key === "model") {
    input.setAttribute("list", "modelOptions");
  }
  input.value = node[key] || "";
  input.addEventListener("pointerdown", (event) => event.stopPropagation());
  input.addEventListener("input", () => {
    node[key] = input.value;
    saveCanvasState();
  });
  return createField(label, input, className);
}

function createNumberField(label, node, key, options = {}) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = options.min ?? 1;
  input.max = options.max ?? 10;
  if (options.step) input.step = options.step;
  input.value = node[key] || "1";
  input.addEventListener("pointerdown", (event) => event.stopPropagation());
  input.addEventListener("input", () => {
    node[key] = input.value || "1";
    saveCanvasState();
  });
  return createField(label, input);
}

function createSelectField(label, node, key, options, fieldOptions = {}) {
  const select = document.createElement("select");
  for (const [value, optionLabel] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = optionLabel;
    select.append(option);
  }
  select.value = node[key] ?? "";
  select.addEventListener("pointerdown", (event) => event.stopPropagation());
  select.addEventListener("change", () => {
    node[key] = select.value;
    fieldOptions.onChange?.(select.value, node);
    saveCanvasState();
    updateCanvasMeta();
  });
  return createField(label, select);
}

function createResultThumb(image, showActions) {
  const item = document.createElement("div");
  item.className = "node-thumb";

  const img = document.createElement("img");
  img.alt = image.prompt || "generated image";
  img.src = image.url;
  img.draggable = false;

  item.append(img);

  if (showActions) {
    const links = document.createElement("div");
    links.className = "thumb-actions";

    const open = document.createElement("a");
    open.href = image.url;
    open.target = "_blank";
    open.rel = "noreferrer";
    open.textContent = "打开";

    const download = document.createElement("a");
    download.href = image.url;
    download.download = image.filename || "generated-image";
    download.textContent = "下载";

    links.append(open, download);
    item.append(links);
  }

  return item;
}

function createContextMenu() {
  createMenu = document.createElement("div");
  createMenu.className = "create-menu";
  createMenu.hidden = true;
  createMenu.addEventListener("pointerdown", (event) => event.stopPropagation());

  const options = [
    ["生图节点", () => addTaskNode("create", pendingCreatePoint)],
    ["即梦视频", () => addDreaminaVideoNode(pendingCreatePoint)],
    ["ChatGPT 节点", () => addChatGptNode(pendingCreatePoint)],
    ["文字节点", () => addNoteNode(pendingCreatePoint)]
  ];

  for (const [label, action] of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      action();
      hideCreateMenu();
    });
    createMenu.append(button);
  }

  document.body.append(createMenu);
}

function showCreateMenu(clientX, clientY) {
  if (!createMenu) return;
  createMenu.hidden = false;
  createMenu.style.left = `${clientX}px`;
  createMenu.style.top = `${clientY}px`;
}

function hideCreateMenu() {
  if (createMenu) createMenu.hidden = true;
  pendingCreatePoint = null;
}

function statusText(status) {
  if (status === "running") return "运行中";
  if (status === "done") return "已完成";
  if (status === "error") return "失败";
  return "待生成";
}

function cacheStatusText(node) {
  if (node.mode !== "edit") return "";
  if (node.cacheStatus === "caching") return "素材缓存中";
  if (node.cachedImages?.length) return "素材已缓存";
  if (fileStore.has(node.id)) return "素材本次可用";
  return "缺少素材";
}

function assetSummaryText(node) {
  if (node.cacheStatus === "caching") return "素材缓存中";
  if (node.cachedImages?.length) {
    const mask = node.cachedMask ? "，含蒙版" : "";
    return `${node.cachedImages.length} 张参考图已缓存${mask}`;
  }
  if (node.sessionFiles?.length) {
    const mask = node.sessionMask ? `，蒙版：${node.sessionMask}` : "";
    return `${node.sessionFiles.join("、")}${mask}`;
  }
  return "请选择参考图片后再生成编辑节点";
}

function duplicateNode(nodeId) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node) return;

  const copy = {
    ...node,
    id: createId(),
    x: node.x + 36,
    y: node.y + 36,
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };

  if (node.type === "task" || node.type === "video-task") {
    copy.images = [];
    copy.videos = [];
    copy.status = "idle";
    copy.error = "";
    copy.durationMs = null;
    copy.sessionFiles = [...(node.sessionFiles || [])];
    copy.cachedImages = [...(node.cachedImages || [])];
    const storedFiles = fileStore.get(nodeId);
    if (storedFiles) fileStore.set(copy.id, storedFiles);
  }
  if (node.type === "chatgpt") {
    copy.interactive = false;
    delete copy.reloadKey;
  }

  canvasState.nodes.push(copy);
  selectOnly(copy.id, { revealControls: true });
  saveCanvasState();
}

function copySelectedNodesToClipboard() {
  const selected = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id));
  if (!selected.length) {
    showToast("没有可复制的节点");
    return;
  }

  nodeClipboard.nodes = selected.map((node) => clonePlainNode(node));
  nodeClipboard.bounds = computeNodesBounds(selected);
  nodeClipboard.pasteCount = 0;
  nodeClipboard.files = new Map();

  for (const node of selected) {
    const stored = fileStore.get(node.id);
    if (stored) {
      nodeClipboard.files.set(node.id, {
        images: [...(stored.images || [])],
        mask: stored.mask || null
      });
    }
  }

  showToast(`已复制 ${selected.length} 个节点`);
}

function pasteNodesFromClipboard() {
  if (!nodeClipboard.nodes.length) {
    showToast("剪贴板里没有节点");
    return;
  }

  const offset = 36 * (nodeClipboard.pasteCount + 1);
  const idMap = new Map();
  const now = new Date().toISOString();

  for (const source of nodeClipboard.nodes) {
    idMap.set(source.id, createId());
  }

  const pasted = nodeClipboard.nodes.map((source) => {
    const copy = preparePastedNode(source, idMap, offset, now);
    const stored = nodeClipboard.files.get(source.id);
    if (stored && (copy.type === "task" || copy.type === "video-task")) {
      fileStore.set(copy.id, {
        images: [...(stored.images || [])],
        mask: stored.mask || null
      });
    }
    return copy;
  });

  canvasState.nodes.push(...pasted);
  selectedNodeIds.clear();
  pasted.forEach((node) => selectedNodeIds.add(node.id));
  nodeClipboard.pasteCount += 1;
  renderCanvas();
  saveCanvasState();
  showToast(`已粘贴 ${pasted.length} 个节点`);
}

function clonePlainNode(node) {
  return JSON.parse(JSON.stringify(serializeNodeForClipboard(node)));
}

function clonePlainValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function serializeNodeForClipboard(node) {
  return {
    ...node,
    status: node.status === "running" ? "idle" : node.status
  };
}

function preparePastedNode(source, idMap, offset, createdAt) {
  const copy = {
    ...clonePlainNode(source),
    id: idMap.get(source.id) || createId(),
    x: Math.round((Number(source.x) || 0) + offset),
    y: Math.round((Number(source.y) || 0) + offset),
    z: ++canvasState.nextZ,
    createdAt
  };

  if (copy.sourceTaskId && idMap.has(copy.sourceTaskId)) {
    copy.sourceTaskId = idMap.get(copy.sourceTaskId);
  }

  if (copy.type === "task" || copy.type === "video-task") {
    copy.images = [];
    copy.videos = [];
    copy.status = "idle";
    copy.error = "";
    copy.durationMs = null;
    copy.debugOpen = Boolean(copy.debugOpen);
    copy.sessionFiles = [...(copy.sessionFiles || [])];
    copy.cachedImages = [...(copy.cachedImages || [])];
  }

  if (copy.type === "chatgpt") {
    copy.interactive = false;
    delete copy.reloadKey;
  }

  return copy;
}

function computeNodesBounds(nodes) {
  if (!nodes.length) return null;
  const rects = nodes.map(getNodeBounds);
  const minX = Math.min(...rects.map((rect) => rect.x));
  const minY = Math.min(...rects.map((rect) => rect.y));
  const maxX = Math.max(...rects.map((rect) => rect.x + rect.width));
  const maxY = Math.max(...rects.map((rect) => rect.y + rect.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function deleteSelectedNodes() {
  deleteNodes(Array.from(selectedNodeIds));
}

function deleteNodes(nodeIds) {
  const ids = new Set(nodeIds);
  if (!ids.size) return;

  const before = canvasState.nodes.length;
  canvasState.nodes = canvasState.nodes.filter((node) => !ids.has(node.id));
  if (canvasState.nodes.length === before) return;

  for (const id of ids) {
    selectedNodeIds.delete(id);
    fileStore.delete(id);
  }
  if (referencePickTargetNodeId && ids.has(referencePickTargetNodeId)) {
    referencePickTargetNodeId = null;
  }

  renderCanvas();
  saveCanvasState();
}

function startNodeDrag(event, nodeId, options = {}) {
  if (event.button !== 0 || (!options.force && event.target.closest("a, button, textarea, input, select, summary"))) return;

  event.preventDefault();
  event.stopPropagation();
  hideCreateMenu();

  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node) return;

  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    toggleSelection(nodeId);
    return;
  } else if (!selectedNodeIds.has(nodeId)) {
    selectOnly(nodeId, { revealControls: true });
  }

  if (!selectedNodeIds.has(nodeId)) return;

  const selectedNodes = canvasState.nodes.filter((item) => selectedNodeIds.has(item.id));
  for (const item of selectedNodes) {
    item.z = ++canvasState.nextZ;
  }
  renderCanvas();

  const dragElement = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === nodeId);
  dragElement?.setPointerCapture?.(event.pointerId);

  const start = {
    x: event.clientX,
    y: event.clientY,
    zoom: canvasState.viewport.zoom,
    nodes: selectedNodes.map((item) => ({ id: item.id, x: item.x, y: item.y }))
  };
  let isDragging = false;

  const move = (moveEvent) => {
    const dx = (moveEvent.clientX - start.x) / start.zoom;
    const dy = (moveEvent.clientY - start.y) / start.zoom;
    if (!isDragging && Math.hypot(moveEvent.clientX - start.x, moveEvent.clientY - start.y) < 4) return;
    isDragging = true;
    for (const item of start.nodes) {
      const target = canvasState.nodes.find((nodeItem) => nodeItem.id === item.id);
      const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === item.id);
      if (!target || !tile) continue;
      target.x = Math.round(item.x + dx);
      target.y = Math.round(item.y + dy);
      tile.style.left = `${target.x}px`;
      tile.style.top = `${target.y}px`;
    }
    updateMinimap();
  };

  const stop = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);
    dragElement?.releasePointerCapture?.(event.pointerId);
    if (isDragging) saveCanvasState();
    syncChatGptHostSoon();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function selectOnly(nodeId, options = {}) {
  selectedNodeIds.clear();
  selectedNodeIds.add(nodeId);

  renderCanvas();

  if (options.focusSelector) {
    window.requestAnimationFrame(() => {
      const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === nodeId);
      tile?.querySelector(options.focusSelector)?.focus();
    });
  }
}

function toggleSelection(nodeId) {
  if (selectedNodeIds.has(nodeId)) selectedNodeIds.delete(nodeId);
  else selectedNodeIds.add(nodeId);
  renderCanvas();
}

function clearSelection() {
  if (!selectedNodeIds.size) return;
  selectedNodeIds.clear();
  renderCanvas();
}

function selectNodesInRect(worldRect, additive = false) {
  if (!additive) selectedNodeIds.clear();

  for (const node of canvasState.nodes) {
    const bounds = getNodeBounds(node);
    if (rectsIntersect(worldRect, bounds)) selectedNodeIds.add(node.id);
  }

  renderCanvas();
}

function getNodeBounds(node) {
  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  const fixedChatGpt = node.type === "chatgpt" && selectedNodeIds.has(node.id);
  const fixedScale = fixedChatGpt ? 1 / Math.max(canvasState.viewport.zoom || 1, 0.001) : 1;
  const fallbackWidth =
    node.type === "image"
      ? Math.max(1, Number(node.originalWidth) || 512) * (Number(node.scale) || 1)
      : node.type === "video"
        ? Math.max(1, Number(node.originalWidth) || defaultVideoWidth) * (Number(node.scale) || defaultVideoScale)
      : node.type === "note"
        ? clamp(Number(node.width) || defaultNoteWidth, minNoteWidth, maxNoteWidth)
        : node.type === "chatgpt"
          ? clamp(Number(node.width) || defaultChatGptWidth, minChatGptWidth, maxChatGptWidth)
          : node.type === "video-task"
            ? node.width || defaultVideoTaskWidth
            : node.width || defaultTaskWidth;
  const fallbackHeight =
    node.type === "image"
      ? Math.max(1, Number(node.originalHeight) || 512) * (Number(node.scale) || 1)
      : node.type === "video"
        ? Math.max(1, Number(node.originalHeight) || defaultVideoHeight) * (Number(node.scale) || defaultVideoScale)
      : node.type === "note"
        ? clamp(Number(node.height) || defaultNoteHeight, minNoteHeight, maxNoteHeight)
        : node.type === "chatgpt"
          ? clamp(Number(node.height) || defaultChatGptHeight, minChatGptHeight, maxChatGptHeight)
          : node.type === "video-task"
            ? 340
            : 360;
  const width = (tile ? tile.offsetWidth : fallbackWidth) * fixedScale;
  const height = (tile ? tile.offsetHeight : fallbackHeight) * fixedScale;
  return { x: node.x, y: node.y, width, height };
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rectFromWorldPoints(a, b) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y)
  };
}

function clearCanvas() {
  canvasState.nodes = [];
  canvasState.nextZ = 1;
  selectedNodeIds.clear();
  referencePickTargetNodeId = null;
  rawResponse.textContent = "{}";
  renderCanvas();
  saveCanvasState();
}

function updateCanvasMeta() {
  const taskNodes = canvasState.nodes.filter((node) => node.type === "task");
  const videoTaskNodes = canvasState.nodes.filter((node) => node.type === "video-task");
  const imageNodes = canvasState.nodes.filter((node) => node.type === "image");
  const videoNodes = canvasState.nodes.filter((node) => node.type === "video");
  const noteNodes = canvasState.nodes.filter((node) => node.type === "note");
  const chatNodes = canvasState.nodes.filter((node) => node.type === "chatgpt");
  const running = [...taskNodes, ...videoTaskNodes].filter((node) => node.status === "running").length;
  if (running) {
    requestMeta.textContent = `${running} 个节点生成中`;
    return;
  }
  if (!canvasState.nodes.length) {
    requestMeta.textContent = "等待添加节点";
    return;
  }
  requestMeta.textContent = `${taskNodes.length} 个生图 · ${videoTaskNodes.length} 个视频任务 · ${imageNodes.length} 张图 · ${videoNodes.length} 个视频 · ${noteNodes.length} 个文字 · ${chatNodes.length} 个 ChatGPT`;
}

function isRunnableTask(node) {
  if (!["task", "video-task"].includes(node.type) || node.status === "running" || !node.prompt.trim()) return false;
  if (node.type === "video-task") return true;
  if (node.mode !== "edit") return true;
  return Boolean(fileStore.get(node.id)?.images?.length || node.cachedImages?.length);
}

function getViewportCenterWorld() {
  const rect = canvasViewport.getBoundingClientRect();
  return {
    x: (rect.width / 2 - canvasState.viewport.x) / canvasState.viewport.zoom,
    y: (rect.height / 2 - canvasState.viewport.y) / canvasState.viewport.zoom
  };
}

function getWorldPointFromClient(clientX, clientY) {
  const rect = canvasViewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left - canvasState.viewport.x) / canvasState.viewport.zoom,
    y: (clientY - rect.top - canvasState.viewport.y) / canvasState.viewport.zoom
  };
}

function migrateNode(node) {
  if (node.type === "note") {
    return {
      ...node,
      id: node.id || createId(),
      type: "note",
      text: node.text || "",
      fontSize: Number(node.fontSize) || 22,
      color: node.color || "#202124",
      width: clamp(Number(node.width) || defaultNoteWidth, minNoteWidth, maxNoteWidth),
      height: clamp(Number(node.height) || defaultNoteHeight, minNoteHeight, maxNoteHeight),
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 1,
      createdAt: node.createdAt || new Date().toISOString()
    };
  }

  if (node.type === "image") {
    const dimensions = parseImageDimensions(node.image, node.size);
    return {
      ...node,
      id: node.id || createId(),
      type: "image",
      image: node.image || {},
      sourceTaskId: node.sourceTaskId || "",
      sourceImageKey: node.sourceImageKey || getImageKey(node.image),
      originalWidth: Number(node.originalWidth) || dimensions.width || 512,
      originalHeight: Number(node.originalHeight) || dimensions.height || 512,
      scale: clamp(Number(node.scale) || defaultImageScale, 0.05, 4),
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 1,
      createdAt: node.createdAt || new Date().toISOString()
    };
  }

  if (node.type === "video") {
    return migrateVideoNode(node);
  }

  if (node.type === "chatgpt") {
    return {
      ...node,
      id: node.id || createId(),
      type: "chatgpt",
      url: normalizeChatGptUrl(node.url),
      proxy: String(node.proxy || ""),
      interactive: Boolean(node.interactive),
      width: clamp(Number(node.width) || defaultChatGptWidth, minChatGptWidth, maxChatGptWidth),
      height: clamp(Number(node.height) || defaultChatGptHeight, minChatGptHeight, maxChatGptHeight),
      x: node.x || 0,
      y: node.y || 0,
      z: node.z || 1,
      createdAt: node.createdAt || new Date().toISOString()
    };
  }

  if (node.type === "task") {
    return migrateTaskNode(node);
  }

  if (node.type === "video-task") {
    return migrateVideoTaskNode(node);
  }

  return migrateTaskNode({
    ...node,
    type: "task",
    provider: node.provider || providerForModel(node.model),
    prompt: node.prompt || "",
    images: node.url ? [normalizeNodeImage({ url: node.url, filename: node.filename }, node)] : [],
    status: node.url ? "done" : "idle"
  });
}

function migrateVideoNode(node) {
  const dimensions = parseVideoDimensions(node.video, node.size);
  return {
    ...node,
    id: node.id || createId(),
    type: "video",
    video: node.video || {},
    sourceTaskId: node.sourceTaskId || "",
    sourceVideoKey: node.sourceVideoKey || getVideoKey(node.video),
    originalWidth: Number(node.originalWidth) || dimensions.width || defaultVideoWidth,
    originalHeight: Number(node.originalHeight) || dimensions.height || defaultVideoHeight,
    scale: clamp(Number(node.scale) || defaultVideoScale, 0.1, 4),
    x: node.x || 0,
    y: node.y || 0,
    z: node.z || 1,
    createdAt: node.createdAt || new Date().toISOString()
  };
}

function migrateTaskNode(node) {
  const mode = node.mode === "edit" ? "edit" : "create";
  const extraParams = isPlainObject(node.extraParams) ? node.extraParams : {};
  const migrated = {
    ...node,
    id: node.id || createId(),
    type: "task",
    provider: node.provider || providerForModel(node.model),
    prompt: node.prompt || "",
    model: node.model || config.defaultModel || "gpt-image-2",
    n: String(node.n || "1"),
    size: node.size || "auto",
    quality: node.quality || "",
    format: node.format || "png",
    baseUrl: node.baseUrl || config.baseUrl || "https://yunwu.ai",
    endpointPath: node.endpointPath || defaultEndpointForMode(mode),
    mode,
    background: node.background || "",
    moderation: node.moderation || "",
    extraParams,
    extraParamsText: node.extraParamsText || JSON.stringify(extraParams, null, 2),
    cachedImages: node.cachedImages || [],
    cachedMask: node.cachedMask || null,
    cacheStatus: node.cacheStatus || (mode === "edit" ? "session-only" : "none"),
    sessionFiles: node.sessionFiles || [],
    sessionMask: node.sessionMask || "",
    images: dedupeNodeImages(node.images || []),
    status: node.status === "running" ? "idle" : node.status || "idle",
    error: node.error || "",
    durationMs: node.durationMs || null,
    debugOpen: Boolean(node.debugOpen),
    width: Math.max(Number(node.width) || defaultTaskWidth, 420),
    x: node.x || 0,
    y: node.y || 0,
    z: node.z || 1,
    createdAt: node.createdAt || new Date().toISOString()
  };
  applyTaskModelDefaults(migrated);
  return migrated;
}

function migrateVideoTaskNode(node) {
  const extraParams = isPlainObject(node.extraParams) ? node.extraParams : {};
  return {
    ...node,
    id: node.id || createId(),
    type: "video-task",
    provider: "dreamina",
    prompt: node.prompt || "",
    model: isDreaminaVideoModelName(node.model) ? node.model : dreaminaVideoDefaultModel,
    n: String(node.n || dreaminaVideoDefaultDuration),
    size: dreaminaVideoRatioOptions.some(([value]) => value === node.size) ? node.size : dreaminaVideoDefaultRatio,
    quality: dreaminaVideoResolutionOptions.some(([value]) => value === node.quality) ? node.quality : dreaminaVideoDefaultResolution,
    format: "mp4",
    baseUrl: "",
    endpointPath: "dreamina-video-cli",
    mode: "video",
    extraParams,
    extraParamsText: node.extraParamsText || JSON.stringify(extraParams, null, 2),
    cachedImages: node.cachedImages || [],
    cacheStatus: node.cacheStatus || "pending",
    sessionFiles: node.sessionFiles || [],
    videos: dedupeNodeVideos(node.videos || []),
    status: node.status === "running" ? "idle" : node.status || "idle",
    error: node.error || "",
    durationMs: node.durationMs || null,
    debugOpen: Boolean(node.debugOpen),
    width: Math.max(Number(node.width) || defaultVideoTaskWidth, 380),
    x: node.x || 0,
    y: node.y || 0,
    z: node.z || 1,
    createdAt: node.createdAt || new Date().toISOString()
  };
}

function providerForModel(model) {
  if (isDreaminaVideoModelName(model)) return "dreamina";
  if (isGrokModelName(model)) return "grok";
  if (isGrsaiModelName(model)) return "grsai";
  if (isDreaminaModelName(model)) return "dreamina";
  return "";
}

function materializeTaskImageNodes() {
  const imageKeys = new Set(
    canvasState.nodes
      .filter((node) => node.type === "image")
      .map((node) => node.sourceImageKey)
      .filter(Boolean)
  );

  const additions = [];
  for (const task of canvasState.nodes) {
    if (task.type !== "task" || !task.images?.length) continue;

    let cursorY = task.y;
    const x = task.x + (task.width || defaultTaskWidth) + 48;
    for (const image of task.images) {
      const key = getImageKey(image);
      if (key && imageKeys.has(key)) continue;

      const dimensions = parseImageDimensions(image, task.size);
      additions.push({
        id: createId(),
        type: "image",
        image,
        sourceTaskId: task.id,
        sourceImageKey: key,
        originalWidth: dimensions.width || 512,
        originalHeight: dimensions.height || 512,
        scale: defaultImageScale,
        x,
        y: cursorY,
        z: ++canvasState.nextZ,
        createdAt: new Date().toISOString()
      });

      imageKeys.add(key);
      cursorY += (dimensions.height || 512) * defaultImageScale + 32;
    }
  }

  if (additions.length) canvasState.nodes.push(...additions);
}

function materializeTaskVideoNodes() {
  const videoKeys = new Set(
    canvasState.nodes
      .filter((node) => node.type === "video")
      .map((node) => node.sourceVideoKey)
      .filter(Boolean)
  );

  const additions = [];
  for (const task of canvasState.nodes) {
    if (task.type !== "video-task" || !task.videos?.length) continue;

    let cursorY = task.y;
    const x = task.x + (task.width || defaultVideoTaskWidth) + 48;
    for (const video of task.videos) {
      const key = getVideoKey(video);
      if (key && videoKeys.has(key)) continue;

      const dimensions = parseVideoDimensions(video, task.size);
      additions.push({
        id: createId(),
        type: "video",
        video,
        sourceTaskId: task.id,
        sourceVideoKey: key,
        originalWidth: dimensions.width || defaultVideoWidth,
        originalHeight: dimensions.height || defaultVideoHeight,
        scale: defaultVideoScale,
        x,
        y: cursorY,
        z: ++canvasState.nextZ,
        createdAt: new Date().toISOString()
      });

      videoKeys.add(key);
      cursorY += (dimensions.height || defaultVideoHeight) * defaultVideoScale + 32;
    }
  }

  if (additions.length) canvasState.nodes.push(...additions);
}

function readLocalCanvasState() {
  try {
    const raw =
      localStorage.getItem(projectStorageKey(currentProjectId)) ||
      (currentProjectId === "default" ? localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey) : "") ||
      "{}";
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(projectStorageKey(currentProjectId));
    return null;
  }
}

async function refreshProjectList() {
  try {
    const response = await fetch("/api/projects");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "画布列表读取失败");
    projectList = Array.isArray(data.projects) ? data.projects : [];
  } catch {
    projectList = [];
  }
  renderProjectSelect();
}

function renderProjectSelect() {
  projectSelect.replaceChildren();
  const projects = projectList.length ? projectList : [{ id: currentProjectId, name: currentProjectName }];
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name || project.id;
    projectSelect.append(option);
  }
  projectSelect.value = currentProjectId;
}

async function loadProjectById(projectId, options = {}) {
  currentProjectId = normalizeProjectId(projectId);
  localStorage.setItem(currentProjectStorageKey, currentProjectId);
  fileStore.clear();

  const diskState = await loadDiskProjectState(currentProjectId);
  const localState = readLocalCanvasState();
  const state = diskState || localState || createEmptyProject(currentProjectId);
  currentProjectName = state.name || projectList.find((project) => project.id === currentProjectId)?.name || "未命名画布";
  projectNameInput.value = currentProjectName;
  applySavedState({ ...state, id: currentProjectId, name: currentProjectName });

  renderCanvas();
  applyViewport();
  primeUndoHistory();
  renderProjectSelect();

  if (options.initial && diskState) {
    localStorage.setItem(projectStorageKey(currentProjectId), JSON.stringify(serializeCanvasState()));
  } else if (options.initial && localState && (Array.isArray(localState.nodes) || localState.viewport)) {
    saveCanvasState({ history: false });
  }
}

async function switchProject(projectId) {
  if (!projectId || projectId === currentProjectId) return;
  saveCanvasState({ history: false });
  persistDiskProject(serializeCanvasState(), currentProjectId);
  selectedNodeIds.clear();
  referencePickTargetNodeId = null;
  fileStore.clear();
  await loadProjectById(projectId);
}

function createNewProject() {
  saveCanvasState({ history: false });
  persistDiskProject(serializeCanvasState(), currentProjectId);
  selectedNodeIds.clear();
  referencePickTargetNodeId = null;
  fileStore.clear();
  const now = new Date();
  currentProjectId = `canvas-${now.toISOString().replace(/[^0-9]/g, "").slice(0, 14)}-${Math.random().toString(16).slice(2, 6)}`;
  currentProjectName = `新画布 ${now.toLocaleString("zh-CN", { hour12: false })}`;
  canvasState = {
    nodes: [],
    viewport: { x: 120, y: 90, zoom: 1 },
    nextZ: 1
  };
  localStorage.setItem(currentProjectStorageKey, currentProjectId);
  projectNameInput.value = currentProjectName;
  rawResponse.textContent = "{}";
  renderCanvas();
  applyViewport();
  primeUndoHistory();
  saveCanvasState({ history: false });
  upsertProjectSummary({ id: currentProjectId, name: currentProjectName, savedAt: new Date().toISOString(), nodeCount: 0 });
  renderProjectSelect();
  showToast("已新建画布");
}

function renameCurrentProject(name) {
  currentProjectName = name.trim() || "未命名画布";
  projectNameInput.value = currentProjectName;
  saveCanvasState();
  upsertProjectSummary({
    id: currentProjectId,
    name: currentProjectName,
    savedAt: new Date().toISOString(),
    nodeCount: canvasState.nodes.length
  });
  renderProjectSelect();
}

function saveProjectNow() {
  currentProjectName = projectNameInput.value.trim() || currentProjectName || "未命名画布";
  projectNameInput.value = currentProjectName;
  saveCanvasState({ history: false });
  persistDiskProject(serializeCanvasState(), currentProjectId);
  showToast("画布已保存");
}

function upsertProjectSummary(project) {
  const index = projectList.findIndex((item) => item.id === project.id);
  if (index >= 0) projectList[index] = { ...projectList[index], ...project };
  else projectList.unshift(project);
}

function createEmptyProject(id) {
  return {
    version: 2,
    id,
    name: id === "default" ? "默认画布" : "未命名画布",
    nodes: [],
    viewport: { x: 120, y: 90, zoom: 1 },
    nextZ: 1
  };
}

async function loadDiskProjectState(projectId = currentProjectId) {
  try {
    const response = await fetch(`/api/project?projectId=${encodeURIComponent(projectId)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.project || null;
  } catch {
    return null;
  }
}

function projectStorageKey(projectId) {
  return `${storageKeyPrefix}:${normalizeProjectId(projectId)}`;
}

function normalizeProjectId(value) {
  const safe = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return safe || "default";
}

function applySavedState(saved, options = {}) {
  if (!saved || typeof saved !== "object") return;

  if (Array.isArray(saved.nodes)) canvasState.nodes = saved.nodes.map(migrateNode);
  if (options.materializeImages !== false) {
    materializeTaskImageNodes();
    materializeTaskVideoNodes();
  }
  if (saved.viewport) {
    canvasState.viewport = {
      x: Number(saved.viewport.x) || 120,
      y: Number(saved.viewport.y) || 90,
      zoom: normalizeZoom(saved.viewport.zoom)
    };
  }
  canvasState.nextZ = Math.max(1, Number(saved.nextZ) || 1, ...canvasState.nodes.map((node) => Number(node.z) || 1));
}

function undoCanvasChange() {
  if (!undoStack.length) {
    showToast("没有可撤销的操作");
    return;
  }

  const snapshot = undoStack.pop();
  let previous;
  try {
    previous = JSON.parse(snapshot);
  } catch {
    showToast("撤销历史已损坏");
    return;
  }

  isRestoringHistory = true;
  try {
    selectedNodeIds.clear();
    referencePickTargetNodeId = null;
    currentProjectName = previous.name || currentProjectName || "未命名画布";
    projectNameInput.value = currentProjectName;
    applySavedState(previous, { materializeImages: false });
    renderCanvas();
    applyViewport();
    rawResponse.textContent = "{}";
    lastHistorySnapshot = createHistorySnapshot();
    saveCanvasState({ history: false });
  } finally {
    isRestoringHistory = false;
  }
}

function primeUndoHistory() {
  undoStack.length = 0;
  lastHistorySnapshot = createHistorySnapshot();
}

function recordUndoPoint() {
  if (isLoadingProject || isRestoringHistory) return;

  const snapshot = createHistorySnapshot();
  if (!lastHistorySnapshot) {
    lastHistorySnapshot = snapshot;
    return;
  }
  if (snapshot === lastHistorySnapshot) return;

  undoStack.push(lastHistorySnapshot);
  if (undoStack.length > undoLimit) undoStack.shift();
  lastHistorySnapshot = snapshot;
}

function createHistorySnapshot() {
  return JSON.stringify({
    version: 2,
    id: currentProjectId,
    name: currentProjectName,
    nodes: serializeCanvasNodes(),
    viewport: { ...canvasState.viewport },
    nextZ: canvasState.nextZ
  });
}

function saveCanvasState(options = {}) {
  if (options.history !== false) recordUndoPoint();

  const project = serializeCanvasState();

  localStorage.setItem(projectStorageKey(currentProjectId), JSON.stringify(project));
  localStorage.setItem(currentProjectStorageKey, currentProjectId);
  scheduleDiskSave(project, currentProjectId);
}

function serializeCanvasState() {
  return {
    version: 2,
    id: currentProjectId,
    name: currentProjectName,
    savedAt: new Date().toISOString(),
    nodes: serializeCanvasNodes(),
    viewport: { ...canvasState.viewport },
    nextZ: canvasState.nextZ
  };
}

function serializeCanvasNodes() {
  return canvasState.nodes.map((node) => ({
    ...node,
    status: node.status === "running" ? "idle" : node.status
  }));
}

function scheduleDiskSave(project, projectId = currentProjectId) {
  if (isLoadingProject) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    persistDiskProject(project, projectId);
  }, 350);
}

async function persistDiskProject(project, projectId = currentProjectId) {
  try {
    const response = await fetch(`/api/project?projectId=${encodeURIComponent(projectId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project)
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.project) {
      upsertProjectSummary(data.project);
      renderProjectSelect();
    }
  } catch {
    // Browser localStorage remains as a fallback if the server is temporarily unavailable.
  }
}

function defaultEndpointForMode(mode) {
  return mode === "edit"
    ? config.editEndpoint || "/v1/images/edits"
    : config.imageEndpoint || "/v1/images/generations";
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isInteractiveElement(target) {
  return Boolean(target?.closest?.("a, button, textarea, input, select, summary, [contenteditable='true']"));
}

function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function showToast(message) {
  const previous = document.querySelector(".toast");
  if (previous) previous.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.append(toast);

  window.setTimeout(() => toast.remove(), 4600);
}
