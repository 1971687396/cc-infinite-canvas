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

const bananaImageRatios = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"];

function compactModelName(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
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
