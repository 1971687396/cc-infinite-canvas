export const SETTINGS_VERSION = 2;

const legacyDefaultChat = Object.freeze({
  baseUrl: "https://yunwu.ai",
  endpoint: "/v1/chat/completions",
  model: "gpt-5.6-sol",
  authType: "bearer",
  extraParamsJson: "{}"
});

const legacyDefaultImage = Object.freeze({
  baseUrl: "https://yunwu.ai",
  endpoint: "/v1/images/generations",
  statusEndpoint: "/v1/media/status",
  model: "gpt-image-2",
  protocol: "openai-images",
  authType: "bearer",
  size: "1024x1024",
  aspectRatio: "1:1",
  extraParamsJson: "{}"
});

export const platformPresets = Object.freeze({
  yunwu: {
    label: "云雾平台",
    baseUrl: "https://yunwu.ai",
    authType: "bearer",
    chatEndpoint: "/v1/chat/completions",
    imageEndpoint: "/v1/images/generations",
    statusEndpoint: "/v1/media/status"
  },
  lk888: {
    label: "LK888",
    baseUrl: "https://api.lk888.ai",
    authType: "bearer",
    chatEndpoint: "/v1/chat/completions",
    imageEndpoint: "/v1/media/generate",
    statusEndpoint: "/v1/media/status"
  },
  custom: {
    label: "自定义平台",
    baseUrl: "",
    authType: "bearer",
    chatEndpoint: "/v1/chat/completions",
    imageEndpoint: "/v1/images/generations",
    statusEndpoint: "/v1/media/status"
  }
});

export const defaultSettings = Object.freeze({
  version: SETTINGS_VERSION,
  providers: [
    {
      id: "provider-yunwu",
      name: "云雾平台",
      preset: "yunwu",
      baseUrl: "https://yunwu.ai",
      authType: "bearer",
      chatEndpoint: "/v1/chat/completions",
      imageEndpoint: "/v1/images/generations",
      statusEndpoint: "/v1/media/status"
    }
  ],
  models: [
    {
      id: "chat-gpt-5-6-sol",
      type: "chat",
      name: "GPT 5.6 SOL",
      providerId: "provider-yunwu",
      model: "gpt-5.6-sol",
      endpoint: "",
      extraParamsJson: "{}"
    },
    {
      id: "image-gpt-image-2",
      type: "image",
      name: "GPT Image 2",
      providerId: "provider-yunwu",
      model: "gpt-image-2",
      endpoint: "",
      statusEndpoint: "",
      protocol: "openai-images",
      size: "1024x1024",
      aspectRatio: "",
      extraParamsJson: "{}"
    }
  ],
  selections: {
    chatModelId: "chat-gpt-5-6-sol",
    imageModelId: "image-gpt-image-2"
  },
  behavior: {
    allowModelImageTool: true,
    notifications: true
  }
});

export const connectionPresets = Object.freeze({
  yunwu: {
    label: "云雾平台",
    chat: { baseUrl: "https://yunwu.ai", endpoint: "/v1/chat/completions", authType: "bearer" },
    image: { baseUrl: "https://yunwu.ai", endpoint: "/v1/images/generations", protocol: "openai-images", authType: "bearer" }
  },
  lk888: {
    label: "LK888 Media Generate",
    chat: { baseUrl: "https://api.lk888.ai", endpoint: "/v1/chat/completions", authType: "bearer" },
    image: {
      baseUrl: "https://api.lk888.ai",
      endpoint: "/v1/media/generate",
      statusEndpoint: "/v1/media/status",
      protocol: "media-generate",
      authType: "bearer",
      size: "2K",
      aspectRatio: "1:1"
    }
  },
  custom: { label: "自定义中转站", chat: {}, image: {} }
});

const commonAspectRatioOptions = Object.freeze([
  ["1:1", "1:1"], ["16:9", "16:9"], ["9:16", "9:16"], ["4:3", "4:3"],
  ["3:4", "3:4"], ["3:2", "3:2"], ["2:3", "2:3"], ["21:9", "21:9"]
]);

