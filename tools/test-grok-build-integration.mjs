import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import {
  buildGrokHeadlessArgs,
  describeGrokBuildMediaFailure,
  grokBuildAssistantModelId,
  grokBuildDefaultChatModel,
  grokBuildInstallCommand,
  grokBuildImageModel,
  grokBuildStatus,
  grokBuildVideoModel,
  isGrokBuildAssistantModel,
  isGrokBuildImageModel,
  isGrokBuildVideoModel,
  normalizeGrokAssistantResponse,
  normalizeGrokBuildRatio,
  parseGrokModelCatalog
} from "../grok-build-bridge.js";

assert.equal(isGrokBuildImageModel(grokBuildImageModel), true);
assert.equal(isGrokBuildImageModel("grok-imagine-image"), false);
assert.equal(isGrokBuildVideoModel(grokBuildVideoModel), true);
assert.equal(isGrokBuildAssistantModel("grok-build-chat:grok-4.5"), true);
assert.equal(grokBuildAssistantModelId("grok-build-chat:grok-4.5"), "grok-4.5");
assert.equal(grokBuildDefaultChatModel, "grok-4.6");
assert.deepEqual(
  parseGrokModelCatalog(`You are logged in with grok.com.\n\nDefault model: grok-4.6\n\nAvailable models:\n  * grok-4.6 (default)\n  - grok-4.5\n`),
  { models: ["grok-4.6", "grok-4.5"], defaultModel: "grok-4.6" }
);
const memoryArgs = buildGrokHeadlessArgs({ promptFile: "prompt.txt", model: "grok-4.6", useMemory: true });
const isolatedMediaArgs = buildGrokHeadlessArgs({ promptFile: "prompt.txt", media: true });
const responseSchema = { type: "object", properties: { assets: { type: "array" }, shots: { type: "array" } }, required: ["assets", "shots"] };
const storyArgs = buildGrokHeadlessArgs({ promptFile: "episode.txt", model: "grok-4.7", responseSchema, systemPrompt: "Analyze this episode. Return JSON only.", useMemory: true });
const argValue = (args, flag) => args[args.indexOf(flag) + 1];
assert.equal(argValue(storyArgs, "--tools"), "");
assert.equal(argValue(storyArgs, "--disallowed-tools"), "search_tool,use_tool");
assert.equal(storyArgs.includes("--no-subagents"), true);
assert.equal(storyArgs.includes("--verbatim"), true);
assert.equal(argValue(storyArgs, "--max-turns"), "1");
assert.equal(argValue(storyArgs, "--model"), "grok-4.7");
assert.equal(argValue(storyArgs, "--system-prompt-override"), "Analyze this episode. Return JSON only.");
assert.deepEqual(JSON.parse(argValue(storyArgs, "--json-schema")), responseSchema);
assert.equal(storyArgs.includes("--no-memory"), false);
assert.equal(memoryArgs.includes("--tools"), false);
assert.equal(isolatedMediaArgs.includes("--json-schema"), false);
assert.equal(buildGrokHeadlessArgs({ promptFile: "image.txt", media: true, responseSchema }).includes("--tools"), false);
for (const field of ["structured_output", "structuredOutput"]) {
  const original = { text: "Done", [field]: { assets: [{ id: "asset-1" }], shots: [] }, requestId: "test-request", usage: { output_tokens: 20 } };
  const result = normalizeGrokAssistantResponse(original, responseSchema);
  assert.deepEqual(JSON.parse(result.text), original[field]);
  assert.equal(result.requestId, original.requestId);
  assert.deepEqual(result.usage, original.usage);
  assert.equal(normalizeGrokAssistantResponse(original), original);
}
const textOnlyResult = { text: '{"assets":[],"shots":[]}' };
assert.equal(normalizeGrokAssistantResponse(textOnlyResult, responseSchema), textOnlyResult);
const windowsInstallCommand = grokBuildInstallCommand("C:\\Users\\Test\\.grok\\bin\\grok.exe", "win32");
assert.equal(memoryArgs.includes("--no-memory"), false);
assert.equal(memoryArgs.includes("--model"), true);
assert.equal(isolatedMediaArgs.includes("--no-memory"), true);
assert.equal(isolatedMediaArgs.includes("--model"), false);
assert.match(windowsInstallCommand, /npm\.Source install -g @xai-official\/grok@latest/u);
assert.match(windowsInstallCommand, /update --stable/u);
assert.equal(normalizeGrokBuildRatio("1280x720", "image"), "16:9");
assert.equal(normalizeGrokBuildRatio("720x1280", "video"), "9:16");
assert.equal(normalizeGrokBuildRatio("unknown", "video"), "16:9");
assert.match(
  describeGrokBuildMediaFailure("Video generation failed with HTTP 400 Bad Request: Zero Data Retention teams must provide output.upload_url for video generation."),
  /零数据保留（ZDR）/u
);
assert.match(describeGrokBuildMediaFailure("Tool `image_gen` failed: upstream unavailable", "image"), /图片生成失败：upstream unavailable/u);

const [bridgeSource, serverSource, appSource, htmlSource] = await Promise.all([
  readFile(new URL("../grok-build-bridge.js", import.meta.url), "utf8"),
  readFile(new URL("../server.js", import.meta.url), "utf8"),
  readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  readFile(new URL("../public/index.html", import.meta.url), "utf8")
]);

