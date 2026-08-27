import assert from "node:assert/strict";
import {
  bananaImageProfile,
  bananaImageProfiles,
  effectiveImageProtocol,
  normalizeBananaImageParameters,
  normalizeSeedreamProMode,
  seedreamImageProfile,
  seedreamImageProfiles,
  seedreamProFeatureChannel,
  seedreamProModes
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

console.log(`Image model profile tests passed (${cases.length + bananaCases.length + 25} cases).`);
