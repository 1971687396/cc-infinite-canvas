export const seedreamImageProfiles = Object.freeze({
  PRO_5: "ark-seedream-5.0-pro",
  LITE_5: "ark-seedream-5.0-lite",
  V4_5: "ark-seedream-4.5",
  V4_0: "ark-seedream-4.0"
});

export const seedreamProModes = Object.freeze({
  STANDARD: "standard",
  INTERACTIVE: "interactive",
  FUSION: "fusion",
  LAYERS: "layers"
});

export const bananaImageProfiles = Object.freeze({
  GEMINI_NATIVE: "gemini-native",
  GRSAI: "grsai"
});

export const banana21AspectRatios = Object.freeze([
  "1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9", "1:4", "4:1", "1:8", "8:1"
]);

export function isBanana21Model(...values) {
  return values.flat(Infinity).some((value) => /(?:banana|香蕉)[\s_-]*2[._-]?1(?![\d.])/iu.test(String(value || "")));
}

export function normalizeBanana21ThinkingLevel(value, { google = false } = {}) {
  const level = String(value || "").trim().toLowerCase();
  if (google) return ["minimal", "medium", "high"].includes(level) ? level : "medium";
  return level === "high" ? "high" : "minimal";
}

export function normalizeBanana21WebSearch(value) {
  return value === true || value === 1 || String(value || "").trim().toLowerCase() === "true";
}

export function isOpenLuxBanana21Connection(connection) {
  if (!/^gemini-nano-banana-2\.1(?:-(?:thinking|nothinking))?$/iu.test(String(connection?.apiModel || "").trim())) return false;
  try { return new URL(connection.baseUrl).hostname.toLowerCase() === "api.openlux.ai"; } catch { return false; }
}

export const googleBanana21Model = "google-nano-banana-2.1";
export const googleBanana21ApiModel = "gemini-nano-banana-2.1";

export const banana21PresetChannels = Object.freeze([
  { model: "openlux-banana-2.1", apiModel: "gemini-nano-banana-2.1", label: "Nano Banana 2.1（OpenLux）", preset: "yunwu", provider: "google" },
  { model: "lingke-banana-2.1", apiModel: "banana-2.1", label: "Banana 2.1（玲珂 AI）", preset: "lingke-media", provider: "lingke" },
  { model: "lingke-banana-2.1-token", apiModel: "banana-2.1-token", label: "Banana 2.1 官转（玲珂 AI）", preset: "lingke-media", provider: "lingke" }
].map(Object.freeze));

export function isGoogleBanana21Connection(connection) {
  if (String(connection?.apiModel || "").trim().toLowerCase() !== googleBanana21ApiModel) return false;
  try { return new URL(connection.baseUrl).hostname.toLowerCase() === "generativelanguage.googleapis.com"; } catch { return false; }
}

