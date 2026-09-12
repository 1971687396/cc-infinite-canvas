export const seedreamImageProfiles = Object.freeze({
  PRO_5: "ark-seedream-5.0-pro",
  LITE_5: "ark-seedream-5.0-lite",
  V4_5: "ark-seedream-4.5",
  V4_0: "ark-seedream-4.0"
});

export const seedreamProModes = Object.freeze({
  STANDARD: "standard",
  FUSION: "fusion",
  LAYERS: "layers"
});

export const bananaImageProfiles = Object.freeze({
  GEMINI_NATIVE: "gemini-native",
  GRSAI: "grsai"
});

export const gptImage25Profiles = Object.freeze({
  GENERIC: "gpt-image-2.5",
  SUNBURST: "gpt-image-2.5-sunburst",
  FLARE: "gpt-image-2.5-flare",
  TT: "tt-image-2.5"
});

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

export function dreaminaVideoDurationRange(modelVersion) {
  return canonicalDreaminaVideoModelVersion(modelVersion) === "seedance2.5"
    ? { min: 4, max: 30 }
    : { min: 4, max: 15 };
}

export function dreaminaVideoResolutionTypes(modelVersion) {
  const canonical = canonicalDreaminaVideoModelVersion(modelVersion);
  if (canonical === "seedance2.5") return ["480p", "720p", "1080p"];
  if (canonical === "seedance2.0_vip") return ["720p", "1080p", "4k"];
  return ["720p"];
}

export function dreaminaVideoImageReferenceLimit(modelVersion) {
  return canonicalDreaminaVideoModelVersion(modelVersion) === "seedance2.5" ? 30 : 9;
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
  const defaultRatio = bananaImageRatios.includes(defaults.ratio) ? defaults.ratio : "1:1";
  const defaultImageSize = ["1K", "2K", "4K"].includes(String(defaults.imageSize || "").toUpperCase())
    ? String(defaults.imageSize).toUpperCase()
    : "4K";
  const rawSize = String(size || "").trim();
  const rawImageSize = String(imageSize || "").trim().toUpperCase();
  const [ratioPart, compoundImageSize = ""] = rawSize.split(/[|@]/);
  const dimensions = rawSize.match(/^(\d{2,5})\s*x\s*(\d{2,5})$/iu);
  const inferredRatio = dimensions
    ? closestBananaImageRatio(Number(dimensions[1]), Number(dimensions[2]))
    : "";
  const longSide = dimensions ? Math.max(Number(dimensions[1]), Number(dimensions[2])) : 0;
  const inferredImageSize = longSide >= 2800 ? "4K" : longSide >= 1600 ? "2K" : longSide > 0 ? "1K" : "";

  return {
    aspectRatio: bananaImageRatios.includes(ratioPart) ? ratioPart : inferredRatio || defaultRatio,
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

function closestBananaImageRatio(width, height) {
  if (!(width > 0) || !(height > 0)) return "";
  const target = width / height;
  return bananaImageRatios.reduce((best, ratio) => {
    const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
    const distance = Math.abs(Math.log(target / (ratioWidth / ratioHeight)));
    return !best || distance < best.distance ? { ratio, distance } : best;
  }, null)?.ratio || "";
}
