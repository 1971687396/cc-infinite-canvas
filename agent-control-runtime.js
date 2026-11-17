import { randomUUID } from "node:crypto";

const supportedKinds = new Set(["note", "image_task", "video_task", "image", "video", "raw"]);

export function createAgentNode(spec = {}, context = {}) {
  const kind = String(spec.kind || spec.type || "note").trim().toLowerCase();
  if (!supportedKinds.has(kind)) {
    throw new Error(`Unsupported node kind: ${kind || "<empty>"}.`);
  }

  const now = new Date().toISOString();
  const id = sanitizeNodeId(spec.id) || `agent-${randomUUID()}`;
  const nextZ = positiveNumber(spec.z, positiveNumber(context.nextZ, 1));
  const position = {
    x: finiteNumber(spec.x, 0),
    y: finiteNumber(spec.y, 0),
    z: nextZ
  };
  const data = plainObject(spec.data) ? cloneJson(spec.data) : {};

  if (kind === "raw") {
    if (!plainObject(data) || !String(data.type || "").trim()) {
      throw new Error("Raw nodes require data.type.");
    }
    return sanitizeCreatedNode({ ...data, id, ...position, createdAt: data.createdAt || now });
  }

  if (kind === "note") {
    return sanitizeCreatedNode({
      ...data,
      id,
      type: "note",
      text: String(spec.text ?? data.text ?? ""),
      fontSize: clampNumber(spec.fontSize ?? data.fontSize, 12, 160, 22),
      color: String(spec.color || data.color || "yellow"),
      width: clampNumber(spec.width ?? data.width, 160, 1600, 300),
      height: clampNumber(spec.height ?? data.height, 48, 1600, 96),
      ...position,
      createdAt: data.createdAt || now
    });
  }

  if (kind === "image_task") {
    const mode = spec.mode === "edit" ? "edit" : "create";
    const extraParams = plainObject(spec.extraParams) ? cloneJson(spec.extraParams) : plainObject(data.extraParams) ? data.extraParams : {};
    return sanitizeCreatedNode({
      ...data,
      id,
      type: "task",
      provider: String(spec.provider || data.provider || ""),
      prompt: String(spec.prompt ?? data.prompt ?? ""),
      model: String(spec.model || data.model || context.defaultModel || "gpt-image-2"),
      n: String(spec.n ?? data.n ?? "1"),
      size: String(spec.size || data.size || "auto"),
      quality: String(spec.quality ?? data.quality ?? ""),
      image26: plainObject(spec.image26 ?? data.image26) ? cloneJson(spec.image26 ?? data.image26) : {},
      bananaWebSearch: spec.bananaWebSearch ?? data.bananaWebSearch,
      bananaThinkingLevel: spec.bananaThinkingLevel ?? data.bananaThinkingLevel,
      ttImageVersion: String(spec.ttImageVersion || data.ttImageVersion || "flare"),
      ttImageAspectRatio: String(spec.ttImageAspectRatio || data.ttImageAspectRatio || "auto"),
      ttImageResolution: String(spec.ttImageResolution || data.ttImageResolution || "auto"),
      format: String(spec.format || data.format || "png"),
      baseUrl: String(data.baseUrl || context.baseUrl || ""),
      endpointPath: String(data.endpointPath || (mode === "edit" ? context.editEndpoint : context.imageEndpoint) || (mode === "edit" ? "/v1/images/edits" : "/v1/images/generations")),
      connectionOverride: false,
      apiKeyOverride: "",
      mode,
      seedreamMode: String(spec.seedreamMode || data.seedreamMode || "standard"),
      background: String(spec.background ?? data.background ?? ""),
      moderation: String(spec.moderation ?? data.moderation ?? ""),
      extraParams,
      extraParamsText: JSON.stringify(extraParams, null, 2),
      cachedImages: arrayValue(spec.cachedImages ?? data.cachedImages),
      referenceImageNodeIds: stringArray(spec.referenceImageNodeIds ?? data.referenceImageNodeIds),
      promptNoteNodeIds: stringArray(spec.promptNoteNodeIds ?? data.promptNoteNodeIds),
      promptNotePlacements: plainObject(data.promptNotePlacements) ? data.promptNotePlacements : {},
      cachedMask: data.cachedMask || null,
      cacheStatus: mode === "edit" ? "pending" : "none",
      sessionFiles: [],
      sessionMask: "",
      images: arrayValue(spec.images ?? data.images),
      status: String(data.status || "idle"),
      error: String(data.error || ""),
      durationMs: finiteNumber(data.durationMs, null),
      debugOpen: Boolean(data.debugOpen),
      width: clampNumber(spec.width ?? data.width, 420, 1800, 620),
      ...position,
      createdAt: data.createdAt || now
    });
  }

  if (kind === "video_task") {
    const extraParams = plainObject(spec.extraParams) ? cloneJson(spec.extraParams) : plainObject(data.extraParams) ? data.extraParams : {};
    return sanitizeCreatedNode({
      ...data,
      id,
      type: "video-task",
      provider: String(spec.provider || data.provider || "dreamina"),
      prompt: String(spec.prompt ?? data.prompt ?? ""),
      model: String(spec.model || data.model || context.defaultVideoModel || "dreamina-video-seedance2.0fast"),
      n: String(spec.n ?? data.n ?? "5"),
      size: String(spec.size || data.size || "16:9"),
      quality: String(spec.quality || data.quality || "720p"),
      format: String(spec.format || data.format || "mp4"),
      baseUrl: String(data.baseUrl || ""),
      endpointPath: String(data.endpointPath || "dreamina-video-cli"),
      apiKeyOverride: "",
      mode: "video",
      videoMode: String(spec.videoMode || data.videoMode || "auto"),
      videoTransitions: arrayValue(spec.videoTransitions ?? data.videoTransitions),
      extraParams,
      extraParamsText: JSON.stringify(extraParams, null, 2),
      arkAssetUris: stringArray(spec.arkAssetUris ?? data.arkAssetUris),
      arkAssetUrisText: stringArray(spec.arkAssetUris ?? data.arkAssetUris).join("\n"),
      referenceMentionAliases: plainObject(data.referenceMentionAliases) ? data.referenceMentionAliases : {},
      cachedImages: arrayValue(spec.cachedImages ?? data.cachedImages),
      cachedVideos: arrayValue(spec.cachedVideos ?? data.cachedVideos),
      cachedAudios: arrayValue(spec.cachedAudios ?? data.cachedAudios),
      referenceImageNodeIds: stringArray(spec.referenceImageNodeIds ?? data.referenceImageNodeIds),
      referenceVideoNodeIds: stringArray(spec.referenceVideoNodeIds ?? data.referenceVideoNodeIds),
      promptNoteNodeIds: stringArray(spec.promptNoteNodeIds ?? data.promptNoteNodeIds),
      promptNotePlacements: plainObject(data.promptNotePlacements) ? data.promptNotePlacements : {},
      cacheStatus: "pending",
      sessionFiles: [],
      sessionVideoFiles: [],
      sessionAudioFiles: [],
      videos: arrayValue(spec.videos ?? data.videos),
      status: String(data.status || "idle"),
      error: String(data.error || ""),
      durationMs: finiteNumber(data.durationMs, null),
      debugOpen: data.debugOpen === undefined ? true : Boolean(data.debugOpen),
      width: clampNumber(spec.width ?? data.width, 380, 1800, 440),
      ...position,
      createdAt: data.createdAt || now
    });
  }

  const assetKey = kind === "image" ? "image" : "video";
  const asset = plainObject(spec[assetKey])
    ? cloneJson(spec[assetKey])
    : plainObject(data[assetKey])
      ? cloneJson(data[assetKey])
      : { url: String(spec.url || data.url || "") };
  if (!String(asset.url || "").trim()) throw new Error(`${kind} nodes require a URL.`);
  const originalWidth = clampNumber(spec.originalWidth ?? data.originalWidth ?? asset.width, 1, 32768, kind === "image" ? 512 : 480);
  const originalHeight = clampNumber(spec.originalHeight ?? data.originalHeight ?? asset.height, 1, 32768, kind === "image" ? 512 : 270);
  const sourceKey = String(asset.contentHash || asset.sourceUrl || asset.url || asset.filename || "");

  return sanitizeCreatedNode({
    ...data,
    id,
    type: kind,
    [assetKey]: asset,
    sourceTaskId: String(spec.sourceTaskId || data.sourceTaskId || ""),
    [kind === "image" ? "sourceImageKey" : "sourceVideoKey"]: sourceKey,
    originalWidth,
    originalHeight,
    scale: clampNumber(spec.scale ?? data.scale, 0.02, 16, kind === "image" ? defaultImageScale(originalWidth, originalHeight) : 0.75),
    ...position,
    createdAt: data.createdAt || now
  });
}