// Migrate only documented gateways, model IDs and known legacy paths.
export function migrateBanana21Connection(model, connection) {
  if (!connection || typeof connection !== "object" || Array.isArray(connection)) return connection;
  if (!isBanana21Model(connection.apiModel || model) || (connection.capability && connection.capability !== "image")) return connection;
  let hostname = "";
  try { hostname = new URL(connection.baseUrl).hostname.toLowerCase(); } catch { return connection; }
  const legacyEndpoint = (endpoint) => !endpoint
    || /^\/v1\/(?:images\/(?:generations|edits)|media\/generate)\/?$/iu.test(endpoint)
    || /^\/v1beta\/models\/[^/]+:generateContent$/iu.test(endpoint);
  if (![connection.imageEndpoint, connection.editEndpoint].every(legacyEndpoint)) return connection;
  if (isOpenLuxBanana21Connection(connection)) {
    const endpoint = "/v1beta/models/{model}:generateContent";
    if (connection.protocol === "gemini-native" && connection.imageEndpoint === endpoint && connection.editEndpoint === endpoint) return connection;
    return { ...connection, protocol: "gemini-native", imageEndpoint: endpoint, editEndpoint: endpoint };
  }
  if (!["api.lk888.ai", "api.lk666.ai"].includes(hostname)) return connection;
  return { ...connection, protocol: "media-generate", imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate" };
}

export function normalizeBanana21ImageParameters(size, imageSize = "", defaults = {}) {
  return normalizeBananaImageParameters(size, imageSize, { ...defaults, ratios: banana21AspectRatios });
}

export const gptImage25Profiles = Object.freeze({
  GENERIC: "gpt-image-2.5",
  SUNBURST: "gpt-image-2.5-sunburst",
  FLARE: "gpt-image-2.5-flare",
  TT: "tt-image-2.5"
});

export const gptImage26Profiles = Object.freeze({
  GENERIC: "gpt-image-2.6",
  SUNBURST: "gpt-image-2.6-sunburst",
  FLARE: "gpt-image-2.6-flare",
  TT: "tt-image-2.6",
  TT_GUAN: "tt-image-2.6-guan"
});

export function gptImage26Profile(...values) {
  for (const value of values.flat(Infinity)) {
    const compact = compactModelName(value);
    if (/ttimage26(?!\d)/u.test(compact)) return compact.includes("guan") ? gptImage26Profiles.TT_GUAN : gptImage26Profiles.TT;
    if (!/gptimage26(?!\d)/u.test(compact)) continue;
    if (compact.includes("sunburst")) return gptImage26Profiles.SUNBURST;
    if (compact.includes("flare")) return gptImage26Profiles.FLARE;
    return gptImage26Profiles.GENERIC;
  }
  return "";
}

export function gptImageProfile(...values) {
  return gptImage26Profile(values) || gptImage25Profile(values);
}

export const grsaiImage26Models = Object.freeze([
  "gpt-image-2.6", "gpt-image-2.6-flare", "gpt-image-2.6-sunburst"
].map((apiModel) => Object.freeze({ model: `grsai-${apiModel}`, apiModel, label: `${apiModel}（Grsai）` })));

export function isGrsaiImage26Connection(connection) {
  return connection?.protocol === "grsai" && grsaiImage26Models.some(({ apiModel }) => apiModel === connection.apiModel);
}

const grsaiImage26Ratios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "5:4", "4:5", "21:9", "9:21", "1:2", "2:1"];
const grsaiImage26StandardSizes = ["1024x1024", "1672x941", "941x1672", "1443x1090", "1090x1443", "1536x1024", "1024x1536", "1408x1120", "1120x1408", "1920x832", "832x1920", "896x1792", "1792x896"];
const grsaiImage26VipSizes = [
  ["1:1", "1024x1024", "2048x2048", "2880x2880"],
  ["16:9", "1280x720", "2048x1152", "3840x2160"],
  ["9:16", "720x1280", "1152x2048", "2160x3840"],
  ["4:3", "1152x864", "2304x1728", "3264x2448"],
  ["3:4", "864x1152", "1728x2304", "2448x3264"],
  ["3:2", "1536x1024", "2048x1360", "3504x2336"],
  ["2:3", "1024x1536", "1360x2048", "2336x3504"],
  ["5:4", "1120x896", "2240x1792", "3200x2560"],
  ["4:5", "896x1120", "1792x2240", "2560x3200"],
  ["21:9", "1456x624", "2912x1248", "3840x1648"],
  ["9:21", "624x1456", "1248x2912", "1648x3840"],
  ["1:3", "688x2048", "1280x3840"], ["3:1", "2048x688", "3840x1280"],
  ["2:1", "1536x768", "3072x1536", "3840x1920"], ["1:2", "768x1536", "1536x3072", "1920x3840"]
];

export function grsaiImage26SizeOptions(apiModel) {
  return [["auto", "自动"], ...(apiModel === "gpt-image-2.6"
    ? [...grsaiImage26Ratios.map((ratio) => [ratio, ratio]), ...grsaiImage26StandardSizes.map((size, i) => [size, `${size} (${grsaiImage26Ratios[i]})`])]
    : grsaiImage26VipSizes.flatMap(([ratio, ...sizes]) => sizes.map((size) => [size, `${size} (${ratio})`])))];
}

export function normalizeGrsaiImage26Size(value, apiModel) {
  const size = String(value || "auto").trim().toLowerCase().replace(/[\s\u200b-\u200d\ufeff]/gu, "");
  if (size === "auto") return size;
  if (apiModel === "gpt-image-2.6") {
    if (grsaiImage26Ratios.includes(size) || grsaiImage26StandardSizes.includes(size)) return size;
    throw new Error("Grsai 普通版 2.6 请使用比例或文档列出的 1K 像素尺寸；2K/4K 请选 Flare 或 Sunburst。");
  }
  const dimensions = size.match(/^(\d+)x(\d+)$/u);
  const [width, height] = dimensions ? dimensions.slice(1).map(Number) : [0, 0];
  if (width > 0 && height > 0 && Math.max(width, height) <= 3840 && width % 16 === 0 && height % 16 === 0
    && Math.max(width, height) / Math.min(width, height) <= 3 && width * height >= 655360 && width * height <= 8294400) return `${width}x${height}`;
  throw new Error("Grsai 2.6 Flare/Sunburst 只接受 auto 或像素尺寸：边长≤3840、均为16的倍数、比例≤3:1、总像素655360～8294400。");
}

