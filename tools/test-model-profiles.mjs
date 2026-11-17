import assert from "node:assert/strict";
import {
  arkVideoModes,
  arkVideoReferenceLimits,
  bananaImageProfile,
  bananaImageProfiles,
  canonicalDreaminaModelVersion,
  canonicalDreaminaVideoModelVersion,
  compareDreaminaModelVersions,
  compareDreaminaVideoModelVersions,
  dreaminaImageResolutionTypes,
  dreaminaSupportsImageEdit,
  dreaminaVideoDurationRange,
  dreaminaVideoImageReferenceLimit,
  dreaminaVideoModes,
  dreaminaVideoResolutionTypes,
  dreaminaVideoReferenceLimits,
  effectiveImageProtocol,
  extractDreaminaModelVersions,
  extractDreaminaVideoModelVersions,
  gptImage25Profile,
  gptImage25Profiles,
  gptImageProfile,
  gptImage26Profile,
  gptImage26Profiles,
  buildImage26Options,
  image26OutputFormats,
  isTtImage26Model,
  migrateTtImage26Connection,
  isBanana21Model,
  isOpenLuxBanana21Connection,
  isGoogleBanana21Connection,
  migrateBanana21Connection,
  normalizeBanana21ImageParameters,
  normalizeBanana21ThinkingLevel,
  normalizeBanana21WebSearch,
  isGptImage25Size,
  isTtImage25Model,
  isArkSeedance25Model,
  normalizeBananaImageParameters,
  normalizeArkVideoMode,
  normalizeDreaminaVideoMode,
  normalizeGptImage25Quality,
  normalizeGptImage25Size,
  normalizeSeedreamProMode,
  normalizeTtImage25AspectRatio,
  normalizeTtImage25Background,
  normalizeTtImage25Resolution,
  normalizeTtImage25Sizing,
  normalizeTtImage25Version,
  seedreamImageProfile,
  seedreamImageProfiles,
  seedreamProFeatureChannel,
  seedreamProModes,
  ttImage25PixelSize
} from "../public/model-profiles.js";

const cases = [
  ["seedream5.0pro", seedreamImageProfiles.PRO_5],
  ["Seedream 5.0 Pro", seedreamImageProfiles.PRO_5],
  ["seedream-5-0-pro", seedreamImageProfiles.PRO_5],
  ["seedream-v5-pro/layer-decomposition", seedreamImageProfiles.PRO_5],
  ["seedream-v5-pro/multi-image-fusion", seedreamImageProfiles.PRO_5],
  ["doubao-seedream-5-0-pro-260628", seedreamImageProfiles.PRO_5],
  ["doubao-seedream-5-0-260128", seedreamImageProfiles.PRO_5],
  ["seedream5.0lite", seedreamImageProfiles.LITE_5],
  ["seedream-v5-lite", seedreamImageProfiles.LITE_5],
  ["doubao-seedream-5-0-lite-260128", seedreamImageProfiles.LITE_5],
  ["seedream-4.5", seedreamImageProfiles.V4_5],
  ["doubao-seedream-4-0-250828", seedreamImageProfiles.V4_0]
];