const gptImageSizeOptions = Object.freeze([
  ["auto", "自动"],
  ["1024x1024", "1024x1024 (1:1, 1K)"], ["2048x2048", "2048x2048 (1:1, 2K)"], ["2880x2880", "2880x2880 (1:1, 4K)"],
  ["1280x720", "1280x720 (16:9, 1K)"], ["2048x1152", "2048x1152 (16:9, 2K)"], ["3840x2160", "3840x2160 (16:9, 4K)"],
  ["720x1280", "720x1280 (9:16, 1K)"], ["1152x2048", "1152x2048 (9:16, 2K)"], ["2160x3840", "2160x3840 (9:16, 4K)"],
  ["1152x864", "1152x864 (4:3, 1K)"], ["2304x1728", "2304x1728 (4:3, 2K)"], ["3264x2448", "3264x2448 (4:3, 4K)"],
  ["864x1152", "864x1152 (3:4, 1K)"], ["1728x2304", "1728x2304 (3:4, 2K)"], ["2448x3264", "2448x3264 (3:4, 4K)"],
  ["1456x624", "1456x624 (21:9, 1K)"], ["2912x1248", "2912x1248 (21:9, 2K)"], ["3840x1648", "3840x1648 (21:9, 4K)"],
  ["624x1456", "624x1456 (9:21, 1K)"], ["1248x2912", "1248x2912 (9:21, 2K)"], ["1648x3840", "1648x3840 (9:21, 4K)"]
]);

const grokImageSizeOptions = Object.freeze([
  ["960x960", "960x960 (1:1)"], ["1280x720", "1280x720 (16:9)"], ["720x1280", "720x1280 (9:16)"],
  ["1168x784", "1168x784 (3:2)"], ["784x1168", "784x1168 (2:3)"]
]);

const gptTierDimensions = Object.freeze({
  "1K": { "1:1": "1024x1024", "16:9": "1280x720", "9:16": "720x1280", "4:3": "1152x864", "3:4": "864x1152", "21:9": "1456x624", "9:21": "624x1456" },
  "2K": { "1:1": "2048x2048", "16:9": "2048x1152", "9:16": "1152x2048", "4:3": "2304x1728", "3:4": "1728x2304", "21:9": "2912x1248", "9:21": "1248x2912" },
  "4K": { "1:1": "2880x2880", "16:9": "3840x2160", "9:16": "2160x3840", "4:3": "3264x2448", "3:4": "2448x3264", "21:9": "3840x1648", "9:21": "1648x3840" }
});

const seedreamDimensions = Object.freeze({
  "1K": [["1024x1024", "1024x1024 (1:1)"], ["1280x720", "1280x720 (16:9)"], ["720x1280", "720x1280 (9:16)"], ["1152x864", "1152x864 (4:3)"], ["864x1152", "864x1152 (3:4)"]],
  "2K": [["2048x2048", "2048x2048 (1:1)"], ["2848x1600", "2848x1600 (16:9)"], ["1600x2848", "1600x2848 (9:16)"], ["2304x1728", "2304x1728 (4:3)"], ["1728x2304", "1728x2304 (3:4)"]],
  "3K": [["3072x3072", "3072x3072 (1:1)"], ["4096x2304", "4096x2304 (16:9)"], ["2304x4096", "2304x4096 (9:16)"], ["3456x2592", "3456x2592 (4:3)"], ["2592x3456", "2592x3456 (3:4)"]],
  "4K": [["4096x4096", "4096x4096 (1:1)"], ["5504x3040", "5504x3040 (16:9)"], ["3040x5504", "3040x5504 (9:16)"], ["4704x3520", "4704x3520 (4:3)"], ["3520x4704", "3520x4704 (3:4)"]]
});

export function imageModelFamily(model) {
  const normalized = String(model || "").trim().toLowerCase();
  const compact = normalized.replace(/[^a-z0-9]+/gu, "");
  if (compact.includes("gptimage")) return "gpt";
  if (normalized.includes("grok") && normalized.includes("image")) return "grok";
  if (normalized.includes("banana") || (normalized.includes("gemini") && normalized.includes("image"))) return "gemini";
  if (normalized.includes("seedream")) return "seedream";
  return "custom";
}

function seedreamTiers(model) {
  const normalized = String(model || "").toLowerCase();
  if (/5[.-]?0.*lite|lite.*5[.-]?0/iu.test(normalized)) return ["2K", "3K", "4K"];
  if (/4[.-]?5/iu.test(normalized)) return ["2K", "4K"];
  if (/4[.-]?0/iu.test(normalized)) return ["1K", "2K", "4K"];
  return ["1K", "2K"];
}