export function patchAgentNode(node, patch = {}) {
  if (!plainObject(node) || !plainObject(patch)) throw new Error("Node patch must be an object.");
  const safePatch = cloneJson(patch);
  delete safePatch.id;
  delete safePatch.type;
  delete safePatch.apiKeyOverride;
  if (Object.prototype.hasOwnProperty.call(safePatch, "connectionOverride")) safePatch.connectionOverride = false;
  return sanitizeCreatedNode({ ...node, ...safePatch, id: node.id, type: node.type });
}

export function nodeMatchesQuery(node, options = {}) {
  const types = stringArray(options.types).map((value) => value.toLowerCase());
  if (types.length && !types.includes(String(node?.type || "").toLowerCase())) return false;
  const search = String(options.search || "").trim().toLowerCase();
  if (!search) return true;
  const haystack = [node?.id, node?.type, node?.title, node?.text, node?.prompt, node?.model, node?.image?.filename, node?.video?.filename]
    .map((value) => String(value || "").toLowerCase())
    .join("\n");
  return haystack.includes(search);
}

export function mediaNodesFromGeneration(taskNode, result = {}, context = {}) {
  const taskX = finiteNumber(taskNode?.x, 0);
  const taskY = finiteNumber(taskNode?.y, 0);
  const taskWidth = finiteNumber(taskNode?.width, taskNode?.type === "video-task" ? 440 : 620);
  let nextZ = positiveNumber(context.nextZ, positiveNumber(taskNode?.z, 1) + 1);
  let cursorY = taskY;
  const nodes = [];
  const images = arrayValue(result.images);
  const layerMode = images.some((image) => image?.layerDecomposition);
  if (layerMode) images.sort((left, right) => finiteNumber(left?.zIndex, 0) - finiteNumber(right?.zIndex, 0));
  const baseLayer = layerMode ? images.find((image) => finiteNumber(image?.zIndex, 0) === 0) || images[0] : null;
  const baseLayerWidth = clampNumber(baseLayer?.width, 1, 32768, 512);
  const baseLayerHeight = clampNumber(baseLayer?.height, 1, 32768, 512);
  const baseLayerScale = defaultImageScale(baseLayerWidth, baseLayerHeight);
  const layerOriginX = taskX + taskWidth + 48;
  const layerOriginY = taskY;

  for (const image of images) {
    const width = clampNumber(image?.width, 1, 32768, 512);
    const height = clampNumber(image?.height, 1, 32768, 512);
    const scale = layerMode ? baseLayerScale : defaultImageScale(width, height);
    const layerOffset = layerMode
      ? layerOffsetFromBoundingBox(image?.boundingBox, baseLayerWidth, baseLayerHeight, width, height)
      : { x: 0, y: 0 };
    const node = createAgentNode({
      kind: "image",
      image: {
        ...image,
        prompt: taskNode.prompt || "",
        model: taskNode.model || "",
        size: image?.size || taskNode.size || "",
        quality: taskNode.quality || "",
        format: image?.format || taskNode.format || "png",
        generation: generationSnapshot(taskNode),
        createdAt: new Date().toISOString()
      },
      sourceTaskId: taskNode.id,
      originalWidth: width,
      originalHeight: height,
      scale,
      x: layerMode ? layerOriginX + layerOffset.x * baseLayerScale : taskX + taskWidth + 48,
      y: layerMode ? layerOriginY + layerOffset.y * baseLayerScale : cursorY,
      z: nextZ
    }, { nextZ });
    nodes.push(node);
    nextZ += 1;
    if (!layerMode) cursorY += height * scale + 32;
  }

  for (const video of arrayValue(result.videos)) {
    const width = clampNumber(video?.width, 1, 32768, 480);
    const height = clampNumber(video?.height, 1, 32768, 270);
    const node = createAgentNode({
      kind: "video",
      video: {
        ...video,
        prompt: taskNode.prompt || "",
        model: taskNode.model || "",
        size: taskNode.size || "",
        format: video?.format || taskNode.format || "mp4",
        generation: generationSnapshot(taskNode),
        createdAt: new Date().toISOString()
      },
      sourceTaskId: taskNode.id,
      originalWidth: width,
      originalHeight: height,
      scale: 0.75,
      x: taskX + taskWidth + 48,
      y: cursorY,
      z: nextZ
    }, { nextZ });
    nodes.push(node);
    nextZ += 1;
    cursorY += height * 0.75 + 32;
  }

  return nodes;
}

