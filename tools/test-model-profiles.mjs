import assert from "node:assert/strict";
import {
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
  isGptImage25Size,
  isTtImage25Model,
  normalizeBananaImageParameters,
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

for (const [model, expected] of cases) {
  assert.equal(seedreamImageProfile(model), expected, model);
}

assert.equal(
  seedreamImageProfile("my-seedream", "doubao-seedream-5-0-260128"),
  seedreamImageProfiles.PRO_5
);
assert.equal(seedreamImageProfile("gpt-image-2"), "");
assert.equal(normalizeSeedreamProMode("fusion"), seedreamProModes.FUSION);
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

console.log(`Image model profile tests passed (${cases.length + bananaCases.length + gptImage25Cases.length + 64} cases).`);