export function imageSizingProfile(model, protocol = "openai-images") {
  const family = imageModelFamily(model);
  if (family === "gpt") return { family, label: "GPT Image 像素尺寸", sizeOptions: gptImageSizeOptions, aspectOptions: [], defaultSize: "1024x1024", defaultAspectRatio: "" };
  if (family === "grok") return { family, label: "Grok 固定尺寸", sizeOptions: grokImageSizeOptions, aspectOptions: [], defaultSize: "960x960", defaultAspectRatio: "" };
  if (family === "gemini") return { family, label: "图片尺寸", sizeOptions: [["1K", "1K"], ["2K", "2K"], ["4K", "4K"]], aspectOptions: commonAspectRatioOptions, defaultSize: "2K", defaultAspectRatio: "1:1" };
  if (family === "seedream") {
    const tiers = seedreamTiers(model);
    const tierOptions = tiers.map((tier) => [tier, `${tier} 默认比例`]);
    const sizeOptions = protocol === "media-generate" ? tierOptions : [...tierOptions, ...tiers.flatMap((tier) => seedreamDimensions[tier] || [])];
    return { family, label: "Seedream 尺寸", sizeOptions, aspectOptions: protocol === "media-generate" ? commonAspectRatioOptions : [], defaultSize: "2K", defaultAspectRatio: protocol === "media-generate" ? "1:1" : "" };
  }
  if (protocol === "media-generate") {
    return { family, label: "任务尺寸", sizeOptions: [["1K", "1K"], ["2K", "2K"], ["4K", "4K"]], aspectOptions: commonAspectRatioOptions, defaultSize: "2K", defaultAspectRatio: "1:1", custom: true };
  }
  return {
    family,
    label: "图片尺寸",
    sizeOptions: [["auto", "自动"], ["1024x1024", "1024x1024 (1:1)"], ["1536x1024", "1536x1024 (3:2)"], ["1024x1536", "1024x1536 (2:3)"]],
    aspectOptions: [],
    defaultSize: "1024x1024",
    defaultAspectRatio: "",
    custom: true
  };
}

function normalizedRatio(value, fallback = "1:1") {
  const requested = String(value || "").trim();
  return /^\d+:\d+$/u.test(requested) ? requested : fallback;
}

function gptPixelSizeIsValid(value) {
  if (value === "auto") return true;
  const match = String(value || "").match(/^(\d{3,5})x(\d{3,5})$/iu);
  if (!match) return false;
  const width = Number(match[1]);
  const height = Number(match[2]);
  const ratio = width / height;
  const pixels = width * height;
  return width % 16 === 0 && height % 16 === 0 && ratio >= 1 / 3 && ratio <= 3 && pixels >= 655360 && pixels <= 8294400;
}

function closestGptRatio(value) {
  const requested = normalizedRatio(value);
  const [requestedWidth, requestedHeight] = requested.split(":").map(Number);
  const ratio = requestedWidth / requestedHeight;
  return ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"]
    .map((item) => {
      const [width, height] = item.split(":").map(Number);
      return { item, delta: Math.abs(Math.log((width / height) / ratio)) };
    })
    .sort((left, right) => left.delta - right.delta)[0].item;
}

function gptSizeForTier(tier, ratio) {
  const normalizedTier = String(tier || "").trim().toUpperCase();
  const normalizedAspectRatio = closestGptRatio(ratio || "1:1");
  return gptTierDimensions[normalizedTier]?.[normalizedAspectRatio] || gptTierDimensions[normalizedTier]?.["1:1"] || "1024x1024";
}

function grokSizeForRatio(ratio) {
  const requested = normalizedRatio(ratio);
  const map = { "1:1": "960x960", "16:9": "1280x720", "9:16": "720x1280", "3:2": "1168x784", "2:3": "784x1168" };
  return map[requested] || "960x960";
}