for (const model of Object.values(gptImage26Profiles)) assert.equal(gptImage26Profile(model), model);
assert.equal(gptImage26Profile("Custom GPT Image 2.6 Sunburst-c"), gptImage26Profiles.SUNBURST);
assert.equal(gptImage26Profile("tt_image_2_6_guan"), gptImage26Profiles.TT_GUAN);
assert.equal(gptImage26Profile("gpt-image-2.60"), "");
assert.equal(gptImage26Profile("gpt-image-2.5-sunburst"), "");
assert.equal(gptImageProfile("gpt-image-2.5-sunburst"), gptImage25Profiles.SUNBURST);
assert.equal(isTtImage26Model("tt-image-2.6-guan"), true);
assert.equal(isTtImage26Model("tt-image-2.5"), false);
assert.deepEqual(buildImage26Options(), { complexity: "high", output_format: "png", background: "auto" });
assert.equal(buildImage26Options({}, { tt: true }).complexity, "medium");
assert.deepEqual(buildImage26Options({ format: "gif", frameCount: "2", frameDurationMs: "20" }), {
  complexity: "high", output_format: "gif", background: "auto", frame_count: 2, frame_duration_ms: 20
});
assert.equal(buildImage26Options({ format: "webp", background: "transparent" }).output_format, "webp");
assert.deepEqual(buildImage26Options({ format: "svg", svgModel: "gpt-6-luna", svgReasoning: "low" }).svg, { model: "gpt-6-luna", reasoning: { effort: "low" } });
assert.throws(() => buildImage26Options({ format: "svg" }), /SVG 作者模型/u);
assert.throws(() => buildImage26Options({ format: "svg", svgModel: "gpt-6-luna" }, { edit: true }), /不支持/u);
assert.throws(() => buildImage26Options({ format: "svg" }, { tt: true, guan: true }), /不支持/u);
assert.equal(buildImage26Options({ format: "svg" }, { tt: true }).output_format, "svg");
assert.throws(() => buildImage26Options({ format: "gif", frameCount: 3 }, { tt: true }), /帧数/u);
assert.throws(() => buildImage26Options({ format: "gif" }, { hasMask: true }), /mask/u);
assert.throws(() => buildImage26Options({ format: "gif", output_compression: 80 }), /压缩率/u);
assert.throws(() => buildImage26Options({ format: "gif", background: "transparent" }), /透明背景/u);
assert.equal(image26OutputFormats({ tt: true, guan: true }).includes("svg"), false);
const tt26Legacy = { apiModel: "tt-image-2.6-guan", baseUrl: "https://api.lk888.ai", protocol: "openai-images", imageEndpoint: "/v1/images/generations", editEndpoint: "/v1/images/edits" };
assert.equal(migrateTtImage26Connection("custom-tt26", tt26Legacy).protocol, "media-generate");
assert.equal(migrateTtImage26Connection("custom-tt26", { ...tt26Legacy, baseUrl: "https://other.example" }).protocol, "openai-images");

for (const [model, expected] of cases) {
  assert.equal(seedreamImageProfile(model), expected, model);
}

assert.equal(
  seedreamImageProfile("my-seedream", "doubao-seedream-5-0-260128"),
  seedreamImageProfiles.PRO_5
);
assert.equal(seedreamImageProfile("gpt-image-2"), "");
assert.equal(normalizeSeedreamProMode("fusion"), seedreamProModes.FUSION);
assert.equal(normalizeSeedreamProMode("INTERACTIVE"), seedreamProModes.INTERACTIVE);
assert.equal(normalizeSeedreamProMode("LAYERS"), seedreamProModes.LAYERS);
assert.equal(normalizeSeedreamProMode("unsupported"), seedreamProModes.STANDARD);
assert.equal(seedreamProFeatureChannel("seedream-v5-pro/layer-decomposition"), true);
assert.equal(seedreamProFeatureChannel("/v1/models/seedream-v5-pro/layer_decomposition"), true);
assert.equal(seedreamProFeatureChannel("Seedream 5 Pro 智能拆图层"), true);
assert.equal(seedreamProFeatureChannel("seedream-v5-pro/multi-image-fusion"), true);
assert.equal(seedreamProFeatureChannel("seedream-v5-pro/image_fusion"), true);
assert.equal(seedreamProFeatureChannel("Seedream 5 Pro 多图融合"), true);
assert.equal(seedreamProFeatureChannel("generic-diffusion-model"), false);
assert.equal(seedreamProFeatureChannel("seedream-v5-pro"), false);

