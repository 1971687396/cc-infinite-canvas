import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  describeGrokBuildMediaFailure,
  grokBuildAssistantModelId,
  grokBuildImageModel,
  grokBuildStatus,
  grokBuildVideoModel,
  isGrokBuildAssistantModel,
  isGrokBuildImageModel,
  isGrokBuildVideoModel,
  normalizeGrokBuildRatio
} from "../grok-build-bridge.js";

assert.equal(isGrokBuildImageModel(grokBuildImageModel), true);
assert.equal(isGrokBuildImageModel("grok-imagine-image"), false);
assert.equal(isGrokBuildVideoModel(grokBuildVideoModel), true);
assert.equal(isGrokBuildAssistantModel("grok-build-chat:grok-4.5"), true);
assert.equal(grokBuildAssistantModelId("grok-build-chat:grok-4.5"), "grok-4.5");
assert.equal(normalizeGrokBuildRatio("1280x720", "image"), "16:9");
assert.equal(normalizeGrokBuildRatio("720x1280", "video"), "9:16");
assert.equal(normalizeGrokBuildRatio("unknown", "video"), "16:9");
assert.match(
  describeGrokBuildMediaFailure("Video generation failed with HTTP 400 Bad Request: Zero Data Retention teams must provide output.upload_url for video generation."),
  /零数据保留（ZDR）/u
);
assert.match(describeGrokBuildMediaFailure("Tool `image_gen` failed: upstream unavailable", "image"), /图片生成失败：upstream unavailable/u);

const [serverSource, appSource, htmlSource] = await Promise.all([
  readFile(new URL("../server.js", import.meta.url), "utf8"),
  readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  readFile(new URL("../public/index.html", import.meta.url), "utf8")
]);

assert.match(serverSource, /api\/grok-build\/status/u);
assert.match(serverSource, /handleGrokBuildImageGenerate/u);
assert.match(serverSource, /handleGrokBuildVideoGenerate/u);
assert.match(appSource, /Grok Imagine（官方账号）/u);
assert.match(appSource, /Grok Imagine Video（官方账号）/u);
assert.match(htmlSource, /Grok 官方账号/u);

const status = await grokBuildStatus();
assert.equal(typeof status.installed, "boolean");
assert.equal(typeof status.loggedIn, "boolean");
assert.ok(Array.isArray(status.models));

console.log("Grok Build integration checks passed.");