export function resolveImageSizing({ model, protocol = "openai-images", size, aspectRatio } = {}) {
  const profile = imageSizingProfile(model, protocol);
  let requestedSize = String(size || "").trim();
  let requestedAspectRatio = String(aspectRatio || "").trim();
  const compound = requestedSize.match(/^(\d+:\d+)[|@]([1-4]K)$/iu);
  if (compound) {
    requestedAspectRatio = compound[1];
    requestedSize = compound[2].toUpperCase();
  }

  if (profile.family === "gpt") {
    if (/^[124]K$/iu.test(requestedSize)) requestedSize = gptSizeForTier(requestedSize, requestedAspectRatio);
    else if (/^\d+:\d+$/u.test(requestedSize)) requestedSize = gptSizeForTier("1K", requestedSize);
    if (!gptPixelSizeIsValid(requestedSize)) requestedSize = profile.defaultSize;
    return { size: requestedSize, aspectRatio: "", profile };
  }

  if (profile.family === "grok") {
    const allowed = new Set(profile.sizeOptions.map(([value]) => value));
    if (/^\d+:\d+$/u.test(requestedSize)) requestedSize = grokSizeForRatio(requestedSize);
    if (!allowed.has(requestedSize)) requestedSize = grokSizeForRatio(requestedAspectRatio);
    return { size: requestedSize, aspectRatio: "", profile };
  }

  if (profile.family === "gemini") {
    requestedSize = requestedSize.toUpperCase();
    if (!new Set(profile.sizeOptions.map(([value]) => value)).has(requestedSize)) requestedSize = profile.defaultSize;
    const allowedRatios = new Set(profile.aspectOptions.map(([value]) => value));
    if (!allowedRatios.has(requestedAspectRatio)) requestedAspectRatio = profile.defaultAspectRatio;
    return { size: requestedSize, aspectRatio: requestedAspectRatio, profile };
  }

  if (profile.family === "seedream") {
    const allowed = new Set(profile.sizeOptions.map(([value]) => value));
    const normalizedTier = requestedSize.toUpperCase();
    if (allowed.has(normalizedTier)) requestedSize = normalizedTier;
    else if (!allowed.has(requestedSize)) requestedSize = profile.defaultSize;
    if (protocol === "media-generate") {
      const allowedRatios = new Set(profile.aspectOptions.map(([value]) => value));
      if (!allowedRatios.has(requestedAspectRatio)) requestedAspectRatio = profile.defaultAspectRatio;
    } else requestedAspectRatio = "";
    return { size: requestedSize, aspectRatio: requestedAspectRatio, profile };
  }

  if (!requestedSize) requestedSize = profile.defaultSize;
  if (protocol !== "media-generate") requestedAspectRatio = "";
  else if (!requestedAspectRatio) requestedAspectRatio = profile.defaultAspectRatio;
  return { size: requestedSize, aspectRatio: requestedAspectRatio, profile };
}

function normalizedId(value, fallback) {
  const id = String(value || "").trim().replace(/[^a-z0-9_-]+/giu, "-").replace(/^-+|-+$/gu, "");
  return id || fallback;
}

function uniqueId(requested, fallback, used) {
  const base = normalizedId(requested, fallback);
  let id = base;
  let index = 2;
  while (used.has(id)) {
    id = `${base}-${index}`;
    index += 1;
  }
  used.add(id);
  return id;
}

function modelDisplayName(model, fallback) {
  const value = String(model || "").trim();
  const known = {
    "gpt-5.6-sol": "GPT 5.6 SOL",
    "gpt-image-2": "GPT Image 2",
    "gemini-3.1-flash-image-preview": "banana2",
    "grok-imagine-image": "Grok Imagine Image"
  };
  return known[value.toLowerCase()] || value || fallback;
}

function presetForBaseUrl(baseUrl) {
  const normalized = String(baseUrl || "").trim().replace(/\/+$/gu, "");
  return Object.entries(platformPresets).find(([name, preset]) => name !== "custom" && preset.baseUrl === normalized)?.[0] || "custom";
}

function providerFromLegacy(connection, id, name, type) {
  const preset = presetForBaseUrl(connection.baseUrl);
  const presetValue = platformPresets[preset] || platformPresets.custom;
  return {
    id,
    name: preset === "custom" ? name : presetValue.label,
    preset,
    baseUrl: String(connection.baseUrl || presetValue.baseUrl).trim(),
    authType: connection.authType || presetValue.authType,
    chatEndpoint: type === "chat" ? connection.endpoint : presetValue.chatEndpoint,
    imageEndpoint: type === "image" ? connection.endpoint : presetValue.imageEndpoint,
    statusEndpoint: type === "image" ? connection.statusEndpoint : presetValue.statusEndpoint
  };
}