const gptImage25Cases = [
  ["gpt-image-2.5-sunburst", gptImage25Profiles.SUNBURST],
  ["openai/gpt-image-2.5-sunburst-2026-09-08", gptImage25Profiles.SUNBURST],
  ["GPT_IMAGE_2_5_FLARE", gptImage25Profiles.FLARE],
  ["gptimage2.5", gptImage25Profiles.GENERIC],
  ["tt-image-2.5", gptImage25Profiles.TT],
  ["TT Image 2.5 官转", gptImage25Profiles.TT],
  [["聚合生图", "tt-image-2.5-token"], gptImage25Profiles.TT],
  [["自定义生图", "GPT Image 2.5 Flare 快速渠道"], gptImage25Profiles.FLARE],
  [["relay-image", "gpt-image-2.5"], gptImage25Profiles.GENERIC]
];

for (const [values, expected] of gptImage25Cases) {
  assert.equal(gptImage25Profile(values), expected, Array.isArray(values) ? values.join(" / ") : values);
}
assert.equal(gptImage25Profile("gpt-image-2"), "");
assert.equal(gptImage25Profile("image-2.5-flare"), "");
assert.equal(normalizeGptImage25Quality("XHIGH"), "xhigh");
assert.equal(normalizeGptImage25Quality("MAX"), "max");
assert.equal(normalizeGptImage25Quality("ultra"), "auto");
assert.equal(isGptImage25Size("1536x1024"), true);
assert.equal(isGptImage25Size("3840x2160"), true);
assert.equal(isGptImage25Size("4608x1792"), false);
assert.equal(isGptImage25Size("4096x2048"), false);
assert.equal(isGptImage25Size("1024x4000"), false);
assert.equal(isGptImage25Size("1000x1000"), false);
assert.equal(normalizeGptImage25Size(" 1024 X 1536 "), "1024x1536");
assert.equal(normalizeGptImage25Size("1920x1080"), "auto");
assert.equal(isTtImage25Model("ttimage2.5"), true);
assert.equal(isTtImage25Model("gpt-image-2.5-sunburst"), false);
assert.equal(normalizeTtImage25Version("SUNBURST"), "sunburst");
assert.equal(normalizeTtImage25Version("unknown"), "flare");
assert.equal(normalizeTtImage25AspectRatio("21:9"), "21:9");
assert.equal(normalizeTtImage25AspectRatio("3:1"), "auto");
assert.equal(normalizeTtImage25Resolution("4k"), "4K");
assert.equal(normalizeTtImage25Background("TRANSPARENT"), "transparent");
assert.deepEqual(normalizeTtImage25Sizing("16:9", "2k"), { aspectRatio: "16:9", resolution: "2K" });
assert.deepEqual(normalizeTtImage25Sizing("auto", "4K"), { aspectRatio: "auto", resolution: "auto" });
assert.equal(ttImage25PixelSize("16:9", "2K"), "2560x1440");
assert.equal(ttImage25PixelSize("4:5", "4K"), "2560x3200");
assert.equal(ttImage25PixelSize("auto", "2K"), "auto");

const bananaCases = [
  [["gemini-3.1-flash-image-preview"], bananaImageProfiles.GEMINI_NATIVE],
  [["gemini-2.5-flash-image-preview"], bananaImageProfiles.GEMINI_NATIVE],
  [["gemini-3.2-pro-image-preview"], bananaImageProfiles.GEMINI_NATIVE],
  [["gemini-4-image-preview"], bananaImageProfiles.GEMINI_NATIVE],
  [["models/gemini-5.0-flash-image-preview:generateContent"], bananaImageProfiles.GEMINI_NATIVE],
  [["banana2"], bananaImageProfiles.GEMINI_NATIVE],
  [["聚合香蕉"], bananaImageProfiles.GEMINI_NATIVE],
  [["custom-image", "gemini-3.1-flash-image-preview"], bananaImageProfiles.GEMINI_NATIVE],
  [["gemini-native", "custom-image"], bananaImageProfiles.GEMINI_NATIVE],
  [["nano-banana-2"], bananaImageProfiles.GRSAI],
  [["grsai", "聚合香蕉"], bananaImageProfiles.GRSAI],
  [["gpt-image-2"], ""]
];

