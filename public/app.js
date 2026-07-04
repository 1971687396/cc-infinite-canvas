const storageKeyPrefix = "cc-infinite-canvas-project-v1";
const currentProjectStorageKey = "cc-infinite-canvas-current-project";
const storageKey = "yunwu-image-canvas-v2";
const legacyStorageKey = "yunwu-image-canvas-v1";
const assistantStorageKeyPrefix = "cc-canvas-assistant-chat-v1";
const assistantSkillLibraryStorageKey = "cc-canvas-assistant-skill-library-v1";
const assistantBuiltInSkillStateStorageKey = "cc-canvas-assistant-builtin-skill-state-v1";
const assistantSkillLibraryLimit = 40;
const assistantSkillRequestLimit = 8;
const assistantChatBackupDelayMs = 600;
const assistantPendingFileLimit = 5;
const themeStorageKey = "cc-canvas-theme";
const minZoom = 0.02;
const maxZoom = 24;
const defaultTaskWidth = 620;
const defaultVideoTaskWidth = 440;
const defaultImageScale = 0.5;
const imageDisplayLongSideByTier = {
  "1k": 360,
  "2k": 460,
  "4k": 560
};
const defaultImageDisplayLongSide = imageDisplayLongSideByTier["1k"];
const defaultVideoWidth = 480;
const defaultVideoHeight = 270;
const defaultVideoScale = 0.75;
const defaultNoteWidth = 300;
const defaultNoteHeight = 64;
const minNoteWidth = 96;
const minNoteHeight = 44;
const maxNoteWidth = 4096;
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
const defaultRegionWidth = 520;
const defaultRegionHeight = 320;
const minRegionWidth = 120;
const minRegionHeight = 80;
const maxRegionWidth = 6000;
const maxRegionHeight = 6000;

const addTaskButton = document.querySelector("#addTaskButton");
const addDreaminaVideoButton = document.querySelector("#addDreaminaVideoButton");
const addEditTaskButton = document.querySelector("#addEditTaskButton");
const addGrokTaskButton = document.querySelector("#addGrokTaskButton");
const addGrokEditTaskButton = document.querySelector("#addGrokEditTaskButton");
const clearCanvasButton = document.querySelector("#clearCanvasButton");
const generateAllButton = document.querySelector("#generateAllButton");
const addNoteButton = document.querySelector("#addNoteButton");
const addRegionButton = document.querySelector("#addRegionButton");
const addChatGptButton = document.querySelector("#addChatGptButton");
const assistantButton = document.querySelector("#assistantButton");
const themeToggleButton = document.querySelector("#themeToggleButton");
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
const settingsAssistantKey = document.querySelector("#settingsAssistantKey");
const settingsAssistantKeyLabel = document.querySelector("#settingsAssistantKeyLabel");
const settingsGrsaiApiKey = document.querySelector("#settingsGrsaiApiKey");
const settingsBaseUrl = document.querySelector("#settingsBaseUrl");
const settingsImageEndpoint = document.querySelector("#settingsImageEndpoint");
const settingsEditEndpoint = document.querySelector("#settingsEditEndpoint");
const settingsChatEndpoint = document.querySelector("#settingsChatEndpoint");
const settingsDefaultModel = document.querySelector("#settingsDefaultModel");
const settingsAssistantModel = document.querySelector("#settingsAssistantModel");
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
const assistantPanel = document.querySelector("#assistantPanel");
const assistantCloseButton = document.querySelector("#assistantCloseButton");
const assistantAnalyzeButton = document.querySelector("#assistantAnalyzeButton");
const assistantOrganizeButton = document.querySelector("#assistantOrganizeButton");
const assistantPlanButton = document.querySelector("#assistantPlanButton");
const assistantImportImagesButton = document.querySelector("#assistantImportImagesButton");
const assistantImportFilesButton = document.querySelector("#assistantImportFilesButton");
const assistantSkillMenuButton = document.querySelector("#assistantSkillMenuButton");
const assistantSkillMenuCount = document.querySelector("#assistantSkillMenuCount");
const assistantImportSkillButton = document.querySelector("#assistantImportSkillButton");
const assistantSkillLibraryEl = document.querySelector("#assistantSkillLibrary");
const assistantSkillSummary = document.querySelector("#assistantSkillSummary");
const assistantSkillCloseButton = document.querySelector("#assistantSkillCloseButton");
const assistantSkillSearchInput = document.querySelector("#assistantSkillSearchInput");
const assistantSkillList = document.querySelector("#assistantSkillList");
const assistantSkillInput = document.querySelector("#assistantSkillInput");
const assistantFileInput = document.querySelector("#assistantFileInput");
const assistantClearButton = document.querySelector("#assistantClearButton");
const assistantMessagesEl = document.querySelector("#assistantMessages");
const assistantPendingAttachmentsEl = document.querySelector("#assistantPendingAttachments");
const assistantForm = document.querySelector("#assistantForm");
const assistantModelSelect = document.querySelector("#assistantModelSelect");
const assistantModelIcon = document.querySelector("#assistantModelIcon");
const assistantInput = document.querySelector("#assistantInput");
const assistantSendButton = document.querySelector("#assistantSendButton");
const assistantStopButton = document.querySelector("#assistantStopButton");

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

const grokImagineModel = "grok-imagine-image";
const legacyGrokImagineModel = "grok-image-image";
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
const assistantDefaultModel = "gpt-5.5";
const assistantPendingImageLimit = 8;
const assistantModelOptions = [
  [assistantDefaultModel, assistantDefaultModel],
  ["gemini-3.5-flash", "gemini-3.5-flash"],
  ["claude-opus-4-8", "claude-opus-4-8"],
  ["doubao-seed-2-1-turbo-260628", "doubao-seed-2-1-turbo-260628"],
  ["grok-4.3", "grok-4.3"],
  ["deepseek-v4-pro", "deepseek-v4-pro"]
];
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
const grokModelOptions = [
  ["grok-3-image", "grok-3-image"],
  [grokImagineModel, grokImagineModel]
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
let referenceConnectState = null;
let editingNoteId = null;
let latestUpdateInfo = null;
let suppressChatGptHost = false;
let lastHistorySnapshot = "";
let currentProjectId = "default";
let currentProjectName = "未命名画布";
let projectList = [];
let dreaminaStatus = { installed: false, loggedIn: false };
let assistantMessages = [];
let assistantSkills = [];
let assistantBuiltInSkills = [];
let assistantBuiltInSkillStates = {};
let assistantPendingImages = [];
let assistantPendingFiles = [];
let assistantBusy = false;
let assistantAbortController = null;
let assistantSkillSearchQuery = "";
let assistantChatBackupTimer = 0;
let assistantCopyMenu = null;
let assistantCopyText = "";
let lastCanvasPointer = null;
let canvasState = {
  nodes: [],
  viewport: { x: 120, y: 90, zoom: 1 },
  nextZ: 1
};

init();

async function init() {
  applyTheme(readThemePreference(), { persist: false });
  createContextMenu();
  bindCanvasEvents();
  bindMinimapEvents();
  loadAssistantSkillLibrary();
  loadAssistantBuiltInSkillStates();
  renderAssistantSkillLibrary();

  try {
    await refreshRuntimeConfig();
  } catch (error) {
    showToast(error.message || "配置读取失败");
  }
  await loadAssistantBuiltInSkills();

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
addRegionButton?.addEventListener("click", () => addRegionNode());
addChatGptButton?.addEventListener("click", addChatGptNode);
assistantButton?.addEventListener("click", openAssistantPanel);
themeToggleButton?.addEventListener("click", toggleTheme);
assistantCloseButton?.addEventListener("click", closeAssistantPanel);
assistantAnalyzeButton?.addEventListener("click", () =>
  sendAssistantQuickMessage("请分析我当前选中的节点，给出作图建议、提示词优化方向和下一步可以做的实验。")
);
assistantOrganizeButton?.addEventListener("click", () =>
  sendAssistantQuickMessage("请根据当前画布和选中内容，给出整理排版方案，按步骤说明。")
);
assistantPlanButton?.addEventListener("click", () =>
  sendAssistantPlanPrompt("请根据当前画布和选中内容，生成一个可执行的画布操作计划，用于整理排版、创建必要的提示词节点或补充生图节点。")
);
assistantImportImagesButton?.addEventListener("click", importSelectedImagesToAssistant);
assistantImportFilesButton?.addEventListener("click", () => assistantFileInput?.click());
assistantSkillMenuButton?.addEventListener("click", toggleAssistantSkillLibrary);
assistantImportSkillButton?.addEventListener("click", () => assistantSkillInput?.click());
assistantSkillInput?.addEventListener("change", importLocalSkillToAssistant);
assistantFileInput?.addEventListener("change", importLocalFilesToAssistant);
assistantSkillCloseButton?.addEventListener("click", closeAssistantSkillLibrary);
assistantSkillSearchInput?.addEventListener("input", () => {
  assistantSkillSearchQuery = assistantSkillSearchInput.value.trim().toLowerCase();
  renderAssistantSkillLibrary();
});
assistantSkillList?.addEventListener("change", handleAssistantSkillListChange);
assistantSkillList?.addEventListener("click", handleAssistantSkillListClick);
assistantPendingAttachmentsEl?.addEventListener("click", handleAssistantPendingAttachmentClick);
assistantClearButton?.addEventListener("click", clearAssistantChat);
assistantForm?.addEventListener("submit", sendAssistantMessage);
assistantStopButton?.addEventListener("click", stopAssistantResponse);
assistantMessagesEl?.addEventListener("click", handleAssistantMessageClick);
assistantMessagesEl?.addEventListener("contextmenu", handleAssistantMessageContextMenu);
assistantModelSelect?.addEventListener("change", () => updateAssistantModelSelection(assistantModelSelect.value));
settingsAssistantModel?.addEventListener("change", () => {
  settingsAssistantKey.value = "";
  updateSettingsAssistantKeyState(settingsAssistantModel.value);
});
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
  renderAssistantModelSelectors();
  return config;
}

function readThemePreference() {
  try {
    return localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
}

function applyTheme(theme, options = {}) {
  const normalized = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalized;
  document.documentElement.style.colorScheme = normalized;
  if (themeToggleButton) {
    const targetLabel = normalized === "dark" ? "浅色" : "深色";
    const label = themeToggleButton.querySelector(".rail-label");
    if (label) label.textContent = targetLabel;
    else themeToggleButton.textContent = targetLabel;
    themeToggleButton.title = normalized === "dark" ? "切换到浅色模式" : "切换到深色模式";
    themeToggleButton.setAttribute("aria-label", themeToggleButton.title);
    themeToggleButton.dataset.themeTarget = normalized === "dark" ? "light" : "dark";
  }
  if (options.persist !== false) {
    try {
      localStorage.setItem(themeStorageKey, normalized);
    } catch {
      // The visual theme can still apply when localStorage is unavailable.
    }
  }
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
}

function currentCanvasTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function defaultNoteColorForTheme(theme = currentCanvasTheme()) {
  return theme === "dark" ? "#f8fafc" : "#202124";
}

function noteDisplayColor(node) {
  return normalizeAssistantColor(node?.color, defaultNoteColorForTheme());
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
selectionScaleInput.addEventListener("blur", commitSelectionScaleInput);

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
  node.model = normalizeGrokModelName(node.model || config.defaultModel || "gpt-image-2");
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
  return normalizeGrokModelName(model).toLowerCase().startsWith("grok-");
}

function normalizeGrokModelName(model) {
  const value = String(model || "").trim();
  if (value.toLowerCase() === legacyGrokImagineModel) return grokImagineModel;
  return value;
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
    referenceImageNodeIds: [],
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
    referenceImageNodeIds: [],
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
    color: defaultNoteColorForTheme(),
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

function addRegionNode(point = null) {
  const center = point || getViewportCenterWorld();
  const offset = point ? 0 : canvasState.nodes.length % 8;
  const node = {
    id: createId(),
    type: "region",
    title: "区域规划",
    color: "#2f8f8a",
    locked: false,
    width: defaultRegionWidth,
    height: defaultRegionHeight,
    x: Math.round(center.x - defaultRegionWidth / 2 + offset * 28),
    y: Math.round(center.y - defaultRegionHeight / 2 + offset * 28),
    z: 0,
    createdAt: new Date().toISOString()
  };

  canvasState.nodes.push(node);
  selectOnly(node.id);
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
    referenceImageNodeIds: dedupeStrings(node.referenceImageNodeIds || []),
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
    const scale = defaultScaleForImageDimensions(dimensions.width || 512, dimensions.height || 512, image?.size || taskNode.size);
    const node = {
      id: createId(),
      type: "image",
      image,
      sourceTaskId: taskNode.id,
      sourceImageKey: key,
      originalWidth: dimensions.width || 512,
      originalHeight: dimensions.height || 512,
      scale,
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
  const text = String(size || "").trim();
  const match = text.match(/(\d{2,5})\s*x\s*(\d{2,5})/i);
  if (match) {
    return {
      width: Number(match[1]) || 512,
      height: Number(match[2]) || 512
    };
  }

  const ratioMatch = text.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?).*?([124])\s*k/i);
  if (ratioMatch) {
    const ratioW = Number(ratioMatch[1]) || 1;
    const ratioH = Number(ratioMatch[2]) || 1;
    const tier = `${ratioMatch[3]}k`;
    const longSide = tier === "4k" ? 3840 : tier === "2k" ? 2048 : 1280;
    if (ratioW >= ratioH) {
      return {
        width: longSide,
        height: Math.round((longSide * ratioH) / ratioW)
      };
    }
    return {
      width: Math.round((longSide * ratioW) / ratioH),
      height: longSide
    };
  }

  if (/4\s*k/i.test(text)) return { width: 3840, height: 2160 };
  if (/2\s*k/i.test(text)) return { width: 2048, height: 1152 };
  if (/1\s*k/i.test(text)) return { width: 1280, height: 720 };
  return {
    width: 512,
    height: 512
  };
}

function parseImageDimensions(image, fallbackSize) {
  const width = Number(image?.width);
  const height = Number(image?.height);
  if (width > 0 && height > 0) return { width, height };
  return parseImageSize(image?.size || fallbackSize);
}

function imageDisplayTierFromSize(size) {
  const text = String(size || "").toLowerCase();
  const tierMatch = text.match(/(?:^|[^0-9])([124])\s*k(?:$|[^a-z0-9])/i);
  if (tierMatch) return `${tierMatch[1].toLowerCase()}k`;

  const dimensions = text.match(/(\d{2,5})\s*x\s*(\d{2,5})/i);
  if (!dimensions) return "";
  const longSide = Math.max(Number(dimensions[1]) || 0, Number(dimensions[2]) || 0);
  if (longSide >= 2800) return "4k";
  if (longSide >= 1700) return "2k";
  if (longSide >= 600) return "1k";
  return "";
}

function targetImageDisplayLongSide(size, width, height) {
  const tier = imageDisplayTierFromSize(size);
  if (tier && imageDisplayLongSideByTier[tier]) return imageDisplayLongSideByTier[tier];

  const longSide = Math.max(Number(width) || 0, Number(height) || 0);
  if (longSide >= 2800) return imageDisplayLongSideByTier["4k"];
  if (longSide >= 1700) return imageDisplayLongSideByTier["2k"];
  return defaultImageDisplayLongSide;
}

function defaultScaleForImageDimensions(width, height, size = "") {
  const longSide = Math.max(1, Number(width) || 512, Number(height) || 512);
  return clamp(targetImageDisplayLongSide(size, width, height) / longSide, 0.05, 1);
}

function defaultScaleForImageNode(node, dimensions = {}) {
  const width = Number(dimensions.width) || Number(node?.originalWidth) || 512;
  const height = Number(dimensions.height) || Number(node?.originalHeight) || 512;
  const size = node?.image?.size || node?.size || "";
  return defaultScaleForImageDimensions(width, height, size);
}

function resolvedImageNodeScale(node, dimensions = {}) {
  const currentScale = Number(node?.scale);
  const normalizedScale = defaultScaleForImageNode(node, dimensions);
  if (Number.isFinite(currentScale) && currentScale > 0) {
    const isLegacyDefault = Math.abs(currentScale - defaultImageScale) < 0.0001;
    return clamp(isLegacyDefault ? normalizedScale : currentScale, 0.05, 4);
  }
  return normalizedScale;
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
  const imageSourceNodeIds = (storedFiles.images || []).map((file) => file.sourceImageNodeId || "");

  try {
    const response = await fetch("/api/cache-assets", {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "素材缓存失败");

    const assets = data.assets || [];
    const imageAssets = assets.filter((asset) => asset.field === "image");
    imageAssets.forEach((asset, index) => {
      const sourceImageNodeId = imageSourceNodeIds[index];
      if (sourceImageNodeId) asset.sourceImageNodeId = sourceImageNodeId;
    });
    if (imageAssets.length) node.cachedImages = dedupeAssetRefs([...(node.cachedImages || []), ...imageAssets]);
    const maskAsset = assets.find((asset) => asset.field === "mask");
    node.cachedMask = maskAsset || node.cachedMask || null;
    node.cacheStatus = node.cachedImages.length ? "ready" : "session-only";

    const nextStored = { ...storedFiles };
    if (imageAssets.length) delete nextStored.images;
    if (maskAsset) delete nextStored.mask;
    if (imageAssets.length && !nextStored.images?.length) node.sessionFiles = [];
    else if (imageAssets.length && node.sessionFiles?.length) node.sessionFiles = node.sessionFiles.slice(imageAssets.length);
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

function renderAssistantModelSelectors(value = config.assistantModel || assistantDefaultModel) {
  const model = String(value || assistantDefaultModel).trim() || assistantDefaultModel;
  fillAssistantModelSelect(assistantModelSelect, model);
  fillAssistantModelSelect(settingsAssistantModel, model);
}

function fillAssistantModelSelect(select, value) {
  if (!select) return;
  const selected = String(value || assistantDefaultModel).trim() || assistantDefaultModel;
  const options = [...assistantModelOptions];
  if (!options.some(([model]) => model === selected)) {
    options.push([selected, `${selected}（当前）`]);
  }

  select.replaceChildren();
  for (const [model, label] of options) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = label;
    select.append(option);
  }
  select.value = selected;
  if (select === assistantModelSelect) updateAssistantModelIcon(selected);
  if (select === settingsAssistantModel) updateSettingsAssistantKeyState(selected);
}

function settingsAssistantKeyModel(model = settingsAssistantModel?.value || config.assistantModel || assistantDefaultModel) {
  return String(model || assistantDefaultModel).trim() || assistantDefaultModel;
}

function updateSettingsAssistantKeyState(model = settingsAssistantKeyModel()) {
  if (!settingsAssistantKey) return;
  const keyModel = settingsAssistantKeyModel(model);
  if (settingsAssistantKeyLabel) settingsAssistantKeyLabel.textContent = `${keyModel} 助手专用 Key`;
  settingsAssistantKey.placeholder = config.modelKeys?.[keyModel.toLowerCase()]
    ? "已配置，留空不修改"
    : "留空则使用平台总 Key";
}

function updateAssistantModelIcon(model) {
  if (!assistantModelIcon) return;
  assistantModelIcon.innerHTML = assistantModelIconSvg(model);
  assistantModelIcon.dataset.provider = assistantModelProvider(model);
}

function assistantModelProvider(model) {
  const normalized = String(model || "").toLowerCase();
  if (normalized.includes("claude")) return "claude";
  if (normalized.includes("gemini")) return "gemini";
  if (normalized.includes("doubao")) return "doubao";
  if (normalized.includes("grok")) return "grok";
  if (normalized.includes("deepseek")) return "deepseek";
  return "openai";
}

function assistantModelIconSvg(model) {
  const provider = assistantModelProvider(model);
  if (provider === "claude") {
    return '<svg viewBox="0 0 24 24"><path d="M12 3.5 15.6 10l6.4 2-6.4 2L12 20.5 8.4 14 2 12l6.4-2L12 3.5Z"/></svg>';
  }
  if (provider === "gemini") {
    return '<svg viewBox="0 0 24 24"><path d="M12 3c1.2 4.1 3.9 6.8 8 8-4.1 1.2-6.8 3.9-8 8-1.2-4.1-3.9-6.8-8-8 4.1-1.2 6.8-3.9 8-8Z"/></svg>';
  }
  if (provider === "doubao") {
    return '<svg viewBox="0 0 24 24"><path d="M6 7.5 12 4l6 3.5v7L12 18l-6-3.5v-7Z"/><path d="M9 9.5h6M9 12.5h4.5"/></svg>';
  }
  if (provider === "grok") {
    return '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5 5 19"/><path d="M8 5h11v11"/></svg>';
  }
  if (provider === "deepseek") {
    return '<svg viewBox="0 0 24 24"><path d="M5 13c0-4.4 3.4-8 7.7-8 3.3 0 6.3 2.2 7.1 5.4.9 3.6-1.5 7.1-5.1 7.8-2.9.6-5.9-.8-7.3-3.4"/><path d="M4 13c2.6-.2 4.4.5 5.6 2.1M15.5 10.5h.01"/></svg>';
  }
  return '<svg viewBox="0 0 24 24"><path d="M12 4.2a4 4 0 0 1 3.8 2.7 4 4 0 0 1 4.1 5.8 4 4 0 0 1-3.7 6.2 4 4 0 0 1-6.4.9 4 4 0 0 1-5.6-4.2 4 4 0 0 1 .1-7.4A4 4 0 0 1 12 4.2Z"/><path d="M8.6 9.8 12 7.9l3.4 1.9v4.4L12 16.1l-3.4-1.9V9.8Z"/></svg>';
}

async function updateAssistantModelSelection(model) {
  const nextModel = String(model || assistantDefaultModel).trim() || assistantDefaultModel;
  const previousModel = config.assistantModel || assistantDefaultModel;
  config.assistantModel = nextModel;
  renderAssistantModelSelectors(nextModel);

  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assistantModel: nextModel })
    });
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || "助手模型保存失败");
    config = {
      ...config,
      ...data
    };
    renderAssistantModelSelectors(config.assistantModel || nextModel);
    showToast(`助手模型已切换为 ${config.assistantModel || nextModel}`);
  } catch (error) {
    config.assistantModel = previousModel;
    renderAssistantModelSelectors(previousModel);
    showToast(error.message || "助手模型保存失败");
  }
}