function migrateLegacySettings(value) {
  const chat = { ...legacyDefaultChat, ...(value.chat || {}) };
  const image = { ...legacyDefaultImage, ...(value.image || {}) };
  const sharedProvider = String(chat.baseUrl).replace(/\/+$/gu, "") === String(image.baseUrl).replace(/\/+$/gu, "") && chat.authType === image.authType;
  const providers = sharedProvider
    ? [{
        ...providerFromLegacy(chat, "provider-migrated", "原有平台", "chat"),
        imageEndpoint: image.endpoint,
        statusEndpoint: image.statusEndpoint
      }]
    : [
        providerFromLegacy(chat, "provider-chat-migrated", "原有聊天平台", "chat"),
        providerFromLegacy(image, "provider-image-migrated", "原有生图平台", "image")
      ];
  const chatProviderId = providers[0].id;
  const imageProviderId = sharedProvider ? providers[0].id : providers[1].id;
  return {
    version: SETTINGS_VERSION,
    providers,
    models: [
      {
        id: "chat-model-migrated",
        type: "chat",
        name: modelDisplayName(chat.model, "原有聊天模型"),
        providerId: chatProviderId,
        model: chat.model,
        endpoint: "",
        extraParamsJson: chat.extraParamsJson || "{}"
      },
      {
        id: "image-model-migrated",
        type: "image",
        name: modelDisplayName(image.model, "原有生图模型"),
        providerId: imageProviderId,
        model: image.model,
        endpoint: "",
        statusEndpoint: "",
        protocol: image.protocol || "openai-images",
        size: image.size,
        aspectRatio: image.aspectRatio,
        extraParamsJson: image.extraParamsJson || "{}"
      }
    ],
    selections: { chatModelId: "chat-model-migrated", imageModelId: "image-model-migrated" },
    behavior: { ...defaultSettings.behavior, ...(value.behavior || {}) }
  };
}

export function settingsNeedMigration(value) {
  return !Array.isArray(value?.providers) || !Array.isArray(value?.models);
}

export function normalizeSettings(value = {}) {
  const source = settingsNeedMigration(value) ? migrateLegacySettings(value) : value;
  const providerIds = new Set();
  const providers = (source.providers || []).map((provider, index) => {
    const preset = platformPresets[provider.preset] ? provider.preset : presetForBaseUrl(provider.baseUrl);
    const presetValue = platformPresets[preset] || platformPresets.custom;
    return {
      id: uniqueId(provider.id, `provider-${index + 1}`, providerIds),
      name: String(provider.name || presetValue.label || `平台 ${index + 1}`).trim(),
      preset,
      baseUrl: String(provider.baseUrl || presetValue.baseUrl || "").trim().replace(/\/+$/gu, ""),
      authType: provider.authType || presetValue.authType || "bearer",
      chatEndpoint: String(provider.chatEndpoint || presetValue.chatEndpoint || "/v1/chat/completions").trim(),
      imageEndpoint: String(provider.imageEndpoint || presetValue.imageEndpoint || "/v1/images/generations").trim(),
      statusEndpoint: String(provider.statusEndpoint || presetValue.statusEndpoint || "/v1/media/status").trim()
    };
  });
  if (!providers.length) providers.push({ ...defaultSettings.providers[0] });

  const validProviderIds = new Set(providers.map((provider) => provider.id));
  const modelIds = new Set();
  const models = (source.models || []).filter((model) => ["chat", "image"].includes(model.type)).map((model, index) => {
    const type = model.type;
    const base = {
      id: uniqueId(model.id, `${type}-model-${index + 1}`, modelIds),
      type,
      name: String(model.name || modelDisplayName(model.model, type === "chat" ? "聊天模型" : "生图模型")).trim(),
      providerId: validProviderIds.has(model.providerId) ? model.providerId : providers[0].id,
      model: String(model.model || "").trim(),
      endpoint: String(model.endpoint || "").trim(),
      extraParamsJson: String(model.extraParamsJson || "{}").trim() || "{}"
    };
    if (type === "chat") return base;
    const image = {
      ...base,
      statusEndpoint: String(model.statusEndpoint || "").trim(),
      protocol: model.protocol === "media-generate" ? "media-generate" : "openai-images",
      size: String(model.size || legacyDefaultImage.size).trim(),
      aspectRatio: String(model.aspectRatio || "").trim()
    };
    const sizing = resolveImageSizing(image);
    return { ...image, size: sizing.size, aspectRatio: sizing.aspectRatio };
  });

  if (!models.some((model) => model.type === "chat")) models.push({ ...defaultSettings.models.find((model) => model.type === "chat"), providerId: providers[0].id });
  if (!models.some((model) => model.type === "image")) models.push({ ...defaultSettings.models.find((model) => model.type === "image"), providerId: providers[0].id });
  const chatModels = models.filter((model) => model.type === "chat");
  const imageModels = models.filter((model) => model.type === "image");
  const requestedSelections = source.selections || {};
  return {
    version: SETTINGS_VERSION,
    providers,
    models,
    selections: {
      chatModelId: chatModels.some((model) => model.id === requestedSelections.chatModelId) ? requestedSelections.chatModelId : chatModels[0].id,
      imageModelId: imageModels.some((model) => model.id === requestedSelections.imageModelId) ? requestedSelections.imageModelId : imageModels[0].id
    },
    behavior: { ...defaultSettings.behavior, ...(source.behavior || {}) }
  };
}

