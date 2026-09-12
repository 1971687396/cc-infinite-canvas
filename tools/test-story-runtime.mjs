import assert from "node:assert/strict";
import {
  mergeStoryAssetMemory,
  normalizeStoryAssetMemory,
  normalizeStoryAssetReuseMode,
  removeStoryEpisodeFromAssetMemory,
  splitStoryIntoEpisodes,
  storyAssetMemoryForPrompt,
  storyAssetReuseModes,
  storyScriptSignature
} from "../public/story-runtime.js";

const markedScript = `剧名：记忆测试\n\n第1集：初见\n场景一\n林晓走进旧书店。\n\n第2集：雨夜\n林晓换上红色雨衣，再次来到旧书店。`;
const episodes = splitStoryIntoEpisodes(markedScript);
assert.equal(episodes.length, 2);
assert.match(episodes[0].title, /第1集/u);
assert.match(episodes[1].title, /第2集/u);
assert.equal(episodes[0].index, 0);
assert.notEqual(episodes[0].signature, episodes[1].signature);
assert.equal(storyScriptSignature("abc"), storyScriptSignature("abc"));
assert.notEqual(storyScriptSignature("abc"), storyScriptSignature("abcd"));

const oversized = splitStoryIntoEpisodes("无分集标题\n" + "一个场景。\n".repeat(1400), { maxChars: 4000 });
assert.ok(oversized.length > 1);
assert.ok(oversized.every((episode) => episode.charCount <= 4000));
assert.ok(oversized.every((episode) => episode.partCount === oversized.length));

assert.equal(normalizeStoryAssetReuseMode("复用"), storyAssetReuseModes.REUSE);
assert.equal(normalizeStoryAssetReuseMode("variation"), storyAssetReuseModes.VARIANT);

const memoryAfterEpisode1 = mergeStoryAssetMemory([], [
  {
    id: "character-linxiao",
    kind: "character",
    name: "林晓",
    continuityKey: "linxiao-female-24-short-black-hair",
    description: "24岁女性，黑色短发",
    prompt: "林晓角色设定图",
    reuseMode: "new"
  },
  {
    id: "scene-bookstore",
    kind: "scene",
    name: "旧书店",
    continuityKey: "old-bookstore-main-room",
    description: "木质书架与绿色台灯",
    reuseMode: "new"
  }
], { id: episodes[0].id });
assert.equal(memoryAfterEpisode1.length, 2);

const memoryAfterEpisode2 = mergeStoryAssetMemory(memoryAfterEpisode1, [
  {
    id: "character-linxiao",
    canonicalAssetId: "character-linxiao",
    kind: "character",
    name: "林晓",
    reuseMode: "reuse"
  },
  {
    id: "costume-linxiao-red-raincoat",
    kind: "costume",
    name: "林晓红色雨衣造型",
    reuseMode: "variant",
    variantOf: "character-linxiao",
    variantNotes: "新增红色雨衣，其余身份特征不变"
  }
], { id: episodes[1].id });
assert.equal(memoryAfterEpisode2.length, 3);
const linxiao = memoryAfterEpisode2.find((asset) => asset.id === "character-linxiao");
const raincoat = memoryAfterEpisode2.find((asset) => asset.id === "costume-linxiao-red-raincoat");
assert.equal(linxiao.appearanceCount, 2);
assert.deepEqual(linxiao.episodeIds, [episodes[0].id, episodes[1].id]);
assert.equal(raincoat.sourceMode, "variant");
assert.equal(raincoat.variantOf, "character-linxiao");

const normalized = normalizeStoryAssetMemory({ assets: memoryAfterEpisode2 });
assert.equal(normalized.length, 3);
const promptMemory = storyAssetMemoryForPrompt(normalized);
assert.equal(promptMemory.length, 3);
assert.ok(promptMemory.every((asset) => !Object.hasOwn(asset, "episodeIds")));
const relevantPromptMemory = storyAssetMemoryForPrompt(normalized, { maxItems: 1, context: "镜头回到旧书店内部" });
assert.equal(relevantPromptMemory[0].id, "scene-bookstore");

const memoryBeforeEpisode2Rerun = removeStoryEpisodeFromAssetMemory(memoryAfterEpisode2, episodes[1].id);
assert.equal(memoryBeforeEpisode2Rerun.length, 2);
assert.equal(memoryBeforeEpisode2Rerun.find((asset) => asset.id === "character-linxiao").appearanceCount, 1);
assert.ok(!memoryBeforeEpisode2Rerun.some((asset) => asset.id === "costume-linxiao-red-raincoat"));

console.log("Story episode and asset-memory tests passed.");