function openSettingsDialog() {
  settingsApiKey.value = "";
  settingsGptImageKey.value = "";
  settingsGrokImageKey.value = "";
  settingsAssistantKey.value = "";
  settingsGrsaiApiKey.value = "";
  settingsGptImageKey.placeholder = config.modelKeys?.["gpt-image-2"] ? "已配置，留空不修改" : "留空则使用平台总 Key";
  settingsGrokImageKey.placeholder = config.modelKeys?.[grokImagineModel] ? "已配置，留空不修改" : "留空则使用平台总 Key";
  settingsGrsaiApiKey.placeholder = config.hasGrsaiApiKey ? "已配置，留空不修改" : "填写 Grsai API Key";
  settingsBaseUrl.value = config.baseUrl || "https://yunwu.ai";
  settingsImageEndpoint.value = config.imageEndpoint || "/v1/images/generations";
  settingsEditEndpoint.value = config.editEndpoint || "/v1/images/edits";
  settingsChatEndpoint.value = config.chatEndpoint || "/v1/chat/completions";
  settingsDefaultModel.value = config.defaultModel || "gpt-image-2";
  renderAssistantModelSelectors();
  updateSettingsAssistantKeyState();
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
  await copyTextToClipboard(command, "命令已复制");
}

async function copyTextToClipboard(text, successMessage = "已复制") {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
  } catch {
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
    showToast(successMessage);
  }
}

async function saveSettings(event) {
  event.preventDefault();
  settingsStatus.textContent = "保存中";

  try {
    const assistantKeyModel = settingsAssistantKeyModel();
    const payload = {
      apiKey: settingsApiKey.value.trim(),
      grsaiApiKey: settingsGrsaiApiKey.value.trim(),
      modelApiKeys: {
        "gpt-image-2": settingsGptImageKey.value.trim(),
        [grokImagineModel]: settingsGrokImageKey.value.trim(),
        [assistantKeyModel]: settingsAssistantKey.value.trim()
      },
      baseUrl: settingsBaseUrl.value.trim(),
      imageEndpoint: settingsImageEndpoint.value.trim(),
      editEndpoint: settingsEditEndpoint.value.trim(),
      chatEndpoint: settingsChatEndpoint.value.trim(),
      defaultModel: settingsDefaultModel.value.trim(),
      assistantModel: assistantKeyModel,
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
      chatEndpoint: data.chatEndpoint,
      defaultModel: data.defaultModel,
      assistantModel: data.assistantModel,
      modelKeys: data.modelKeys,
      cacheDir: data.cacheDir
    };
    setKeyStatus(config.hasAnyKey ?? config.hasApiKey, config.dreaminaLoggedIn);
    renderAssistantModelSelectors();
    await refreshProjectList();
    settingsApiKey.value = "";
    settingsGptImageKey.value = "";
    settingsGrokImageKey.value = "";
    settingsAssistantKey.value = "";
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
  if (assistantPanel && !assistantPanel.hidden) return;
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

function openAssistantPanel() {
  if (!assistantPanel) return;
  pauseChatGptHost();
  assistantPanel.hidden = false;
  document.body.classList.add("assistant-open");
  renderAssistantSkillLibrary();
  renderAssistantPendingAttachments();
  renderAssistantMessages();
  window.setTimeout(() => assistantInput?.focus(), 0);
}

function closeAssistantPanel() {
  if (assistantPanel) assistantPanel.hidden = true;
  document.body.classList.remove("assistant-open");
  closeAssistantSkillLibrary();
  resumeChatGptHost();
}

function toggleAssistantSkillLibrary() {
  if (!assistantSkillLibraryEl) return;
  if (assistantSkillLibraryEl.hidden) openAssistantSkillLibrary();
  else closeAssistantSkillLibrary();
}

function openAssistantSkillLibrary() {
  if (!assistantSkillLibraryEl) return;
  assistantSkillLibraryEl.hidden = false;
  renderAssistantSkillLibrary();
  window.setTimeout(() => assistantSkillSearchInput?.focus(), 0);
}

function closeAssistantSkillLibrary() {
  if (assistantSkillLibraryEl) assistantSkillLibraryEl.hidden = true;
}

function clearAssistantChat() {
  assistantMessages = [];
  assistantPendingImages = [];
  assistantPendingFiles = [];
  saveAssistantChat();
  renderAssistantPendingAttachments();
  renderAssistantMessages();
}

async function importSelectedImagesToAssistant() {
  openAssistantPanel();
  const remaining = Math.max(0, assistantPendingImageLimit - assistantPendingImages.length);
  if (!remaining) {
    showToast(`待发送图片最多 ${assistantPendingImageLimit} 张`);
    return;
  }
  const allCandidates = getAssistantImageImportCandidates();
  const candidates = allCandidates.slice(0, remaining);
  if (!candidates.length) {
    showToast("请先选中画布中的图片节点，或选中含结果图的生图节点");
    return;
  }

  setAssistantBusy(true);
  try {
    const attachments = [];
    for (const candidate of candidates) {
      const attachment = await createAssistantImageAttachment(candidate);
      if (attachment) attachments.push(attachment);
    }

    if (!attachments.length) {
      showToast("选中的图片无法导入助手");
      return;
    }

    const before = assistantPendingImages.length;
    appendAssistantPendingImages(attachments);
    const added = assistantPendingImages.length - before;
    const clipped = allCandidates.length > candidates.length ? "，已自动截取可添加数量" : "";
    renderAssistantPendingAttachments();
    assistantInput?.focus();
    showToast(added ? `已添加 ${added} 张待发送图片${clipped}` : "这些图片已在待发送列表中");
  } catch (error) {
    showToast(error.message || "图片导入助手失败");
  } finally {
    setAssistantBusy(false);
  }
}

function getAssistantImageImportCandidates() {
  const selected = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id));
  const candidates = [];
  const seen = new Set();

  for (const node of selected) {
    if (node.type === "image" && node.image?.url) {
      pushAssistantImageCandidate(candidates, seen, {
        nodeId: node.id,
        sourceType: "image-node",
        image: node.image,
        url: node.image.url,
        prompt: getImagePrompt(node),
        model: node.image?.generation?.model || node.image?.model || ""
      });
    }

    if (node.type === "task" && node.images?.length) {
      for (const image of node.images) {
        pushAssistantImageCandidate(candidates, seen, {
          nodeId: node.id,
          sourceType: "task-result",
          image,
          url: image.url,
          prompt: image.generation?.prompt || image.prompt || node.prompt || "",
          model: image.generation?.model || image.model || node.model || ""
        });
      }
    }
  }

  return candidates;
}

function pushAssistantImageCandidate(candidates, seen, candidate) {
  const key = candidate.url || candidate.image?.filename || `${candidate.nodeId}:${candidates.length}`;
  if (!key || seen.has(key)) return;
  seen.add(key);
  candidates.push(candidate);
}

async function createAssistantImageAttachment(candidate) {
  const dataUrl = await imageUrlToAssistantDataUrl(candidate.url);
  if (!dataUrl) return null;
  return {
    type: "image",
    key: candidate.url || `${candidate.nodeId}:${candidate.sourceType}:${candidate.image?.filename || ""}`,
    name: candidate.image?.filename || "canvas-image.jpg",
    nodeId: candidate.nodeId,
    sourceType: candidate.sourceType,
    prompt: trimAssistantText(candidate.prompt, 800),
    model: candidate.model || "",
    dataUrl
  };
}

async function imageUrlToAssistantDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("图片读取失败");
  const blob = await response.blob();
  return await imageBlobToAssistantDataUrl(blob);
}

async function imageBlobToAssistantDataUrl(blob) {
  const bitmap = await createImageBitmap(blob);
  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function appendAssistantPendingImages(attachments) {
  const seen = new Set(assistantPendingImages.map((attachment) => attachment.key || attachment.dataUrl));
  for (const attachment of attachments) {
    const key = attachment.key || attachment.dataUrl;
    if (!key || seen.has(key)) continue;
    if (assistantPendingImages.length >= assistantPendingImageLimit) break;
    seen.add(key);
    assistantPendingImages.push(attachment);
  }
}

function renderAssistantPendingAttachments() {
  if (!assistantPendingAttachmentsEl) return;
  assistantPendingAttachmentsEl.replaceChildren();
  const total = assistantPendingImages.length + assistantPendingFiles.length;
  assistantPendingAttachmentsEl.hidden = !total;
  if (!total) return;

  const head = document.createElement("div");
  head.className = "assistant-pending-head";
  head.textContent = `待发送附件 ${total} · 图片 ${assistantPendingImages.length}/${assistantPendingImageLimit} · 文件 ${assistantPendingFiles.length}/${assistantPendingFileLimit}`;
  assistantPendingAttachmentsEl.append(head);

  if (assistantPendingImages.length) {
    const grid = document.createElement("div");
    grid.className = "assistant-pending-grid";

    assistantPendingImages.forEach((attachment, index) => {
      const item = document.createElement("figure");
      item.className = "assistant-pending-image";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "assistant-pending-remove";
      remove.dataset.pendingImageIndex = String(index);
      remove.title = "移除图片";
      remove.setAttribute("aria-label", "移除图片");
      remove.textContent = "×";

      const img = document.createElement("img");
      img.src = attachment.dataUrl;
      img.alt = attachment.name || "待发送图片";

      const caption = document.createElement("figcaption");
      caption.textContent = attachment.name || attachment.nodeId || "画布图片";

      item.append(remove, img, caption);
      grid.append(item);
    });

    assistantPendingAttachmentsEl.append(grid);
  }

  if (assistantPendingFiles.length) {
    const files = document.createElement("div");
    files.className = "assistant-pending-files";
    assistantPendingFiles.forEach((attachment, index) => {
      const item = document.createElement("div");
      item.className = "assistant-pending-file";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "assistant-pending-remove";
      remove.dataset.pendingFileIndex = String(index);
      remove.title = "移除文件";
      remove.setAttribute("aria-label", "移除文件");
      remove.textContent = "×";

      const name = document.createElement("strong");
      name.textContent = attachment.name || "本地文件";

      const meta = document.createElement("span");
      meta.textContent = `${formatBytes(attachment.size || attachment.text?.length || 0)} · ${attachment.kind || "文本"}`;

      item.append(remove, name, meta);
      files.append(item);
    });
    assistantPendingAttachmentsEl.append(files);
  }
}

function handleAssistantPendingAttachmentClick(event) {
  const imageButton = event.target?.closest?.("button[data-pending-image-index]");
  if (imageButton) {
    const index = Number(imageButton.dataset.pendingImageIndex);
    if (Number.isInteger(index) && index >= 0 && index < assistantPendingImages.length) {
      assistantPendingImages.splice(index, 1);
    }
    renderAssistantPendingAttachments();
    return;
  }

  const fileButton = event.target?.closest?.("button[data-pending-file-index]");
  if (fileButton) {
    const index = Number(fileButton.dataset.pendingFileIndex);
    if (Number.isInteger(index) && index >= 0 && index < assistantPendingFiles.length) {
      assistantPendingFiles.splice(index, 1);
    }
  }
  renderAssistantPendingAttachments();
}

function consumeAssistantPendingImages() {
  const attachments = [...assistantPendingImages, ...assistantPendingFiles];
  assistantPendingImages = [];
  assistantPendingFiles = [];
  return attachments;
}

async function importLocalSkillToAssistant(event) {
  openAssistantPanel();
  const files = Array.from(event.target?.files || []).slice(0, 5);
  if (assistantSkillInput) assistantSkillInput.value = "";
  if (!files.length) return;

  try {
    const records = [];
    for (const file of files) {
      const text = await readAssistantSkillFile(file);
      if (!text) continue;
      records.push({
        name: file.name,
        size: file.size,
        text
      });
    }

    if (!records.length) {
      showToast("没有可导入的 Skill 文本");
      return;
    }

    const result = upsertAssistantSkillRecords(records, { enabled: true });
    openAssistantSkillLibrary();
    assistantMessages.push({
      id: createId(),
      role: "user",
      content: formatAssistantSkillImportMessage(result),
      createdAt: new Date().toISOString()
    });
    saveAssistantChat();
    renderAssistantMessages();
    showToast(formatAssistantSkillImportToast(result));
  } catch (error) {
    showToast(error.message || "Skill 导入失败");
  }
}

async function importLocalFilesToAssistant(event) {
  openAssistantPanel();
  const remaining = Math.max(0, assistantPendingFileLimit - assistantPendingFiles.length);
  const selectedFiles = Array.from(event.target?.files || []);
  const files = selectedFiles.slice(0, remaining);
  if (assistantFileInput) assistantFileInput.value = "";
  if (!files.length) {
    if (!remaining) showToast(`待发送文件最多 ${assistantPendingFileLimit} 个`);
    return;
  }

  setAssistantBusy(true);
  try {
    const attachments = await extractAssistantFileAttachments(files);
    if (!attachments.length) {
      showToast("没有可导入的文件内容");
      return;
    }

    appendAssistantPendingFiles(attachments);
    renderAssistantPendingAttachments();
    assistantInput?.focus();
    const clipped = files.length < selectedFiles.length ? "，已自动截取可添加数量" : "";
    showToast(`已添加 ${attachments.length} 个待发送文件${clipped}`);
  } catch (error) {
    showToast(error.message || "文件导入助手失败");
  } finally {
    setAssistantBusy(false);
  }
}

async function extractAssistantFileAttachments(files) {
  const formData = new FormData();
  for (const file of files) formData.append("files", file, file.name);
  const response = await fetch("/api/assistant/extract-files", {
    method: "POST",
    body: formData
  });
  const data = await readJsonResponse(response);
  if (!response.ok || data.parseError) throw new Error(data.error || "文件解析失败");
  const documents = Array.isArray(data.files) ? data.files : [];
  return documents
    .filter((item) => item?.text)
    .map((item) => ({
      type: "file",
      key: `${item.name}:${item.size}:${hashAssistantSkillText(item.text || "")}`,
      name: item.name || "本地文件",
      size: Number(item.size) || item.text.length,
      kind: item.kind || "文本",
      text: String(item.text || "").slice(0, 120000)
    }));
}

function appendAssistantPendingFiles(attachments) {
  const seen = new Set(assistantPendingFiles.map((attachment) => attachment.key || attachment.name));
  for (const attachment of attachments) {
    const key = attachment.key || attachment.name;
    if (!key || seen.has(key)) continue;
    if (assistantPendingFiles.length >= assistantPendingFileLimit) break;
    seen.add(key);
    assistantPendingFiles.push(attachment);
  }
}

async function readAssistantSkillFile(file) {
  const maxBytes = 300 * 1024;
  if (file.size > maxBytes) {
    showToast(`${file.name} 超过 300KB，已跳过`);
    return "";
  }
  return (await file.text()).slice(0, 120000);
}

function loadAssistantSkillLibrary() {
  try {
    const raw = localStorage.getItem(assistantSkillLibraryStorageKey) || "[]";
    const parsed = JSON.parse(raw);
    assistantSkills = Array.isArray(parsed)
      ? parsed.map((item) => normalizeAssistantSkillRecord(item, { source: "user", defaultEnabled: true })).filter(Boolean).slice(0, assistantSkillLibraryLimit)
      : [];
  } catch {
    assistantSkills = [];
  }
}

function loadAssistantBuiltInSkillStates() {
  try {
    const raw = localStorage.getItem(assistantBuiltInSkillStateStorageKey) || "{}";
    const parsed = JSON.parse(raw);
    assistantBuiltInSkillStates = isPlainObject(parsed) ? parsed : {};
  } catch {
    assistantBuiltInSkillStates = {};
  }
}

function saveAssistantBuiltInSkillStates() {
  try {
    localStorage.setItem(assistantBuiltInSkillStateStorageKey, JSON.stringify(assistantBuiltInSkillStates));
  } catch {
    // Built-in skill toggles can fall back to their defaults if localStorage is full.
  }
}

async function loadAssistantBuiltInSkills() {
  try {
    const response = await fetch("/api/assistant/skills");
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || "内置 Skill 读取失败");
    assistantBuiltInSkills = Array.isArray(data.skills)
      ? data.skills
          .map((item) =>
            normalizeAssistantSkillRecord(
              {
                ...item,
                enabled: assistantBuiltInSkillStates[item.id] === true
              },
              { source: "builtin", defaultEnabled: false }
            )
          )
          .filter(Boolean)
      : [];
  } catch (error) {
    assistantBuiltInSkills = [];
    console.warn(error);
  }
  renderAssistantSkillLibrary();
}

function saveAssistantSkillLibrary() {
  try {
    localStorage.setItem(
      assistantSkillLibraryStorageKey,
      JSON.stringify(assistantSkills.slice(0, assistantSkillLibraryLimit).map(serializeAssistantSkillRecord))
    );
  } catch {
    showToast("Skill 库保存失败，本地缓存空间可能不足");
  }
}

function normalizeAssistantSkillRecord(record, options = {}) {
  const text = String(record?.text || "").trim().slice(0, 120000);
  if (!text) return null;
  const name = String(record?.name || "本地 Skill").trim().slice(0, 160) || "本地 Skill";
  const hash = String(record?.hash || hashAssistantSkillText(text));
  const rawId = String(record?.id || `skill-${hash}`);
  const source = options.source === "builtin" || record?.source === "builtin" ? "builtin" : "user";
  const defaultEnabled = options.defaultEnabled !== false;
  const id = rawId
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || `skill-${hash}`;
  return {
    id,
    hash,
    name,
    size: Number(record?.size) || text.length,
    text,
    source,
    enabled: typeof record?.enabled === "boolean" ? record.enabled : defaultEnabled,
    importedAt: record?.importedAt || new Date().toISOString(),
    updatedAt: record?.updatedAt || record?.importedAt || new Date().toISOString()
  };
}

function serializeAssistantSkillRecord(skill) {
  return {
    id: skill.id,
    hash: skill.hash,
    name: skill.name,
    size: skill.size,
    text: skill.text,
    source: "user",
    enabled: skill.enabled !== false,
    importedAt: skill.importedAt,
    updatedAt: skill.updatedAt
  };
}

function upsertAssistantSkillRecords(records, options = {}) {
  const enabled = options.enabled !== false;
  const now = new Date().toISOString();
  let added = 0;
  let updated = 0;

  for (const record of records) {
    const skill = normalizeAssistantSkillRecord({
      ...record,
      enabled,
      importedAt: record.importedAt || now,
      updatedAt: now
    }, { source: "user", defaultEnabled: enabled });
    if (!skill) continue;

    const index = assistantSkills.findIndex((item) => item.hash === skill.hash || item.id === skill.id);
    if (index >= 0) {
      assistantSkills[index] = {
        ...assistantSkills[index],
        name: skill.name,
        size: skill.size,
        text: skill.text,
        hash: skill.hash,
        enabled,
        updatedAt: now
      };
      updated += 1;
    } else {
      assistantSkills.unshift(skill);
      added += 1;
    }
  }

  assistantSkills = assistantSkills.slice(0, assistantSkillLibraryLimit);
  saveAssistantSkillLibrary();
  renderAssistantSkillLibrary();
  return { added, updated, total: added + updated };
}