assert.match(serverSource, /api\/grok-build\/status/u);
assert.match(serverSource, /handleGrokBuildImageGenerate/u);
assert.match(serverSource, /handleGrokBuildVideoGenerate/u);
assert.match(serverSource, /projectGrokMemoryDir/u);
assert.match(serverSource, /useMemory/u);
assert.match(serverSource, /responseSchema: storyBreakdownResponseSchema\(\)/u);
assert.match(appSource, /Grok Imagine（官方账号）/u);
assert.match(appSource, /Grok Imagine Video（官方账号）/u);
assert.match(appSource, /grokProjectMemory/u);
assert.match(htmlSource, /Grok 官方账号/u);
assert.match(htmlSource, /id="assistantProjectMemoryToggle"/u);
assert.match(bridgeSource, /@xai-official\/grok@latest/u);
assert.match(bridgeSource, /\.\.\.\(useMemory \? \[\] : \["--no-memory"\]\)/u);

// Exercise the actual bridge and server handoff without sending a paid model request.
let capturedRun;
let capturedPrompt;
let cleaned = false;
const bridgeContext = vm.createContext({
  path: { join: (...parts) => parts.join("/") }, tmpdir: () => "/temp", grokBuildDefaultChatModel,
  mkdtemp: async () => "/temp/cc-grok-chat-test",
  writeFile: async () => {}, rm: async () => { cleaned = true; },
  serializeGrokAssistantMessages: async (messages) => { capturedPrompt = messages; return "current episode"; },
  runGrokHeadless: async (options) => {
    capturedRun = options;
    return { text: "Done", structuredOutput: { assets: [{ id: "asset-1" }], shots: [] } };
  },
  normalizeGrokAssistantResponse
});
const runSource = bridgeSource.slice(bridgeSource.indexOf("export async function runGrokBuildAssistant("), bridgeSource.indexOf("export async function runGrokBuildImage("));
vm.runInContext(runSource.replace("export async", "async"), bridgeContext);
const messages = [{ role: "system", content: "Analyze the current episode and preserve asset memory." }, { role: "user", content: "Only episode 1" }];
const assistantResult = await bridgeContext.runGrokBuildAssistant({ messages, model: "grok-4.7", responseSchema, useMemory: true });
assert.equal(capturedPrompt, messages);
assert.equal(capturedRun.responseSchema, responseSchema);
assert.match(capturedRun.systemPrompt, /不是编程代理/u);
assert.match(capturedRun.systemPrompt, /preserve asset memory/u);
assert.equal(capturedRun.media, false);
assert.equal(capturedRun.useMemory, true);
assert.equal(JSON.parse(assistantResult.text).assets.length, 1);
assert.equal(cleaned, true);

const schemaExampleSource = serverSource.slice(serverSource.indexOf("function storyBreakdownSchemaExample("), serverSource.indexOf("function buildStoryAnalysisMessages("));
let capturedStoryCall;
const storyContext = vm.createContext({
  isGrokBuildAssistantModel, grokBuildAssistantModelId, mkdir: async () => {}, projectGrokMemoryDir: () => "/project-memory",
  config: { grokBuildProxyUrl: "" }, requestAbortSignal: () => new AbortController().signal, assistantRequestTimeoutMs: () => 1000,
  sanitizeOptionalText: (value) => String(value || ""),
  runGrokBuildAssistant: async (options) => { capturedStoryCall = options; return { text: '{"assets":[{"id":"asset-1"}],"shots":[]}' }; }
});
vm.runInContext(schemaExampleSource, storyContext);
const callSource = serverSource.slice(serverSource.indexOf("async function callStoryModel("), serverSource.indexOf("function buildStoryRepairMessages("));
vm.runInContext(callSource, storyContext);
const storyReply = await storyContext.callStoryModel(messages, "grok-build-chat:grok-4.7", { projectMemory: true, projectId: "test" }, {}, {});
assert.equal(storyReply.ok, true);
assert.equal(capturedStoryCall.model, "grok-4.7");
assert.equal(capturedStoryCall.cwd, "/project-memory");
assert.equal(capturedStoryCall.useMemory, true);
const schema = JSON.parse(JSON.stringify(capturedStoryCall.responseSchema));
assert.equal(schema.type, "object");
assert.deepEqual(schema.properties.schema.enum, ["cc-story-episode-v2"]);
assert.ok(schema.required.includes("assets") && schema.required.includes("shots"));
assert.ok(schema.properties.episode.required.includes("id"));
assert.deepEqual(schema.properties.assets.items.properties.reuseMode.enum, ["new", "reuse", "variant"]);
assert.ok(schema.properties.assets.items.required.includes("variantOf"));
assert.equal(schema.properties.assets.maxItems, 60);
assert.equal(schema.properties.shots.maxItems, 80);
assert.equal(schema.anyOf.length, 2, "Don't accept both assets and shots being empty");

const status = await grokBuildStatus();
assert.equal(typeof status.installed, "boolean");
assert.equal(typeof status.loggedIn, "boolean");
assert.ok(Array.isArray(status.models));
if (status.loggedIn) assert.equal(typeof status.defaultModel, "string");

console.log("Grok Build integration checks passed.");
