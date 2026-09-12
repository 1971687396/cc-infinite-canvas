import { Capacitor, CapacitorHttp, registerPlugin } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  createIcons,
  ExternalLink,
  Image,
  LoaderCircle,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Send,
  Server,
  Settings,
  Trash2,
  X
} from "lucide";
import {
  authRequest,
  buildApiUrl,
  buildChatPayload,
  defaultSettings,
  extractAssistantMessage,
  extractImageToolCalls,
  generateImageWithConnection,
  imageSizingProfile,
  platformPresets,
  resolveModelConnection,
  resolveRuntimeSettings,
  resolveImageSizing,
  normalizeSettings,
  settingsNeedMigration,
  shouldOfferImageTool
} from "./core.js";
import "./styles.css";

const SecureStore = registerPlugin("SecureStore");
const settingsKey = "cc-mobile-settings-v1";
const historyKey = "cc-mobile-history-v1";
const legacyChatApiKeyName = "chat-api-key";
const legacyImageApiKeyName = "image-api-key";
const maxHistoryItems = 120;
const mobileIcons = { ArrowLeft, Bot, Check, Copy, ExternalLink, Image, LoaderCircle, MessageSquare, MessageSquarePlus, Plus, Send, Server, Settings, Trash2, X };

const state = {
  settings: normalizeSettings(defaultSettings),
  messages: [],
  mode: "chat",
  busy: false,
  settingsOpen: false,
  settingsTab: "provider",
  settingsDraft: null,
  editorSelection: { providerId: "", chatModelId: "", imageModelId: "" },
  pendingKeys: new Map(),
  keyState: { providers: new Set(), models: new Set() }
};