function hashAssistantSkillText(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function formatAssistantSkillImportMessage(result) {
  const parts = [];
  if (result.added) parts.push(`新增 ${result.added} 个`);
  if (result.updated) parts.push(`更新 ${result.updated} 个`);
  const summary = parts.length ? parts.join("，") : "没有新增";
  return `已保存到本地 Skill 库：${summary}。这些 Skill 已启用，后续对话可在 Skill 库中勾选是否调用。`;
}

function formatAssistantSkillImportToast(result) {
  if (result.added && result.updated) return `已新增 ${result.added} 个、更新 ${result.updated} 个 Skill`;
  if (result.added) return `已保存 ${result.added} 个 Skill`;
  if (result.updated) return `已更新 ${result.updated} 个 Skill`;
  return "Skill 已存在";
}

function getAssistantSkillCollection() {
  const builtInHashes = new Set(assistantBuiltInSkills.map((skill) => skill.hash).filter(Boolean));
  const uploadedSkills = assistantSkills.filter((skill) => !builtInHashes.has(skill.hash));
  return [...assistantBuiltInSkills, ...uploadedSkills];
}

function assistantSkillKey(skill) {
  return `${skill.source === "builtin" ? "builtin" : "user"}:${skill.id}`;
}

function findAssistantSkillByKey(key) {
  return getAssistantSkillCollection().find((skill) => assistantSkillKey(skill) === key) || null;
}

function renderAssistantSkillLibrary() {
  if (!assistantSkillList) return;
  const skills = getAssistantSkillCollection();
  const enabledCount = skills.filter((skill) => skill.enabled !== false).length;
  const builtInCount = assistantBuiltInSkills.length;
  const uploadedCount = skills.filter((skill) => skill.source !== "builtin").length;
  if (assistantSkillMenuCount) assistantSkillMenuCount.textContent = `${enabledCount}/${skills.length}`;
  if (assistantSkillSummary) {
    assistantSkillSummary.textContent = skills.length
      ? `${enabledCount}/${skills.length} 启用 · ${builtInCount} 内置 · ${uploadedCount} 用户`
      : "未导入";
  }

  assistantSkillList.replaceChildren();
  if (!skills.length) {
    const empty = document.createElement("div");
    empty.className = "assistant-skill-empty";
    empty.textContent = "内置 Skill 会随应用加载，也可以导入自己的 Skill。";
    assistantSkillList.append(empty);
    return;
  }

  const query = assistantSkillSearchQuery.trim().toLowerCase();
  const filteredSkills = query
    ? skills.filter((skill) => {
        const haystack = `${skill.name || ""}\n${skill.text || ""}`.toLowerCase();
        return haystack.includes(query);
      })
    : skills;

  if (!filteredSkills.length) {
    const empty = document.createElement("div");
    empty.className = "assistant-skill-empty";
    empty.textContent = "没有匹配的 Skill。";
    assistantSkillList.append(empty);
    return;
  }

  for (const skill of filteredSkills) {
    const isBuiltIn = skill.source === "builtin";
    const item = document.createElement("div");
    item.className = `assistant-skill-item ${isBuiltIn ? "is-builtin" : "is-uploaded"}`;

    const label = document.createElement("label");
    label.className = "assistant-skill-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = skill.enabled !== false;
    checkbox.dataset.skillToggle = assistantSkillKey(skill);

    const name = document.createElement("span");
    name.className = "assistant-skill-name";
    name.textContent = skill.name || "本地 Skill";

    const sourceBadge = document.createElement("span");
    sourceBadge.className = `assistant-skill-source-badge ${isBuiltIn ? "is-builtin" : "is-uploaded"}`;
    sourceBadge.textContent = isBuiltIn ? "内置" : "用户";

    label.append(checkbox, name, sourceBadge);

    const meta = document.createElement("div");
    meta.className = "assistant-skill-meta";
    meta.textContent = `${skill.enabled !== false ? "启用中" : "未启用"} · ${formatBytes(skill.size || skill.text?.length || 0)} · ${formatAssistantSkillDate(skill.updatedAt || skill.importedAt)}`;

    if (!isBuiltIn) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "secondary compact assistant-skill-delete";
      remove.dataset.skillDelete = assistantSkillKey(skill);
      remove.textContent = "删除";
      item.append(label, remove, meta);
    } else {
      item.append(label, meta);
    }

    assistantSkillList.append(item);
  }
}

function formatAssistantSkillDate(value) {
  if (!value) return "未知时间";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "未知时间";
    return date.toLocaleDateString("zh-CN");
  } catch {
    return "未知时间";
  }
}

function handleAssistantSkillListChange(event) {
  const input = event.target?.closest?.("input[data-skill-toggle]");
  if (!input) return;
  const skill = findAssistantSkillByKey(input.dataset.skillToggle);
  if (!skill) return;
  skill.enabled = input.checked;
  skill.updatedAt = new Date().toISOString();
  if (skill.source === "builtin") {
    if (skill.enabled) {
      assistantBuiltInSkillStates[skill.id] = true;
    } else {
      delete assistantBuiltInSkillStates[skill.id];
    }
    saveAssistantBuiltInSkillStates();
  } else {
    saveAssistantSkillLibrary();
  }
  renderAssistantSkillLibrary();
  showToast(`${skill.name} ${skill.enabled ? "已启用" : "已停用"}`);
}

function handleAssistantSkillListClick(event) {
  const button = event.target?.closest?.("button[data-skill-delete]");
  if (!button) return;
  const skill = findAssistantSkillByKey(button.dataset.skillDelete);
  if (!skill) return;
  if (skill.source === "builtin") {
    showToast("内置 Skill 不能删除，可以停用");
    return;
  }
  const index = assistantSkills.findIndex((item) => item.id === skill.id);
  if (index < 0) return;
  if (!window.confirm(`删除本地 Skill「${skill.name}」吗？`)) return;
  assistantSkills.splice(index, 1);
  saveAssistantSkillLibrary();
  renderAssistantSkillLibrary();
  showToast("Skill 已删除");
}

async function sendAssistantMessage(event) {
  event?.preventDefault();
  const content = assistantInput?.value.trim() || "";
  if (!content) {
    if (assistantPendingImages.length || assistantPendingFiles.length) showToast("请先输入分析要求，再和附件一起发送");
    return;
  }
  if (assistantInput) assistantInput.value = "";
  await sendAssistantPrompt(content);
}

async function sendAssistantQuickMessage(content) {
  openAssistantPanel();
  await sendAssistantPrompt(content);
}

async function sendAssistantPlanPrompt(content) {
  openAssistantPanel();
  await sendAssistantPrompt(content, { mode: "action_plan" });
}

async function sendAssistantPrompt(content, options = {}) {
  if (assistantBusy) {
    showToast("助手正在回复");
    return;
  }
  if (!content.trim()) return;

  const attachments = Array.isArray(options.attachments)
    ? cloneAssistantAttachments(options.attachments)
    : consumeAssistantPendingImages();
  const mode = options.mode || inferAssistantMessageMode(content);
  assistantMessages.push({
    id: createId(),
    role: "user",
    content: content.trim(),
    attachments,
    mode,
    retryOf: options.retryOf || "",
    createdAt: new Date().toISOString()
  });
  saveAssistantChat();
  renderAssistantPendingAttachments();

  const localPlan = options.localPlan === true ? createLocalAssistantPlan(content, mode) : null;
  if (localPlan) {
    assistantMessages.push({
      id: createId(),
      role: "assistant",
      content: localPlan.summary,
      plan: localPlan,
      retryOf: options.retryOf || "",
      createdAt: new Date().toISOString()
    });
    saveAssistantChat();
    renderAssistantMessages();
    return;
  }

  setAssistantBusy(true);
  renderAssistantMessages();
  assistantAbortController = new AbortController();

  try {
    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.assistantModel || assistantDefaultModel,
        mode,
        messages: buildAssistantRequestMessages(options.requestMessages || assistantMessages),
        context: buildAssistantContext({ compact: mode === "action_plan" })
      }),
      signal: assistantAbortController.signal
    });
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || "助手请求失败");

    const assistantContent = data.message?.content || "";
    const extractedPlan = extractAssistantPlanFromContent(assistantContent);
    const responsePlan =
      data.plan ||
      extractedPlan.plan ||
      createAssistantFallbackPlan(content, mode, assistantContent) ||
      createAssistantSummaryFallbackPlan(content, assistantContent);
    const responseContent = extractedPlan.content || assistantContent || responsePlan?.summary || "";
    assistantMessages.push({
      id: createId(),
      role: "assistant",
      content: responseContent,
      plan: responsePlan,
      retryOf: options.retryOf || "",
      createdAt: new Date().toISOString()
    });
    saveAssistantChat();
  } catch (error) {
    const stopped = error?.name === "AbortError";
    assistantMessages.push({
      id: createId(),
      role: "assistant",
      content: stopped ? "已停止当前回复。" : error.message || "助手请求失败",
      error: !stopped,
      stopped,
      retryOf: options.retryOf || "",
      createdAt: new Date().toISOString()
    });
    saveAssistantChat();
  } finally {
    assistantAbortController = null;
    setAssistantBusy(false);
    renderAssistantMessages();
  }
}

function setAssistantBusy(isBusy) {
  assistantBusy = Boolean(isBusy);
  if (assistantSendButton) assistantSendButton.disabled = assistantBusy;
  if (assistantStopButton) {
    assistantStopButton.hidden = !assistantBusy;
    assistantStopButton.disabled = !assistantBusy;
  }
  if (assistantAnalyzeButton) assistantAnalyzeButton.disabled = assistantBusy;
  if (assistantOrganizeButton) assistantOrganizeButton.disabled = assistantBusy;
  if (assistantPlanButton) assistantPlanButton.disabled = assistantBusy;
  if (assistantImportImagesButton) assistantImportImagesButton.disabled = assistantBusy;
  if (assistantImportFilesButton) assistantImportFilesButton.disabled = assistantBusy;
  if (assistantImportSkillButton) assistantImportSkillButton.disabled = assistantBusy;
  if (assistantModelSelect) assistantModelSelect.disabled = assistantBusy;
}

function stopAssistantResponse() {
  if (!assistantBusy || !assistantAbortController) return;
  assistantAbortController.abort();
}

function buildAssistantRequestMessages(sourceMessages = assistantMessages) {
  const messages = sourceMessages.map(serializeAssistantMessageForRequest);
  const activeSkillAttachments = getEnabledAssistantSkillAttachments();
  if (!activeSkillAttachments.length || !messages.length) return messages;

  const currentMessage = messages.pop();
  messages.push({
    role: "system",
    content: `当前对话启用了 ${activeSkillAttachments.length} 个 Skill。回答本轮问题时优先遵循这些 Skill 的工作流和约束；未启用的 Skill 不要调用。`,
    attachments: activeSkillAttachments
  });
  messages.push(currentMessage);
  return messages;
}

function getEnabledAssistantSkillAttachments() {
  return getAssistantSkillCollection()
    .filter((skill) => skill.enabled !== false && skill.text)
    .slice(0, assistantSkillRequestLimit)
    .map((skill) => ({
      type: "skill",
      name: skill.name,
      size: skill.size || skill.text.length,
      text: skill.text
    }));
}

function serializeAssistantMessageForRequest(message) {
  return {
    role: message.role,
    content: message.content || "",
    attachments: Array.isArray(message.attachments)
      ? message.attachments.filter((attachment) => attachment?.type !== "skill")
      : []
  };
}

function cloneAssistantAttachments(attachments = []) {
  return Array.isArray(attachments) ? clonePlainValue(attachments).filter((attachment) => attachment?.type !== "skill") : [];
}

function handleAssistantMessageClick(event) {
  const copyButton = event.target?.closest?.("button[data-assistant-copy]");
  if (copyButton) {
    const message = assistantMessages.find((item) => item.id === copyButton.dataset.assistantCopy);
    copyAssistantMessage(message);
    return;
  }

  const retryButton = event.target?.closest?.("button[data-assistant-retry]");
  if (!retryButton) return;
  retryAssistantMessage(retryButton.dataset.assistantRetry);
}

function handleAssistantMessageContextMenu(event) {
  const item = event.target?.closest?.(".assistant-message");
  if (!item || !assistantMessagesEl?.contains(item) || item.classList.contains("is-pending")) return;
  const message = assistantMessages.find((entry) => entry.id === item.dataset.assistantMessageId);
  const text = selectedTextWithin(item) || assistantMessageCopyText(message);
  if (!text.trim()) return;
  event.preventDefault();
  showAssistantCopyMenu(event.clientX, event.clientY, text);
}

function selectedTextWithin(element) {
  const selection = window.getSelection?.();
  const text = selection?.toString?.() || "";
  if (!text.trim() || !selection.rangeCount) return "";
  const anchor = selection.anchorNode;
  const focus = selection.focusNode;
  if (element.contains(anchor) || element.contains(focus)) return text;
  return "";
}

function hasActiveTextSelection() {
  const selection = window.getSelection?.();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function copyAssistantMessage(message) {
  const text = assistantMessageCopyText(message);
  if (!text.trim()) return;
  copyTextToClipboard(text, "助手内容已复制");
}

function assistantMessageCopyText(message) {
  if (!message) return "";
  const parts = [String(message.content || "").trim()].filter(Boolean);
  if (message.plan?.actions?.length) {
    parts.push(
      [
        "操作计划：",
        ...message.plan.actions.slice(0, 20).map((action, index) => `${index + 1}. ${formatAssistantPlanActionForCopy(action)}`)
      ].join("\n")
    );
  }
  return parts.join("\n\n").trim();
}

function formatAssistantPlanActionForCopy(action = {}) {
  const type = String(action.type || "");
  if (type === "create_task") return `创建生图节点：${String(action.prompt || "").trim() || "空提示词"}`;
  if (type === "create_video_task") return `创建视频节点：${String(action.prompt || "").trim() || "空提示词"}`;
  if (type === "create_note") return `创建文字标注：${String(action.text || "").trim() || "空文字"}`;
  return formatAssistantPlanAction(action);
}

async function retryAssistantMessage(messageId) {
  if (assistantBusy) {
    showToast("助手正在回复");
    return;
  }

  const sourceInfo = findAssistantRetrySource(messageId);
  if (!sourceInfo) {
    showToast("没有找到可重试的消息");
    return;
  }

  const { sourceUser, sourceUserIndex, clickedMessage } = sourceInfo;
  const originalAttachments = Array.isArray(sourceUser.attachments) ? sourceUser.attachments : [];
  const imageCount = originalAttachments.filter((attachment) => attachment?.type === "image").length;
  const missingImageCount = originalAttachments.filter(
    (attachment) => attachment?.type === "image" && !String(attachment.dataUrl || "").startsWith("data:image/")
  ).length;
  if (imageCount && missingImageCount) {
    showToast("这条历史消息的图片数据已丢失，请重新导入图片后再重试");
    return;
  }

  const attachments = cloneAssistantAttachments(originalAttachments);
  const retryUserMessage = {
    ...sourceUser,
    attachments,
    content: String(sourceUser.content || "").trim()
  };
  const requestMessages = [
    ...assistantMessages.slice(0, sourceUserIndex).map(normalizeAssistantChatMessage),
    retryUserMessage
  ];
  const mode = sourceUser.mode === "action_plan" || clickedMessage?.plan ? "action_plan" : "chat";
  await sendAssistantPrompt(retryUserMessage.content, {
    mode,
    attachments,
    requestMessages,
    retryOf: sourceUser.id || ""
  });
}

function findAssistantRetrySource(messageId) {
  const index = assistantMessages.findIndex((message) => message.id === messageId);
  if (index < 0) return null;
  const clickedMessage = assistantMessages[index];
  if (clickedMessage.role === "user") {
    return { sourceUser: clickedMessage, sourceUserIndex: index, clickedMessage };
  }

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = assistantMessages[cursor];
    if (candidate?.role === "user" && String(candidate.content || "").trim()) {
      return { sourceUser: candidate, sourceUserIndex: cursor, clickedMessage };
    }
  }

  return null;
}

function createAssistantMessageActionsElement(message) {
  const canCopy = Boolean(String(message?.content || "").trim() || message?.plan?.actions?.length);
  const canRetry = canRetryAssistantMessage(message);
  if (!canCopy && !canRetry) return null;

  const actions = document.createElement("div");
  actions.className = "assistant-message-actions";

  if (canCopy) {
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "secondary compact assistant-message-copy";
    copy.dataset.assistantCopy = message.id;
    copy.textContent = "复制";
    actions.append(copy);
  }

  if (canRetry) {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "secondary compact assistant-message-retry";
    retry.dataset.assistantRetry = message.id;
    retry.disabled = assistantBusy;
    retry.textContent = "重试";
    actions.append(retry);
  }
  return actions;
}

function canRetryAssistantMessage(message) {
  if (!message?.id || !String(message.content || "").trim()) return false;
  if (message.role === "user") return true;
  return message.role === "assistant" && Boolean(findAssistantRetrySource(message.id));
}

function inferAssistantMessageMode(content) {
  return isAssistantActionInstruction(content) ? "action_plan" : "chat";
}

function isAssistantActionInstruction(content) {
  const text = String(content || "").trim();
  if (!text) return false;
  const hasActionWord = /(整理|排版|布局|排列|对齐|分组|归类|分类|标注|文字|颜色|改色|改为|修改|变成|移动|挪动|摆放|创建|新建|添加|输出到画布|写到画布|写入画布|放到画布|贴到画布|生成到画布|做成节点|转成节点|生图节点|图生图节点|作图节点|图片生成节点|视频节点|提示词节点|提示词.*填|生成.*节点|补充.*节点|缩放|放大|缩小|执行|应用)/u.test(text);
  if (!hasActionWord) return false;
  const asksForAdvice = /(怎么|如何|怎样|建议|分析|评价|是否|能不能|可不可以|思路|方案|为什么)/u.test(text);
  const explicitExecution = /(生成计划|应用|执行|直接|自动|立即|现在|把|将|整理一下|排版一下|分类|归类|分组|标注|输出到画布|写到画布|写入画布|放到画布|贴到画布|生成到画布|做成节点|转成节点|改为|修改|变成|改色|创建|新建|添加|生图节点|图生图节点|作图节点|图片生成节点|视频节点|提示词节点|填进去|移动|挪动|缩放|放大|缩小)/u.test(text);
  const hasCommandTone = /(帮我|请|把|将|给我|直接|自动|现在|立即|需要|想要|生成计划|应用|执行)/u.test(text);
  if (asksForAdvice && !explicitExecution) return false;
  return hasCommandTone || !asksForAdvice;
}

function createLocalAssistantPlan(content, mode) {
  if (mode !== "action_plan" || !isAssistantLayoutInstruction(content)) return null;
  const targets = assistantLayoutTargetNodes();
  if (targets.length < 2) return null;
  const bounds = computeNodesBounds(targets) || { x: getViewportCenterWorld().x, y: getViewportCenterWorld().y, width: 0, height: 0 };
  const columns = inferAssistantLayoutColumns(content, targets.length);
  const normalizeMedia = !/(不缩放|不要缩放|保持大小|保持原大小|只移动)/u.test(String(content || ""));
  return {
    summary: selectedNodeIds.size
      ? `已为选中的 ${targets.length} 个节点生成整理计划，应用后会按整齐间距重新排版。`
      : `已为画布中的 ${targets.length} 个节点生成整理计划，应用后会按整齐间距重新排版。`,
    actions: [
      {
        type: "organize_nodes",
        ids: targets.map((node) => node.id),
        columns,
        gap: 56,
        originX: Math.round(bounds.x),
        originY: Math.round(bounds.y),
        normalizeMedia,
        maxMediaLongSide: 280
      }
    ]
  };
}

function parseAssistantPlanFromContent(content) {
  return extractAssistantPlanFromContent(content).plan;
}