export function generationSnapshot(node) {
  const fields = [
    "mode", "videoMode", "videoTransitions", "seedreamMode", "prompt", "model", "n", "size", "quality",
    "ttImageVersion", "ttImageAspectRatio", "ttImageResolution", "image26", "bananaWebSearch", "bananaThinkingLevel", "format", "background", "moderation", "extraParams",
    "arkAssetUris", "cachedImages", "cachedVideos", "cachedAudios", "referenceImageNodeIds", "referenceVideoNodeIds"
  ];
  return Object.fromEntries(fields.filter((key) => node?.[key] !== undefined).map((key) => [key, cloneJson(node[key])]));
}

function sanitizeCreatedNode(node) {
  const safe = cloneJson(node);
  safe.id = sanitizeNodeId(safe.id) || `agent-${randomUUID()}`;
  safe.type = String(safe.type || "note").trim();
  safe.x = finiteNumber(safe.x, 0);
  safe.y = finiteNumber(safe.y, 0);
  safe.z = positiveNumber(safe.z, 1);
  safe.createdAt = safe.createdAt || new Date().toISOString();
  delete safe.apiKeyOverride;
  if (Object.prototype.hasOwnProperty.call(safe, "connectionOverride")) safe.connectionOverride = false;
  return safe;
}

function sanitizeNodeId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function defaultImageScale(width, height) {
  const longest = Math.max(Number(width) || 512, Number(height) || 512);
  return Math.min(1, Math.max(0.08, 420 / longest));
}