export function resolveModelConnection(settings, type, modelId = "") {
  const normalized = settings?.version === SETTINGS_VERSION && Array.isArray(settings.providers) && Array.isArray(settings.models)
    ? settings
    : normalizeSettings(settings);
  const selectionKey = type === "image" ? "imageModelId" : "chatModelId";
  const candidates = normalized.models.filter((model) => model.type === type);
  const model = candidates.find((item) => item.id === (modelId || normalized.selections[selectionKey])) || candidates[0];
  if (!model) throw new Error(type === "image" ? "请先添加生图模型。" : "请先添加聊天模型。");
  const provider = normalized.providers.find((item) => item.id === model.providerId) || normalized.providers[0];
  if (!provider) throw new Error("模型没有可用的平台连接。");
  const connection = {
    baseUrl: provider.baseUrl,
    endpoint: model.endpoint || (type === "image" ? provider.imageEndpoint : provider.chatEndpoint),
    model: model.model,
    authType: provider.authType,
    extraParamsJson: model.extraParamsJson || "{}"
  };
  if (type === "image") {
    connection.statusEndpoint = model.statusEndpoint || provider.statusEndpoint;
    connection.protocol = model.protocol || "openai-images";
    connection.size = model.size;
    connection.aspectRatio = model.aspectRatio;
  }
  return { model, provider, connection };
}

export function resolveRuntimeSettings(settings) {
  const normalized = settings?.version === SETTINGS_VERSION && Array.isArray(settings.providers) && Array.isArray(settings.models)
    ? settings
    : normalizeSettings(settings);
  const chat = resolveModelConnection(normalized, "chat");
  const image = resolveModelConnection(normalized, "image");
  return {
    version: SETTINGS_VERSION,
    chat: chat.connection,
    image: image.connection,
    chatModel: chat.model,
    imageModel: image.model,
    chatProvider: chat.provider,
    imageProvider: image.provider,
    behavior: normalized.behavior
  };
}

export function buildApiUrl(baseUrl, endpoint) {
  const path = String(endpoint || "").trim();
  if (/^https?:\/\//iu.test(path)) return path;
  const base = String(baseUrl || "").trim().replace(/\/+$/u, "");
  if (!base) throw new Error("请填写 API Base URL。");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parseJsonObject(value, label = "扩展参数") {
  const text = String(value || "").trim();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error();
    return parsed;
  } catch {
    throw new Error(`${label}必须是 JSON 对象。`);
  }
}

export function authRequest(connection, apiKey, url) {
  const key = String(apiKey || "").trim();
  const authType = connection?.authType || "bearer";
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  let requestUrl = url;
  if (key) {
    if (authType === "x-api-key") headers["x-api-key"] = key;
    else if (authType === "x-goog-api-key") headers["x-goog-api-key"] = key;
    else if (authType === "query") {
      const target = new URL(url);
      target.searchParams.set("key", key);
      requestUrl = target.toString();
    } else headers.Authorization = `Bearer ${key}`;
  }
  return { url: requestUrl, headers };
}

export const imageTool = Object.freeze({
  type: "function",
  function: {
    name: "generate_image",
    description: "根据用户要求生成一张图片。用户要求画图、生图、设计视觉、制作海报或图像时调用。",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        prompt: { type: "string", description: "完整、可直接提交给图像模型的提示词" },
        size: { type: "string", description: "可选分辨率，例如 1024x1024、1K 或 2K" },
        aspect_ratio: { type: "string", description: "可选宽高比，例如 1:1、16:9、9:16" }
      },
      required: ["prompt"]
    }
  }
});

export function shouldOfferImageTool(input) {
  const text = String(input || "").trim();
  if (!text) return false;
  const imageTarget = /(?:图片|图像|照片|海报|插画|封面|头像|壁纸|视觉稿|效果图|logo|image|picture|photo|poster|illustration|portrait)/iu;
  const creationAction = /(?:生成|绘制|画|制作|创建|设计|重绘|修复|编辑|修改|改成|做成|渲染|generate|create|draw|paint|design|edit|retouch|render)/iu;
  const directCommand = /^(?:(?:我想|我要|我需要|请|帮我|给我|替我|开始|直接|现在|立即)\s*){0,3}(?:生图|出图|画图|修图|改图)/iu;
  const cancelledIntent = /(?:不要|不需要|不用|别|停止|取消).{0,8}(?:生成|绘制|画|制作|创建|设计|生图|出图|画图|修图|改图)/iu;
  if (cancelledIntent.test(text)) return false;
  return directCommand.test(text) || (imageTarget.test(text) && creationAction.test(text));
}