const root = document.querySelector("#app");
root.innerHTML = `
  <main class="app-shell">
    <header class="topbar">
      <div class="brand-block">
        <img src="/app-icon.png" alt="" class="app-mark" />
        <div><strong>cc创作助手</strong><span id="connectionState">未配置</span></div>
      </div>
      <div class="topbar-actions">
        <label class="model-picker compact-picker"><i data-lucide="bot"></i><select id="chatModelPicker" aria-label="聊天模型"></select></label>
        <button id="newConversationButton" class="icon-button" type="button" title="新对话" aria-label="新对话"><i data-lucide="message-square-plus"></i></button>
        <button id="settingsButton" class="icon-button" type="button" title="设置" aria-label="设置"><i data-lucide="settings"></i></button>
      </div>
    </header>

    <section id="conversation" class="conversation" aria-live="polite"></section>

    <footer class="composer-wrap">
      <div class="mode-switch" role="tablist" aria-label="创作模式">
        <button type="button" class="mode-button is-active" data-mode="chat"><i data-lucide="message-square"></i><span>智能对话</span></button>
        <button type="button" class="mode-button" data-mode="image"><i data-lucide="image"></i><span>直接生图</span></button>
      </div>
      <div id="imageSizingBar" class="generation-options" hidden>
        <label class="model-picker generation-model-picker"><i data-lucide="image"></i><select id="imageModelPicker" aria-label="生图模型"></select></label>
        <label id="imageSizeField" class="generation-option"><span id="imageSizeLabel">尺寸</span><select id="imageSizeControl" aria-label="图片尺寸"></select></label>
        <label id="imageAspectField" class="generation-option"><span>比例</span><select id="imageAspectRatioControl" aria-label="图片比例"></select></label>
      </div>
      <div class="composer">
        <textarea id="promptInput" rows="1" maxlength="6000" placeholder="说说你想创作什么"></textarea>
        <button id="sendButton" class="send-button" type="button" title="发送" aria-label="发送"><i data-lucide="send"></i></button>
      </div>
    </footer>
  </main>

  <section id="settingsView" class="settings-view" hidden>
    <header class="settings-header">
      <button id="closeSettingsButton" class="icon-button" type="button" aria-label="返回"><i data-lucide="arrow-left"></i></button>
      <strong>连接设置</strong>
      <button id="saveSettingsButton" class="primary-button compact" type="button"><i data-lucide="check"></i><span>保存</span></button>
    </header>
    <nav class="settings-tabs" aria-label="设置页面">
      <button type="button" class="settings-tab is-active" data-settings-tab="provider"><i data-lucide="server"></i><span>平台</span></button>
      <button type="button" class="settings-tab" data-settings-tab="chat"><i data-lucide="bot"></i><span>聊天模型</span></button>
      <button type="button" class="settings-tab" data-settings-tab="image"><i data-lucide="image"></i><span>生图模型</span></button>
      <button type="button" class="settings-tab" data-settings-tab="behavior"><i data-lucide="settings"></i><span>偏好</span></button>
    </nav>
    <div class="settings-content">
      <section class="settings-panel library-panel" data-panel="provider">
        <div class="panel-heading"><div><strong>平台连接</strong><small>统一管理地址、鉴权和平台总 Key</small></div><button id="addProviderButton" class="primary-button compact" type="button"><i data-lucide="plus"></i><span>添加平台</span></button></div>
        <div id="providerList" class="library-list"></div>
        <form id="providerEditor" class="editor-form" hidden>
          <div class="editor-title"><strong id="providerEditorTitle">添加平台</strong><button id="deleteProviderButton" class="icon-button small-danger" type="button" title="删除平台" aria-label="删除平台"><i data-lucide="trash-2"></i></button></div>
          <label>平台名称<input id="providerName" type="text" autocomplete="off" /></label>
          <label>平台预设<select id="providerPreset"></select></label>
          <label>Base URL<input id="providerBaseUrl" type="url" inputmode="url" autocomplete="off" /></label>
          <label>鉴权方式<select id="providerAuthType"></select></label>
          <label>平台总 Key<input id="providerApiKey" type="password" autocomplete="new-password" /></label>
          <div class="field-row"><label>聊天接口<input id="providerChatEndpoint" type="text" autocomplete="off" /></label><label>生图接口<input id="providerImageEndpoint" type="text" autocomplete="off" /></label></div>
          <label>异步查询接口<input id="providerStatusEndpoint" type="text" autocomplete="off" /></label>
          <button id="saveProviderButton" class="primary-button" type="button"><i data-lucide="check"></i><span>保存平台</span></button>
        </form>
      </section>

      <section id="chatSettings" class="settings-panel" data-panel="chat" hidden>
        <div class="panel-heading"><div><strong>聊天模型</strong><small>聊天界面可以随时切换已添加的模型</small></div><button id="addChatModelButton" class="primary-button compact" type="button"><i data-lucide="plus"></i><span>添加模型</span></button></div>
        <div id="chatModelList" class="library-list"></div>
        <form id="chatModelEditor" class="editor-form" hidden>
          <div class="editor-title"><strong id="chatModelEditorTitle">添加聊天模型</strong><button id="deleteChatModelButton" class="icon-button small-danger" type="button" title="删除模型" aria-label="删除模型"><i data-lucide="trash-2"></i></button></div>
          <label>显示名称<input id="chatModelName" type="text" autocomplete="off" /></label>
          <label>所属平台<select id="chatModelProvider"></select></label>
          <label>模型 ID<input id="chatModelId" type="text" autocomplete="off" /></label>
          <label>模型专属 Key<input id="chatModelApiKey" type="password" autocomplete="new-password" /></label>
          <label>接口覆盖（可选）<input id="chatModelEndpoint" type="text" autocomplete="off" /></label>
          <label>扩展参数<textarea id="chatModelExtraParams" rows="4" spellcheck="false"></textarea></label>
          <button id="saveChatModelButton" class="primary-button" type="button"><i data-lucide="check"></i><span>保存聊天模型</span></button>
        </form>
      </section>

      <section id="imageSettings" class="settings-panel" data-panel="image" hidden>
        <div class="panel-heading"><div><strong>生图模型</strong><small>直接生图与聊天生图共用这里的选择</small></div><button id="addImageModelButton" class="primary-button compact" type="button"><i data-lucide="plus"></i><span>添加模型</span></button></div>
        <div id="imageModelList" class="library-list"></div>
        <form id="imageModelEditor" class="editor-form" hidden>
          <div class="editor-title"><strong id="imageModelEditorTitle">添加生图模型</strong><button id="deleteImageModelButton" class="icon-button small-danger" type="button" title="删除模型" aria-label="删除模型"><i data-lucide="trash-2"></i></button></div>
          <label>显示名称<input id="imageModelName" type="text" autocomplete="off" /></label>
          <label>所属平台<select id="imageModelProvider"></select></label>
          <label>模型 ID<input id="imageModelId" type="text" autocomplete="off" /></label>
          <label>模型专属 Key<input id="imageModelApiKey" type="password" autocomplete="new-password" /></label>
          <label>接口协议<select id="imageProtocol"><option value="openai-images">OpenAI Images</option><option value="media-generate">Media Generate 异步任务</option></select></label>
          <label>接口覆盖（可选）<input id="imageModelEndpoint" type="text" autocomplete="off" /></label>
          <label>查询接口覆盖（可选）<input id="imageModelStatusEndpoint" type="text" autocomplete="off" /></label>
          <label>默认尺寸或清晰度<input id="imageModelSize" type="text" autocomplete="off" /></label>
          <label>默认比例<input id="imageModelAspectRatio" type="text" autocomplete="off" /></label>
          <label>扩展参数<textarea id="imageModelExtraParams" rows="4" spellcheck="false"></textarea></label>
          <button id="saveImageModelButton" class="primary-button" type="button"><i data-lucide="check"></i><span>保存生图模型</span></button>
        </form>
      </section>

      <section class="settings-panel" data-panel="behavior" hidden>
        <label class="switch-row"><span><strong>允许模型调用生图</strong><small>聊天模型可自动执行 generate_image</small></span><input id="allowTool" type="checkbox" /></label>
        <label class="switch-row"><span><strong>完成通知</strong><small>生图结束后发送 Android 通知</small></span><input id="notifications" type="checkbox" /></label>
        <button id="clearHistoryButton" class="danger-button" type="button"><i data-lucide="trash-2"></i><span>清空聊天记录</span></button>
      </section>
    </div>
  </section>

  <div id="toast" class="toast" role="status" hidden></div>
  <dialog id="imagePreview" class="image-preview"><button id="closePreviewButton" type="button" aria-label="关闭"><i data-lucide="x"></i></button><img alt="生成结果预览" /></dialog>
  <dialog id="newConversationDialog" class="confirm-dialog" aria-labelledby="newConversationTitle">
    <div class="confirm-dialog-content">
      <div class="confirm-dialog-icon"><i data-lucide="trash-2"></i></div>
      <div>
        <h2 id="newConversationTitle">新建对话</h2>
        <p>当前对话和其中的生成图片缓存将被删除，此操作无法撤销。</p>
      </div>
    </div>
    <div class="confirm-dialog-actions">
      <button id="cancelNewConversationButton" class="dialog-button" type="button">取消</button>
      <button id="confirmNewConversationButton" class="dialog-button is-danger" type="button">新建对话</button>
    </div>
  </dialog>
`;

const elements = Object.fromEntries([
  "connectionState", "conversation", "chatModelPicker", "imageModelPicker", "newConversationButton", "settingsButton", "settingsView", "closeSettingsButton", "saveSettingsButton",
  "promptInput", "sendButton", "toast", "imagePreview", "closePreviewButton", "imageSizingBar", "imageSizeField", "imageSizeLabel", "imageSizeControl", "imageAspectField", "imageAspectRatioControl",
  "providerList", "providerEditor", "providerEditorTitle", "addProviderButton", "deleteProviderButton", "saveProviderButton", "providerName", "providerPreset", "providerBaseUrl", "providerAuthType", "providerApiKey", "providerChatEndpoint", "providerImageEndpoint", "providerStatusEndpoint",
  "chatModelList", "chatModelEditor", "chatModelEditorTitle", "addChatModelButton", "deleteChatModelButton", "saveChatModelButton", "chatModelName", "chatModelProvider", "chatModelId", "chatModelApiKey", "chatModelEndpoint", "chatModelExtraParams",
  "imageModelList", "imageModelEditor", "imageModelEditorTitle", "addImageModelButton", "deleteImageModelButton", "saveImageModelButton", "imageModelName", "imageModelProvider", "imageModelId", "imageModelApiKey", "imageProtocol", "imageModelEndpoint", "imageModelStatusEndpoint", "imageModelSize", "imageModelAspectRatio", "imageModelExtraParams",
  "allowTool", "notifications", "clearHistoryButton", "newConversationDialog", "cancelNewConversationButton", "confirmNewConversationButton"
].map((id) => [id, document.querySelector(`#${id}`)]));