function extractAssistantPlanFromContent(content) {
  const text = String(content || "").trim();
  const candidates = assistantJsonCandidates(text);
  const actions = [];
  const seenActions = new Set();
  const planRanges = [];
  let summary = "";

  for (const candidate of candidates) {
    const parsed = tryParseAssistantPlanJson(candidate.json);
    const candidateActions = normalizeAssistantPlanActions(parsed);
    if (!candidateActions.length) continue;

    if (!summary && isPlainObject(parsed)) summary = String(parsed.summary || "").trim();
    planRanges.push([candidate.start, candidate.end]);

    for (const action of candidateActions) {
      const key = JSON.stringify(action);
      if (seenActions.has(key)) continue;
      seenActions.add(key);
      if (actions.length < 20) actions.push(action);
    }
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

function isAssistantPlanSummaryOnly(value) {
  return /^已识别到\s*\d+\s*个画布操作，请确认后应用。?$/u.test(String(value || "").trim());
}

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
  return clonePlainValue(normalized);
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
  const parsed = tryParseAssistantPlanJson(raw);
  return isPlainObject(parsed) ? parsed : null;
}

function tryParseAssistantPlanJson(content) {
  try {
    return JSON.parse(stripAssistantJsonFence(content));
  } catch {
    return null;
  }
}

function stripAssistantJsonFence(text) {
  return String(text || "").replace(/^```(?:json)?\s*/iu, "").replace(/\s*```$/u, "").trim();
}

function assistantJsonCandidates(content) {
  const text = String(content || "");
  const candidates = [];
  const seen = new Set();
  const fencedRanges = [];
  const addCandidate = (json, start, end) => {
    const trimmed = stripAssistantJsonFence(json);
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

function createAssistantFallbackPlan(content, mode, assistantContent = "") {
  if (mode !== "action_plan") return null;
  const text = String(content || "").trim();
  if (isAssistantCreateTaskInstruction(text)) return createAssistantTaskFallbackPlan(text);
  if (isAssistantCreateVideoTaskInstruction(text)) return createAssistantVideoTaskFallbackPlan(text);
  if (isAssistantCreateNoteInstruction(text)) return createAssistantNoteFallbackPlan(text, assistantContent);
  if (isAssistantCharacterAssetSpec(text)) return createAssistantCharacterAssetFallbackPlan(text, assistantContent);
  return null;
}

function createAssistantSummaryFallbackPlan(content, assistantContent = "") {
  if (!isAssistantPlanSummaryOnly(assistantContent)) return null;
  return createAssistantFallbackPlan(content, "action_plan", assistantContent);
}

function isAssistantCreateTaskInstruction(text) {
  if (/(生图节点|图生图节点|作图节点|图片生成节点|生成图片节点)/u.test(text)) {
    return /(创建|新建|添加|补充|生成|做一个|来一个|输出|放到|生成到|做成|转成)/u.test(text);
  }
  if (/(视频|生视频|生成视频)/u.test(text)) return false;
  return hasAssistantImageGenerationIntent(text) && /(画布|节点|生成|输出|放到|做成|转成)/u.test(text);
}

function createAssistantTaskFallbackPlan(text) {
  const prompt = extractAssistantCreateTaskPrompt(text) || promptFromSelectedNodes();
  const isEditMode = /(图生图|参考图|垫图|局部重绘|重绘)/u.test(text);
  return {
    summary: prompt
      ? "已生成创建生图节点的计划，并会把识别到的提示词填入节点。"
      : "已生成创建空白生图节点的计划，应用后可继续填写提示词。",
    actions: [
      {
        type: "create_task",
        mode: isEditMode ? "edit" : "create",
        prompt
      }
    ]
  };
}

function isAssistantCreateVideoTaskInstruction(text) {
  if (/(生视频节点|视频节点|视频生成节点|生成视频节点)/u.test(text)) {
    return /(创建|新建|添加|补充|生成|做一个|来一个|输出|放到|生成到|做成|转成)/u.test(text);
  }
  return hasAssistantVideoGenerationIntent(text) && /(画布|节点|生成|输出|放到|做成|转成)/u.test(text);
}

function createAssistantVideoTaskFallbackPlan(text) {
  const prompt = extractAssistantCreateTaskPrompt(text) || promptFromSelectedNodes();
  return {
    summary: prompt
      ? "已生成创建视频节点的计划，并会把识别到的提示词填入节点。"
      : "已生成创建空白视频节点的计划，应用后可继续填写提示词。",
    actions: [
      {
        type: "create_video_task",
        prompt
      }
    ]
  };
}

function isAssistantCreateNoteInstruction(text) {
  const hasExplicitNoteTarget = /(文字标注|文字节点|提示词节点|标注节点|便签|说明节点|报告节点)/u.test(text);
  const hasCanvasOutputTarget =
    /(输出|写入|写到|放到|贴到|生成到|整理到|呈现到|同步到).{0,12}(画布|节点|标注)/u.test(text) ||
    /(画布|节点|标注).{0,12}(输出|显示|呈现|展示|写入)/u.test(text) ||
    /(做成|转成).{0,8}(节点|文字标注|标注)/u.test(text);
  const hasTextArtifactIntent = /(分析|报告|说明|文字|文本|文案|提示词|清单|总结|摘要|标题|标签|建议|方案|内容|剧本|分镜|大纲|设定|风格|备注|注释)/u.test(text);
  const hasVisualGenerationIntent = hasAssistantImageGenerationIntent(text) || hasAssistantVideoGenerationIntent(text);
  return (
    hasExplicitNoteTarget ||
    (hasCanvasOutputTarget && hasTextArtifactIntent && !hasVisualGenerationIntent)
  );
}

function hasAssistantImageGenerationIntent(text) {
  return (
    /(生成|创作|绘制|画|做|出).{0,16}(图片|图像|画面|海报|分镜图|参考图)/u.test(text) ||
    /(图片|图像|画面|海报|分镜图|参考图).{0,16}(生成|生成到画布)/u.test(text) ||
    /(生图|作图|画图)/u.test(text)
  );
}

function hasAssistantVideoGenerationIntent(text) {
  return (
    /(生成|创作|制作|做|出).{0,16}(视频|短片|动画|镜头)/u.test(text) ||
    /(视频|短片|动画|镜头).{0,16}(生成|生成到画布)/u.test(text) ||
    /(生视频)/u.test(text)
  );
}

function createAssistantNoteFallbackPlan(text, assistantContent = "") {
  const noteText = extractAssistantOutputNoteText(text, assistantContent);
  if (!noteText) return null;
  return {
    summary: "已生成创建文字标注的计划，应用后会把内容放到画布中。",
    actions: [
      {
        type: "create_note",
        text: noteText,
        width: Math.min(900, maxNoteWidth),
        fontSize: noteText.length > 220 ? 24 : 30
      }
    ]
  };
}

function extractAssistantOutputNoteText(text, assistantContent = "") {
  const assistantText = String(assistantContent || "").trim();
  if (assistantText && !isAssistantCapabilityRefusal(assistantText)) return assistantText;

  const patterns = [
    /(?:输出|写入|写到|放到|贴到|生成到|整理到|呈现到).{0,12}(?:画布|节点|标注)(?:中|里|上)?[:：]\s*([\s\S]+)/u,
    /(?:创建|新建|添加).{0,10}(?:文字标注|文字节点|提示词节点|标注节点|便签|说明节点|报告节点)[:：]\s*([\s\S]+)/u,
    /(?:创建|新建|添加).{0,10}(?:文字标注|文字节点|提示词节点|标注节点|便签|说明节点|报告节点)\s+([\s\S]+)/u,
    /(?:把|将)([\s\S]{2,400}?)(?:输出|写入|写到|放到|贴到|生成到|整理到|呈现到).{0,12}(?:画布|节点|标注)/u,
    /(?:把|将)([\s\S]{2,400}?)(?:做成|转成).{0,8}(?:节点|文字标注|标注)/u
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const value = String(match?.[1] || "").trim();
    if (value) return value;
  }

  const selectedText = promptFromSelectedNodes();
  if (selectedText) return selectedText;
  return "";
}

function isAssistantCharacterAssetSpec(text) {
  const value = String(text || "").trim();
  if (value.length < 160) return false;
  const structureScore = [
    /剧情定位/u,
    /人设气质/u,
    /脸型|五官|眉眼|鼻型|嘴唇/u,
    /身材比例|身高感|体态/u,
    /服装版本|V\d+\s+/u
  ].filter((pattern) => pattern.test(value)).length;
  return structureScore >= 3;
}

function createAssistantCharacterAssetFallbackPlan(text, assistantContent = "") {
  const value = String(text || "").trim();
  if (!value) return null;

  const center = getViewportCenterWorld();
  const name = inferAssistantCharacterAssetName(value);
  const versions = extractAssistantCharacterVersions(value).slice(0, 3);
  const noteText = `【人物资产】${name}设定规范\n\n${value}`;
  const noteHeight = clamp(300 + Math.ceil(noteText.length / 120) * 24, 420, 760);
  const originX = Math.round(center.x - 720);
  const originY = Math.round(center.y - 280);
  const actions = [
    {
      type: "create_note",
      x: originX,
      y: originY,
      width: 1180,
      height: noteHeight,
      text: noteText,
      fontSize: value.length > 900 ? 24 : 28,
      color: defaultNoteColorForTheme()
    }
  ];

  const promptBase = trimAssistantText(value.replace(/\n{2,}/gu, "\n").replace(/\s+/gu, " "), 900);
  const taskVersions = versions.length
    ? versions
    : [{ title: "角色标准版", description: "根据人物设定生成角色定妆参考。" }];
  for (const [index, version] of taskVersions.entries()) {
    actions.push({
      type: "create_task",
      mode: "create",
      x: originX + 1240 + index * 260,
      y: originY,
      model: config.defaultModel || "gpt-image-2",
      size: "720x1280",
      count: "1",
      prompt: trimAssistantText(
        [
          "真人实拍, 9:16竖屏, 电影级写实, 角色定妆参考图",
          name,
          version.title,
          version.description,
          promptBase,
          "自然皮肤纹理, 真实骨相, 服装材质清晰, 影视级光影, 半身或全身人物参考"
        ].filter(Boolean).join(", "),
        1400
      )
    });
  }

  return {
    summary: assistantContent && isAssistantPlanSummaryOnly(assistantContent)
      ? `已补全 ${actions.length} 个画布操作，请确认后应用。`
      : `已为「${name}」生成 ${actions.length} 个画布操作，请确认后应用。`,
    actions
  };
}

function inferAssistantCharacterAssetName(text) {
  const lines = String(text || "")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);
  const titleLine = lines.find((line) => /剧情定位/u.test(line));
  if (titleLine) {
    const index = lines.indexOf(titleLine);
    const next = lines[index + 1] || "";
    const name = firstChineseNameSegment(next);
    if (name) return name;
  }

  for (const line of lines.slice(0, 8)) {
    if (/^\d+[.、]/u.test(line) || /^(剧情定位|人设气质|脸型|身材)/u.test(line)) continue;
    const name = firstChineseNameSegment(line);
    if (name) return name;
  }
  return "角色";
}

function firstChineseNameSegment(line) {
  const cleaned = String(line || "").replace(/^[-*•\s]+/u, "").trim();
  const segment = cleaned.split(/[，,。；;：:\s]/u)[0] || "";
  if (/^[\u4e00-\u9fa5A-Za-z0-9·]{2,16}$/u.test(segment)) return segment;
  return "";
}

function extractAssistantCharacterVersions(text) {
  const versions = [];
  const pattern = /(V\d+)\s*([^\n\r]{0,40})(?:\r?\n)([^\n\r]{2,120})/giu;
  for (const match of String(text || "").matchAll(pattern)) {
    versions.push({
      title: `${match[1]} ${String(match[2] || "").trim()}`.trim(),
      description: String(match[3] || "").trim()
    });
  }
  return versions;
}

function isAssistantCapabilityRefusal(text) {
  return /(无法直接|不能直接|没有权限|没有接口|当前.*无法|需要你手动|请你手动|我不能操作|我无法操作)/u.test(String(text || ""));
}

function extractAssistantCreateTaskPrompt(text) {
  const patterns = [
    /提示词[:：]\s*([\s\S]+)/u,
    /prompt[:：]\s*([\s\S]+)/iu,
    /用(?:这个|以下|下面)?提示词\s*[“"']?([\s\S]+?)[”"']?$/u,
    /将(?:以下|下面|这个)?提示词填进去[:：]?\s*([\s\S]*)$/u,
    /把(?:以下|下面|这个)?提示词填进去[:：]?\s*([\s\S]*)$/u
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const prompt = String(match?.[1] || "").trim();
    if (prompt) return prompt;
  }
  return "";
}

function promptFromSelectedNodes() {
  const parts = canvasState.nodes
    .filter((node) => selectedNodeIds.has(node.id))
    .map((node) => {
      if (node.type === "note") return node.text || "";
      if (node.type === "task" || node.type === "video-task") return node.prompt || "";
      if (node.type === "image") return getImagePrompt(node) || getImageGeneration(node)?.prompt || "";
      if (node.type === "video") return node.video?.prompt || node.video?.generation?.prompt || "";
      return "";
    })
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return parts.join("\n\n").trim();
}

function isAssistantLayoutInstruction(content) {
  const text = String(content || "");
  return /(整理|排版|布局|排列|对齐|分组|归类|摆放|规整|整齐|收纳)/u.test(text);
}

function assistantLayoutTargetNodes() {
  const allowedTypes = new Set(["image", "video", "note", "task", "video-task"]);
  const selected = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id) && allowedTypes.has(node.type || "task"));
  const source = selected.length ? selected : canvasState.nodes.filter((node) => allowedTypes.has(node.type || "task"));
  return source
    .slice()
    .sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0))
    .slice(0, 80);
}

function inferAssistantLayoutColumns(content, count) {
  const text = String(content || "");
  if (/(一列|纵向|竖排|竖着|从上到下)/u.test(text)) return 1;
  if (/(一排|横向|横排|横着|从左到右)/u.test(text)) return Math.min(count, 8);
  if (/(两列|2列|二列)/u.test(text)) return 2;
  if (/(三列|3列)/u.test(text)) return 3;
  if (/(四列|4列)/u.test(text)) return 4;
  if (/(五列|5列)/u.test(text)) return 5;
  return clamp(Math.ceil(Math.sqrt(count * 1.2)), 2, 6);
}

function renderAssistantMessages() {
  if (!assistantMessagesEl) return;
  assistantMessagesEl.replaceChildren();

  if (!assistantMessages.length) {
    const empty = document.createElement("div");
    empty.className = "assistant-empty";
    empty.textContent = "选中节点后可以让助手分析提示词、结果和排版。";
    assistantMessagesEl.append(empty);
  }

  for (const message of assistantMessages) {
    const item = document.createElement("div");
    item.className = [
      "assistant-message",
      message.role === "user" ? "is-user" : "is-assistant",
      message.error ? "is-error" : ""
    ]
      .filter(Boolean)
      .join(" ");
    item.dataset.assistantMessageId = message.id;

    const content = document.createElement("div");
    content.className = "assistant-message-content";
    content.textContent = message.content;
    item.append(content);

    if (message.plan?.actions?.length) {
      item.append(createAssistantPlanElement(message));
    }

    if (message.attachments?.length) {
      item.append(createAssistantAttachmentsElement(message.attachments));
    }

    const actions = createAssistantMessageActionsElement(message);
    if (actions) item.append(actions);

    assistantMessagesEl.append(item);
  }

  if (assistantBusy) {
    const pending = document.createElement("div");
    pending.className = "assistant-message is-assistant is-pending";
    pending.textContent = "思考中...";
    assistantMessagesEl.append(pending);
  }

  assistantMessagesEl.scrollTop = assistantMessagesEl.scrollHeight;
}

function createAssistantAttachmentsElement(attachments = []) {
  const wrap = document.createElement("div");
  wrap.className = "assistant-attachments";

  for (const attachment of attachments) {
    if (attachment.type === "image") {
      const item = document.createElement("figure");
      item.className = "assistant-attachment-image";

      if (attachment.dataUrl) {
        const img = document.createElement("img");
        img.src = attachment.dataUrl;
        img.alt = attachment.name || "canvas image";
        item.append(img);
      }

      const caption = document.createElement("figcaption");
      caption.textContent = attachment.name || attachment.nodeId || "画布图片";
      item.append(caption);
      wrap.append(item);
      continue;
    }

    if (attachment.type === "skill") {
      const item = document.createElement("div");
      item.className = "assistant-attachment-skill";
      item.textContent = `${attachment.name || "本地 Skill"} · ${formatBytes(attachment.size || attachment.text?.length || 0)}`;
      wrap.append(item);
      continue;
    }

    if (attachment.type === "file") {
      const item = document.createElement("div");
      item.className = "assistant-attachment-file";
      const name = document.createElement("strong");
      name.textContent = attachment.name || "本地文件";
      const meta = document.createElement("span");
      meta.textContent = `${formatBytes(attachment.size || attachment.text?.length || 0)} · ${attachment.kind || "文本"}`;
      item.append(name, meta);
      wrap.append(item);
    }
  }

  return wrap;
}

function createAssistantPlanElement(message) {
  const plan = message.plan;
  const panel = document.createElement("div");
  panel.className = "assistant-plan";

  const title = document.createElement("div");
  title.className = "assistant-plan-title";
  const statusText = plan.applied ? "已应用" : plan.ignored ? "已不使用" : "";
  title.textContent = `操作计划 · ${plan.actions.length} 步${statusText ? ` · ${statusText}` : ""}`;

  const list = document.createElement("ol");
  list.className = "assistant-plan-list";
  for (const action of plan.actions.slice(0, 20)) {
    const item = document.createElement("li");
    item.textContent = formatAssistantPlanAction(action);
    list.append(item);
  }

  const actions = document.createElement("div");
  actions.className = "assistant-plan-actions";

  const apply = document.createElement("button");
  apply.type = "button";
  apply.textContent = plan.applied ? "已应用" : "应用计划";
  apply.disabled = Boolean(plan.applied || plan.ignored);
  apply.addEventListener("click", () => {
    const applied = applyAssistantPlan(plan);
    if (!applied) return;
    plan.applied = true;
    saveAssistantChat();
    renderAssistantMessages();
  });

  const ignore = document.createElement("button");
  ignore.type = "button";
  ignore.className = "secondary";
  ignore.textContent = plan.ignored ? "已不使用" : "不使用";
  ignore.disabled = Boolean(plan.applied || plan.ignored);
  ignore.addEventListener("click", () => {
    plan.ignored = true;
    saveAssistantChat();
    renderAssistantMessages();
  });

  actions.append(apply, ignore);
  panel.append(title, list, actions);
  return panel;
}

function formatAssistantPlanAction(action = {}) {
  const type = String(action.type || "");
  if (type === "create_task") return `创建生图节点：${trimAssistantText(action.prompt, 80) || "空提示词"}`;
  if (type === "create_video_task") return `创建视频节点：${trimAssistantText(action.prompt, 80) || "空提示词"}`;
  if (type === "create_note") return `创建文字标注：${trimAssistantText(action.text, 80) || "空文字"}`;
  if (type === "move_node") return `移动节点：${action.id || "-"}`;
  if (type === "move_nodes") return `移动多个节点：${Array.isArray(action.items) ? action.items.length : 0} 个`;
  if (type === "update_task") return `修改任务节点：${action.id || "-"}`;
  if (type === "update_note") return `修改文字标注：${action.id || "-"}`;
  if (type === "update_notes") {
    const scope = String(action.scope || "").toLowerCase();
    if (scope === "all") return "批量修改文字标注：全部文字标注";
    if (scope === "selected" || scope === "selection") return "批量修改文字标注：选中文字标注";
    const count = Array.isArray(action.ids) ? action.ids.length : Array.isArray(action.items) ? action.items.length : 0;
    return `批量修改文字标注：${count} 个文字标注`;
  }
  if (type === "set_node_scale") return `调整图片/视频缩放：${action.id || "-"}`;
  if (type === "organize_nodes") {
    const count = Array.isArray(action.ids) ? action.ids.length : Array.isArray(action.items) ? action.items.length : 0;
    return `整理节点：${count} 个，${action.columns || "自动"} 列规整排版`;
  }
  if (type === "organize_groups") {
    const groups = Array.isArray(action.groups) ? action.groups : Array.isArray(action.items) ? action.items : [];
    const count = groups.reduce((sum, group) => {
      const ids = Array.isArray(group?.ids) ? group.ids : Array.isArray(group?.items) ? group.items : [];
      return sum + ids.length;
    }, 0);
    return `分组整理：${groups.length} 组，${count} 个节点`;
  }
  return `未知动作：${type || "-"}`;
}

function applyAssistantPlan(plan) {
  if (plan?.ignored) {
    showToast("这条计划已标记为不使用");
    return false;
  }
  const actions = Array.isArray(plan?.actions) ? plan.actions.slice(0, 20) : [];
  if (!actions.length) {
    showToast("计划里没有可执行动作");
    return false;
  }
  if (!window.confirm(`确认应用这 ${actions.length} 个画布操作吗？`)) return false;

  const touchedIds = new Set();
  let appliedCount = 0;

  for (const action of actions) {
    if (!isPlainObject(action)) continue;
    if (applyAssistantAction(action, touchedIds)) appliedCount += 1;
  }

  if (!appliedCount) {
    showToast("没有可应用的有效动作");
    return false;
  }

  selectedNodeIds.clear();
  for (const id of touchedIds) selectedNodeIds.add(id);
  renderCanvas();
  saveCanvasState();
  showToast(`已应用 ${appliedCount} 个画布操作`);
  return true;
}

function applyAssistantAction(action, touchedIds) {
  const type = String(action.type || "").trim();
  if (type === "create_task") return applyAssistantCreateTask(action, touchedIds);
  if (type === "create_video_task") return applyAssistantCreateVideoTask(action, touchedIds);
  if (type === "create_note") return applyAssistantCreateNote(action, touchedIds);
  if (type === "move_node") return applyAssistantMoveNode(action, touchedIds);
  if (type === "move_nodes") return applyAssistantMoveNodes(action, touchedIds);
  if (type === "update_task") return applyAssistantUpdateTask(action, touchedIds);
  if (type === "update_note") return applyAssistantUpdateNote(action, touchedIds);
  if (type === "update_notes") return applyAssistantUpdateNotes(action, touchedIds);
  if (type === "set_node_scale") return applyAssistantSetNodeScale(action, touchedIds);
  if (type === "organize_nodes") return applyAssistantOrganizeNodes(action, touchedIds);
  if (type === "organize_groups") return applyAssistantOrganizeGroups(action, touchedIds);
  return false;
}

function assistantPlannedNodeId(action) {
  const id = String(action?.id || "").trim().slice(0, 160);
  if (!id) return "";
  if (canvasState.nodes.some((node) => node.id === id)) return "";
  return id;
}

function applyAssistantCreateTask(action, touchedIds) {
  const center = getViewportCenterWorld();
  const mode = action.mode === "edit" ? "edit" : "create";
  const node = createDefaultTaskNode(mode);
  node.id = assistantPlannedNodeId(action) || node.id;
  node.prompt = String(action.prompt || "").trim();
  node.model = String(action.model || node.model || config.defaultModel || "gpt-image-2").trim();
  node.x = Math.round(planNumber(action.x, center.x));
  node.y = Math.round(planNumber(action.y, center.y));
  node.z = ++canvasState.nextZ;
  applyTaskModelDefaults(node, { modeChanged: true, modelChanged: true });
  applyAssistantTaskFields(node, action);
  canvasState.nodes.push(node);
  touchedIds.add(node.id);
  return true;
}

function applyAssistantCreateVideoTask(action, touchedIds) {
  const center = getViewportCenterWorld();
  const node = createDefaultVideoTaskNode();
  node.id = assistantPlannedNodeId(action) || node.id;
  node.prompt = String(action.prompt || "").trim();
  node.model = isDreaminaVideoModelName(action.model) ? action.model : node.model;
  node.x = Math.round(planNumber(action.x, center.x));
  node.y = Math.round(planNumber(action.y, center.y));
  node.z = ++canvasState.nextZ;
  if (dreaminaVideoRatioOptions.some(([value]) => value === action.size)) node.size = action.size;
  if (dreaminaVideoResolutionOptions.some(([value]) => value === action.quality)) node.quality = action.quality;
  if (action.n || action.count) node.n = String(action.n || action.count);
  canvasState.nodes.push(node);
  touchedIds.add(node.id);
  return true;
}

function applyAssistantCreateNote(action, touchedIds) {
  const center = getViewportCenterWorld();
  const width = clamp(Math.round(planNumber(action.width, defaultNoteWidth)), minNoteWidth, maxNoteWidth);
  const height = clamp(Math.round(planNumber(action.height, defaultNoteHeight)), minNoteHeight, maxNoteHeight);
  const node = {
    id: assistantPlannedNodeId(action) || createId(),
    type: "note",
    text: String(action.text || "").trim(),
    fontSize: clamp(Math.round(planNumber(action.fontSize, 22)), minNoteFontSize, maxNoteFontSize),
    color: normalizeAssistantColor(action.color, defaultNoteColorForTheme()),
    width,
    height,
    x: Math.round(planNumber(action.x, center.x)),
    y: Math.round(planNumber(action.y, center.y)),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };
  canvasState.nodes.push(node);
  touchedIds.add(node.id);
  return true;
}

