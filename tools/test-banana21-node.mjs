import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import * as profiles from "../public/model-profiles.js";
import { createAgentNode, generationSnapshot } from "../agent-control-runtime.js";

// Exercise the actual node controls and serialization functions without loading
// the user's canvas, credentials, or any paid generation endpoint.
const source = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const extract = (name) => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const tail = source.slice(start);
  const end = tail.slice(1).search(/\n(?:async )?function /u);
  return end < 0 ? tail : tail.slice(0, end + 1);
};
const element = (tag) => ({
  tag, children: [], events: {}, value: "",
  append(...children) { this.children.push(...children); },
  addEventListener(event, handler) { this.events[event] = handler; },
  setAttribute() {}
});
const connection = (apiModel) => ({ protocol: "media-generate", apiModel, baseUrl: "https://api.lk888.ai", imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate" });
let id = 0;
const context = vm.createContext({
  ...profiles, FormData, URL,
  config: { defaultModel: "banana2.1", modelConnections: { "banana2.1": connection("banana-2.1"), "banana2.1官": connection("banana-2.1-token"), old: { protocol: "gemini-native", apiModel: "gemini-3.1-flash-image-preview" } } },
  document: { createElement: element }, currentProjectId: "banana-node-test", defaultTaskWidth: 620, dreaminaVideoDefaultMode: "auto",
  defaultYunwuBaseUrl: "https://api.openlux.ai", geminiNativeDefaultRatio: "1:1", geminiNativeDefaultImageSize: "4K",
  geminiNativeRatioOptions: ["1:1", "16:9"].map((value) => [value, value]),
  geminiNativeImageSizeOptions: ["1K", "2K", "4K"].map((value) => [value, value]),
  banana21RatioOptions: profiles.banana21AspectRatios.map((value) => [value, value]),
  banana21WebSearchOptions: [["false", "关闭"], ["true", "开启"]],
  banana21ThinkingLevelOptions: [["minimal", "快速（minimal）"], ["high", "深度（high）"]],
  formatOptions: [["png", "png"]], fileStore: new Map(),
  createId: () => `test-${++id}`, defaultEndpointForMode: (mode) => mode === "edit" ? "/v1/images/edits" : "/v1/images/generations",
  imageModelConnectionForModel: (model) => context.config.modelConnections[model],
  isPlainObject: (value) => !!value && typeof value === "object" && !Array.isArray(value),
  clonePlainValue: (value) => structuredClone(value), dedupeStrings: (items) => [...new Set(items)], dedupeAssetRefs: (items) => items,
  normalizePromptNotePlacements: (value) => value || {}, dedupeNodeImages: (items) => items,
  providerForModel: () => "gemini", requestPromptForNode: (node) => node.prompt, effectivePromptForNode: (node) => node.prompt,
  normalizeVideoModeForModel: () => "auto", seedreamModeForNode: () => "standard", normalizeImageModelName: (model) => model,
  isDreaminaModelName: () => false, isArkImageModelName: () => false, isSeedreamImageModelName: () => false,
  isGrokBuildImageModelName: () => false, seedreamImageProfileForModel: () => "", usesBananaImageParameters: (model) => !profiles.gptImage26Profile(model),
  isGrsaiModelName: () => false,
  seedreamProFeatureChannelForModel: () => "", imageModelProfileKind: (model) => profiles.gptImage26Profile(model) ? "openai" : "gemini", imageModelProviderName: () => "",
  imageModelDefinitionForModel: () => null, isSizeAllowedForModel: (size) => profiles.isGptImage25Size(size), defaultSizeForModel: () => "auto",
  gptImage25SizeOptions: [["auto", "auto"], ["1024x1024", "1K"]],
  gptImage25QualityOptions: profiles.gptImage25Qualities.map((value) => [value,value]),
  ttImage25VersionOptions: profiles.ttImage25Versions.map((value) => [value,value]),
  ttImage25AspectRatioOptions: profiles.ttImage25AspectRatios.map((value) => [value,value]),
  ttImage25ResolutionOptions: profiles.ttImage25Resolutions.map((value) => [value,value]),
  ttImage25BackgroundOptions: profiles.ttImage25Backgrounds.map((value) => [value,value]),
  openLuxResponseFormatOptions: [["", "auto"], ["url", "URL"], ["b64_json", "b64_json"]], openLuxModerationOptions: [["auto", "auto"], ["low", "low"]],
  backgroundOptions: [["auto", "auto"], ["transparent", "transparent"]],
  updateNode() {},
  createTaskModelField: () => element("model"), createConnectionOverrideField: () => element("override"), createEditAssetFields: () => element("assets"),
  saveCanvasState() {}, updateCanvasMeta() {}
});
const functions = ["applyTaskModelDefaults", "applyImage26NodeDefaults", "image26FormatsForNode", "image26ProfileForModel", "gptImage25ProfileForModel", "usesGptImage25Parameters", "isOpenLuxGptImage25Node", "usesTtImage25Parameters", "usesTtImage25MediaProtocol", "applyTtImage25NodeDefaults", "qualityOptionsForModel", "usesBanana21Parameters", "sizeOptionsForModel", "geminiNativeEndpointForModel", "parseGeminiNativeSizeValue", "createDefaultTaskNode", "buildNodePayload", "appendNodeFields", "buildGenerationSnapshot", "getImageGeneration", "applyGenerationToTask", "migrateTaskNode", "createDebugPanel", "createField", "createSelectField", "createTextField", "createNumberField"];
const profileStart = source.indexOf("const imageModelDefaultProfiles = {");
functions.unshift("usesGrsaiImage26Parameters", "isSizeAllowedForModel");
functions.unshift("isGrsaiTaskNode", "hasPendingGrsaiTask", "createGrsaiRecoveryPanel");
const profileEnd = source.indexOf("\nfunction applyTaskModelDefaults", profileStart);
vm.runInContext([
  source.slice(profileStart, profileEnd),
  ...functions.map(extract)
].join("\n"), context);
const walk = (node) => [node, ...(node.children || []).flatMap(walk)];
for (const model of ["banana2.1", "banana2.1官"]) {
  const node = context.createDefaultTaskNode("create");
  node.model = model;
  node.prompt = "test prompt";
  context.applyTaskModelDefaults(node);
  assert.equal(node.endpointPath, "/v1/media/generate");
  assert.equal(node.bananaWebSearch, "false");
  assert.equal(node.bananaThinkingLevel, "minimal");
  const panel = context.createDebugPanel(node);
  const fields = walk(panel).filter((item) => item.tag === "label");
  const search = fields.find((field) => field.children[0]?.textContent === "联网搜索").children[1];
  const thinking = fields.find((field) => field.children[0]?.textContent === "思考强度").children[1];
  assert.deepEqual(search.children.map((option) => option.value), ["false", "true"]);
  assert.deepEqual(thinking.children.map((option) => option.value), ["minimal", "high"]);
  search.value = "true";
  search.events.change();
  thinking.value = "high";
  thinking.events.change();
  node.size = "1:8";
  context.applyTaskModelDefaults(node);
  assert.equal(node.size, "1:8");
  assert.equal(context.buildNodePayload(node).bananaWebSearch, "true");
  assert.equal(context.buildNodePayload(node).bananaThinkingLevel, "high");
  const form = new FormData();
  context.appendNodeFields(form, node);
  assert.equal(form.get("bananaWebSearch"), "true");
  assert.equal(form.get("bananaThinkingLevel"), "high");
  const snapshot = context.buildGenerationSnapshot(node);
  const reused = context.createDefaultTaskNode();
  context.applyGenerationToTask(reused, context.getImageGeneration({ image: { generation: snapshot } }));
  const reloaded = context.migrateTaskNode(JSON.parse(JSON.stringify(node)));
  for (const restored of [reused, reloaded]) {
    assert.equal(restored.bananaWebSearch, "true");
    assert.equal(restored.bananaThinkingLevel, "high");
    assert.equal(restored.size, "1:8");
  }
  search.value = "false";
  search.events.change();
  assert.equal(context.buildNodePayload(node).bananaWebSearch, "false");
  const legacy = context.migrateTaskNode({ model, prompt: "old node", extraParams: { params: { web_search: true, thinkingLevel: "high" } } });
  assert.equal(legacy.bananaWebSearch, "true");
  assert.equal(legacy.bananaThinkingLevel, "high");
}
const other = context.migrateTaskNode({ model: "old", prompt: "other channel" });
context.config.modelConnections.yunb21 = { ...connection("gemini-nano-banana-2.1"), baseUrl: "https://api.openlux.ai", protocol: "gemini-native", imageEndpoint: "/v1beta/models/{model}:generateContent", editEndpoint: "/v1beta/models/{model}:generateContent" };
const nativeNode = context.createDefaultTaskNode();
nativeNode.model = "yunb21";
context.applyTaskModelDefaults(nativeNode);
assert.equal(nativeNode.quality, "1K");
assert.equal(nativeNode.responseFormat, "base64");
assert.equal(nativeNode.endpointPath, "/v1beta/models/{model}:generateContent");
nativeNode.size = "8:1";
nativeNode.responseFormat = "url";
nativeNode.bananaThinkingLevel = "high";
context.applyTaskModelDefaults(nativeNode);
const nativeFields = walk(context.createDebugPanel(nativeNode)).filter((item) => item.tag === "label");
assert.ok(nativeFields.some((field) => field.children[0]?.textContent === "思考强度"));
assert.equal(nativeFields.some((field) => field.children[0]?.textContent === "联网搜索"), false);
const nativeReturnField = nativeFields.find((field) => field.children[0]?.textContent === "返回方式").children[1];
assert.deepEqual(nativeReturnField.children.map((option) => option.value), ["base64", "url"]);
const nativeForm = new FormData();
context.appendNodeFields(nativeForm, nativeNode);
assert.equal(nativeForm.get("responseFormat"), "url");
for (const restored of [context.migrateTaskNode(JSON.parse(JSON.stringify(nativeNode))), (() => {
  const reused = context.createDefaultTaskNode();
  context.applyGenerationToTask(reused, context.buildGenerationSnapshot(nativeNode));
  return reused;
})()]) {
  assert.equal(restored.responseFormat, "url");
  assert.equal(restored.bananaThinkingLevel, "high");
  assert.equal(restored.size, "8:1");
}
assert.equal(walk(context.createDebugPanel(other)).some((item) => item.textContent === "联网搜索" || item.textContent === "思考强度"), false);
context.config.modelConnections[profiles.googleBanana21Model] = { ...context.config.modelConnections.yunb21, baseUrl: "https://generativelanguage.googleapis.com", authType: "x-goog-api-key" };
const googleNode = context.createDefaultTaskNode();
googleNode.model = profiles.googleBanana21Model;
context.applyTaskModelDefaults(googleNode);
assert.equal(googleNode.quality, "1K");
assert.equal(googleNode.bananaThinkingLevel, "medium");
assert.equal(googleNode.responseFormat, "");
const googleFields = walk(context.createDebugPanel(googleNode)).filter((item) => item.tag === "label");
const googleSearch = googleFields.find((field) => field.children[0]?.textContent === "联网搜索").children[1];
const googleThinking = googleFields.find((field) => field.children[0]?.textContent === "思考强度").children[1];
assert.deepEqual(googleThinking.children.map((option) => option.value), ["minimal", "medium", "high"]);
assert.equal(googleFields.some((field) => field.children[0]?.textContent === "返回方式"), false);
googleSearch.value = "true";
googleSearch.events.change();
const googleSnapshot = context.buildGenerationSnapshot(googleNode);
assert.equal(googleSnapshot.bananaThinkingLevel, "medium");
assert.equal(googleSnapshot.bananaWebSearch, "true");
const googleReuse = context.createDefaultTaskNode();
context.applyGenerationToTask(googleReuse, googleSnapshot);
assert.equal(googleReuse.bananaThinkingLevel, "medium");
assert.equal(googleReuse.bananaWebSearch, "true");
const googleForm = new FormData();
context.appendNodeFields(googleForm, googleReuse);
assert.equal(googleForm.get("bananaThinkingLevel"), "medium");
const agentNode = createAgentNode({ kind: "image_task", model: "banana2.1", bananaWebSearch: false, bananaThinkingLevel: "high" });
assert.equal(agentNode.bananaWebSearch, false);
assert.equal(generationSnapshot(agentNode).bananaWebSearch, false);
assert.equal(generationSnapshot(agentNode).bananaThinkingLevel, "high");
const agent26 = createAgentNode({ kind: "image_task", model: "tt-image-2.6", image26: { complexity: "low", frameCount: 12 } });
assert.equal(generationSnapshot(agent26).image26.complexity, "low");
console.log("Banana 2.1 node controls, JSON/multipart, reload, reuse and agent snapshots passed.");

for (const definition of profiles.grsaiImage26Models) {
  context.config.modelConnections[definition.model] = { protocol: "grsai", apiModel: definition.apiModel, baseUrl: "https://grsaiapi.com", imageEndpoint: "/v1/api/generate", editEndpoint: "/v1/api/generate" };
  const node = context.createDefaultTaskNode("edit");
  node.model = definition.model;
  node.grsaiTask = { requestId: "persisted-client", taskId: "recovered-upstream", model: definition.model, status: "query_error" };
  context.applyTaskModelDefaults(node);
  assert.equal(node.model, definition.model);
  assert.equal(node.endpointPath, "/v1/api/generate");
  assert.equal(node.quality, "auto");
  node.format = "gif";
  const fields = walk(context.createDebugPanel(node)).filter((item) => item.tag === "label");
  const labels = fields.map((field) => field.children[0]?.textContent);
  for (const unsupported of ["复杂度", "GIF 帧数", "SVG 作者模型", "审核", "返回格式"]) assert.equal(labels.some((label) => label?.startsWith(unsupported)), false);
  const quality = fields.find((field) => field.children[0]?.textContent === "质量").children[1];
  assert.deepEqual(quality.children.map((option) => option.value), profiles.grsaiImage26Qualities(definition.apiModel));
  if (definition.apiModel.endsWith("sunburst")) {
    assert.ok(quality.children.some((option) => option.value === "xhigh"));
    assert.ok(quality.children.some((option) => option.value === "max"));
  }
  const formats = fields.find((field) => field.children[0]?.textContent === "输出格式").children[1];
  assert.deepEqual(formats.children.map((option) => option.value), profiles.grsaiImage26Formats(definition.apiModel));
  node.size = definition.apiModel === "gpt-image-2.6" ? "16:9" : "3840x2160";
  context.applyTaskModelDefaults(node);
  const restored = context.migrateTaskNode(JSON.parse(JSON.stringify(node)));
  assert.equal(restored.size, node.size);
  assert.equal(restored.format, "gif");
  assert.equal(restored.grsaiTask.taskId, "recovered-upstream");
  assert.equal(restored.grsaiTask.requestId, "persisted-client");
  assert.equal(context.hasPendingGrsaiTask(restored), true);
  const form = new FormData();
  context.appendNodeFields(form, restored);
  assert.equal(form.get("grsaiRequestId"), "persisted-client");
  assert.equal(context.buildNodePayload(restored).grsaiRequestId, "persisted-client");
}
console.log("Grsai GPT Image 2.6 node controls, size/quality/format limits and reload passed.");

for (const model of [profiles.gptImage26Profiles.SUNBURST, profiles.gptImage26Profiles.FLARE, profiles.gptImage26Profiles.TT, profiles.gptImage26Profiles.TT_GUAN]) {
  const tt = profiles.isTtImage26Model(model);
  context.config.modelConnections[model] = tt ? connection(model) : { ...connection(model), protocol: "openai-images", baseUrl: "https://api.openlux.ai", imageEndpoint: "/v1/images/generations", editEndpoint: "/v1/images/edits" };
  const node = context.createDefaultTaskNode();
  node.model = model;
  node.prompt = "image 2.6 test";
  context.applyTaskModelDefaults(node);
  const fields = walk(context.createDebugPanel(node)).filter((item) => item.tag === "label");
  const complexity = fields.find((field) => field.children[0]?.textContent === "复杂度").children[1];
  complexity.value = "low";
  complexity.events.change();
  assert.equal(context.buildNodePayload(node).image26.complexity, "low");
  node.format = "gif";
  const gifFields = walk(context.createDebugPanel(node)).filter((item) => item.tag === "label");
  assert.ok(gifFields.some((field) => field.children[0]?.textContent === "GIF 帧数"));
  node.image26.frameCount = "12";
  node.image26.frameDurationMs = "300";
  const snapshot = context.buildGenerationSnapshot(node);
  const restored = context.createDefaultTaskNode();
  context.applyGenerationToTask(restored, context.getImageGeneration({ image: { generation: snapshot } }));
  assert.equal(restored.image26.frameCount, "12");
  assert.equal(context.migrateTaskNode(JSON.parse(JSON.stringify(node))).image26.complexity, "low");
  const form = new FormData();
  context.appendNodeFields(form, node);
  assert.equal(JSON.parse(form.get("image26")).frameDurationMs, "300");
  assert.equal(context.image26FormatsForNode(node).includes("svg"), model !== profiles.gptImage26Profiles.TT_GUAN);
  if (!tt) {
    node.mode = "edit";
    assert.equal(context.image26FormatsForNode(node).includes("svg"), false);
    assert.ok(walk(context.createDebugPanel(node)).some((item) => item.textContent === "编辑引导"));
  }
}
console.log("GPT/TT Image 2.6 node controls, GIF/SVG restrictions, JSON/multipart and parameter reuse passed.");