initializeSelects();
bindEvents();
await initializeApp();

async function initializeApp() {
  const [savedSettings, savedHistory, chatKey, imageKey] = await Promise.all([
    Preferences.get({ key: settingsKey }),
    Preferences.get({ key: historyKey }),
    secureGet(legacyChatApiKeyName),
    secureGet(legacyImageApiKeyName)
  ]);
  let rawSettings = {};
  if (savedSettings.value) {
    try { rawSettings = JSON.parse(savedSettings.value); } catch { rawSettings = {}; }
  }
  const shouldMigrate = settingsNeedMigration(rawSettings);
  state.settings = normalizeSettings(rawSettings);
  if (shouldMigrate) {
    const chatModel = state.settings.models.find((model) => model.type === "chat");
    const imageModel = state.settings.models.find((model) => model.type === "image");
    if (chatKey && chatModel) await secureSet(credentialStorageKey("model", chatModel.id), chatKey);
    if (imageKey && imageModel) await secureSet(credentialStorageKey("model", imageModel.id), imageKey);
    await persistSettings();
  }
  await refreshKeyState();
  if (savedHistory.value) {
    try { state.messages = JSON.parse(savedHistory.value).slice(-maxHistoryItems); } catch { state.messages = []; }
  }
  syncSettingsForm();
  renderConversation();
  updateConnectionState();
  refreshIcons();
}

function initializeSelects() {
  const authOptions = [
    ["bearer", "Authorization: Bearer"], ["x-api-key", "x-api-key"], ["x-goog-api-key", "x-goog-api-key"], ["query", "URL ?key="], ["none", "不鉴权"]
  ].map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  elements.providerAuthType.innerHTML = authOptions;
  elements.providerPreset.innerHTML = Object.entries(platformPresets).map(([value, item]) => `<option value="${value}">${item.label}</option>`).join("");
}

function bindEvents() {
  elements.chatModelPicker.addEventListener("change", () => selectModel("chat", elements.chatModelPicker.value));
  elements.imageModelPicker.addEventListener("change", () => selectModel("image", elements.imageModelPicker.value));
  elements.newConversationButton.addEventListener("click", openNewConversationDialog);
  elements.settingsButton.addEventListener("click", openSettings);
  elements.closeSettingsButton.addEventListener("click", closeSettings);
  elements.saveSettingsButton.addEventListener("click", saveSettings);
  elements.sendButton.addEventListener("click", submitComposer);
  elements.promptInput.addEventListener("input", autoSizeComposer);
  elements.promptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitComposer();
    }
  });
  document.querySelectorAll(".mode-button").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  document.querySelectorAll(".settings-tab").forEach((button) => button.addEventListener("click", () => setSettingsTab(button.dataset.settingsTab)));
  elements.addProviderButton.addEventListener("click", () => openProviderEditor());
  elements.saveProviderButton.addEventListener("click", saveProvider);
  elements.deleteProviderButton.addEventListener("click", deleteProvider);
  elements.providerPreset.addEventListener("change", applyProviderPreset);
  elements.addChatModelButton.addEventListener("click", () => openModelEditor("chat"));
  elements.saveChatModelButton.addEventListener("click", () => saveModel("chat"));
  elements.deleteChatModelButton.addEventListener("click", () => deleteModel("chat"));
  elements.addImageModelButton.addEventListener("click", () => openModelEditor("image"));
  elements.saveImageModelButton.addEventListener("click", () => saveModel("image"));
  elements.deleteImageModelButton.addEventListener("click", () => deleteModel("image"));
  elements.imageProtocol.addEventListener("change", syncImageEditorSizing);
  elements.imageSizeControl.addEventListener("change", persistImageSizing);
  elements.imageAspectRatioControl.addEventListener("change", persistImageSizing);
  elements.clearHistoryButton.addEventListener("click", clearHistory);
  elements.cancelNewConversationButton.addEventListener("click", () => elements.newConversationDialog.close());
  elements.confirmNewConversationButton.addEventListener("click", createNewConversation);
  elements.newConversationDialog.addEventListener("click", (event) => {
    if (event.target === elements.newConversationDialog) elements.newConversationDialog.close();
  });
  elements.closePreviewButton.addEventListener("click", () => elements.imagePreview.close());
  elements.imagePreview.addEventListener("click", (event) => { if (event.target === elements.imagePreview) elements.imagePreview.close(); });
}

function refreshIcons() {
  createIcons({ icons: mobileIcons, attrs: { "stroke-width": 1.8, width: 20, height: 20 } });
}

function setMode(mode) {
  state.mode = mode === "image" ? "image" : "chat";
  document.querySelectorAll(".mode-button").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === state.mode));
  elements.promptInput.placeholder = state.mode === "image" ? "描述你想生成的图片" : "说说你想创作什么";
  elements.imageSizingBar.hidden = state.mode !== "image";
  if (state.mode === "image") syncImageSizingControls(resolveRuntimeSettings(state.settings).image);
}

function openSettings() {
  state.settingsOpen = true;
  syncSettingsForm();
  elements.settingsView.hidden = false;
  document.body.classList.add("settings-open");
}

function closeSettings() {
  state.settingsOpen = false;
  elements.settingsView.hidden = true;
  document.body.classList.remove("settings-open");
}