export function assistantSystemPrompt(toolEnabled = true, toolFallback = false) {
  const base = "你是 cc 创作助手。回答简洁、明确，默认使用中文。";
  if (toolFallback) {
    return `${base} 当前接口不支持原生工具调用。当用户要求生成、绘制、设计或修改图片时，只返回一个 JSON 对象，不要使用 Markdown 代码块，格式为 {"tool":"generate_image","arguments":{"prompt":"完整生图提示词","size":"可选尺寸","aspect_ratio":"可选比例"}}。其他请求正常回答。`;
  }
  if (!toolEnabled) return base;
  return `${base} 仅当用户当前消息明确要求生成、绘制、设计或修改图片时，才调用 generate_image 工具；普通聊天、数字、问候和信息咨询不得调用。工具完成后，根据工具结果告诉用户图片已经生成，并简要说明你执行了什么。`;
}

export function buildChatPayload(messages, settings, options = {}) {
  const runtime = settings?.chat?.model ? settings : resolveRuntimeSettings(settings);
  const toolEnabled = options.tools !== false;
  const toolFallback = options.toolFallback === true;
  const extra = parseJsonObject(runtime.chat.extraParamsJson, "聊天扩展参数");
  const payload = {
    ...extra,
    model: runtime.chat.model,
    messages: [
      { role: "system", content: assistantSystemPrompt(toolEnabled, toolFallback) },
      ...messages
    ],
    stream: false
  };
  if (toolEnabled) {
    payload.tools = [imageTool];
    payload.tool_choice = "auto";
  }
  return payload;
}

export function extractAssistantMessage(data) {
  const message = data?.choices?.[0]?.message || data?.data?.choices?.[0]?.message;
  if (message) return message;
  if (typeof data?.output_text === "string") return { role: "assistant", content: data.output_text };
  if (typeof data?.message === "string") return { role: "assistant", content: data.message };
  throw new Error("对话接口没有返回可识别的消息。");
}

function parseToolArguments(value) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(String(value || "{}"));
  } catch {
    return {};
  }
}

export function extractImageToolCalls(message) {
  const calls = [];
  for (const call of message?.tool_calls || []) {
    if (call?.function?.name !== "generate_image") continue;
    const args = parseToolArguments(call.function.arguments);
    if (!String(args.prompt || "").trim()) continue;
    calls.push({ id: call.id || `image-${calls.length + 1}`, args, raw: call });
  }
  if (calls.length) return calls;

  const content = typeof message?.content === "string" ? message.content : "";
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/iu)?.[1] || content;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(fenced.slice(start, end + 1));
    const name = parsed.tool || parsed.name || parsed.type;
    const args = parsed.arguments || parsed.args || parsed;
    if (["generate_image", "create_image", "image_generation"].includes(name) && String(args.prompt || "").trim()) {
      return [{ id: "fallback-image-1", args, raw: null }];
    }
  } catch {
    return [];
  }
  return [];
}

export function normalizeImageArguments(args, settings) {
  const sizing = resolveImageSizing({
    model: settings.image.model,
    protocol: settings.image.protocol,
    size: args?.size || args?.image_size || args?.imageSize || settings.image.size,
    aspectRatio: args?.aspect_ratio || args?.aspectRatio || settings.image.aspectRatio
  });
  return {
    prompt: String(args?.prompt || "").trim(),
    size: sizing.size,
    aspectRatio: sizing.aspectRatio,
    family: sizing.profile.family
  };
}

export function openAiImageSizingPayload(model, normalized) {
  if (imageModelFamily(model) === "gemini") {
    return { image_size: normalized.size || undefined, aspect_ratio: normalized.aspectRatio || undefined };
  }
  return { size: normalized.size || undefined };
}

export function extractTaskId(data) {
  const value = data?.task_id ?? data?.taskId ?? data?.id ?? data?.data?.task_id ?? data?.data?.taskId ?? data?.data?.id ?? data?.data?.["任务ids"]?.[0];
  return value === undefined || value === null ? "" : String(value).trim();
}

