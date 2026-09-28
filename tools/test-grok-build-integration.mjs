import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
assert.match(appSource, /Grok Imagine（官方账号）/u);
assert.match(appSource, /Grok Imagine Video（官方账号）/u);
assert.match(appSource, /grokProjectMemory/u);
assert.match(htmlSource, /Grok 官方账号/u);
assert.match(htmlSource, /id="assistantProjectMemoryToggle"/u);
assert.match(bridgeSource, /@xai-official\/grok@latest/u);
assert.match(bridgeSource, /\.\.\.\(useMemory \? \[\] : \["--no-memory"\]\)/u);

const status = await grokBuildStatus();
assert.equal(typeof status.installed, "boolean");
assert.equal(typeof status.loggedIn, "boolean");
assert.ok(Array.isArray(status.models));
if (status.loggedIn) assert.equal(typeof status.defaultModel, "string");

console.log("Grok Build integration checks passed.");