function setSettingsTab(tab) {
  state.settingsTab = tab;
  document.querySelectorAll(".settings-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.settingsTab === tab));
  document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
}

function syncSettingsForm() {
  const { behavior } = state.settings;
  renderModelPickers();
  renderProviderList();
  renderModelList("chat");
  renderModelList("image");
  syncProviderOptions();
  elements.allowTool.checked = behavior.allowModelImageTool;
  elements.notifications.checked = behavior.notifications;
  if (state.mode === "image") syncImageSizingControls(resolveRuntimeSettings(state.settings).image);
  setSettingsTab(state.settingsTab);
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function syncProviderOptions() {
  const options = state.settings.providers.map((provider) => [provider.id, provider.name]);
  fillOptions(elements.chatModelProvider, options);
  fillOptions(elements.imageModelProvider, options);
}

function providerModelCount(providerId) {
  return state.settings.models.filter((model) => model.providerId === providerId).length;
}

function renderProviderList() {
  elements.providerList.replaceChildren();
  for (const provider of state.settings.providers) {
    const item = document.createElement("article");
    item.className = "library-item";
    const info = document.createElement("div");
    info.className = "library-item-info";
    const title = document.createElement("strong");
    title.textContent = provider.name;
    const detail = document.createElement("small");
    detail.textContent = `${provider.baseUrl || "未填写地址"} · ${providerModelCount(provider.id)} 个模型${state.keyState.providers.has(provider.id) ? " · 已配置 Key" : ""}`;
    info.append(title, detail);
    const action = document.createElement("button");
    action.className = "icon-button small-button";
    action.type = "button";
    action.title = "编辑平台";
    action.setAttribute("aria-label", `编辑平台 ${provider.name}`);
    action.innerHTML = `<i data-lucide="settings"></i>`;
    action.addEventListener("click", () => openProviderEditor(provider.id));
    item.append(info, action);
    elements.providerList.append(item);
  }
}

function renderModelList(type) {
  const target = type === "chat" ? elements.chatModelList : elements.imageModelList;
  const selectedId = state.settings.selections[type === "chat" ? "chatModelId" : "imageModelId"];
  target.replaceChildren();
  for (const model of state.settings.models.filter((item) => item.type === type)) {
    const provider = state.settings.providers.find((item) => item.id === model.providerId);
    const item = document.createElement("article");
    item.className = `library-item${model.id === selectedId ? " is-selected" : ""}`;
    const info = document.createElement("div");
    info.className = "library-item-info";
    const title = document.createElement("strong");
    title.textContent = model.name;
    const detail = document.createElement("small");
    detail.textContent = `${model.model || "未填写模型 ID"} · ${provider?.name || "平台已删除"}${state.keyState.models.has(model.id) ? " · 专属 Key" : state.keyState.providers.has(model.providerId) ? " · 继承平台 Key" : ""}`;
    info.append(title, detail);
    const actions = document.createElement("div");
    actions.className = "library-item-actions";
    const defaultButton = document.createElement("button");
    defaultButton.className = "text-button";
    defaultButton.type = "button";
    defaultButton.textContent = model.id === selectedId ? "当前默认" : "设为默认";
    defaultButton.disabled = model.id === selectedId;
    defaultButton.addEventListener("click", () => selectModel(type, model.id));
    const editButton = document.createElement("button");
    editButton.className = "icon-button small-button";
    editButton.type = "button";
    editButton.title = "编辑模型";
    editButton.setAttribute("aria-label", `编辑${type === "chat" ? "聊天" : "生图"}模型 ${model.name}`);
    editButton.innerHTML = `<i data-lucide="settings"></i>`;
    editButton.addEventListener("click", () => openModelEditor(type, model.id));
    const copyButton = document.createElement("button");
    copyButton.className = "icon-button small-button";
    copyButton.type = "button";
    copyButton.title = "复制模型";
    copyButton.setAttribute("aria-label", `复制模型 ${model.name}`);
    copyButton.innerHTML = `<i data-lucide="copy"></i>`;
    copyButton.addEventListener("click", () => copyModel(type, model.id));
    actions.append(defaultButton, copyButton, editButton);
    item.append(info, actions);
    target.append(item);
  }
  refreshIcons();
}

function openProviderEditor(providerId = "") {
  const provider = state.settings.providers.find((item) => item.id === providerId);
  state.editorSelection.providerId = provider?.id || "";
  const draft = provider || {
    id: makeId("provider"), name: "新平台", preset: "custom", baseUrl: "", authType: "bearer",
    chatEndpoint: "/v1/chat/completions", imageEndpoint: "/v1/images/generations", statusEndpoint: "/v1/media/status"
  };
  elements.providerEditorTitle.textContent = provider ? "编辑平台" : "添加平台";
  elements.providerName.value = draft.name;
  elements.providerPreset.value = draft.preset || "custom";
  elements.providerBaseUrl.value = draft.baseUrl;
  elements.providerAuthType.value = draft.authType;
  elements.providerApiKey.value = "";
  elements.providerApiKey.placeholder = state.keyState.providers.has(draft.id) ? "已安全保存，留空表示不修改" : "输入平台总 Key";
  elements.providerChatEndpoint.value = draft.chatEndpoint;
  elements.providerImageEndpoint.value = draft.imageEndpoint;
  elements.providerStatusEndpoint.value = draft.statusEndpoint;
  elements.providerEditor.dataset.draftId = draft.id;
  elements.providerEditor.hidden = false;
  elements.deleteProviderButton.hidden = !provider;
  elements.providerEditor.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function applyProviderPreset() {
  const preset = platformPresets[elements.providerPreset.value];
  if (!preset) return;
  elements.providerName.value = preset.label;
  elements.providerBaseUrl.value = preset.baseUrl;
  elements.providerAuthType.value = preset.authType;
  elements.providerChatEndpoint.value = preset.chatEndpoint;
  elements.providerImageEndpoint.value = preset.imageEndpoint;
  elements.providerStatusEndpoint.value = preset.statusEndpoint;
}

async function saveProvider() {
  try {
    const id = elements.providerEditor.dataset.draftId;
    const existing = state.settings.providers.find((item) => item.id === id);
    const provider = {
      id,
      name: elements.providerName.value.trim(),
      preset: elements.providerPreset.value,
      baseUrl: elements.providerBaseUrl.value.trim().replace(/\/+$/gu, ""),
      authType: elements.providerAuthType.value,
      chatEndpoint: elements.providerChatEndpoint.value.trim(),
      imageEndpoint: elements.providerImageEndpoint.value.trim(),
      statusEndpoint: elements.providerStatusEndpoint.value.trim()
    };
    if (!provider.name) throw new Error("平台名称不能为空。");
    buildApiUrl(provider.baseUrl, provider.chatEndpoint);
    buildApiUrl(provider.baseUrl, provider.imageEndpoint);
    if (provider.statusEndpoint) buildApiUrl(provider.baseUrl, provider.statusEndpoint);
    if (existing) Object.assign(existing, provider);
    else state.settings.providers.push(provider);
    const apiKey = elements.providerApiKey.value.trim();
    if (apiKey) await secureSet(credentialStorageKey("provider", id), apiKey);
    state.settings = normalizeSettings(state.settings);
    await persistSettings();
    await refreshKeyState();
    syncSettingsForm();
    elements.providerEditor.hidden = true;
    updateConnectionState();
    showToast("平台已保存");
  } catch (error) {
    showToast(error.message || "平台保存失败", true);
  }
}

async function deleteProvider() {
  const id = elements.providerEditor.dataset.draftId;
  if (!id) return;
  if (providerModelCount(id)) {
    showToast("该平台仍被模型使用，请先修改或删除这些模型", true);
    return;
  }
  if (state.settings.providers.length <= 1) {
    showToast("至少保留一个平台", true);
    return;
  }
  state.settings.providers = state.settings.providers.filter((provider) => provider.id !== id);
  await secureRemove(credentialStorageKey("provider", id));
  await persistSettings();
  await refreshKeyState();
  syncSettingsForm();
  elements.providerEditor.hidden = true;
  updateConnectionState();
  showToast("平台已删除");
}

function openModelEditor(type, modelId = "") {
  const model = state.settings.models.find((item) => item.type === type && item.id === modelId);
  state.editorSelection[`${type}ModelId`] = model?.id || "";
  const draft = model || {
    id: makeId(`${type}-model`), type, name: type === "chat" ? "新聊天模型" : "新生图模型", providerId: state.settings.providers[0].id,
    model: "", endpoint: "", extraParamsJson: "{}", ...(type === "image" ? { statusEndpoint: "", protocol: "openai-images", size: "1024x1024", aspectRatio: "" } : {})
  };
  const fields = type === "chat" ? {
    editor: elements.chatModelEditor, title: elements.chatModelEditorTitle, deleteButton: elements.deleteChatModelButton,
    name: elements.chatModelName, provider: elements.chatModelProvider, model: elements.chatModelId, key: elements.chatModelApiKey,
    endpoint: elements.chatModelEndpoint, extra: elements.chatModelExtraParams
  } : {
    editor: elements.imageModelEditor, title: elements.imageModelEditorTitle, deleteButton: elements.deleteImageModelButton,
    name: elements.imageModelName, provider: elements.imageModelProvider, model: elements.imageModelId, key: elements.imageModelApiKey,
    endpoint: elements.imageModelEndpoint, statusEndpoint: elements.imageModelStatusEndpoint, protocol: elements.imageProtocol,
    size: elements.imageModelSize, aspectRatio: elements.imageModelAspectRatio, extra: elements.imageModelExtraParams
  };
  fields.title.textContent = model ? `编辑${type === "chat" ? "聊天" : "生图"}模型` : `添加${type === "chat" ? "聊天" : "生图"}模型`;
  fields.name.value = draft.name;
  fields.provider.value = draft.providerId;
  fields.model.value = draft.model;
  fields.key.value = "";
  fields.key.placeholder = state.keyState.models.has(draft.id) ? "已安全保存，留空表示不修改" : "留空则继承平台总 Key";
  fields.endpoint.value = draft.endpoint || "";
  fields.extra.value = draft.extraParamsJson || "{}";
  if (type === "image") {
    fields.statusEndpoint.value = draft.statusEndpoint || "";
    fields.protocol.value = draft.protocol || "openai-images";
    fields.size.value = draft.size || "1024x1024";
    fields.aspectRatio.value = draft.aspectRatio || "";
  }
  fields.editor.dataset.draftId = draft.id;
  fields.editor.hidden = false;
  fields.deleteButton.hidden = !model;
  fields.editor.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

async function saveModel(type) {
  const isImage = type === "image";
  const fields = isImage ? {
    editor: elements.imageModelEditor, name: elements.imageModelName, provider: elements.imageModelProvider, model: elements.imageModelId, key: elements.imageModelApiKey,
    endpoint: elements.imageModelEndpoint, statusEndpoint: elements.imageModelStatusEndpoint, protocol: elements.imageProtocol, size: elements.imageModelSize,
    aspectRatio: elements.imageModelAspectRatio, extra: elements.imageModelExtraParams
  } : {
    editor: elements.chatModelEditor, name: elements.chatModelName, provider: elements.chatModelProvider, model: elements.chatModelId, key: elements.chatModelApiKey,
    endpoint: elements.chatModelEndpoint, extra: elements.chatModelExtraParams
  };
  try {
    const id = fields.editor.dataset.draftId;
    const model = {
      id, type, name: fields.name.value.trim(), providerId: fields.provider.value, model: fields.model.value.trim(), endpoint: fields.endpoint.value.trim(), extraParamsJson: fields.extra.value.trim() || "{}"
    };
    if (isImage) Object.assign(model, { statusEndpoint: fields.statusEndpoint.value.trim(), protocol: fields.protocol.value, size: fields.size.value.trim(), aspectRatio: fields.aspectRatio.value.trim() });
    if (!model.name || !model.model) throw new Error("模型名称和模型 ID 不能为空。");
    if (!state.settings.providers.some((provider) => provider.id === model.providerId)) throw new Error("请选择有效的平台。");
    JSON.parse(model.extraParamsJson);
    if (isImage) {
      const sizing = resolveImageSizing(model);
      model.size = sizing.size;
      model.aspectRatio = sizing.aspectRatio;
    }
    const index = state.settings.models.findIndex((item) => item.id === id);
    if (index >= 0) state.settings.models[index] = model;
    else state.settings.models.push(model);
    const apiKey = fields.key.value.trim();
    if (apiKey) await secureSet(credentialStorageKey("model", id), apiKey);
    state.settings = normalizeSettings(state.settings);
    if (!state.settings.selections[isImage ? "imageModelId" : "chatModelId"]) state.settings.selections[isImage ? "imageModelId" : "chatModelId"] = id;
    await persistSettings();
    await refreshKeyState();
    syncSettingsForm();
    fields.editor.hidden = true;
    updateConnectionState();
    showToast("模型已保存");
  } catch (error) {
    showToast(error.message || "模型保存失败", true);
  }
}

async function deleteModel(type) {
  const editor = type === "chat" ? elements.chatModelEditor : elements.imageModelEditor;
  const id = editor.dataset.draftId;
  const models = state.settings.models.filter((model) => model.type === type);
  if (!id || models.length <= 1) {
    showToast(`至少保留一个${type === "chat" ? "聊天" : "生图"}模型`, true);
    return;
  }
  state.settings.models = state.settings.models.filter((model) => model.id !== id);
  if (state.settings.selections[type === "chat" ? "chatModelId" : "imageModelId"] === id) {
    state.settings.selections[type === "chat" ? "chatModelId" : "imageModelId"] = models.find((model) => model.id !== id).id;
  }
  await secureRemove(credentialStorageKey("model", id));
  await persistSettings();
  await refreshKeyState();
  syncSettingsForm();
  editor.hidden = true;
  updateConnectionState();
  showToast("模型已删除");
}

async function copyModel(type, modelId) {
  const source = state.settings.models.find((model) => model.type === type && model.id === modelId);
  if (!source) return;
  const copy = { ...source, id: makeId(`${type}-model`), name: `${source.name} 副本` };
  state.settings.models.push(copy);
  await persistSettings();
  await refreshKeyState();
  syncSettingsForm();
  setSettingsTab(type);
  openModelEditor(type, copy.id);
  showToast("已复制模型配置，请填写专属 Key");
}

function syncImageEditorSizing() {
  const model = elements.imageModelId.value.trim() || "custom-image";
  const sizing = resolveImageSizing({ model, protocol: elements.imageProtocol.value, size: elements.imageModelSize.value, aspectRatio: elements.imageModelAspectRatio.value });
  elements.imageModelSize.value = sizing.size;
  elements.imageModelAspectRatio.value = sizing.aspectRatio;
}

function credentialStorageKey(scope, id) {
  return `cc-mobile-${scope}-key-${id}`;
}

async function persistSettings() {
  await Preferences.set({ key: settingsKey, value: JSON.stringify(state.settings) });
}

async function refreshKeyState() {
  const providerKeys = await Promise.all(state.settings.providers.map(async (provider) => [provider.id, Boolean(await secureGet(credentialStorageKey("provider", provider.id)))]));
  const modelKeys = await Promise.all(state.settings.models.map(async (model) => [model.id, Boolean(await secureGet(credentialStorageKey("model", model.id)))]));
  state.keyState.providers = new Set(providerKeys.filter(([, ready]) => ready).map(([id]) => id));
  state.keyState.models = new Set(modelKeys.filter(([, ready]) => ready).map(([id]) => id));
}

async function getCredential(type) {
  const resolved = resolveModelConnection(state.settings, type);
  const modelKey = await secureGet(credentialStorageKey("model", resolved.model.id));
  if (modelKey) return modelKey;
  return await secureGet(credentialStorageKey("provider", resolved.provider.id));
}

function renderModelPickers() {
  const chatModels = state.settings.models.filter((model) => model.type === "chat");
  const imageModels = state.settings.models.filter((model) => model.type === "image");
  fillOptions(elements.chatModelPicker, chatModels.map((model) => [model.id, model.name]));
  fillOptions(elements.imageModelPicker, imageModels.map((model) => [model.id, model.name]));
  elements.chatModelPicker.value = state.settings.selections.chatModelId;
  elements.imageModelPicker.value = state.settings.selections.imageModelId;
}

function fillOptions(target, options) {
  target.replaceChildren(...options.map(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

async function selectModel(type, modelId) {
  const key = type === "image" ? "imageModelId" : "chatModelId";
  if (!state.settings.models.some((model) => model.type === type && model.id === modelId)) return;
  state.settings.selections[key] = modelId;
  await persistSettings();
  await refreshKeyState();
  if (type === "image") syncImageSizingControls(resolveRuntimeSettings(state.settings).image);
  updateConnectionState();
  showToast(`${type === "image" ? "生图" : "聊天"}模型已切换`);
}

function syncImageSizingControls(connection) {
  const sizing = resolveImageSizing(connection);
  const profile = imageSizingProfile(connection.model, connection.protocol);
  fillOptions(elements.imageSizeControl, profile.sizeOptions);
  fillOptions(elements.imageAspectRatioControl, profile.aspectOptions);
  elements.imageSizeLabel.textContent = profile.label;
  elements.imageSizeControl.value = sizing.size;
  elements.imageAspectRatioControl.value = sizing.aspectRatio;
  elements.imageAspectField.hidden = profile.aspectOptions.length === 0;
  elements.imageSizeField.classList.toggle("is-wide", profile.aspectOptions.length === 0);
  return sizing;
}

async function persistImageSizing() {
  const resolved = resolveModelConnection(state.settings, "image");
  const sizing = resolveImageSizing({
    ...resolved.connection,
    size: elements.imageSizeControl.value,
    aspectRatio: elements.imageAspectRatioControl.value
  });
  const model = state.settings.models.find((item) => item.id === resolved.model.id);
  Object.assign(model, { size: sizing.size, aspectRatio: sizing.aspectRatio });
  await persistSettings();
  syncImageSizingControls(resolveRuntimeSettings(state.settings).image);
  return sizing;
}

async function saveSettings() {
  try {
    state.settings.behavior = { allowModelImageTool: elements.allowTool.checked, notifications: elements.notifications.checked };
    await persistSettings();
    if (state.settings.behavior.notifications) await ensureNotificationPermission();
    await refreshKeyState();
    syncSettingsForm();
    updateConnectionState();
    closeSettings();
    showToast("设置已保存");
  } catch (error) {
    showToast(error.message || "设置保存失败", true);
  }
}

function updateConnectionState() {
  const runtime = resolveRuntimeSettings(state.settings);
  const chatReady = runtime.chat.authType === "none" || state.keyState.models.has(runtime.chatModel.id) || state.keyState.providers.has(runtime.chatProvider.id);
  const imageReady = runtime.image.authType === "none" || state.keyState.models.has(runtime.imageModel.id) || state.keyState.providers.has(runtime.imageProvider.id);
  const ready = chatReady && imageReady;
  elements.connectionState.textContent = ready ? `${runtime.chatModel.name} · ${runtime.imageModel.name}` : "请配置模型连接";
  elements.connectionState.classList.toggle("is-ready", ready);
}

async function submitComposer() {
  const prompt = elements.promptInput.value.trim();
  if (!prompt || state.busy) return;
  elements.promptInput.value = "";
  autoSizeComposer();
  state.busy = true;
  updateBusyState();
  addMessage({ role: "user", type: "text", content: prompt });
  try {
    if (state.mode === "image") {
      const sizing = await persistImageSizing();
      await runImageGeneration({ prompt, size: sizing.size, aspect_ratio: sizing.aspectRatio });
    }
    else await runChat(prompt);
  } catch (error) {
    addMessage({ role: "assistant", type: "error", content: error.message || "请求失败。" });
  } finally {
    state.busy = false;
    updateBusyState();
    await persistHistory();
  }
}

async function runChat(prompt) {
  const runtime = resolveRuntimeSettings(state.settings);
  const chatKey = await getCredential("chat");
  if (!chatKey && runtime.chat.authType !== "none") throw new Error("请先在设置中为当前聊天模型配置 Key。");
  const history = conversationMessages();
  const imageToolEnabled = state.settings.behavior.allowModelImageTool && shouldOfferImageTool(prompt);
  let response;
  try {
    response = await requestChat(history, chatKey, imageToolEnabled);
  } catch (error) {
    if (!imageToolEnabled || !/tool|function|unsupported|不支持/iu.test(error.message || "")) throw error;
    response = await requestChat(history, chatKey, false, true);
  }
  const assistant = extractAssistantMessage(response);
  const toolCalls = imageToolEnabled ? extractImageToolCalls(assistant) : [];
  if (!toolCalls.length) {
    addMessage({ role: "assistant", type: "text", content: readableContent(assistant.content) || "我已经处理完成。" });
    return;
  }

  if (readableContent(assistant.content) && !assistant.tool_calls?.length) {
    const text = readableContent(assistant.content).replace(/```(?:json)?[\s\S]*?```/giu, "").trim();
    if (text) addMessage({ role: "assistant", type: "text", content: text });
  }

  const toolResults = [];
  for (const call of toolCalls) {
    const result = await runImageGeneration(call.args, { requestFeedback: true });
    toolResults.push({ call, result });
  }
  await requestGenerationFeedback(history, assistant, toolResults, chatKey);
}

async function requestChat(messages, apiKey, tools, toolFallback = false) {
  const runtime = resolveRuntimeSettings(state.settings);
  const target = buildApiUrl(runtime.chat.baseUrl, runtime.chat.endpoint);
  const auth = authRequest(runtime.chat, apiKey, target);
  return await requestJson({ method: "POST", url: auth.url, headers: auth.headers, data: buildChatPayload(messages, runtime, { tools, toolFallback }) });
}

async function requestGenerationFeedback(history, assistant, toolResults, apiKey) {
  try {
    let messages;
    if (assistant.tool_calls?.length) {
      messages = [...history, assistant, ...toolResults.map(({ call, result }) => ({
        role: "tool", tool_call_id: call.id, content: JSON.stringify({ status: "completed", image_url: result.url, prompt: result.prompt })
      }))];
    } else {
      messages = [...history, { role: "assistant", content: readableContent(assistant.content) }, {
        role: "user", content: `系统已经完成生图并返回 ${toolResults.length} 张图片。请确认任务完成并简要总结生成内容。`
      }];
    }
    const response = await requestChat(messages, apiKey, false);
    const finalMessage = extractAssistantMessage(response);
    addMessage({ role: "assistant", type: "text", content: readableContent(finalMessage.content) || "图片已生成完成。" });
  } catch {
    addMessage({ role: "assistant", type: "text", content: "图片已生成完成，结果已经放在上方。" });
  }
}

async function runImageGeneration(args) {
  const runtime = resolveRuntimeSettings(state.settings);
  const imageKey = await getCredential("image");
  if (!imageKey && runtime.image.authType !== "none") throw new Error("请先在设置中为当前生图模型配置 Key。");
  const job = addMessage({ role: "assistant", type: "job", content: "正在提交生图任务", status: "running", progress: "" });
  let result;
  try {
    result = await generateImageWithConnection({
      settings: state.settings,
      apiKey: imageKey,
      args,
      request: requestJson,
      sleep: (ms) => new Promise((resolve) => window.setTimeout(resolve, ms)),
      onProgress: ({ progress, state: taskState }) => {
        job.content = taskState === "pending" ? "任务正在排队" : "图片正在生成";
        job.progress = progress;
        renderConversation();
      }
    });
  } catch (error) {
    state.messages = state.messages.filter((message) => message.id !== job.id);
    renderConversation();
    await persistHistory();
    throw error;
  }
  job.type = "image";
  job.status = "done";
  job.content = result.prompt;
  job.imageUrl = result.url;
  job.taskId = result.taskId || "";
  renderConversation();
  await persistHistory();
  await notifyGenerationComplete(result.prompt);
  return result;
}

function conversationMessages() {
  return state.messages
    .filter((message) => message.type === "text" && ["user", "assistant"].includes(message.role))
    .slice(-30)
    .map((message) => ({ role: message.role, content: message.content }));
}

function readableContent(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((item) => item?.text || item?.content || "").join("\n").trim();
  return "";
}

function addMessage(message) {
  const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...message };
  state.messages.push(item);
  if (state.messages.length > maxHistoryItems) state.messages.splice(0, state.messages.length - maxHistoryItems);
  renderConversation();
  persistHistory();
  return item;
}

function renderConversation() {
  elements.conversation.replaceChildren();
  if (!state.messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<img src="/app-icon.png" alt="" /><strong>开始创作</strong><span>输入一句话，助手会在需要时直接生成图片。</span>`;
    elements.conversation.append(empty);
  } else {
    for (const message of state.messages) elements.conversation.append(createMessageElement(message));
  }
  requestAnimationFrame(() => { elements.conversation.scrollTop = elements.conversation.scrollHeight; refreshIcons(); });
}

function createMessageElement(message) {
  const row = document.createElement("article");
  row.className = `message-row role-${message.role} type-${message.type}`;
  row.dataset.messageId = message.id;
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  if (message.type === "image") {
    const image = document.createElement("img");
    image.src = message.imageUrl;
    image.alt = message.content || "生成图片";
    image.loading = "lazy";
    image.addEventListener("click", () => openImagePreview(message.imageUrl));
    const meta = document.createElement("div");
    meta.className = "image-meta";
    const text = document.createElement("span");
    text.textContent = message.content || "图片已生成";
    const open = document.createElement("a");
    open.href = message.imageUrl;
    open.target = "_blank";
    open.rel = "noreferrer";
    open.title = "打开原图";
    open.innerHTML = `<i data-lucide="external-link"></i>`;
    meta.append(text, open);
    bubble.append(image, meta);
  } else if (message.type === "job") {
    const status = document.createElement("div");
    status.className = "job-status";
    status.innerHTML = `<i data-lucide="loader-circle"></i><div><strong>${escapeText(message.content)}</strong><span>${escapeText(message.progress || "请稍候")}</span></div>`;
    bubble.append(status);
  } else {
    const text = document.createElement("p");
    text.textContent = message.content;
    bubble.append(text);
  }
  row.append(bubble);
  return row;
}

function escapeText(value) {
  return String(value || "").replace(/[&<>"']/gu, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function openImagePreview(url) {
  elements.imagePreview.querySelector("img").src = url;
  elements.imagePreview.showModal();
}

async function requestJson(options) {
  const response = await CapacitorHttp.request({
    method: options.method || "GET",
    url: options.url,
    headers: options.headers || {},
    data: options.data,
    connectTimeout: 60000,
    readTimeout: 180000
  });
  const data = typeof response.data === "string" ? tryJson(response.data) : response.data;
  if (response.status < 200 || response.status >= 300) {
    const message = data?.error?.message || data?.error || data?.message || `${response.status} ${response.url || "API 请求失败"}`;
    throw new Error(String(message));
  }
  return data;
}

function tryJson(value) {
  try { return JSON.parse(value); } catch { return { text: value }; }
}

async function secureGet(key) {
  if (!Capacitor.isNativePlatform()) return sessionStorage.getItem(`secure:${key}`) || "";
  try { return (await SecureStore.get({ key })).value || ""; } catch { return ""; }
}

async function secureSet(key, value) {
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.setItem(`secure:${key}`, value);
    return;
  }
  await SecureStore.set({ key, value });
}

async function secureRemove(key) {
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.removeItem(`secure:${key}`);
    return;
  }
  try { await SecureStore.remove({ key }); } catch { /* Missing legacy key is harmless. */ }
}

async function persistHistory() {
  await Preferences.set({ key: historyKey, value: JSON.stringify(state.messages.slice(-maxHistoryItems)) });
}

async function clearHistory() {
  await clearConversationData();
  showToast("聊天记录已清空");
}

function openNewConversationDialog() {
  if (state.busy) {
    showToast("当前任务完成后才能新建对话", true);
    return;
  }
  elements.newConversationDialog.showModal();
}

async function createNewConversation() {
  elements.confirmNewConversationButton.disabled = true;
  try {
    await clearConversationData();
    elements.promptInput.value = "";
    autoSizeComposer();
    setMode("chat");
    elements.newConversationDialog.close();
    showToast("已新建对话");
  } finally {
    elements.confirmNewConversationButton.disabled = false;
  }
}

async function clearConversationData() {
  for (const message of state.messages) {
    if (typeof message.imageUrl === "string" && message.imageUrl.startsWith("blob:")) URL.revokeObjectURL(message.imageUrl);
  }
  elements.conversation.querySelectorAll("img").forEach((image) => image.removeAttribute("src"));
  const previewImage = elements.imagePreview.querySelector("img");
  previewImage.removeAttribute("src");
  if (elements.imagePreview.open) elements.imagePreview.close();
  state.messages = [];
  await Preferences.remove({ key: historyKey });
  renderConversation();
}

function updateBusyState() {
  elements.newConversationButton.disabled = state.busy;
  elements.sendButton.disabled = state.busy;
  elements.promptInput.disabled = state.busy;
  elements.imageSizeControl.disabled = state.busy;
  elements.imageAspectRatioControl.disabled = state.busy;
  elements.sendButton.innerHTML = state.busy ? `<i data-lucide="loader-circle"></i>` : `<i data-lucide="send"></i>`;
  elements.sendButton.classList.toggle("is-loading", state.busy);
  refreshIcons();
}

function autoSizeComposer() {
  elements.promptInput.style.height = "auto";
  elements.promptInput.style.height = `${Math.min(elements.promptInput.scrollHeight, 144)}px`;
}

async function ensureNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false;
  let permission = await LocalNotifications.checkPermissions();
  if (permission.display === "prompt") permission = await LocalNotifications.requestPermissions();
  return permission.display === "granted";
}

async function notifyGenerationComplete(prompt) {
  if (!state.settings.behavior.notifications || !(await ensureNotificationPermission())) return;
  await LocalNotifications.schedule({ notifications: [{
    id: Math.floor(Date.now() % 2147483647),
    title: "图片已生成",
    body: String(prompt || "生成任务已完成").slice(0, 100),
    smallIcon: "ic_stat_cc"
  }] });
}

let toastTimer = 0;
function showToast(message, error = false) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("is-error", error);
  const composerHeight = document.querySelector(".composer-wrap")?.getBoundingClientRect().height || 116;
  elements.toast.style.bottom = `${Math.ceil(composerHeight) + 12}px`;
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => { elements.toast.hidden = true; }, 2600);
}