function applyAssistantMoveNode(action, touchedIds) {
  const node = canvasState.nodes.find((item) => item.id === action.id);
  if (!node) return false;
  node.x = Math.round(planNumber(action.x, node.x));
  node.y = Math.round(planNumber(action.y, node.y));
  node.z = ++canvasState.nextZ;
  touchedIds.add(node.id);
  return true;
}

function applyAssistantMoveNodes(action, touchedIds) {
  const items = Array.isArray(action.items) ? action.items : [];
  let changed = 0;
  for (const item of items.slice(0, 40)) {
    if (applyAssistantMoveNode(item, touchedIds)) changed += 1;
  }
  return changed > 0;
}

function applyAssistantUpdateTask(action, touchedIds) {
  const node = canvasState.nodes.find((item) => item.id === action.id && (item.type === "task" || item.type === "video-task"));
  if (!node) return false;

  if (node.type === "video-task") {
    if (typeof action.prompt === "string") node.prompt = action.prompt.trim();
    if (isDreaminaVideoModelName(action.model)) node.model = action.model;
    if (dreaminaVideoRatioOptions.some(([value]) => value === action.size)) node.size = action.size;
    if (dreaminaVideoResolutionOptions.some(([value]) => value === action.quality)) node.quality = action.quality;
    if (action.n) node.n = String(action.n);
  } else {
    if (action.mode === "edit" || action.mode === "create") {
      node.mode = action.mode;
      node.endpointPath = defaultEndpointForMode(node.mode);
      node.cacheStatus = node.mode === "edit" ? (node.cachedImages?.length ? "ready" : "pending") : "none";
    }
    if (typeof action.prompt === "string") node.prompt = action.prompt.trim();
    if (typeof action.model === "string" && action.model.trim()) node.model = action.model.trim();
    applyTaskModelDefaults(node, { modeChanged: true, modelChanged: true });
    applyAssistantTaskFields(node, action);
  }

  node.status = node.status === "running" ? "idle" : node.status;
  node.z = ++canvasState.nextZ;
  touchedIds.add(node.id);
  return true;
}

function applyAssistantUpdateNote(action, touchedIds) {
  const node = canvasState.nodes.find((item) => item.id === action.id && item.type === "note");
  if (!node) return false;
  return applyAssistantNotePatch(node, action, touchedIds);
}

function applyAssistantUpdateNotes(action, touchedIds) {
  const nodes = assistantNoteTargetsFromAction(action);
  if (!nodes.length) return false;

  let changed = 0;
  for (const node of nodes) {
    if (applyAssistantNotePatch(node, action, touchedIds)) changed += 1;
  }
  return changed > 0;
}

function assistantNoteTargetsFromAction(action) {
  const ids = new Set(
    Array.isArray(action.ids)
      ? action.ids.map(String)
      : Array.isArray(action.items)
        ? action.items.map((item) => String(typeof item === "string" ? item : item?.id || "")).filter(Boolean)
        : []
  );
  if (ids.size) return canvasState.nodes.filter((node) => node.type === "note" && ids.has(node.id));

  const scope = String(action.scope || "").trim().toLowerCase();
  if (scope === "selected" || scope === "selection") {
    return canvasState.nodes.filter((node) => node.type === "note" && selectedNodeIds.has(node.id));
  }
  if (scope === "all" || action.all === true) {
    return canvasState.nodes.filter((node) => node.type === "note");
  }
  return [];
}

function applyAssistantNotePatch(node, action, touchedIds) {
  let changed = false;

  if (typeof action.text === "string") {
    node.text = action.text;
    changed = true;
  }
  if (action.color !== undefined) {
    node.color = normalizeAssistantColor(action.color, noteDisplayColor(node));
    changed = true;
  }
  if (action.fontSize !== undefined) {
    node.fontSize = clamp(Math.round(planNumber(action.fontSize, node.fontSize || 22)), minNoteFontSize, maxNoteFontSize);
    changed = true;
  }
  if (action.width !== undefined) {
    node.width = clamp(Math.round(planNumber(action.width, node.width || defaultNoteWidth)), minNoteWidth, maxNoteWidth);
    changed = true;
  }
  if (action.height !== undefined) {
    node.height = clamp(Math.round(planNumber(action.height, node.height || defaultNoteHeight)), minNoteHeight, maxNoteHeight);
    changed = true;
  }

  if (!changed) return false;
  node.z = ++canvasState.nextZ;
  touchedIds.add(node.id);
  return true;
}

function applyAssistantTaskFields(node, action) {
  if (action.n || action.count) node.n = String(action.n || action.count);
  if (action.size && isSizeAllowedForModel(action.size, node.model, node.mode)) node.size = action.size;
  if (typeof action.quality === "string") node.quality = action.quality;
  if (typeof action.format === "string" && formatOptions.some(([value]) => value === action.format)) node.format = action.format;
  node.endpointPath = node.endpointPath || defaultEndpointForMode(node.mode);
}

function applyAssistantSetNodeScale(action, touchedIds) {
  const node = canvasState.nodes.find((item) => item.id === action.id && ["image", "video"].includes(item.type));
  if (!node) return false;
  const min = node.type === "video" ? 0.1 : 0.05;
  node.scale = clamp(planNumber(action.scale, node.scale || defaultImageScale), min, 4);
  node.z = ++canvasState.nextZ;
  touchedIds.add(node.id);
  return true;
}

function applyAssistantOrganizeNodes(action, touchedIds) {
  const ids = new Set(
    Array.isArray(action.ids)
      ? action.ids.map(String)
      : Array.isArray(action.items)
        ? action.items.map((item) => String(item?.id || "")).filter(Boolean)
        : []
  );
  if (!ids.size) {
    if (touchedIds?.size) {
      for (const id of touchedIds) ids.add(id);
    } else if (selectedNodeIds.size) {
      for (const id of selectedNodeIds) ids.add(id);
    } else {
      for (const node of assistantLayoutTargetNodes()) ids.add(node.id);
    }
  }
  const nodes = canvasState.nodes
    .filter((node) => ids.has(node.id))
    .sort((a, b) => (Number(a.x) || 0) - (Number(b.x) || 0) || (Number(a.y) || 0) - (Number(b.y) || 0));
  if (!nodes.length) return false;

  const bounds = computeNodesBounds(nodes) || { x: getViewportCenterWorld().x, y: getViewportCenterWorld().y };
  const gap = clamp(Math.round(planNumber(action.gap, 56)), 24, 180);
  const columns = clamp(Math.round(planNumber(action.columns, Math.ceil(Math.sqrt(nodes.length * 1.2)))), 1, Math.min(8, nodes.length));
  const originX = Math.round(planNumber(action.originX, bounds.x));
  const originY = Math.round(planNumber(action.originY, bounds.y));
  const normalizeMedia = action.normalizeMedia !== false;

  if (normalizeMedia) {
    for (const node of nodes) normalizeAssistantLayoutMediaScale(node, action);
  }

  layoutAssistantNodeMasonry(nodes, {
    x: originX,
    y: originY,
    columns,
    gap,
    touchedIds
  });

  return true;
}

function applyAssistantOrganizeGroups(action, touchedIds) {
  const groups = normalizeAssistantPlanGroups(action);
  if (!groups.length) return false;

  const uniqueIds = new Set(groups.flatMap((group) => group.ids));
  const allNodes = canvasState.nodes.filter((node) => uniqueIds.has(node.id));
  if (!allNodes.length) return false;

  const bounds = computeNodesBounds(allNodes) || { x: getViewportCenterWorld().x, y: getViewportCenterWorld().y };
  const gap = clamp(Math.round(planNumber(action.gap, 52)), 24, 180);
  const groupGap = clamp(Math.round(planNumber(action.groupGap, 180)), 80, 520);
  const originX = Math.round(planNumber(action.originX, bounds.x));
  const originY = Math.round(planNumber(action.originY, bounds.y));
  const maxMediaLongSide = clamp(Math.round(planNumber(action.maxMediaLongSide, 240)), 120, 720);
  const labelFontSize = clamp(Math.round(planNumber(action.labelFontSize, 46)), 20, maxNoteFontSize);
  const labelColor = normalizeAssistantColor(action.labelColor, defaultNoteColorForTheme());
  const labelHeight = Math.max(72, Math.round(labelFontSize * 1.8));
  const orientation = String(action.orientation || "horizontal") === "vertical" ? "vertical" : "horizontal";

  if (action.normalizeMedia !== false) {
    for (const node of allNodes) normalizeAssistantLayoutMediaScale(node, { ...action, maxMediaLongSide });
  }

  let cursorX = originX;
  let cursorY = originY;
  let appliedGroups = 0;

  for (const group of groups) {
    const nodes = group.ids
      .map((id) => canvasState.nodes.find((node) => node.id === id))
      .filter(Boolean);
    if (!nodes.length) continue;

    const columns = clamp(
      Math.round(planNumber(group.columns, Math.ceil(Math.sqrt(nodes.length * 1.15)))),
      1,
      Math.min(6, nodes.length)
    );
    const layout = measureAssistantMasonry(nodes, columns, gap);
    const labelWidth = clamp(Math.max(layout.width, 220), minNoteWidth, maxNoteWidth);
    const label = createAssistantGroupLabel(group.title || `分组 ${appliedGroups + 1}`, {
      x: cursorX,
      y: cursorY,
      width: labelWidth,
      height: labelHeight,
      fontSize: labelFontSize,
      color: labelColor
    });
    canvasState.nodes.push(label);
    touchedIds.add(label.id);

    const result = layoutAssistantNodeMasonry(nodes, {
      x: cursorX,
      y: cursorY + labelHeight + 28,
      columns,
      gap,
      touchedIds
    });
    const groupWidth = Math.max(labelWidth, result.width);
    const groupHeight = labelHeight + 28 + result.height;
    if (orientation === "vertical") {
      cursorY += groupHeight + groupGap;
    } else {
      cursorX += groupWidth + groupGap;
    }
    appliedGroups += 1;
  }

  return appliedGroups > 0;
}

function normalizeAssistantPlanGroups(action) {
  const groups = Array.isArray(action.groups) ? action.groups : Array.isArray(action.items) ? action.items : [];
  const seen = new Set();
  return groups
    .map((group, index) => {
      const ids = [];
      const rawIds = Array.isArray(group?.ids) ? group.ids : Array.isArray(group?.items) ? group.items : [];
      for (const item of rawIds) {
        const id = String(typeof item === "string" ? item : item?.id || "");
        if (!id || seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
      }
      return {
        title: String(group?.title || group?.name || `分组 ${index + 1}`).trim(),
        ids,
        columns: group?.columns
      };
    })
    .filter((group) => group.ids.length);
}

function createAssistantGroupLabel(text, options) {
  return {
    id: createId(),
    type: "note",
    text: String(text || "分组").trim(),
    fontSize: options.fontSize,
    color: options.color,
    width: options.width,
    height: options.height,
    x: Math.round(options.x),
    y: Math.round(options.y),
    z: ++canvasState.nextZ,
    createdAt: new Date().toISOString()
  };
}

function measureAssistantMasonry(nodes, columns, gap) {
  const entries = nodes.map((node) => ({ node, bounds: getAssistantLayoutBounds(node) }));
  const columnWidth = Math.max(...entries.map((entry) => entry.bounds.width), 150);
  const columnHeights = Array.from({ length: columns }, () => 0);
  for (const entry of entries) {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    columnHeights[column] += Math.ceil(entry.bounds.height) + gap;
  }
  const height = Math.max(...columnHeights.map((value) => Math.max(0, value - gap)), 0);
  return {
    width: columns * columnWidth + (columns - 1) * gap,
    height,
    columnWidth,
    entries
  };
}

function layoutAssistantNodeMasonry(nodes, options) {
  const columns = clamp(Math.round(options.columns || 1), 1, Math.max(1, nodes.length));
  const gap = clamp(Math.round(options.gap || 52), 24, 180);
  const measured = measureAssistantMasonry(nodes, columns, gap);
  const columnHeights = Array.from({ length: columns }, () => 0);

  for (const entry of measured.entries) {
    const column = columnHeights.indexOf(Math.min(...columnHeights));
    entry.node.x = Math.round(options.x + column * (measured.columnWidth + gap));
    entry.node.y = Math.round(options.y + columnHeights[column]);
    entry.node.z = ++canvasState.nextZ;
    columnHeights[column] += Math.ceil(entry.bounds.height) + gap;
    options.touchedIds?.add(entry.node.id);
  }

  return {
    width: measured.width,
    height: Math.max(...columnHeights.map((value) => Math.max(0, value - gap)), 0)
  };
}

function normalizeAssistantLayoutMediaScale(node, action = {}) {
  if (!["image", "video"].includes(node.type)) return;
  const defaultScale = node.type === "video" ? defaultVideoScale : defaultImageScale;
  const minScale = node.type === "video" ? 0.1 : 0.05;
  const width = Math.max(1, Number(node.originalWidth) || (node.type === "video" ? defaultVideoWidth : 512));
  const height = Math.max(1, Number(node.originalHeight) || (node.type === "video" ? defaultVideoHeight : 512));
  const currentScale = clamp(Number(node.scale) || defaultScale, minScale, 4);
  const maxLongSide = clamp(Math.round(planNumber(action.maxMediaLongSide, node.type === "video" ? 320 : 280)), 120, 720);
  const targetScale = Math.min(currentScale, maxLongSide / Math.max(width, height));
  node.scale = clamp(targetScale, minScale, 4);
}

function getAssistantLayoutBounds(node) {
  if (node.type === "image") {
    const scale = Number(node.scale) || defaultImageScale;
    return {
      x: node.x,
      y: node.y,
      width: Math.max(1, Number(node.originalWidth) || 512) * scale,
      height: Math.max(1, Number(node.originalHeight) || 512) * scale
    };
  }
  if (node.type === "video") {
    const scale = Number(node.scale) || defaultVideoScale;
    return {
      x: node.x,
      y: node.y,
      width: Math.max(1, Number(node.originalWidth) || defaultVideoWidth) * scale,
      height: Math.max(1, Number(node.originalHeight) || defaultVideoHeight) * scale
    };
  }
  return getNodeBounds(node);
}

function planNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeAssistantColor(value, fallback = defaultNoteColorForTheme()) {
  const text = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/iu.test(text)) return text.toLowerCase();
  if (/^#[0-9a-f]{3}$/iu.test(text)) {
    return `#${text.slice(1).split("").map((char) => `${char}${char}`).join("")}`.toLowerCase();
  }

  const normalized = text.toLowerCase();
  const namedColors = {
    白: "#ffffff",
    白色: "#ffffff",
    white: "#ffffff",
    黑: "#000000",
    黑色: "#000000",
    black: "#000000",
    红: "#ef4444",
    红色: "#ef4444",
    red: "#ef4444",
    蓝: "#3b82f6",
    蓝色: "#3b82f6",
    blue: "#3b82f6",
    绿: "#22c55e",
    绿色: "#22c55e",
    green: "#22c55e",
    黄: "#facc15",
    黄色: "#facc15",
    yellow: "#facc15",
    紫: "#a855f7",
    紫色: "#a855f7",
    purple: "#a855f7",
    粉: "#ec4899",
    粉色: "#ec4899",
    pink: "#ec4899",
    橙: "#f97316",
    橙色: "#f97316",
    orange: "#f97316",
    灰: "#94a3b8",
    灰色: "#94a3b8",
    gray: "#94a3b8",
    grey: "#94a3b8",
    青: "#14b8a6",
    青色: "#14b8a6",
    teal: "#14b8a6"
  };
  return namedColors[normalized] || fallback;
}

function assistantStorageKey(projectId = currentProjectId) {
  return `${assistantStorageKeyPrefix}:${normalizeProjectId(projectId)}`;
}

async function loadAssistantChat() {
  const localMessages = readAssistantLocalMessages();
  const diskMessages = await readAssistantChatBackup();
  const restoredFromLocal =
    localMessages.length &&
    (!diskMessages.length || newestAssistantMessageTime(localMessages) > newestAssistantMessageTime(diskMessages));
  assistantMessages = restoredFromLocal ? localMessages : diskMessages;

  const migrated = migrateAssistantSkillAttachmentsFromChat();
  const repaired = repairAssistantSummaryOnlyPlansFromHistory();
  if (restoredFromLocal || migrated || repaired) saveAssistantChat({ immediate: restoredFromLocal || repaired });
  else if (diskMessages.length) saveAssistantChat({ backup: false });

  renderAssistantMessages();
  renderAssistantSkillLibrary();
}

function newestAssistantMessageTime(messages = []) {
  return Math.max(
    0,
    ...messages.map((message) => {
      const time = Date.parse(message.createdAt || "");
      return Number.isFinite(time) ? time : 0;
    })
  );
}

function readAssistantLocalMessages(projectId = currentProjectId) {
  let changed = false;
  try {
    const raw = localStorage.getItem(assistantStorageKey(projectId)) || "[]";
    const parsed = JSON.parse(raw);
    const messages = Array.isArray(parsed)
      ? parsed
          .filter((item) => item?.content)
          .map((item) => {
            const normalized = normalizeAssistantChatMessage(item);
            if (!item.id) changed = true;
            return normalized;
          })
          .slice(-80)
      : [];
    if (changed) {
      localStorage.setItem(
        assistantStorageKey(projectId),
        JSON.stringify(messages.slice(-80).map(serializeAssistantMessageForStorage))
      );
    }
    return messages;
  } catch {
    return [];
  }
}

async function readAssistantChatBackup(projectId = currentProjectId) {
  try {
    const response = await fetch(`/api/assistant/chat-backup?projectId=${encodeURIComponent(projectId)}`);
    const data = await readJsonResponse(response);
    if (!response.ok || data.parseError) throw new Error(data.error || "助手聊天备份读取失败");
    const messages = Array.isArray(data.backup?.messages) ? data.backup.messages : [];
    return messages.map(normalizeAssistantChatMessage).filter((message) => message.content).slice(-80);
  } catch {
    return [];
  }
}

function saveAssistantChat(options = {}) {
  const messages = assistantMessages.slice(-80).map(serializeAssistantMessageForStorage);
  try {
    localStorage.setItem(
      assistantStorageKey(currentProjectId),
      JSON.stringify(messages)
    );
  } catch {
    // Chat history is helpful but not required for canvas editing.
  }
  if (options.backup !== false) {
    scheduleAssistantChatBackup(messages, currentProjectId, { immediate: Boolean(options.immediate) });
  }
}

function scheduleAssistantChatBackup(messages, projectId = currentProjectId, options = {}) {
  const payload = {
    version: 1,
    projectId: normalizeProjectId(projectId),
    messages
  };
  if (assistantChatBackupTimer) window.clearTimeout(assistantChatBackupTimer);
  const persist = () => {
    assistantChatBackupTimer = 0;
    persistAssistantChatBackup(payload);
  };
  if (options.immediate) persist();
  else assistantChatBackupTimer = window.setTimeout(persist, assistantChatBackupDelayMs);
}