for (const [values, expected] of bananaCases) {
  assert.equal(bananaImageProfile(values), expected, values.join(" / "));
}

assert.deepEqual(normalizeBananaImageParameters("3840x2160"), { aspectRatio: "16:9", imageSize: "4K" });
assert.deepEqual(normalizeBananaImageParameters("2048x1152"), { aspectRatio: "16:9", imageSize: "2K" });
assert.deepEqual(normalizeBananaImageParameters("21:9|2K"), { aspectRatio: "21:9", imageSize: "2K" });
assert.deepEqual(normalizeBananaImageParameters("9:16", "1k"), { aspectRatio: "9:16", imageSize: "1K" });
for (const model of ["banana-2.1", "banana-2.1-token", "banana2.1", "banana2.1官"]) {
  assert.equal(isBanana21Model(model), true, model);
}
for (const model of ["banana-2", "nano-banana-2", "banana-pro", "banana-2.10", "gemini-3.1-flash-image-preview"]) {
  assert.equal(isBanana21Model(model), false, model);
}
assert.deepEqual(normalizeBanana21ImageParameters("1:8", "2k"), { aspectRatio: "1:8", imageSize: "2K" });
assert.deepEqual(normalizeBanana21ImageParameters("4:5|1K"), { aspectRatio: "4:5", imageSize: "1K" });
assert.deepEqual(normalizeBanana21ImageParameters("2048x512"), { aspectRatio: "4:1", imageSize: "2K" });
assert.deepEqual(normalizeBananaImageParameters("4:5", "1K"), { aspectRatio: "1:1", imageSize: "1K" });
assert.equal(normalizeBanana21ThinkingLevel("HIGH"), "high");
assert.equal(normalizeBanana21ThinkingLevel("invalid"), "minimal");
assert.equal(normalizeBanana21ThinkingLevel("MEDIUM", { google: true }), "medium");
assert.equal(normalizeBanana21ThinkingLevel("invalid", { google: true }), "medium");
assert.equal(normalizeBanana21ThinkingLevel("medium"), "minimal");
const googleConnection = { baseUrl: "https://generativelanguage.googleapis.com", apiModel: "gemini-nano-banana-2.1" };
assert.equal(isGoogleBanana21Connection(googleConnection), true);
assert.equal(isGoogleBanana21Connection({ ...googleConnection, baseUrl: "https://api.openlux.ai" }), false);
assert.equal(isGoogleBanana21Connection({ ...googleConnection, baseUrl: "https://generativelanguage.googleapis.com.example.org" }), false);
assert.equal(normalizeBanana21WebSearch(true), true);
assert.equal(normalizeBanana21WebSearch("true"), true);
assert.equal(normalizeBanana21WebSearch("false"), false);
assert.equal(normalizeBanana21WebSearch(false), false);
assert.equal(normalizeBanana21WebSearch(undefined), false);
const bananaLegacy = {
  capability: "image", apiModel: "banana-2.1-token", baseUrl: "https://api.lk888.ai", protocol: "gemini-native",
  imageEndpoint: "/v1/images/generations", editEndpoint: "/v1/images/edits", authType: "bearer"
};
const bananaMigrated = migrateBanana21Connection("banana2.1官", bananaLegacy);
assert.deepEqual(bananaMigrated, { ...bananaLegacy, protocol: "media-generate", imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate" });
assert.equal(bananaLegacy.protocol, "gemini-native");
assert.deepEqual(migrateBanana21Connection("banana2.1官", bananaMigrated), bananaMigrated);
for (const patch of [
  { baseUrl: "https://other.example" },
  { baseUrl: "https://api.lk888.ai.other.example" },
  { apiModel: "gemini-3.1-flash-image-preview" },
  { editEndpoint: "/custom/edit" },
  { capability: "video" }
]) {
  const unchanged = { ...bananaLegacy, ...patch };
  assert.equal(migrateBanana21Connection("banana2.1官", unchanged), unchanged);
}
assert.equal(migrateBanana21Connection("banana2.1", { ...bananaLegacy, baseUrl: "https://api.lk666.ai" }).protocol, "media-generate");
const openLuxBanana = { ...bananaLegacy, apiModel: "gemini-nano-banana-2.1", baseUrl: "https://api.openlux.ai", protocol: "media-generate" };
const openLuxBananaMigrated = migrateBanana21Connection("yunb2.1", openLuxBanana);
assert.equal(isOpenLuxBanana21Connection(openLuxBanana), true);
assert.equal(isOpenLuxBanana21Connection({ ...openLuxBanana, baseUrl: "https://api.openlux.ai.other.example" }), false);
assert.equal(openLuxBananaMigrated.protocol, "gemini-native");
assert.equal(openLuxBananaMigrated.imageEndpoint, "/v1beta/models/{model}:generateContent");
assert.equal(openLuxBananaMigrated.editEndpoint, openLuxBananaMigrated.imageEndpoint);
assert.equal(migrateBanana21Connection("yunb2.1", openLuxBananaMigrated), openLuxBananaMigrated);
for (const patch of [{ baseUrl: "https://ai.t8star.org" }, { apiModel: "banana-2.1" }, { imageEndpoint: "/my/custom" }, { capability: "video" }]) {
  const value = { ...openLuxBanana, ...patch };
  assert.equal(migrateBanana21Connection("yunb2.1", value), value);
}
assert.deepEqual(normalizeBanana21ImageParameters("auto", "", { imageSize: "1K" }), { aspectRatio: "1:1", imageSize: "1K" });
assert.equal(effectiveImageProtocol("gemini-native", "/v1/images/generations"), "openai-images");
assert.equal(effectiveImageProtocol("gemini-native", "https://proxy.example/v1/images/edits"), "openai-images");
assert.equal(effectiveImageProtocol("gemini-native", "/v1beta/models/{model}:generateContent"), "gemini-native");
assert.equal(effectiveImageProtocol("ark-images", "/v1/images/edits"), "openai-images");
assert.equal(effectiveImageProtocol("ark-images", "https://proxy.example/v1/images/edits"), "openai-images");
assert.equal(effectiveImageProtocol("ark-images", "/v1/images/generations"), "ark-images");
assert.equal(effectiveImageProtocol("ark-images", "/api/v3/images/generations"), "ark-images");
assert.equal(effectiveImageProtocol("openai-images", "/v1/images/edits"), "openai-images");

const dreaminaHelp = "model_version: 3.0, 4.7, 5.0, 5.0Pro\nresolution_type: 1.5k, 2k, 4k";
assert.equal(canonicalDreaminaModelVersion("dreamina-5.0pro"), "5.0Pro");
assert.equal(canonicalDreaminaModelVersion("5.0"), "5.0");
assert.equal(canonicalDreaminaModelVersion("seedream-pro"), "");
assert.deepEqual(extractDreaminaModelVersions(dreaminaHelp), ["5.0Pro", "5.0", "4.7", "3.0"]);
assert.deepEqual(["4.7", "5.0", "5.0Pro"].sort(compareDreaminaModelVersions), ["5.0Pro", "5.0", "4.7"]);
assert.equal(dreaminaSupportsImageEdit("5.0Pro"), true);
assert.equal(dreaminaSupportsImageEdit("3.1"), false);
assert.deepEqual(dreaminaImageResolutionTypes("5.0Pro", "create"), ["1.5k", "2k", "4k"]);
assert.deepEqual(dreaminaImageResolutionTypes("5.0", "edit"), ["2k", "4k"]);

const dreaminaVideoHelp = "model_version: seedance2.0, seedance2.0fast, seedance2.0_vip, seedance2.0mini, seedance2.5\n";
const dreaminaMultimodalHelp = "flag values: seedance2.0, seedance2.0fast, seedance2.0_vip, seedance2.5).\ndefault model_version: seedance2.0_vip\n";
assert.equal(canonicalDreaminaVideoModelVersion("dreamina-video-seedance2.5"), "seedance2.5");
assert.deepEqual(extractDreaminaVideoModelVersions(dreaminaVideoHelp), [
  "seedance2.5",
  "seedance2.0fast",
  "seedance2.0",
  "seedance2.0mini",
  "seedance2.0_vip"
]);
assert.deepEqual(extractDreaminaVideoModelVersions(dreaminaMultimodalHelp), [
  "seedance2.5",
  "seedance2.0fast",
  "seedance2.0",
  "seedance2.0_vip"
]);
assert.deepEqual(["seedance2.0", "seedance2.5"].sort(compareDreaminaVideoModelVersions), ["seedance2.5", "seedance2.0"]);
assert.deepEqual(dreaminaVideoDurationRange("seedance2.5"), { min: 4, max: 30 });
assert.deepEqual(dreaminaVideoResolutionTypes("seedance2.5"), ["480p", "720p", "1080p"]);
assert.deepEqual(dreaminaVideoResolutionTypes("seedance2.0_vip"), ["720p", "1080p", "4k"]);
assert.deepEqual(dreaminaVideoResolutionTypes("seedance2.0fast_vip"), ["720p"]);
assert.equal(dreaminaVideoImageReferenceLimit("seedance2.5"), 30);
assert.equal(dreaminaVideoImageReferenceLimit("seedance2.0fast"), 9);
assert.equal(normalizeDreaminaVideoMode("frames2video"), dreaminaVideoModes.FRAMES);
assert.equal(normalizeDreaminaVideoMode("ref2video"), dreaminaVideoModes.MULTIMODAL);
assert.equal(normalizeDreaminaVideoMode("unknown"), dreaminaVideoModes.AUTO);
assert.deepEqual(dreaminaVideoResolutionTypes("seedance2.0fast", "multiframe"), ["720p", "1080p"]);
assert.deepEqual(dreaminaVideoDurationRange("seedance2.5", "multiframe"), { min: 1, max: 8 });
assert.deepEqual(dreaminaVideoReferenceLimits("seedance2.5", "multimodal"), {
  images: 30,
  videos: 10,
  audios: 10,
  total: 50,
  minImages: 0
});
assert.deepEqual(dreaminaVideoReferenceLimits("seedance2.0fast", "frames"), {
  images: 2,
  videos: 0,
  audios: 0,
  total: 2,
  minImages: 2
});

assert.equal(isArkSeedance25Model("ark-seedance-2.5"), true);
assert.equal(isArkSeedance25Model("doubao-seedance-2-5-260628"), true);
assert.equal(isArkSeedance25Model(["custom-video", "doubao-seedance-2-5-260628"]), true);
assert.equal(isArkSeedance25Model("ark-seedance-2.0"), false);
assert.equal(normalizeArkVideoMode("multimodal2video"), arkVideoModes.REFERENCE);
assert.equal(normalizeArkVideoMode("video-edit"), arkVideoModes.EDIT);
assert.equal(normalizeArkVideoMode("extension"), arkVideoModes.EXTEND);
assert.deepEqual(arkVideoReferenceLimits("ark-seedance-2.5", "reference"), {
  images: 30,
  videos: 10,
  audios: 10,
  total: 50,
  minImages: 0,
  minVideos: 0
});
assert.deepEqual(arkVideoReferenceLimits("ark-seedance-2.5", "frames"), {
  images: 2,
  videos: 0,
  audios: 0,
  total: 2,
  minImages: 1,
  minVideos: 0
});
assert.deepEqual(arkVideoReferenceLimits("ark-seedance-2.5", "extend"), {
  images: 30,
  videos: 1,
  audios: 10,
  total: 41,
  minImages: 0,
  minVideos: 1
});

console.log("Image model profile tests passed (Banana 2.1 and GPT/TT Image 2.6 recognition, constraints and scoped migration).");