export function taskIsFinal(data) {
  const value = data?.is_final ?? data?.data?.is_final;
  if (value !== undefined && value !== null) return value === true || value === "true";
  const state = String(data?.state || data?.status || data?.data?.state || "").toLowerCase();
  return ["success", "succeeded", "completed", "failed", "error", "cancelled"].includes(state);
}

export function taskSucceeded(data) {
  const state = String(data?.state || data?.status || data?.data?.state || "").toLowerCase();
  return ["success", "succeeded", "completed", "done"].includes(state) || Boolean(extractImageResult(data));
}

export function extractImageResult(data) {
  const roots = [
    ...(Array.isArray(data?.data) ? data.data : []),
    ...(Array.isArray(data?.images) ? data.images : []),
    data
  ];
  for (const item of roots) {
    const url = item?.url || item?.image_url || item?.imageUrl || item?.result_url || item?.resultUrl || item?.output_url;
    if (typeof url === "string" && /^https?:\/\//iu.test(url)) return { url, type: "url" };
    const base64 = item?.b64_json || item?.base64 || item?.image_base64;
    if (typeof base64 === "string" && base64.trim()) {
      return { url: base64.startsWith("data:image/") ? base64 : `data:image/png;base64,${base64}`, type: "base64" };
    }
  }
  return null;
}

function upstreamError(data, fallback) {
  return data?.error?.message || data?.error || data?.message || data?.msg || fallback;
}

export async function generateImageWithConnection(options) {
  const { settings, apiKey, args, request, sleep, onProgress = () => {} } = options;
  const runtime = settings?.image?.model ? settings : resolveRuntimeSettings(settings);
  const normalized = normalizeImageArguments(args, runtime);
  if (!normalized.prompt) throw new Error("生图提示词不能为空。");
  const connection = runtime.image;
  const submitUrl = buildApiUrl(connection.baseUrl, connection.endpoint);
  const auth = authRequest(connection, apiKey, submitUrl);
  const extra = parseJsonObject(connection.extraParamsJson, "生图扩展参数");

  if (connection.protocol === "media-generate") {
    const nested = extra.params && typeof extra.params === "object" && !Array.isArray(extra.params) ? extra.params : {};
    const topLevel = { ...extra };
    delete topLevel.params;
    const submit = await request({
      method: "POST",
      url: auth.url,
      headers: auth.headers,
      data: {
        ...topLevel,
        model: connection.model,
        prompt: normalized.prompt,
        params: {
          size: normalized.size || undefined,
          aspect_ratio: normalized.aspectRatio || undefined,
          ...nested
        }
      }
    });
    const taskId = extractTaskId(submit);
    if (!taskId) throw new Error(upstreamError(submit, "生图接口没有返回 task_id。"));
    const deadline = Date.now() + 10 * 60 * 1000;
    const statusBase = buildApiUrl(connection.baseUrl, connection.statusEndpoint || "/v1/media/status");
    while (Date.now() < deadline) {
      await sleep(5000);
      const statusTarget = new URL(statusBase);
      statusTarget.searchParams.set("task_id", taskId);
      const statusAuth = authRequest(connection, apiKey, statusTarget.toString());
      const status = await request({ method: "GET", url: statusAuth.url, headers: statusAuth.headers });
      onProgress({ taskId, progress: status?.progress || "", state: status?.state || "running" });
      if (!taskIsFinal(status)) continue;
      const image = extractImageResult(status);
      if (taskSucceeded(status) && image) return { ...image, taskId, raw: status, prompt: normalized.prompt };
      throw new Error(upstreamError(status, "图片生成失败。"));
    }
    throw new Error(`图片生成等待超时，task_id=${taskId}`);
  }

  const payload = {
    ...extra,
    model: connection.model,
    prompt: normalized.prompt,
    n: 1,
    ...openAiImageSizingPayload(connection.model, normalized)
  };
  if (normalized.family === "gpt" && payload.format === undefined) payload.format = "png";
  if (normalized.family === "grok" && payload.response_format === undefined) payload.response_format = "url";
  if (normalized.family === "custom" && payload.response_format === undefined && payload.format === undefined) payload.response_format = "url";

  const response = await request({
    method: "POST",
    url: auth.url,
    headers: auth.headers,
    data: payload
  });
  const image = extractImageResult(response);
  if (!image) throw new Error(upstreamError(response, "生图接口没有返回图片。"));
  return { ...image, raw: response, prompt: normalized.prompt };
}