async function persistAssistantChatBackup(payload) {
  try {
    await fetch(`/api/assistant/chat-backup?projectId=${encodeURIComponent(payload.projectId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    // localStorage remains as the immediate fallback if disk backup is unavailable.
  }
}

function serializeAssistantMessageForStorage(message) {
  const attachments = Array.isArray(message.attachments)
    ? message.attachments.filter((attachment) => attachment?.type !== "skill").map((attachment) => {
        if (attachment.type === "image") {
          const { dataUrl, ...metadata } = attachment;
          return metadata;
        }
        return attachment;
      })
    : [];
  return { ...message, attachments };
}

function normalizeAssistantChatMessage(message) {
  const role = ["assistant", "system", "user"].includes(message?.role) ? message.role : "user";
  let content = String(message?.content || "");
  let plan = isPlainObject(message?.plan) ? clonePlainValue(message.plan) : null;
  if (role === "assistant" && !message?.error) {
    const extractedPlan = extractAssistantPlanFromContent(content);
    if (!plan && extractedPlan.plan) plan = extractedPlan.plan;
    if (extractedPlan.plan) content = extractedPlan.content || plan?.summary || "";
  }

  return {
    id: String(message?.id || createId()),
    role,
    content,
    attachments: Array.isArray(message?.attachments) ? clonePlainValue(message.attachments) : [],
    plan,
    error: Boolean(message?.error),
    stopped: Boolean(message?.stopped),
    retryOf: String(message?.retryOf || ""),
    mode: message?.mode === "action_plan" ? "action_plan" : "chat",
    createdAt: message?.createdAt || new Date().toISOString()
  };
}

function migrateAssistantSkillAttachmentsFromChat() {
  const records = [];
  let changed = false;
  assistantMessages = assistantMessages.map((message) => {
    const attachments = Array.isArray(message.attachments) ? message.attachments : [];
    const skillAttachments = attachments.filter((attachment) => attachment?.type === "skill" && attachment.text);
    if (!skillAttachments.length) return message;
    records.push(...skillAttachments);
    changed = true;
    return {
      ...message,
      attachments: attachments.filter((attachment) => attachment?.type !== "skill")
    };
  });

  if (records.length) upsertAssistantSkillRecords(records, { enabled: true });
  if (changed) return true;
  return false;
}

function repairAssistantSummaryOnlyPlansFromHistory() {
  let changed = false;
  for (let index = 0; index < assistantMessages.length; index += 1) {
    const message = assistantMessages[index];
    if (
      message?.role !== "assistant" ||
      message.error ||
      message.plan?.actions?.length ||
      !isAssistantPlanSummaryOnly(message.content)
    ) {
      continue;
    }

    const sourceUser = findPreviousAssistantUserMessage(index);
    const plan = sourceUser ? createAssistantSummaryFallbackPlan(sourceUser.content, message.content) : null;
    if (!plan?.actions?.length) continue;

    message.plan = plan;
    message.content = plan.summary;
    changed = true;
  }
  return changed;
}

function findPreviousAssistantUserMessage(beforeIndex) {
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    const message = assistantMessages[index];
    if (message?.role === "user" && String(message.content || "").trim()) return message;
  }
  return null;
}

function buildAssistantContext(options = {}) {
  const compact = Boolean(options.compact);
  const nodeLimit = compact ? 80 : 24;
  const promptLimit = compact ? 520 : 1200;
  const selected = canvasState.nodes.filter((node) => selectedNodeIds.has(node.id));
  const counts = countCanvasNodeTypes();
  const recentNodes = [...canvasState.nodes]
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")) || (Number(b.z) || 0) - (Number(a.z) || 0))
    .slice(0, nodeLimit);

  return {
    project: {
      id: currentProjectId,
      name: currentProjectName
    },
    canvas: {
      nodeCount: canvasState.nodes.length,
      counts,
      theme: currentCanvasTheme(),
      selectedCount: selected.length,
      viewport: {
        zoom: Number(canvasState.viewport.zoom) || 1,
        x: Math.round(Number(canvasState.viewport.x) || 0),
        y: Math.round(Number(canvasState.viewport.y) || 0)
      }
    },
    selection: selected.slice(0, nodeLimit).map((node) => summarizeNodeForAssistant(node, promptLimit)),
    recentNodes: recentNodes.map((node) => summarizeNodeForAssistant(node, promptLimit))
  };
}

function countCanvasNodeTypes() {
  return canvasState.nodes.reduce((acc, node) => {
    acc[node.type || "task"] = (acc[node.type || "task"] || 0) + 1;
    return acc;
  }, {});
}

function summarizeNodeForAssistant(node, textLimit = 1200) {
  const bounds = getNodeBounds(node);
  const common = {
    id: node.id,
    type: node.type || "task",
    x: Math.round(Number(node.x) || 0),
    y: Math.round(Number(node.y) || 0),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    createdAt: node.createdAt || ""
  };

  if (node.type === "task") {
    return {
      ...common,
      mode: node.mode,
      prompt: trimAssistantText(node.prompt, textLimit),
      model: node.model,
      size: node.size,
      count: node.n,
      status: node.status,
      error: trimAssistantText(node.error, 400),
      resultCount: node.images?.length || 0,
      referenceCount: node.cachedImages?.length || fileStore.get(node.id)?.images?.length || 0
    };
  }

  if (node.type === "video-task") {
    return {
      ...common,
      prompt: trimAssistantText(node.prompt, textLimit),
      model: node.model,
      ratio: node.size,
      duration: node.n,
      resolution: node.quality,
      status: node.status,
      error: trimAssistantText(node.error, 400),
      resultCount: node.videos?.length || 0,
      referenceCount: node.cachedImages?.length || fileStore.get(node.id)?.images?.length || 0
    };
  }

  if (node.type === "image") {
    const generation = getImageGeneration(node);
    return {
      ...common,
      filename: node.image?.filename || "",
      dimensions: `${node.originalWidth || "?"}x${node.originalHeight || "?"}`,
      displayScale: Number(node.scale) || defaultImageScale,
      prompt: trimAssistantText(generation?.prompt || getImagePrompt(node), textLimit),
      model: generation?.model || node.image?.model || "",
      size: generation?.size || node.image?.size || "",
      sourceTaskId: node.sourceTaskId || ""
    };
  }

  if (node.type === "video") {
    return {
      ...common,
      filename: node.video?.filename || "",
      dimensions: `${node.originalWidth || "?"}x${node.originalHeight || "?"}`,
      displayScale: Number(node.scale) || defaultVideoScale,
      prompt: trimAssistantText(node.video?.prompt || node.video?.generation?.prompt || "", textLimit),
      model: node.video?.model || node.video?.generation?.model || "",
      sourceTaskId: node.sourceTaskId || ""
    };
  }

  if (node.type === "note") {
    return {
      ...common,
      text: trimAssistantText(node.text, textLimit),
      fontSize: node.fontSize,
      color: node.color,
      width: node.width,
      height: node.height
    };
  }

  if (node.type === "region") {
    return {
      ...common,
      title: node.title || "区域规划",
      color: node.color || "#2f8f8a"
    };
  }

  if (node.type === "chatgpt") {
    return {
      ...common,
      url: node.url || chatGptUrl,
      width: node.width,
      height: node.height
    };
  }

  return {
    ...common,
    prompt: trimAssistantText(node.prompt, 1200),
    model: node.model || ""
  };
}

function trimAssistantText(value, maxLength = 1000) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
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

function commitSelectionScaleInput() {
  if (!selectionScaleInput || document.activeElement !== selectionScaleInput) return;
  const raw = String(selectionScaleInput.value || "").trim();
  if (!raw) {
    updateSelectionToolbar();
    return;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    updateSelectionToolbar();
    return;
  }
  selectionScaleInput.value = String(Math.round(clamp(value, 5, 400)));
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
    referenceImageNodeIds: Array.isArray(generation.referenceImageNodeIds) ? dedupeStrings(generation.referenceImageNodeIds) : [],
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
  task.referenceImageNodeIds = dedupeStrings([
    ...(generation.referenceImageNodeIds || []),
    ...task.cachedImages.map((image) => image?.sourceImageNodeId || "")
  ]);
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
    if (assistantCopyMenu && !assistantCopyMenu.hidden && !assistantCopyMenu.contains(event.target)) {
      hideAssistantCopyMenu();
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

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "c") {
    if (hasActiveTextSelection()) return false;
    if (isInteractiveElement(event.target)) return false;
    event.preventDefault();
    copySelectedNodesToClipboard();
    return true;
  }

  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z") {
    if (isEditableShortcutTarget(event.target)) return false;
    event.preventDefault();
    undoCanvasChange();
    return true;
  }

  if (isInteractiveElement(event.target)) return false;

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
      const node = isVideo
        ? createLocalVideoNode(asset, dim, cursorX, cursorY)
        : createLocalImageNode(asset, dim, cursorX, cursorY);
      const scale = Number(node.scale) || (isVideo ? defaultVideoScale : defaultImageScale);

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
  const scale = defaultScaleForImageDimensions(dim.width, dim.height, image.size);

  return {
    id: createId(),
    type: "image",
    image,
    sourceTaskId: "",
    sourceImageKey: asset.filename || image.url,
    originalWidth: dim.width,
    originalHeight: dim.height,
    scale,
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
  if (event.target.closest(".minimap-dock")) return;
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
  if (event.target.closest(".minimap-dock")) return;
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
  renderReferenceLinks();
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
  canvasStage.append(createReferenceLinkLayer());

  for (const node of canvasState.nodes) {
    canvasStage.append(createCanvasNode(node));
  }

  renderReferenceLinks();
  emptyState.hidden = canvasState.nodes.length > 0;
  updateCanvasMeta();
  updateSelectionToolbar();
  updateMinimap();
  syncChatGptHostSoon();
}

function updateNode(node) {
  const previous = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  if (previous) previous.replaceWith(createCanvasNode(node));
  renderReferenceLinks();
  syncChatGptHostSoon();
}

function createReferenceLinkLayer() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("reference-link-layer");
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

function renderReferenceLinks() {
  const layer = canvasStage?.querySelector?.(".reference-link-layer");
  if (!layer) return;
  layer.replaceChildren();

  const links = referenceLinksForCanvas();
  if (!links.length) return;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.id = "reference-link-arrow";
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  marker.append(arrow);
  defs.append(marker);
  layer.append(defs);

  for (const link of links) {
    const sourceRect = getNodeVisualWorldRect(link.sourceId);
    const targetRect = getNodeVisualWorldRect(link.targetId);
    if (!sourceRect || !targetRect) continue;
    const { start, end } = referenceLinkAnchors(sourceRect, targetRect);
    const midX = start.x + (end.x - start.x) * 0.5;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("reference-link-path");
    path.setAttribute("d", `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`);

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = "参考图连接";
    path.append(title);
    layer.append(path);
  }
}

function referenceLinksForCanvas() {
  const imageIds = new Set(canvasState.nodes.filter((node) => node.type === "image").map((node) => node.id));
  const links = [];
  for (const target of canvasState.nodes) {
    if (!["task", "video-task"].includes(target.type)) continue;
    if (target.type === "task" && target.mode !== "edit") continue;
    for (const sourceId of referenceSourceNodeIdsForTask(target)) {
      if (!imageIds.has(sourceId)) continue;
      links.push({ sourceId, targetId: target.id });
    }
  }
  return links;
}

function referenceSourceNodeIdsForTask(node) {
  const ids = [
    ...(node.cachedImages || []).map((image) => image?.sourceImageNodeId || ""),
    ...(Array.isArray(node.referenceImageNodeIds) ? node.referenceImageNodeIds : [])
  ];
  return dedupeStrings(ids);
}

function referenceLinkAnchors(sourceRect, targetRect) {
  const sourceCenter = {
    x: sourceRect.x + sourceRect.width / 2,
    y: sourceRect.y + sourceRect.height / 2
  };
  const targetCenter = {
    x: targetRect.x + targetRect.width / 2,
    y: targetRect.y + targetRect.height / 2
  };
  const sourceOnLeft = sourceCenter.x <= targetCenter.x;
  return {
    start: {
      x: sourceOnLeft ? sourceRect.x + sourceRect.width : sourceRect.x,
      y: sourceCenter.y
    },
    end: {
      x: sourceOnLeft ? targetRect.x : targetRect.x + targetRect.width,
      y: targetCenter.y
    }
  };
}

function getNodeVisualWorldRect(nodeId) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node) return null;
  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === nodeId);
  if (!tile) return getNodeBounds(node);

  const rect = tile.getBoundingClientRect();
  const topLeft = getWorldPointFromClient(rect.left, rect.top);
  const bottomRight = getWorldPointFromClient(rect.right, rect.bottom);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: Math.max(1, bottomRight.x - topLeft.x),
    height: Math.max(1, bottomRight.y - topLeft.y)
  };
}

function createCanvasNode(node) {
  if (node.type === "region") return createRegionNode(node);
  if (node.type === "note") return createNoteNode(node);
  if (node.type === "image") return createImageNode(node);
  if (node.type === "video") return createVideoNode(node);
  if (node.type === "video-task") return createVideoTaskNode(node);
  if (node.type === "chatgpt") return createChatGptNode(node);
  return createTaskNode(node);
}

function createRegionNode(node) {
  const selected = selectedNodeIds.has(node.id);
  node.width = clamp(Number(node.width) || defaultRegionWidth, minRegionWidth, maxRegionWidth);
  node.height = clamp(Number(node.height) || defaultRegionHeight, minRegionHeight, maxRegionHeight);
  node.color = normalizeRegionColor(node.color);

  const tile = document.createElement("article");
  tile.className = ["canvas-node", "region-node", selected ? "is-selected" : ""].filter(Boolean).join(" ");
  tile.dataset.nodeId = node.id;
  tile.style.left = `${node.x}px`;
  tile.style.top = `${node.y}px`;
  tile.style.width = `${node.width}px`;
  tile.style.height = `${node.height}px`;
  tile.style.zIndex = Number.isFinite(Number(node.z)) ? Number(node.z) : 0;
  tile.style.setProperty("--region-color", node.color);
  tile.style.setProperty("--region-fill", colorToRgba(node.color, 0.14));
  tile.style.setProperty("--region-fill-strong", colorToRgba(node.color, 0.22));
  if (node.locked) tile.classList.add("is-locked");

  const label = document.createElement("div");
  label.className = "region-label";
  label.textContent = node.title || (node.locked ? "区域规划 · 已锁定" : "区域规划");
  label.title = node.locked ? "区域已锁定，点击标题可选中后解锁" : "区域规划";
  label.addEventListener("pointerdown", (event) => {
    if (!node.locked) return;
    event.preventDefault();
    event.stopPropagation();
    selectOnly(node.id);
  });

  tile.append(label);

  if (selected) {
    tile.append(createRegionToolbar(node));
    if (!node.locked) tile.append(createRegionResizeHandle(node));
  }

  tile.addEventListener("pointerdown", (event) => {
    if (node.locked) {
      event.preventDefault();
      event.stopPropagation();
      selectOnly(node.id);
      return;
    }
    startNodeDrag(event, node.id);
  });
  return tile;
}

function createRegionToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "region-toolbar";
  toolbar.addEventListener("pointerdown", (event) => event.stopPropagation());

  const title = document.createElement("input");
  title.type = "text";
  title.value = node.title || "";
  title.placeholder = "区域名称";
  title.title = "区域名称";
  title.addEventListener("input", () => {
    node.title = title.value;
    const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
    const label = tile?.querySelector(".region-label");
    if (label) label.textContent = node.title || (node.locked ? "区域规划 · 已锁定" : "区域规划");
    saveCanvasState();
  });

  const color = document.createElement("input");
  color.type = "color";
  color.value = normalizeRegionColor(node.color);
  color.title = "区域颜色";
  color.addEventListener("input", () => {
    node.color = color.value;
    updateNode(node);
    saveCanvasState();
  });

  const duplicate = document.createElement("button");
  duplicate.type = "button";
  duplicate.textContent = "复制";
  duplicate.addEventListener("click", () => duplicateNode(node.id));

  const lock = document.createElement("button");
  lock.type = "button";
  lock.textContent = node.locked ? "解锁" : "锁定";
  lock.title = node.locked ? "恢复区域内点击选择" : "锁定后区域内部可双击创建节点";
  lock.addEventListener("click", () => {
    node.locked = !node.locked;
    updateNode(node);
    saveCanvasState();
    showToast(node.locked ? "区域已锁定，区域内部可以双击创建节点" : "区域已解锁");
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "删除";
  remove.addEventListener("click", () => deleteNodes([node.id]));

  toolbar.append(title, color, lock, duplicate, remove);
  return toolbar;
}

function createRegionResizeHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "region-resize-handle";
  handle.title = "拖动调整区域大小";
  handle.setAttribute("aria-label", "拖动调整区域大小");
  handle.addEventListener("pointerdown", (event) => startRegionResize(event, node.id));
  return handle;
}

function startRegionResize(event, nodeId) {
  event.preventDefault();
  event.stopPropagation();

  const node = canvasState.nodes.find((item) => item.id === nodeId && item.type === "region");
  if (!node) return;
  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  const start = {
    x: event.clientX,
    y: event.clientY,
    width: Number(node.width) || tile?.offsetWidth || defaultRegionWidth,
    height: Number(node.height) || tile?.offsetHeight || defaultRegionHeight,
    zoom: canvasState.viewport.zoom
  };

  const move = (moveEvent) => {
    const dx = (moveEvent.clientX - start.x) / start.zoom;
    const dy = (moveEvent.clientY - start.y) / start.zoom;
    node.width = Math.round(clamp(start.width + dx, minRegionWidth, maxRegionWidth));
    node.height = Math.round(clamp(start.height + dy, minRegionHeight, maxRegionHeight));
    if (tile) {
      tile.style.width = `${node.width}px`;
      tile.style.height = `${node.height}px`;
    }
    updateMinimap();
    renderReferenceLinks();
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

function normalizeRegionColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/iu.test(text) ? text : "#2f8f8a";
}

function colorToRgba(hex, alpha) {
  const color = normalizeRegionColor(hex).replace("#", "");
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${clamp(Number(alpha) || 0, 0, 1)})`;
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

function displayedMediaScalePercent(node, fallbackScale) {
  return String(Math.round((Number(node.scale) || fallbackScale) * 100));
}

function commitMediaScaleInput(node, input, options = {}) {
  const minScale = Number(options.minScale) || 0.05;
  const fallbackScale = Number(options.fallbackScale) || 1;
  const raw = String(input.value || "").trim();
  const currentScale = Number(node.scale) || fallbackScale;
  if (!raw) {
    input.value = String(Math.round(currentScale * 100));
    return;
  }

  const value = Number(raw);
  if (!Number.isFinite(value)) {
    input.value = String(Math.round(currentScale * 100));
    return;
  }

  const nextPercent = Math.round(clamp(value, minScale * 100, 400));
  node.scale = nextPercent / 100;
  input.value = String(nextPercent);

  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  const fallbackWidth = node.type === "video" ? defaultVideoWidth : 512;
  const fallbackHeight = node.type === "video" ? defaultVideoHeight : 512;
  const width = Math.max(1, Number(node.originalWidth) || fallbackWidth);
  const height = Math.max(1, Number(node.originalHeight) || fallbackHeight);
  if (tile) {
    tile.style.width = `${Math.round(width * node.scale)}px`;
    tile.style.height = `${Math.round(height * node.scale)}px`;
  }

  updateSelectionToolbar();
  saveCanvasState();
  updateMinimap();
  renderReferenceLinks();
  syncChatGptHostSoon();
}

function bindMediaScaleInput(input, node, options) {
  input.addEventListener("pointerdown", (event) => event.stopPropagation());
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    commitMediaScaleInput(node, input, options);
    input.select();
  });
  input.addEventListener("blur", () => commitMediaScaleInput(node, input, options));
}

function createVideoToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "image-toolbar video-toolbar";

  const scaleInput = document.createElement("input");
  scaleInput.type = "number";
  scaleInput.min = "10";
  scaleInput.max = "400";
  scaleInput.step = "5";
  scaleInput.value = displayedMediaScalePercent(node, defaultVideoScale);
  scaleInput.title = "缩放百分比";
  bindMediaScaleInput(scaleInput, node, {
    minScale: 0.1,
    fallbackScale: defaultVideoScale
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
    renderReferenceLinks();
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
  const width = Math.max(1, Number(node.originalWidth) || 512);
  const height = Math.max(1, Number(node.originalHeight) || 512);
  const scale = Number(node.scale) || defaultScaleForImageNode(node, { width, height });

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
    const previousDefaultScale = defaultScaleForImageNode(node, {
      width: node.originalWidth || width,
      height: node.originalHeight || height
    });
    const currentScale = Number(node.scale);
    const shouldRefreshDefaultScale =
      !Number.isFinite(currentScale) ||
      Math.abs(currentScale - defaultImageScale) < 0.0001 ||
      Math.abs(currentScale - previousDefaultScale) < 0.0001;
    node.originalWidth = img.naturalWidth;
    node.originalHeight = img.naturalHeight;
    if (shouldRefreshDefaultScale) {
      node.scale = defaultScaleForImageNode(node, {
        width: node.originalWidth,
        height: node.originalHeight
      });
    }
    const nextScale = Number(node.scale) || defaultScaleForImageNode(node, {
      width: node.originalWidth,
      height: node.originalHeight
    });
    tile.style.width = `${Math.round(node.originalWidth * nextScale)}px`;
    tile.style.height = `${Math.round(node.originalHeight * nextScale)}px`;
    saveCanvasState();
    updateMinimap();
    renderReferenceLinks();
  });

  tile.append(img, createReferenceConnectHandle(node));

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

function createReferenceConnectHandle(node) {
  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "reference-connect-handle";
  handle.title = "拖到生图或视频节点，添加为参考图";
  handle.setAttribute("aria-label", "拖动连线添加参考图");
  handle.addEventListener("pointerdown", (event) => startReferenceConnection(event, node.id));
  return handle;
}

function createImageToolbar(node) {
  const toolbar = document.createElement("div");
  toolbar.className = "image-toolbar";

  const scaleInput = document.createElement("input");
  scaleInput.type = "number";
  scaleInput.min = "5";
  scaleInput.max = "400";
  scaleInput.step = "5";
  scaleInput.value = displayedMediaScalePercent(node, 1);
  scaleInput.title = "缩放百分比";
  bindMediaScaleInput(scaleInput, node, {
    minScale: 0.05,
    fallbackScale: 1
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "100%";
  reset.addEventListener("click", () => {
    scaleInput.value = "100";
    commitMediaScaleInput(node, scaleInput, {
      minScale: 0.05,
      fallbackScale: 1
    });
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
    renderReferenceLinks();
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
      const removed = (node.cachedImages || [])[index];
      node.cachedImages = (node.cachedImages || []).filter((_, itemIndex) => itemIndex !== index);
      if (removed?.sourceImageNodeId) {
        node.referenceImageNodeIds = dedupeStrings(node.referenceImageNodeIds || []).filter((id) => id !== removed.sourceImageNodeId);
      }
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
  const pending = pendingReferenceImageCount(node);
  summary.textContent = cached || pending ? `${cached} 张已缓存参考图，${pending} 张待缓存/本次选择` : "未选择参考图时将使用文生视频。";
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

function createNodeIcon(name, className = "") {
  const span = document.createElement("span");
  span.className = ["node-inline-icon", className].filter(Boolean).join(" ");
  span.setAttribute("aria-hidden", "true");
  span.innerHTML = nodeIconSvg(name);
  return span;
}

function nodeIconSvg(name) {
  const icons = {
    "image-generate":
      '<svg viewBox="0 0 24 24"><path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h8A2 2 0 0 1 16.5 6.5v1h1A2 2 0 0 1 19.5 9.5v8a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11Z"/><path d="m6.5 16 3-3 2.2 2.2 2.1-2.1 3.7 3.9"/><path d="M18 3.8v3M16.5 5.3h3M9 8.5h.01"/></svg>',
    "image-edit":
      '<svg viewBox="0 0 24 24"><path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h7A2 2 0 0 1 15.5 6.5v2"/><path d="M4.5 17.5v-11M4.5 17.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5"/><path d="m6.5 16 3-3 2 2"/><path d="M14.5 15.5 19 11l2 2-4.5 4.5-2.5.5.5-2.5Z"/></svg>',
    create:
      '<svg viewBox="0 0 24 24"><path d="M6 5.5h9.5A2.5 2.5 0 0 1 18 8v10.5H6z"/><path d="M18 8h2M19 7v2M9 12h6M12 9v6"/></svg>',
    pencil:
      '<svg viewBox="0 0 24 24"><path d="M5 18.5 6 14l8.8-8.8a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L10 18l-5 1Z"/><path d="m13.5 6.5 4 4"/></svg>',
    spark:
      '<svg viewBox="0 0 24 24"><path d="M12 3.5 14.7 9l5.8 3-5.8 3L12 20.5 9.3 15l-5.8-3 5.8-3L12 3.5Z"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24"><path d="M8 8h10v11H8z"/><path d="M5 16V5h10"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24"><path d="M7 7h10M10 7V5h4v2M9 10v7M15 10v7M8 7l1 12h6l1-12"/></svg>',
    image:
      '<svg viewBox="0 0 24 24"><path d="M5 5h14v14H5z"/><path d="m7 16 3-3 2 2 3-4 2 5"/><path d="M9 9.5h.01"/></svg>',
    mask:
      '<svg viewBox="0 0 24 24"><path d="M5 5h5M14 5h5M5 19h5M14 19h5M5 5v5M19 5v5M5 14v5M19 14v5"/><path d="M9 12h6M12 9v6"/></svg>'
  };
  return icons[name] || icons.image;
}

function createTaskHeader(node) {
  const header = document.createElement("div");
  header.className = "task-header";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = statusText(node.status);

  const titleWrap = document.createElement("div");
  titleWrap.className = "task-title-wrap";
  titleWrap.append(createNodeIcon(node.mode === "edit" ? "image-edit" : "image-generate", "task-title-icon"));

  const title = document.createElement("strong");
  title.className = "task-title";
  title.textContent = providerForModel(node.model) === "dreamina" ? "即梦生图" : node.mode === "edit" ? "图片编辑" : "图片生成";
  titleWrap.append(title);

  const modeTabs = document.createElement("div");
  modeTabs.className = "node-mode-tabs";
  modeTabs.append(createModeButton(node, "create", "创建"), createModeButton(node, "edit", "编辑"));

  const meta = document.createElement("span");
  meta.className = "node-meta";
  meta.textContent = [node.model, node.size, node.format, cacheStatusText(node)].filter(Boolean).join(" · ");

  header.append(status, titleWrap, modeTabs, meta, createTaskActions(node));
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
  const debug = document.createElement("section");
  debug.className = "node-debug";

  const summary = document.createElement("div");
  summary.className = "node-debug-heading";
  summary.textContent = "参数";

  const settings = document.createElement("div");
  settings.className = "node-config-grid";
  const modelField = createTaskModelField(node);

  const advanced = document.createElement("details");
  advanced.className = "node-advanced";
  advanced.open = Boolean(node.debugOpen);
  advanced.addEventListener("toggle", () => {
    node.debugOpen = advanced.open;
    saveCanvasState();
  });
  const advancedSummary = document.createElement("summary");
  advancedSummary.textContent = "高级参数已收起";
  const advancedGrid = document.createElement("div");
  advancedGrid.className = "node-config-grid";

  if (isDreaminaModelName(node.model)) {
    settings.append(modelField, createSelectField("尺寸", node, "size", sizeOptionsForModel(node.model, node.mode)));
  } else {
    settings.append(
      modelField,
      createSelectField("尺寸", node, "size", sizeOptionsForModel(node.model, node.mode)),
      createNumberField("数量", node, "n", { min: 1, max: 10 }),
      createSelectField("质量", node, "quality", qualityOptions)
    );
    advancedGrid.append(
      createSelectField("格式", node, "format", formatOptions),
      createTextField("接口路径", node, "endpointPath")
    );
  }

  if (node.mode === "edit" && !isDreaminaModelName(node.model)) {
    advancedGrid.append(
      createSelectField("背景", node, "background", backgroundOptions),
      createSelectField("审核", node, "moderation", moderationOptions)
    );
  }

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
    imageArea.append(createImagePlaceholder(`${node.images.length} 张图片已放到画布`, "image"));
    return imageArea;
  }

  imageArea.append(createImagePlaceholder(node.error || (node.mode === "edit" ? "等待生成" : "待生成"), node.mode === "edit" ? "mask" : "image"));
  return imageArea;
}

function createImagePlaceholder(text, icon = "image") {
  const placeholder = document.createElement("div");
  placeholder.className = "node-placeholder";
  placeholder.append(createNodeIcon(icon, "node-placeholder-icon"), document.createTextNode(text));
  return placeholder;
}

function createTaskActions(node) {
  const actions = document.createElement("div");
  actions.className = "node-actions";

  const generate = document.createElement("button");
  generate.type = "button";
  generate.className = "node-action-primary";
  generate.append(createNodeIcon("spark", "node-action-icon"), document.createTextNode(node.status === "running" ? "生成中" : "生成"));
  generate.disabled = node.status === "running";
  generate.addEventListener("click", () => generateNode(node.id));

  const duplicate = document.createElement("button");
  duplicate.type = "button";
  duplicate.append(createNodeIcon("copy", "node-action-icon"), document.createTextNode("复制"));
  duplicate.addEventListener("click", () => duplicateNode(node.id));

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "node-action-danger";
  remove.append(createNodeIcon("trash", "node-action-icon"), document.createTextNode("删除"));
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
  button.append(createNodeIcon(mode === "edit" ? "pencil" : "create", "node-mode-icon"), document.createTextNode(label));
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

  const head = document.createElement("div");
  head.className = "edit-assets-head";
  const title = document.createElement("strong");
  title.textContent = "参考输入";
  const hint = document.createElement("span");
  hint.textContent = "支持参考图与蒙版";
  head.append(title, hint);

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

  const cards = document.createElement("div");
  cards.className = "reference-card-grid";
  cards.append(
    createReferenceInputCard({
      title: "参考图",
      hint: imageReferenceStateText(node),
      icon: "image",
      input: imageInput,
      actionText: "选择"
    })
  );
  if (!isDreaminaModelName(node.model)) {
    cards.append(
      createReferenceInputCard({
        title: "蒙版",
        hint: node.cachedMask || node.sessionMask ? "已选" : "可选",
        icon: "mask",
        input: maskInput,
        actionText: "选择"
      })
    );
  }

  const summary = document.createElement("p");
  summary.className = "asset-summary";
  summary.textContent = assetSummaryText(node);

  panel.append(head, cards, referenceActions, thumbnails, summary);

  return panel;
}

function createReferenceInputCard({ title, hint, icon, input, actionText }) {
  const card = document.createElement("label");
  card.className = "reference-input-card";
  card.addEventListener("pointerdown", (event) => event.stopPropagation());

  input.classList.add("reference-file-input");
  input.tabIndex = -1;

  const iconEl = createNodeIcon(icon, "reference-input-icon");
  const copy = document.createElement("span");
  copy.className = "reference-input-copy";
  const name = document.createElement("strong");
  name.textContent = title;
  const meta = document.createElement("span");
  meta.textContent = hint;
  copy.append(name, meta);

  const action = document.createElement("span");
  action.className = "reference-input-action";
  action.textContent = actionText;

  card.append(iconEl, copy, action, input);
  return card;
}

function imageReferenceStateText(node) {
  const cached = node.cachedImages?.length || 0;
  const pending = pendingReferenceImageCount(node);
  if (cached || pending) return `${cached + pending} 张`;
  return isDreaminaModelName(node.model) ? "最多 10 张" : "选择 / 已选";
}

function pendingReferenceImageCount(node) {
  const stored = fileStore.get(node.id)?.images?.length || 0;
  if (stored) return stored;
  if (node.cachedImages?.length) return 0;
  return node.sessionFiles?.length || 0;
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
    const annotationOverlay = createReferenceAnnotationOverlay(image.maskAnnotation);
    if (annotationOverlay) button.append(annotationOverlay);

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

function createReferenceAnnotationOverlay(annotation) {
  const normalized = normalizeMaskAnnotation(annotation);
  if (!normalized.actions.length) return null;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("reference-annotation-overlay");
  svg.setAttribute("viewBox", `0 0 ${Math.max(1, normalized.width)} ${Math.max(1, normalized.height)}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  for (const action of normalized.actions) {
    const element = createAnnotationSvgElement(action);
    if (element) svg.append(element);
  }

  return svg;
}

function createAnnotationSvgElement(action) {
  if (!action?.tool) return null;
  const size = Math.max(8, Number(action.size) || 24);
  const strokeWidth = Math.max(3, size * 0.18);
  const fill = "rgba(230, 64, 48, 0.36)";
  const stroke = "rgba(230, 64, 48, 0.86)";

  if (action.tool === "brush") {
    const points = annotationPoints(action.points);
    if (!points.length) return null;
    if (points.length === 1) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", points[0].x);
      circle.setAttribute("cy", points[0].y);
      circle.setAttribute("r", size / 2);
      circle.setAttribute("fill", "rgba(230, 64, 48, 0.42)");
      return circle;
    }
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "rgba(230, 64, 48, 0.42)");
    polyline.setAttribute("stroke-width", size);
    polyline.setAttribute("stroke-linecap", "round");
    polyline.setAttribute("stroke-linejoin", "round");
    return polyline;
  }

  const start = annotationPoint(action.start);
  const end = annotationPoint(action.end);
  if (!start || !end) return null;
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  if (action.tool === "rect") {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", Math.max(1, width));
    rect.setAttribute("height", Math.max(1, height));
    rect.setAttribute("fill", fill);
    rect.setAttribute("stroke", stroke);
    rect.setAttribute("stroke-width", strokeWidth);
    return rect;
  }

  if (action.tool === "ellipse") {
    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("cx", x + width / 2);
    ellipse.setAttribute("cy", y + height / 2);
    ellipse.setAttribute("rx", Math.max(1, width / 2));
    ellipse.setAttribute("ry", Math.max(1, height / 2));
    ellipse.setAttribute("fill", fill);
    ellipse.setAttribute("stroke", stroke);
    ellipse.setAttribute("stroke-width", strokeWidth);
    return ellipse;
  }

  if (action.tool === "arrow") {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", Math.max(5, size * 0.45));
    line.setAttribute("stroke-linecap", "round");
    const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    head.setAttribute("points", arrowHeadPointString(start, end, size));
    head.setAttribute("fill", stroke);
    group.append(line, head);
    return group;
  }

  return null;
}

function normalizeMaskAnnotation(annotation) {
  if (!annotation || typeof annotation !== "object") return { version: 1, width: 1, height: 1, actions: [] };
  return {
    version: 1,
    width: Math.max(1, Number(annotation.width) || 1),
    height: Math.max(1, Number(annotation.height) || 1),
    actions: Array.isArray(annotation.actions) ? annotation.actions.map(normalizeAnnotationAction).filter(Boolean) : []
  };
}

function normalizeAnnotationAction(action) {
  if (!action || typeof action !== "object") return null;
  const tool = String(action.tool || "");
  const size = Math.max(8, Number(action.size) || 24);
  if (tool === "brush") {
    const points = annotationPoints(action.points);
    return points.length ? { tool, size, points } : null;
  }
  if (["rect", "ellipse", "arrow"].includes(tool)) {
    const start = annotationPoint(action.start);
    const end = annotationPoint(action.end);
    return start && end ? { tool, size, start, end } : null;
  }
  return null;
}

function annotationPoint(point) {
  if (!point || typeof point !== "object") return null;
  const x = Number(point.x);
  const y = Number(point.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function annotationPoints(points) {
  if (!Array.isArray(points)) return [];
  return points.map(annotationPoint).filter(Boolean);
}

function arrowHeadPointString(start, end, size) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = Math.atan2(dy, dx);
  const headLength = Math.max(18, size * 1.8);
  const headAngle = Math.PI / 7;
  const left = {
    x: end.x - headLength * Math.cos(angle - headAngle),
    y: end.y - headLength * Math.sin(angle - headAngle)
  };
  const right = {
    x: end.x - headLength * Math.cos(angle + headAngle),
    y: end.y - headLength * Math.sin(angle + headAngle)
  };
  return `${end.x},${end.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

function removeReferenceImage(nodeId, index) {
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  if (!node || node.type !== "task") return;

  const removed = (node.cachedImages || [])[index];
  node.cachedImages = (node.cachedImages || []).filter((_, imageIndex) => imageIndex !== index);
  if (removed?.sourceImageNodeId) {
    node.referenceImageNodeIds = dedupeStrings(node.referenceImageNodeIds || []).filter((id) => id !== removed.sourceImageNodeId);
  }
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

  const toolGroup = document.createElement("div");
  toolGroup.className = "mask-editor-tools";
  const tools = [
    ["brush", "画笔"],
    ["rect", "框"],
    ["ellipse", "圈"],
    ["arrow", "箭头"]
  ];
  let activeTool = "brush";
  const toolButtons = tools.map(([tool, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.className = tool === activeTool ? "active" : "";
    button.addEventListener("click", () => {
      activeTool = tool;
      toolButtons.forEach((item) => item.classList.toggle("active", item === button));
    });
    toolGroup.append(button);
    return button;
  });

  const brushLabel = document.createElement("label");
  brushLabel.textContent = "粗细";
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
  save.textContent = "保存标注";

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "关闭";

  toolbar.append(title, toolGroup, brushLabel, clear, save, close);

  const stage = document.createElement("div");
  stage.className = "mask-editor-stage";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = imageRef.originalName || imageRef.filename || "参考图";

  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.className = "mask-editor-canvas";

  const previewCanvas = document.createElement("canvas");
  previewCanvas.className = "mask-editor-canvas mask-editor-preview";

  stage.append(image, overlayCanvas, previewCanvas);
  editor.append(toolbar, stage);
  overlay.append(editor);
  document.body.append(overlay);

  const maskCanvas = document.createElement("canvas");
  const maskContext = maskCanvas.getContext("2d");
  const overlayContext = overlayCanvas.getContext("2d");
  const previewContext = previewCanvas.getContext("2d");
  let isDrawing = false;
  let startPoint = null;
  let hasMarks = false;
  let wasCleared = false;
  let currentAction = null;
  let annotationActions = clonePlainValue(normalizeMaskAnnotation(imageRef.maskAnnotation).actions);

  const closeEditor = () => overlay.remove();
  close.addEventListener("click", closeEditor);
  overlay.addEventListener("pointerdown", (event) => {
    if (event.target === overlay) closeEditor();
  });

  const resetMaskCanvas = () => {
    overlayContext.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    maskContext.globalCompositeOperation = "source-over";
    maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    maskContext.fillStyle = "#ffffff";
    maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    hasMarks = false;
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
    previewCanvas.width = naturalWidth;
    previewCanvas.height = naturalHeight;
    previewCanvas.style.width = `${displayWidth}px`;
    previewCanvas.style.height = `${displayHeight}px`;
    maskCanvas.width = naturalWidth;
    maskCanvas.height = naturalHeight;
    resetMaskCanvas();
    replayAnnotationActions();
  };

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
    if (currentAction?.tool === "brush") currentAction.points.push(point);

    overlayContext.save();
    overlayContext.globalCompositeOperation = "source-over";
    overlayContext.fillStyle = "rgba(230, 64, 48, 0.42)";
    overlayContext.beginPath();
    overlayContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
    overlayContext.fill();
    overlayContext.restore();

    maskContext.save();
    maskContext.globalCompositeOperation = "destination-out";
    maskContext.beginPath();
    maskContext.arc(point.x, point.y, radius, 0, Math.PI * 2);
    maskContext.fill();
    maskContext.restore();
    hasMarks = true;
    wasCleared = false;
  };

  const shapeFromEvent = (event) => ({
    tool: activeTool,
    start: startPoint,
    end: pointFromEvent(event),
    size: Number(brush.value)
  });

  const replayAnnotationActions = () => {
    for (const action of annotationActions) {
      drawAnnotationAction(overlayContext, action, "overlay");
      drawAnnotationAction(maskContext, action, "mask");
    }
    hasMarks = annotationActions.length > 0;
  };

  const drawAnnotationAction = (context, action, target, preview = false) => {
    const normalized = normalizeAnnotationAction(action);
    if (!normalized) return;
    if (normalized.tool === "brush") {
      drawBrushAction(context, normalized, target, preview);
      return;
    }
    if (target === "mask") eraseShapeFromMask(normalized);
    else drawShape(context, normalized, preview);
  };

  const drawBrushAction = (context, action, target, preview = false) => {
    const points = annotationPoints(action.points);
    if (!points.length) return;
    const size = Math.max(8, Number(action.size) || 24);

    context.save();
    context.globalCompositeOperation = target === "mask" ? "destination-out" : "source-over";
    context.strokeStyle = target === "mask" ? "#000000" : preview ? "rgba(230, 64, 48, 0.24)" : "rgba(230, 64, 48, 0.42)";
    context.fillStyle = context.strokeStyle;
    context.lineWidth = size;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (const point of points.slice(1)) context.lineTo(point.x, point.y);
      context.stroke();
    }

    context.restore();
  };

  const drawShape = (context, shape, preview = false) => {
    if (!shape?.start || !shape?.end) return;
    const x = Math.min(shape.start.x, shape.end.x);
    const y = Math.min(shape.start.y, shape.end.y);
    const width = Math.abs(shape.end.x - shape.start.x);
    const height = Math.abs(shape.end.y - shape.start.y);
    const lineWidth = Math.max(8, Number(shape.size) || 24);

    context.save();
    context.globalCompositeOperation = "source-over";
    context.fillStyle = preview ? "rgba(230, 64, 48, 0.24)" : "rgba(230, 64, 48, 0.36)";
    context.strokeStyle = "rgba(230, 64, 48, 0.86)";
    context.lineWidth = Math.max(3, lineWidth * 0.18);
    context.lineCap = "round";
    context.lineJoin = "round";

    if (shape.tool === "rect") {
      context.beginPath();
      context.rect(x, y, Math.max(1, width), Math.max(1, height));
      context.fill();
      context.stroke();
    } else if (shape.tool === "ellipse") {
      context.beginPath();
      context.ellipse(x + width / 2, y + height / 2, Math.max(1, width / 2), Math.max(1, height / 2), 0, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    } else if (shape.tool === "arrow") {
      drawArrowShape(context, shape.start, shape.end, lineWidth);
    }

    context.restore();
  };

  const eraseShapeFromMask = (shape) => {
    if (!shape?.start || !shape?.end) return;
    const x = Math.min(shape.start.x, shape.end.x);
    const y = Math.min(shape.start.y, shape.end.y);
    const width = Math.abs(shape.end.x - shape.start.x);
    const height = Math.abs(shape.end.y - shape.start.y);
    const lineWidth = Math.max(8, Number(shape.size) || 24);

    maskContext.save();
    maskContext.globalCompositeOperation = "destination-out";
    maskContext.fillStyle = "#000000";
    maskContext.strokeStyle = "#000000";
    maskContext.lineWidth = lineWidth;
    maskContext.lineCap = "round";
    maskContext.lineJoin = "round";

    if (shape.tool === "rect") {
      maskContext.fillRect(x, y, Math.max(1, width), Math.max(1, height));
    } else if (shape.tool === "ellipse") {
      maskContext.beginPath();
      maskContext.ellipse(x + width / 2, y + height / 2, Math.max(1, width / 2), Math.max(1, height / 2), 0, 0, Math.PI * 2);
      maskContext.fill();
    } else if (shape.tool === "arrow") {
      drawArrowShape(maskContext, shape.start, shape.end, lineWidth);
    }

    maskContext.restore();
  };

  const drawArrowShape = (context, start, end, lineWidth) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (length < 2) return;
    const angle = Math.atan2(dy, dx);
    const headLength = Math.max(18, lineWidth * 1.8);
    const headAngle = Math.PI / 7;

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    context.beginPath();
    context.moveTo(end.x, end.y);
    context.lineTo(end.x - headLength * Math.cos(angle - headAngle), end.y - headLength * Math.sin(angle - headAngle));
    context.lineTo(end.x - headLength * Math.cos(angle + headAngle), end.y - headLength * Math.sin(angle + headAngle));
    context.closePath();
    context.fill();
  };

  const drawShapePreview = (event) => {
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    drawShape(previewContext, shapeFromEvent(event), true);
  };

  const commitShape = (event) => {
    const shape = normalizeAnnotationAction(shapeFromEvent(event));
    if (!shape) return;
    const distance = Math.hypot(shape.end.x - shape.start.x, shape.end.y - shape.start.y);
    if (distance < 2) return;
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    drawShape(overlayContext, shape);
    eraseShapeFromMask(shape);
    annotationActions.push(shape);
    hasMarks = true;
    wasCleared = false;
  };

  image.addEventListener("load", initializeMaskEditor);
  if (image.complete && image.naturalWidth) initializeMaskEditor();

  overlayCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isDrawing = true;
    startPoint = pointFromEvent(event);
    overlayCanvas.setPointerCapture?.(event.pointerId);
    if (activeTool === "brush") {
      currentAction = { tool: "brush", size: Number(brush.value), points: [] };
      annotationActions.push(currentAction);
      drawPoint(event);
    } else {
      currentAction = null;
      drawShapePreview(event);
    }
  });

  overlayCanvas.addEventListener("pointermove", (event) => {
    if (!isDrawing) return;
    if (activeTool === "brush") drawPoint(event);
    else drawShapePreview(event);
  });

  const stopDrawing = (event) => {
    if (isDrawing && activeTool !== "brush" && event?.type === "pointerup") commitShape(event);
    isDrawing = false;
    startPoint = null;
    currentAction = null;
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  };
  overlayCanvas.addEventListener("pointerup", stopDrawing);
  overlayCanvas.addEventListener("pointercancel", stopDrawing);
  clear.addEventListener("click", () => {
    annotationActions = [];
    currentAction = null;
    wasCleared = true;
    resetMaskCanvas();
  });
  save.addEventListener("click", () => {
    if (!hasMarks && !wasCleared) {
      showToast("请先标注需要局部重绘的区域");
      return;
    }

    save.disabled = true;
    save.textContent = "保存中";
    maskCanvas.toBlob(async (blob) => {
      if (!blob) {
        save.disabled = false;
        save.textContent = "保存标注";
        showToast("蒙版生成失败");
        return;
      }

      if (!hasMarks && wasCleared) {
        imageRef.maskAnnotation = null;
        const stored = fileStore.get(node.id) || {};
        delete stored.mask;
        if (stored.images?.length) fileStore.set(node.id, stored);
        else fileStore.delete(node.id);
        node.sessionMask = "";
        node.cachedMask = null;
        node.cacheStatus = node.cachedImages?.length ? "ready" : "pending";
        updateNode(node);
        saveCanvasState();
        closeEditor();
        showToast("局部重绘标注已清空");
        return;
      }

      const file = new File([blob], `mask-${Date.now()}.png`, { type: "image/png" });
      imageRef.maskAnnotation = {
        version: 1,
        width: maskCanvas.width,
        height: maskCanvas.height,
        actions: clonePlainValue(annotationActions.map(normalizeAnnotationAction).filter(Boolean))
      };
      const stored = fileStore.get(node.id) || {};
      fileStore.set(node.id, { ...stored, mask: file });
      node.sessionMask = file.name;
      node.cachedMask = null;
      if (node.cachedImages?.length || stored.images?.length) node.cacheStatus = "caching";
      updateNode(node);
      saveCanvasState();
      await cacheEditFiles(node.id);
      closeEditor();
      showToast("局部重绘蒙版已保存");
    }, "image/png");
  });
}

function startReferenceConnection(event, sourceImageNodeId) {
  if (event.button !== 0) return;
  const sourceNode = canvasState.nodes.find((node) => node.id === sourceImageNodeId && node.type === "image");
  if (!sourceNode?.image?.url) {
    showToast("这张画布图片暂时不能作为参考图");
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  hideCreateMenu();
  referencePickTargetNodeId = null;

  const handle = event.currentTarget;
  try {
    handle.setPointerCapture?.(event.pointerId);
  } catch {
    // Some embedded browsers do not allow capture on every element.
  }
  const start = nodeViewportCenter(sourceImageNodeId) || clientToViewportPoint(event.clientX, event.clientY);
  const layer = ensureReferenceConnectLayer();
  const line = layer.querySelector(".reference-connect-line");
  const hit = layer.querySelector(".reference-connect-hit");
  referenceConnectState = {
    sourceImageNodeId,
    targetNodeId: "",
    start,
    layer,
    line,
    hit
  };

  canvasViewport.classList.add("is-reference-connecting");
  updateReferenceConnectionLine(event.clientX, event.clientY);

  const move = (moveEvent) => {
    updateReferenceConnectionLine(moveEvent.clientX, moveEvent.clientY);
  };

  const stop = async (upEvent) => {
    try {
      handle.releasePointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture may already be released by the browser.
    }
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", stop);

    updateReferenceConnectionLine(upEvent.clientX, upEvent.clientY);
    const targetNodeId = referenceConnectState?.targetNodeId || "";
    cleanupReferenceConnection();

    if (!targetNodeId) {
      showToast("请把连线拖到生图节点或视频节点上");
      return;
    }
    await useCanvasImagesAsReference(targetNodeId, [sourceImageNodeId]);
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", stop, { once: true });
}

function ensureReferenceConnectLayer() {
  let layer = canvasViewport.querySelector(".reference-connect-layer");
  if (!layer) {
    layer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    layer.classList.add("reference-connect-layer");

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hit.classList.add("reference-connect-hit");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("reference-connect-line");

    layer.append(hit, line);
    canvasViewport.append(layer);
  }
  return layer;
}

function updateReferenceConnectionLine(clientX, clientY) {
  if (!referenceConnectState) return;
  const end = clientToViewportPoint(clientX, clientY);
  for (const line of [referenceConnectState.hit, referenceConnectState.line]) {
    if (!line) continue;
    line.setAttribute("x1", referenceConnectState.start.x);
    line.setAttribute("y1", referenceConnectState.start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
  }

  const target = referenceTargetFromPoint(clientX, clientY, referenceConnectState.sourceImageNodeId);
  setReferenceConnectionTarget(target?.id || "");
}

function clientToViewportPoint(clientX, clientY) {
  const rect = canvasViewport.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function nodeViewportCenter(nodeId) {
  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === nodeId);
  if (!tile) return null;
  const tileRect = tile.getBoundingClientRect();
  const viewportRect = canvasViewport.getBoundingClientRect();
  return {
    x: tileRect.left + tileRect.width / 2 - viewportRect.left,
    y: tileRect.top + tileRect.height / 2 - viewportRect.top
  };
}

function referenceTargetFromPoint(clientX, clientY, sourceImageNodeId) {
  const element = document.elementFromPoint(clientX, clientY);
  const tile = element?.closest?.(".canvas-node");
  const nodeId = tile?.dataset?.nodeId || "";
  if (!nodeId || nodeId === sourceImageNodeId) return null;
  const node = canvasState.nodes.find((item) => item.id === nodeId);
  return node && ["task", "video-task"].includes(node.type) ? node : null;
}

function setReferenceConnectionTarget(targetNodeId) {
  if (!referenceConnectState || referenceConnectState.targetNodeId === targetNodeId) return;
  if (referenceConnectState.targetNodeId) {
    const previous = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === referenceConnectState.targetNodeId);
    previous?.classList.remove("is-reference-target");
  }
  referenceConnectState.targetNodeId = targetNodeId;
  if (targetNodeId) {
    const next = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === targetNodeId);
    next?.classList.add("is-reference-target");
  }
}

function cleanupReferenceConnection() {
  if (referenceConnectState?.targetNodeId) {
    const previous = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === referenceConnectState.targetNodeId);
    previous?.classList.remove("is-reference-target");
  }
  referenceConnectState?.layer?.remove();
  referenceConnectState = null;
  canvasViewport.classList.remove("is-reference-connecting");
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
    let usableImageNodes = imageNodes;
    let files = await Promise.all(usableImageNodes.map(imageNodeToFile));
    const stored = fileStore.get(target.id) || {};
    if (target.type === "video-task") {
      const remaining = Math.max(0, 9 - (target.cachedImages?.length || 0) - (stored.images?.length || 0));
      if (!remaining) {
        showToast("即梦视频最多使用 9 张参考图片");
        return;
      }
      if (files.length > remaining) showToast("即梦视频最多使用 9 张参考图片，已自动截取");
      usableImageNodes = usableImageNodes.slice(0, remaining);
      files = files.slice(0, remaining);
    }
    files.forEach((file, index) => {
      tagReferenceFile(file, usableImageNodes[index]?.id);
    });
    const nextFiles = [...(stored.images || []), ...files];
    fileStore.set(target.id, {
      ...stored,
      images: nextFiles
    });
    target.referenceImageNodeIds = dedupeStrings([
      ...(target.referenceImageNodeIds || []),
      ...usableImageNodes.map((node) => node.id)
    ]);

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
  const file = new File([blob], filename, { type });
  tagReferenceFile(file, node.id);
  return file;
}

function tagReferenceFile(file, sourceImageNodeId) {
  if (!file || !sourceImageNodeId) return file;
  try {
    Object.defineProperty(file, "sourceImageNodeId", {
      configurable: true,
      enumerable: false,
      value: sourceImageNodeId
    });
  } catch {
    file.sourceImageNodeId = sourceImageNodeId;
  }
  return file;
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
  text.style.color = noteDisplayColor(node);
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
  text.style.color = noteDisplayColor(node);
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
  text.style.color = noteDisplayColor(node);
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

function normalizeHexColorInput(value) {
  const text = String(value || "").trim();
  const match = text.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/iu);
  if (!match) return "";
  const hex = match[1].toLowerCase();
  if (hex.length === 3) {
    return `#${hex.split("").map((char) => `${char}${char}`).join("")}`;
  }
  return `#${hex}`;
}

const noteColorPalette = [
  "#111827",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#facc15",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#7cfc00",
  "#94a3b8"
];

function applyNoteColor(node, value, options = {}) {
  const nextColor = normalizeHexColorInput(value) || normalizeAssistantColor(value, noteDisplayColor(node));
  node.color = nextColor;

  const tile = Array.from(canvasStage.children).find((child) => child.dataset.nodeId === node.id);
  tile?.querySelectorAll(".note-text").forEach((text) => {
    text.style.color = nextColor;
  });

  if (options.syncInputs) {
    syncNoteColorInputs(tile, nextColor);
  }

  saveCanvasState();
  updateMinimap();
}

function syncNoteColorInputs(tile, color) {
  const nextColor = normalizeHexColorInput(color) || noteDisplayColor({ color });
  const colorInput = tile?.querySelector(".note-toolbar input[type='color']");
  const codeInput = tile?.querySelector(".note-toolbar .note-color-code");
  if (colorInput) colorInput.value = nextColor;
  if (codeInput && document.activeElement !== codeInput) codeInput.value = nextColor;
  tile?.querySelectorAll(".note-color-swatch").forEach((swatch) => {
    swatch.classList.toggle("is-active", normalizeHexColorInput(swatch.dataset.color) === nextColor);
  });
}

function commitNoteFontSize(node, input) {
  const raw = String(input.value || "").trim();
  const fallback = Number(node.fontSize) || 22;
  const value = raw ? Number(raw) : fallback;
  const nextSize = Math.round(clamp(Number.isFinite(value) ? value : fallback, minNoteFontSize, maxNoteFontSize));
  input.value = String(nextSize);
  applyNoteFontSize(node, nextSize);
}

function updateNoteColorCode(node, input, options = {}) {
  const color = normalizeHexColorInput(input.value);
  if (!color) {
    input.classList.toggle("is-invalid", Boolean(String(input.value || "").trim()));
    if (options.commit) input.value = noteDisplayColor(node);
    return false;
  }
  input.classList.remove("is-invalid");
  if (options.commit) input.value = color;
  applyNoteColor(node, color, { syncInputs: true });
  return true;
}

function createNoteColorPalette(node) {
  const palette = document.createElement("div");
  palette.className = "note-color-palette";
  const currentColor = noteDisplayColor(node);
  for (const color of noteColorPalette) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "note-color-swatch";
    swatch.dataset.color = color;
    swatch.title = color;
    swatch.style.backgroundColor = color;
    swatch.classList.toggle("is-light", color === "#ffffff");
    swatch.classList.toggle("is-active", color === currentColor);
    swatch.addEventListener("pointerdown", (event) => event.stopPropagation());
    swatch.addEventListener("click", () => {
      applyNoteColor(node, color, { syncInputs: true });
    });
    palette.append(swatch);
  }
  return palette;
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
  sizeInput.addEventListener("blur", () => commitNoteFontSize(node, sizeInput));

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.value = noteDisplayColor(node);
  colorInput.title = "颜色";
  colorInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  colorInput.addEventListener("input", () => {
    applyNoteColor(node, colorInput.value, { syncInputs: true });
  });

  const colorCodeInput = document.createElement("input");
  colorCodeInput.type = "text";
  colorCodeInput.className = "note-color-code";
  colorCodeInput.value = noteDisplayColor(node);
  colorCodeInput.placeholder = "#7cfc00";
  colorCodeInput.title = "颜色代码";
  colorCodeInput.spellcheck = false;
  colorCodeInput.autocomplete = "off";
  colorCodeInput.addEventListener("pointerdown", (event) => event.stopPropagation());
  colorCodeInput.addEventListener("input", () => {
    updateNoteColorCode(node, colorCodeInput);
  });
  colorCodeInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    updateNoteColorCode(node, colorCodeInput, { commit: true });
    colorCodeInput.select();
  });
  colorCodeInput.addEventListener("blur", () => {
    updateNoteColorCode(node, colorCodeInput, { commit: true });
  });

  const colorPalette = createNoteColorPalette(node);

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

  toolbar.append(sizeInput, colorInput, colorCodeInput, colorPalette, duplicate, remove);
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
    ["文字节点", () => addNoteNode(pendingCreatePoint)],
    ["区域规划", () => addRegionNode(pendingCreatePoint)]
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
  createAssistantCopyMenu();
}

function createAssistantCopyMenu() {
  assistantCopyMenu = document.createElement("div");
  assistantCopyMenu.className = "assistant-copy-menu";
  assistantCopyMenu.hidden = true;
  assistantCopyMenu.addEventListener("pointerdown", (event) => event.stopPropagation());

  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "复制";
  copy.addEventListener("click", () => {
    const text = assistantCopyText;
    hideAssistantCopyMenu();
    copyTextToClipboard(text, "助手内容已复制");
  });
  assistantCopyMenu.append(copy);
  document.body.append(assistantCopyMenu);
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

function showAssistantCopyMenu(clientX, clientY, text) {
  if (!assistantCopyMenu) return;
  assistantCopyText = text;
  assistantCopyMenu.hidden = false;
  assistantCopyMenu.style.left = `${clientX}px`;
  assistantCopyMenu.style.top = `${clientY}px`;
}

function hideAssistantCopyMenu() {
  if (assistantCopyMenu) assistantCopyMenu.hidden = true;
  assistantCopyText = "";
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
    z: node.type === "region" ? 0 : ++canvasState.nextZ,
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

function dedupeStrings(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
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
    z: source.type === "region" ? 0 : ++canvasState.nextZ,
    createdAt
  };

  if (copy.sourceTaskId && idMap.has(copy.sourceTaskId)) {
    copy.sourceTaskId = idMap.get(copy.sourceTaskId);
  }

  if (Array.isArray(copy.referenceImageNodeIds)) {
    copy.referenceImageNodeIds = dedupeStrings(copy.referenceImageNodeIds.map((id) => idMap.get(id) || id));
  }

  if (Array.isArray(copy.cachedImages)) {
    copy.cachedImages = copy.cachedImages.map((image) => {
      if (!image?.sourceImageNodeId || !idMap.has(image.sourceImageNodeId)) return image;
      return { ...image, sourceImageNodeId: idMap.get(image.sourceImageNodeId) };
    });
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
  if (
    referenceConnectState &&
    (ids.has(referenceConnectState.sourceImageNodeId) || ids.has(referenceConnectState.targetNodeId))
  ) {
    cleanupReferenceConnection();
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
  if (node.type === "region" && node.locked && !options.force) {
    selectOnly(node.id);
    return;
  }

  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    toggleSelection(nodeId);
    return;
  } else if (!selectedNodeIds.has(nodeId)) {
    selectOnly(nodeId, { revealControls: true });
  }

  if (!selectedNodeIds.has(nodeId)) return;

  const selectedNodes = canvasState.nodes.filter((item) => selectedNodeIds.has(item.id));
  for (const item of selectedNodes) {
    item.z = item.type === "region" ? Math.min(Number(item.z) || 0, 0) : ++canvasState.nextZ;
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
    renderReferenceLinks();
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
      : node.type === "region"
        ? clamp(Number(node.width) || defaultRegionWidth, minRegionWidth, maxRegionWidth)
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
      : node.type === "region"
        ? clamp(Number(node.height) || defaultRegionHeight, minRegionHeight, maxRegionHeight)
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
  if (!canvasState.nodes.length) {
    showToast("画布已经是空的");
    return;
  }

  const confirmed = window.confirm("确定要清空当前画布吗？清空后可以按 Ctrl+Z 撤销。");
  if (!confirmed) return;

  pushUndoSnapshot(createHistorySnapshot());
  canvasState.nodes = [];
  canvasState.nextZ = 1;
  selectedNodeIds.clear();
  referencePickTargetNodeId = null;
  if (referenceConnectState) cleanupReferenceConnection();
  rawResponse.textContent = "{}";
  renderCanvas();
  lastHistorySnapshot = createHistorySnapshot();
  saveCanvasState({ history: false });
}

function updateCanvasMeta() {
  const taskNodes = canvasState.nodes.filter((node) => node.type === "task");
  const videoTaskNodes = canvasState.nodes.filter((node) => node.type === "video-task");
  const imageNodes = canvasState.nodes.filter((node) => node.type === "image");
  const videoNodes = canvasState.nodes.filter((node) => node.type === "video");
  const noteNodes = canvasState.nodes.filter((node) => node.type === "note");
  const chatNodes = canvasState.nodes.filter((node) => node.type === "chatgpt");
  const regionNodes = canvasState.nodes.filter((node) => node.type === "region");
  const running = [...taskNodes, ...videoTaskNodes].filter((node) => node.status === "running").length;
  if (running) {
    requestMeta.textContent = `${running} 个节点生成中`;
    return;
  }
  if (!canvasState.nodes.length) {
    requestMeta.textContent = "等待添加节点";
    return;
  }
  requestMeta.textContent = `${taskNodes.length} 个生图 · ${videoTaskNodes.length} 个视频任务 · ${imageNodes.length} 张图 · ${videoNodes.length} 个视频 · ${noteNodes.length} 个文字 · ${regionNodes.length} 个区域 · ${chatNodes.length} 个 ChatGPT`;
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
  if (node.type === "region") {
    return {
      ...node,
      id: node.id || createId(),
      type: "region",
      title: String(node.title || "区域规划"),
      color: normalizeRegionColor(node.color),
      locked: Boolean(node.locked),
      width: clamp(Number(node.width) || defaultRegionWidth, minRegionWidth, maxRegionWidth),
      height: clamp(Number(node.height) || defaultRegionHeight, minRegionHeight, maxRegionHeight),
      x: node.x || 0,
      y: node.y || 0,
      z: Math.min(Number(node.z) || 0, 0),
      createdAt: node.createdAt || new Date().toISOString()
    };
  }

  if (node.type === "note") {
    return {
      ...node,
      id: node.id || createId(),
      type: "note",
      text: node.text || "",
      fontSize: Number(node.fontSize) || 22,
      color: noteDisplayColor(node),
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
    const originalWidth = Number(node.originalWidth) || dimensions.width || 512;
    const originalHeight = Number(node.originalHeight) || dimensions.height || 512;
    return {
      ...node,
      id: node.id || createId(),
      type: "image",
      image: node.image || {},
      sourceTaskId: node.sourceTaskId || "",
      sourceImageKey: node.sourceImageKey || getImageKey(node.image),
      originalWidth,
      originalHeight,
      scale: resolvedImageNodeScale(node, { width: originalWidth, height: originalHeight }),
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
    referenceImageNodeIds: dedupeStrings(node.referenceImageNodeIds || []),
    cachedMask: node.cachedMask || null,
    cacheStatus: node.cacheStatus || (mode === "edit" ? "session-only" : "none"),
    sessionFiles: node.sessionFiles || [],
    sessionMask: node.sessionMask || "",
    images: dedupeNodeImages(node.images || []),
    status: node.status === "running" ? "idle" : node.status || "idle",
    error: node.error || "",
    durationMs: node.durationMs || null,
    debugOpen: Boolean(node.debugOpen),
    width: Math.max(Number(node.width) || defaultTaskWidth, 560),
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
    referenceImageNodeIds: dedupeStrings(node.referenceImageNodeIds || []),
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
      const scale = defaultScaleForImageDimensions(dimensions.width || 512, dimensions.height || 512, image?.size || task.size);
      additions.push({
        id: createId(),
        type: "image",
        image,
        sourceTaskId: task.id,
        sourceImageKey: key,
        originalWidth: dimensions.width || 512,
        originalHeight: dimensions.height || 512,
        scale,
        x,
        y: cursorY,
        z: ++canvasState.nextZ,
        createdAt: new Date().toISOString()
      });

      imageKeys.add(key);
      cursorY += (dimensions.height || 512) * scale + 32;
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
  await loadAssistantChat();
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
  saveAssistantChat({ immediate: true });
  saveCanvasState({ history: false });
  persistDiskProject(serializeCanvasState(), currentProjectId);
  selectedNodeIds.clear();
  referencePickTargetNodeId = null;
  fileStore.clear();
  await loadProjectById(projectId);
}

function createNewProject() {
  saveAssistantChat({ immediate: true });
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
  assistantMessages = [];
  localStorage.setItem(currentProjectStorageKey, currentProjectId);
  projectNameInput.value = currentProjectName;
  rawResponse.textContent = "{}";
  renderCanvas();
  applyViewport();
  primeUndoHistory();
  saveCanvasState({ history: false });
  saveAssistantChat();
  renderAssistantMessages();
  renderAssistantSkillLibrary();
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
  saveAssistantChat({ immediate: true });
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

  pushUndoSnapshot(lastHistorySnapshot);
  lastHistorySnapshot = snapshot;
}

function pushUndoSnapshot(snapshot) {
  if (isLoadingProject || isRestoringHistory || !snapshot) return;
  if (undoStack.at(-1) === snapshot) return;
  undoStack.push(snapshot);
  if (undoStack.length > undoLimit) undoStack.shift();
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

function isEditableShortcutTarget(target) {
  return Boolean(target?.closest?.("textarea, input, select, [contenteditable='true']"));
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