export function grsaiImage26Qualities(apiModel) {
  // Native and OpenAI-compatible docs differ; expose Sunburst's documented six levels.
  return apiModel === "gpt-image-2.6" ? ["auto"]
    : apiModel === "gpt-image-2.6-sunburst" ? ["auto", "low", "medium", "high", "xhigh", "max"]
    : ["auto", "low", "medium", "high"];
}

export function grsaiImage26Formats(apiModel) {
  return apiModel === "gpt-image-2.6" ? ["png", "gif", "svg"] : ["png", "gif"];
}

export function buildGrsaiImage26Payload(apiModel, body, prompt, images = [], extra = {}) {
  const aspectRatio = normalizeGrsaiImage26Size(extra.aspectRatio ?? body.size, apiModel);
  const quality = String(body.quality || extra.quality || "auto").toLowerCase();
  if (!grsaiImage26Qualities(apiModel).includes(quality)) throw new Error("当前 Grsai 模型不支持此质量档位。");
  const outputFormat = String(body.format || extra.outputFormat || "png").toLowerCase();
  if (!grsaiImage26Formats(apiModel).includes(outputFormat)) throw new Error("Grsai 2.6 仅支持 PNG/GIF；SVG 仅普通版支持。");
  const replyType = extra.replyType || "async";
  if (!["async", "json"].includes(replyType)) throw new Error("画布 Grsai 渠道仅支持 async 或 json 回复类型，不支持 stream。");
  const background = body.background || extra.background;
  if (background && !["auto", "opaque", "transparent"].includes(background)) throw new Error("Grsai 背景仅可选默认或透明。");
  return { model: apiModel, prompt, images, aspectRatio, quality, outputFormat, replyType, ...(background === "transparent" ? { background } : {}) };
}

export function isTtImage26Model(...values) {
  return [gptImage26Profiles.TT, gptImage26Profiles.TT_GUAN].includes(gptImage26Profile(values));
}

export function image26OutputFormats({ tt = false, guan = false, edit = false } = {}) {
  return ["png", "jpeg", "webp", "gif", ...((tt ? !guan : !edit) ? ["svg"] : [])];
}

export function buildImage26Options(input = {}, options = {}) {
  const outputFormat = String(input.format || input.output_format || "png").trim().toLowerCase().replace(/^jpg$/u, "jpeg");
  if (!image26OutputFormats(options).includes(outputFormat)) throw new Error("当前 2.6 渠道或编辑模式不支持此输出格式。");
  const complexity = input.complexity || (options.tt ? "medium" : "high");
  if (!["low", "medium", "high"].includes(complexity)) throw new Error("复杂度只支持 low、medium、high。");
  const background = input.background || "auto";
  if (!["auto", "opaque", "transparent"].includes(background)) throw new Error("背景只支持 auto、opaque、transparent。");
  if (background === "transparent" && !["png", "webp"].includes(outputFormat)) throw new Error("透明背景请使用 PNG 或 WebP 格式。");
  const result = { complexity, output_format: outputFormat, background };
  if (["gif", "svg"].includes(outputFormat)) {
    if (input.stream || input.partial_images != null || input.prompt_rewriter != null || input.output_compression != null) {
      throw new Error("GIF／SVG 不支持流式、partial_images、prompt_rewriter 或自定义压缩率，请移除这些参数。");
    }
  }
  if (outputFormat === "gif") {
    if (options.hasMask) throw new Error("GIF 输出不支持 mask 蒙版，请移除蒙版后重试。");
    const frameCount = Number(input.frameCount ?? input.frame_count ?? 9);
    const frameDuration = Number(input.frameDurationMs ?? input.frame_duration_ms ?? 200);
    const validCount = options.tt ? [4, 6, 9, 12, 16].includes(frameCount) : Number.isInteger(frameCount) && frameCount >= 2 && frameCount <= 16;
    const validDuration = options.tt ? [100, 200, 300, 500, 1000].includes(frameDuration) : Number.isInteger(frameDuration) && frameDuration >= 20 && frameDuration <= 655350;
    if (!validCount || !validDuration) throw new Error("GIF 帧数或每帧时长超出当前渠道支持范围。");
    result.frame_count = frameCount;
    result.frame_duration_ms = frameDuration;
  }
  if (outputFormat === "svg" && !options.tt) {
    if (Number(input.n || 1) !== 1) throw new Error("SVG 输出数量必须为 1。");
    const authorModel = String(input.svgModel || input.svg?.model || "").trim();
    if (!authorModel) throw new Error("SVG 输出需要填写 SVG 作者模型，例如 gpt-6-luna；作者模型会按其 Token 费率计费。");
    const effort = input.svgReasoning || input.svg?.reasoning?.effort;
    if (effort && !["none", "minimal", "low", "medium", "high", "xhigh", "max"].includes(effort)) throw new Error("SVG 作者模型推理强度无效。");
    result.svg = { model: authorModel, ...(effort ? { reasoning: { effort } } : {}) };
  }
  return result;
}