function layerOffsetFromBoundingBox(boundingBox, baseWidth, baseHeight, layerWidth, layerHeight) {
  if (Math.abs(layerWidth - baseWidth) <= 2 && Math.abs(layerHeight - baseHeight) <= 2) return { x: 0, y: 0 };
  const absolute = boundingBox?.absolute;
  if (Array.isArray(absolute) && absolute.length >= 4 && absolute.every((value) => Number.isFinite(Number(value)))) {
    return { x: Number(absolute[0]), y: Number(absolute[1]) };
  }
  const normalized = boundingBox?.normalized;
  if (Array.isArray(normalized) && normalized.length >= 4 && normalized.every((value) => Number.isFinite(Number(value)))) {
    return {
      x: (Number(normalized[0]) / 1000) * baseWidth,
      y: (Number(normalized[1]) / 1000) * baseHeight
    };
  }
  return { x: 0, y: 0 };
}

function stringArray(value) {
  return [...new Set(arrayValue(value).map((item) => String(item || "").trim()).filter(Boolean))];
}

function arrayValue(value) {
  return Array.isArray(value) ? cloneJson(value) : [];
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, min, max, fallback) {
  const number = finiteNumber(value, fallback);
  return Math.min(max, Math.max(min, number));
}

function plainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function cloneJson(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