export function migrateTtImage26Connection(model, connection) {
  if (!connection || typeof connection !== "object" || !isTtImage26Model(connection.apiModel || model)) return connection;
  let hostname;
  try { hostname = new URL(connection.baseUrl).hostname.toLowerCase(); } catch { return connection; }
  if (!["api.lk888.ai", "api.lk666.ai"].includes(hostname) || connection.capability && connection.capability !== "image") return connection;
  if (![connection.imageEndpoint, connection.editEndpoint].every((endpoint) => !endpoint || /^\/v1\/(?:images\/(?:generations|edits)|media\/generate)\/?$/iu.test(endpoint))) return connection;
  return { ...connection, protocol: "media-generate", imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate" };
}

export const gptImage25Qualities = Object.freeze(["auto", "low", "medium", "high", "xhigh", "max"]);
export const ttImage25Versions = Object.freeze(["flare", "sunburst"]);
export const ttImage25AspectRatios = Object.freeze([
  "auto",
  "1:1",
  "16:9",
  "9:16",
  "4:3",
  "3:4",
  "3:2",
  "2:3",
  "5:4",
  "4:5",
  "2:1",
  "1:2",
  "21:9",
  "9:21"
]);
export const ttImage25Resolutions = Object.freeze(["auto", "1K", "2K", "4K"]);
export const ttImage25Backgrounds = Object.freeze(["opaque", "transparent", "auto"]);

const ttImage25PixelSizes = Object.freeze({
  "1K": Object.freeze({
    "1:1": "1024x1024",
    "16:9": "1280x720",
    "9:16": "720x1280",
    "4:3": "1152x864",
    "3:4": "864x1152",
    "3:2": "1248x832",
    "2:3": "832x1248",
    "5:4": "1120x896",
    "4:5": "896x1120",
    "2:1": "1440x720",
    "1:2": "720x1440",
    "21:9": "1456x624",
    "9:21": "624x1456"
  }),
  "2K": Object.freeze({
    "1:1": "2048x2048",
    "16:9": "2560x1440",
    "9:16": "1440x2560",
    "4:3": "2304x1728",
    "3:4": "1728x2304",
    "3:2": "2496x1664",
    "2:3": "1664x2496",
    "5:4": "2288x1824",
    "4:5": "1824x2288",
    "2:1": "2880x1440",
    "1:2": "1440x2880",
    "21:9": "3136x1344",
    "9:21": "1344x3136"
  }),
  "4K": Object.freeze({
    "1:1": "2880x2880",
    "16:9": "3840x2160",
    "9:16": "2160x3840",
    "4:3": "3264x2448",
    "3:4": "2448x3264",
    "3:2": "3520x2352",
    "2:3": "2352x3520",
    "5:4": "3200x2560",
    "4:5": "2560x3200",
    "2:1": "3840x1920",
    "1:2": "1920x3840",
    "21:9": "3840x1648",
    "9:21": "1648x3840"
  })
});

export const dreaminaImageModelVersions = Object.freeze(["5.0Pro", "5.0", "4.7", "4.6", "4.5", "4.1", "4.0", "3.1", "3.0"]);
export const dreaminaVideoModelVersions = Object.freeze([
  "seedance2.5",
  "seedance2.0fast",
  "seedance2.0",
  "seedance2.0mini",
  "seedance2.0_vip",
  "seedance2.0fast_vip"
]);

export const dreaminaVideoModes = Object.freeze({
  AUTO: "auto",
  TEXT: "text",
  IMAGE: "image",
  FRAMES: "frames",
  MULTIFRAME: "multiframe",
  MULTIMODAL: "multimodal"
});

export const arkVideoModes = Object.freeze({
  AUTO: "auto",
  TEXT: "text",
  REFERENCE: "reference",
  FRAMES: "frames",
  EDIT: "edit",
  EXTEND: "extend"
});

const bananaImageRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"];

function compactModelName(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function gptImage25Profile(...values) {
  for (const value of values.flat(Infinity)) {
    const compact = compactModelName(value);
    if (compact.includes("ttimage25")) return gptImage25Profiles.TT;
    if (!compact.includes("gptimage25")) continue;
    if (compact.includes("sunburst")) return gptImage25Profiles.SUNBURST;
    if (compact.includes("flare")) return gptImage25Profiles.FLARE;
    return gptImage25Profiles.GENERIC;
  }
  return "";
}

export function normalizeGptImage25Quality(value, fallback = "auto") {
  const normalized = String(value || "").trim().toLowerCase();
  if (gptImage25Qualities.includes(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toLowerCase();
  return gptImage25Qualities.includes(normalizedFallback) ? normalizedFallback : "auto";
}

export function isGptImage25Size(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "auto") return true;
  const match = normalized.match(/^(\d{2,5})\s*x\s*(\d{2,5})$/u);
  if (!match) return false;
  const width = Number(match[1]);
  const height = Number(match[2]);
  const pixels = width * height;
  const ratio = width / height;
  return width % 16 === 0
    && height % 16 === 0
    && Math.max(width, height) <= 3840
    && pixels >= 655_360
    && pixels <= 8_294_400
    && ratio >= 1 / 3
    && ratio <= 3;
}

export function normalizeGptImage25Size(value, fallback = "auto") {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/gu, "");
  if (isGptImage25Size(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toLowerCase().replace(/\s+/gu, "");
  return isGptImage25Size(normalizedFallback) ? normalizedFallback : "auto";
}

export function isTtImage25Model(...values) {
  return gptImage25Profile(values) === gptImage25Profiles.TT;
}

export function normalizeTtImage25Version(value, fallback = "flare") {
  const normalized = String(value || "").trim().toLowerCase();
  if (ttImage25Versions.includes(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toLowerCase();
  return ttImage25Versions.includes(normalizedFallback) ? normalizedFallback : "flare";
}

export function normalizeTtImage25AspectRatio(value, fallback = "auto") {
  const normalized = String(value || "").trim().toLowerCase();
  if (ttImage25AspectRatios.includes(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toLowerCase();
  return ttImage25AspectRatios.includes(normalizedFallback) ? normalizedFallback : "auto";
}

export function normalizeTtImage25Resolution(value, fallback = "auto") {
  const normalized = String(value || "").trim().toUpperCase();
  if (ttImage25Resolutions.includes(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toUpperCase();
  return ttImage25Resolutions.includes(normalizedFallback) ? normalizedFallback : "auto";
}

export function normalizeTtImage25Background(value, fallback = "opaque") {
  const normalized = String(value || "").trim().toLowerCase();
  if (ttImage25Backgrounds.includes(normalized)) return normalized;
  const normalizedFallback = String(fallback || "").trim().toLowerCase();
  return ttImage25Backgrounds.includes(normalizedFallback) ? normalizedFallback : "opaque";
}

export function normalizeTtImage25Sizing(aspectRatio, resolution) {
  const normalizedAspectRatio = normalizeTtImage25AspectRatio(aspectRatio);
  const normalizedResolution = normalizeTtImage25Resolution(resolution);
  if (normalizedAspectRatio === "auto" || normalizedResolution === "auto") {
    return { aspectRatio: "auto", resolution: "auto" };
  }
  return { aspectRatio: normalizedAspectRatio, resolution: normalizedResolution };
}

export function ttImage25PixelSize(aspectRatio, resolution) {
  const normalized = normalizeTtImage25Sizing(aspectRatio, resolution);
  if (normalized.aspectRatio === "auto") return "auto";
  return ttImage25PixelSizes[normalized.resolution]?.[normalized.aspectRatio] || "auto";
}

export function seedreamImageProfile(...values) {
  for (const value of values.flat(Infinity)) {
    const compact = compactModelName(value);
    if (!compact.includes("seedream")) continue;
    if (
      compact.includes("seedream50lite")
      || compact.includes("seedreamv5lite")
      || compact.includes("seedream5lite")
    ) return seedreamImageProfiles.LITE_5;
    if (
      compact.includes("seedream50")
      || compact.includes("seedreamv5pro")
      || compact.includes("seedream5pro")
    ) return seedreamImageProfiles.PRO_5;
    if (compact.includes("seedream45")) return seedreamImageProfiles.V4_5;
    if (compact.includes("seedream40")) return seedreamImageProfiles.V4_0;
  }
  return "";
}

export function seedreamProFeatureChannel(...values) {
  const normalized = values
    .flat(Infinity)
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  return normalized.some((value) => (
    /layer(?:s)?[-_ /]?(?:decomposition|decompose)|layerdecomposition|decompose[-_ /]?layers?/iu.test(value)
    || /拆图层|智能拆层|拆层|图层分解/u.test(value)
    || /multi[-_ /]?image[-_ /]?fusion|images?[-_ /]?fusion|(?:^|[-_ /])fusion(?:$|[-_ /])/iu.test(value)
    || /拆图融图|多图融合|融图/u.test(value)
  ));
}

export function normalizeSeedreamProMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return Object.values(seedreamProModes).includes(normalized) ? normalized : seedreamProModes.STANDARD;
}

export function canonicalDreaminaModelVersion(value) {
  const normalized = String(value || "").trim().replace(/^dreamina-/iu, "");
  if (/^5\.0pro$/iu.test(normalized)) return "5.0Pro";
  return /^\d+(?:\.\d+)+$/u.test(normalized) ? normalized : "";
}

export function compareDreaminaModelVersions(left, right) {
  const leftVersion = canonicalDreaminaModelVersion(left) || String(left || "").trim();
  const rightVersion = canonicalDreaminaModelVersion(right) || String(right || "").trim();
  const leftPro = /pro$/iu.test(leftVersion);
  const rightPro = /pro$/iu.test(rightVersion);
  const numericOrder = rightVersion.replace(/pro$/iu, "").localeCompare(leftVersion.replace(/pro$/iu, ""), undefined, {
    numeric: true,
    sensitivity: "base"
  });
  if (numericOrder) return numericOrder;
  if (leftPro !== rightPro) return leftPro ? -1 : 1;
  return rightVersion.localeCompare(leftVersion, undefined, { numeric: true, sensitivity: "base" });
}

export function extractDreaminaModelVersions(text) {
  const match = String(text || "").match(/model_version\s*:\s*([^\r\n]+)/iu);
  if (!match) return [];
  return [...new Set(
    (match[1].match(/\b\d+(?:\.\d+)+(?:pro)?\b/giu) || [])
      .map(canonicalDreaminaModelVersion)
      .filter(Boolean)
  )].sort(compareDreaminaModelVersions);
}

export function dreaminaSupportsImageEdit(modelVersion) {
  const canonical = canonicalDreaminaModelVersion(modelVersion);
  return canonical === "5.0Pro" || Number(canonical) >= 4;
}

export function dreaminaImageResolutionTypes(modelVersion, mode = "create") {
  const canonical = canonicalDreaminaModelVersion(modelVersion);
  if (canonical === "5.0Pro") return ["1.5k", "2k", "4k"];
  if (mode === "edit" || Number(canonical) >= 4) return ["2k", "4k"];
  return ["1k", "2k"];
}

export function canonicalDreaminaVideoModelVersion(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/^dreamina-video-/u, "");
  return /^seedance\d+(?:\.\d+)+(?:[a-z0-9_]*)$/u.test(normalized) ? normalized : "";
}

export function compareDreaminaVideoModelVersions(left, right) {
  const leftVersion = canonicalDreaminaVideoModelVersion(left) || String(left || "").trim().toLowerCase();
  const rightVersion = canonicalDreaminaVideoModelVersion(right) || String(right || "").trim().toLowerCase();
  const leftNumber = Number(leftVersion.match(/^seedance(\d+(?:\.\d+)+)/u)?.[1] || 0);
  const rightNumber = Number(rightVersion.match(/^seedance(\d+(?:\.\d+)+)/u)?.[1] || 0);
  if (leftNumber !== rightNumber) return rightNumber - leftNumber;
  const leftIndex = dreaminaVideoModelVersions.indexOf(leftVersion);
  const rightIndex = dreaminaVideoModelVersions.indexOf(rightVersion);
  if (leftIndex >= 0 || rightIndex >= 0) {
    if (leftIndex < 0) return 1;
    if (rightIndex < 0) return -1;
    return leftIndex - rightIndex;
  }
  return leftVersion.localeCompare(rightVersion, undefined, { numeric: true, sensitivity: "base" });
}

export function extractDreaminaVideoModelVersions(text) {
  const source = String(text || "");
  const sections = [
    ...source.matchAll(/(?:model_version\s*:|flag values\s*:|--model_version[^\r\n]*?supported values\s*:)[ \t]*([^\r\n]+)/giu)
  ].map((match) => match[1]);
  if (!sections.length) return [];
  return [...new Set(
    (sections.join(",").match(/\bseedance\d+(?:\.\d+)+(?:[a-z0-9_]*)\b/giu) || [])
      .map(canonicalDreaminaVideoModelVersion)
      .filter(Boolean)
  )].sort(compareDreaminaVideoModelVersions);
}

export function normalizeDreaminaVideoMode(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[_\s]+/gu, "-");
  const aliases = {
    auto: dreaminaVideoModes.AUTO,
    text: dreaminaVideoModes.TEXT,
    text2video: dreaminaVideoModes.TEXT,
    image: dreaminaVideoModes.IMAGE,
    image2video: dreaminaVideoModes.IMAGE,
    frames: dreaminaVideoModes.FRAMES,
    frames2video: dreaminaVideoModes.FRAMES,
    "first-last": dreaminaVideoModes.FRAMES,
    multiframe: dreaminaVideoModes.MULTIFRAME,
    multiframe2video: dreaminaVideoModes.MULTIFRAME,
    multimodal: dreaminaVideoModes.MULTIMODAL,
    multimodal2video: dreaminaVideoModes.MULTIMODAL,
    ref2video: dreaminaVideoModes.MULTIMODAL
  };
  return aliases[normalized] || dreaminaVideoModes.AUTO;
}

export function normalizeArkVideoMode(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[_\s]+/gu, "-");
  const aliases = {
    auto: arkVideoModes.AUTO,
    text: arkVideoModes.TEXT,
    text2video: arkVideoModes.TEXT,
    reference: arkVideoModes.REFERENCE,
    ref: arkVideoModes.REFERENCE,
    ref2video: arkVideoModes.REFERENCE,
    multimodal: arkVideoModes.REFERENCE,
    multimodal2video: arkVideoModes.REFERENCE,
    frames: arkVideoModes.FRAMES,
    frames2video: arkVideoModes.FRAMES,
    "first-last": arkVideoModes.FRAMES,
    "first-last-frame": arkVideoModes.FRAMES,
    edit: arkVideoModes.EDIT,
    videoedit: arkVideoModes.EDIT,
    "video-edit": arkVideoModes.EDIT,
    extend: arkVideoModes.EXTEND,
    extension: arkVideoModes.EXTEND,
    videoextend: arkVideoModes.EXTEND,
    "video-extend": arkVideoModes.EXTEND
  };
  return aliases[normalized] || arkVideoModes.AUTO;
}

export function isArkSeedance25Model(...values) {
  return values.flat(Infinity).some((value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "ark-seedance-2.5"
      || /(?:^|[-_/])seedance[-_]?2(?:\.|-)?5(?:[-_/]|$)/u.test(normalized)
      || normalized.includes("doubao-seedance-2-5-260628");
  });
}

export function arkVideoReferenceLimits(model, mode = arkVideoModes.AUTO) {
  const normalizedMode = normalizeArkVideoMode(mode);
  if (normalizedMode === arkVideoModes.TEXT) {
    return { images: 0, videos: 0, audios: 0, total: 0, minImages: 0, minVideos: 0 };
  }
  if (normalizedMode === arkVideoModes.FRAMES) {
    return { images: 2, videos: 0, audios: 0, total: 2, minImages: 1, minVideos: 0 };
  }
  if (!isArkSeedance25Model(model)) {
    return { images: 9, videos: 0, audios: 0, total: 9, minImages: 0, minVideos: 0 };
  }
  if (normalizedMode === arkVideoModes.EXTEND) {
    return { images: 30, videos: 1, audios: 10, total: 41, minImages: 0, minVideos: 1 };
  }
  return {
    images: 30,
    videos: 10,
    audios: 10,
    total: 50,
    minImages: 0,
    minVideos: normalizedMode === arkVideoModes.EDIT ? 1 : 0
  };
}

export function dreaminaVideoDurationRange(modelVersion, mode = dreaminaVideoModes.AUTO) {
  if (normalizeDreaminaVideoMode(mode) === dreaminaVideoModes.MULTIFRAME) return { min: 1, max: 8 };
  return canonicalDreaminaVideoModelVersion(modelVersion) === "seedance2.5"
    ? { min: 4, max: 30 }
    : { min: 4, max: 15 };
}

export function dreaminaVideoResolutionTypes(modelVersion, mode = dreaminaVideoModes.AUTO) {
  if (normalizeDreaminaVideoMode(mode) === dreaminaVideoModes.MULTIFRAME) return ["720p", "1080p"];
  const canonical = canonicalDreaminaVideoModelVersion(modelVersion);
  if (canonical === "seedance2.5") return ["480p", "720p", "1080p"];
  if (canonical === "seedance2.0_vip") return ["720p", "1080p", "4k"];
  return ["720p"];
}

export function dreaminaVideoReferenceLimits(modelVersion, mode = dreaminaVideoModes.MULTIMODAL) {
  const normalizedMode = normalizeDreaminaVideoMode(mode);
  if (normalizedMode === dreaminaVideoModes.TEXT) {
    return { images: 0, videos: 0, audios: 0, total: 0, minImages: 0 };
  }
  if (normalizedMode === dreaminaVideoModes.IMAGE) {
    return { images: 1, videos: 0, audios: 0, total: 1, minImages: 1 };
  }
  if (normalizedMode === dreaminaVideoModes.FRAMES) {
    return { images: 2, videos: 0, audios: 0, total: 2, minImages: 2 };
  }
  if (normalizedMode === dreaminaVideoModes.MULTIFRAME) {
    return { images: 20, videos: 0, audios: 0, total: 20, minImages: 2 };
  }
  if (canonicalDreaminaVideoModelVersion(modelVersion) === "seedance2.5") {
    return { images: 30, videos: 10, audios: 10, total: 50, minImages: 0 };
  }
  return { images: 9, videos: 3, audios: 3, total: 12, minImages: 0 };
}

export function dreaminaVideoImageReferenceLimit(modelVersion) {
  return dreaminaVideoReferenceLimits(modelVersion).images;
}

export function bananaImageProfile(...values) {
  const normalized = values
    .flat(Infinity)
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);

  if (normalized.includes("grsai")) return bananaImageProfiles.GRSAI;
  if (normalized.includes("gemini-native")) return bananaImageProfiles.GEMINI_NATIVE;
  if (normalized.some((value) => value.startsWith("nano-banana"))) return bananaImageProfiles.GRSAI;
  if (normalized.some((value) => /(?:banana|香蕉)/u.test(value))) return bananaImageProfiles.GEMINI_NATIVE;
  if (normalized.some(isGeminiImageModelName)) {
    return bananaImageProfiles.GEMINI_NATIVE;
  }
  return "";
}

function isGeminiImageModelName(value) {
  const modelName = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^models\//u, "")
    .replace(/:generatecontent$/u, "");
  return modelName.includes("gemini") && /(?:^|[-_.])image(?:[-_.]|$)/u.test(modelName);
}

export function normalizeBananaImageParameters(size, imageSize = "", defaults = {}) {
  const ratios = defaults.ratios || bananaImageRatios;
  const defaultRatio = ratios.includes(defaults.ratio) ? defaults.ratio : "1:1";
  const defaultImageSize = ["1K", "2K", "4K"].includes(String(defaults.imageSize || "").toUpperCase())
    ? String(defaults.imageSize).toUpperCase()
    : "4K";
  const rawSize = String(size || "").trim();
  const rawImageSize = String(imageSize || "").trim().toUpperCase();
  const [ratioPart, compoundImageSize = ""] = rawSize.split(/[|@]/);
  const dimensions = rawSize.match(/^(\d{2,5})\s*x\s*(\d{2,5})$/iu);
  const inferredRatio = dimensions
    ? closestBananaImageRatio(Number(dimensions[1]), Number(dimensions[2]), ratios)
    : "";
  const longSide = dimensions ? Math.max(Number(dimensions[1]), Number(dimensions[2])) : 0;
  const inferredImageSize = longSide >= 2800 ? "4K" : longSide >= 1600 ? "2K" : longSide > 0 ? "1K" : "";

  return {
    aspectRatio: ratios.includes(ratioPart) ? ratioPart : inferredRatio || defaultRatio,
    imageSize: ["1K", "2K", "4K"].includes(rawImageSize)
      ? rawImageSize
      : ["1K", "2K", "4K"].includes(compoundImageSize.toUpperCase())
        ? compoundImageSize.toUpperCase()
        : inferredImageSize || defaultImageSize
  };
}

export function effectiveImageProtocol(protocol, endpoint) {
  const normalizedProtocol = String(protocol || "").trim().toLowerCase();
  const rawEndpoint = String(endpoint || "").trim();
  let pathname = rawEndpoint;
  try {
    pathname = new URL(rawEndpoint, "https://local.invalid").pathname;
  } catch {}
  if (normalizedProtocol === "gemini-native" && /^\/v1\/images\/(?:generations|edits)\/?$/iu.test(pathname)) {
    return "openai-images";
  }
  if (normalizedProtocol === "ark-images" && /^\/v1\/images\/edits\/?$/iu.test(pathname)) {
    return "openai-images";
  }
  return normalizedProtocol;
}

function closestBananaImageRatio(width, height, ratios = bananaImageRatios) {
  if (!(width > 0) || !(height > 0)) return "";
  const target = width / height;
  return ratios.reduce((best, ratio) => {
    const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
    const distance = Math.abs(Math.log(target / (ratioWidth / ratioHeight)));
    return !best || distance < best.distance ? { ratio, distance } : best;
  }, null)?.ratio || "";
}
