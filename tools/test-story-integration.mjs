import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testCache = path.join(root, "cache", "story-smoke-test");
const requests = [];
const appSource = await readFile(path.join(root, "public", "app.js"), "utf8");
assert.match(appSource, /storyEpisodeId: taskNode\.storyEpisodeId/u);
assert.match(appSource, /storyAssetMemoryBeforeEpisode\(node, episodeId\)/u);
assert.match(appSource, /laterEpisode\.status = "stale"/u);
assert.match(appSource, /asset\.reuseMode !== storyAssetReuseModes\.REUSE/u);

const mock = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/v1/chat/completions") {
    res.statusCode = 404;
    return res.end("not found");
  }
  const payload = await readJson(req);
  requests.push(payload);
  const secondEpisode = requests.length > 1;
  const result = secondEpisode
    ? {
        schema: "cc-story-episode-v2",
        title: "记忆测试",
        episode: { title: "第 2 集", summary: "雨夜重返书店", continuityNotes: "保持人物短发和书店格局" },
        assets: [
          {
            id: "character-linxiao",
            canonicalAssetId: "character-linxiao",
            kind: "character",
            name: "林晓",
            reuseMode: "reuse",
            prompt: "24 岁女性，黑色短发"
          },
          {
            id: "costume-linxiao-raincoat",
            kind: "costume",
            name: "林晓雨衣造型",
            reuseMode: "variant",
            variantOf: "character-linxiao",
            variantNotes: "增加红色雨衣",
            prompt: "林晓穿红色雨衣，保持人物身份特征"
          }
        ],
        shots: [{ id: "shot-2", title: "雨夜归来", assetIds: ["character-linxiao", "costume-linxiao-raincoat"], imagePrompt: "雨夜书店", videoPrompt: "林晓走入书店" }]
      }
    : {
        schema: "cc-story-episode-v2",
        title: "记忆测试",
        episode: { title: "第 1 集", summary: "林晓初到书店", continuityNotes: "建立人物与主场景" },
        assets: [
          { id: "character-linxiao", kind: "character", name: "林晓", reuseMode: "new", continuityKey: "24岁黑色短发", prompt: "24 岁女性，黑色短发" },
          { id: "scene-bookstore", kind: "scene", name: "旧书店", reuseMode: "new", continuityKey: "木书架绿台灯", prompt: "旧书店，木书架和绿色台灯" }
        ],
        shots: [{ id: "shot-1", title: "初见", assetIds: ["character-linxiao", "scene-bookstore"], imagePrompt: "林晓走进旧书店", videoPrompt: "林晓推门进入" }]
      };
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(result) } }] }));
});

await listen(mock);
const mockPort = mock.address().port;
const model = "story-memory-smoke";
const connections = {
  [model]: {
    preset: "custom",
    capability: "chat",
    protocol: "openai-chat",
    authType: "bearer",
    apiModel: "story-memory-upstream",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    chatEndpoint: "/v1/chat/completions"
  }
};
const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "0",
    CC_CANVAS_CACHE_DIR: testCache,
    YUNWU_API_KEY: "story-smoke-key",
    CC_CANVAS_MODEL_CONNECTIONS_B64: Buffer.from(JSON.stringify(connections), "utf8").toString("base64url")
  },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  const appPort = await waitForCanvasPort(child);
  const first = await postJson(`http://127.0.0.1:${appPort}/api/story/analyze`, {
    model,
    script: "第1集\n林晓走进旧书店。",
    episode: { id: "episode-1", title: "第 1 集", index: 0, total: 2 },
    assetMemory: []
  });
  assert.equal(first.result.schema, "cc-story-episode-v2");
  assert.equal(first.result.assets.length, 2);
  assert.equal(first.assetMemory.length, 2);
  assert.equal(first.result.episode.id, "episode-1");

  const second = await postJson(`http://127.0.0.1:${appPort}/api/story/analyze`, {
    model,
    script: "第2集\n雨夜，林晓穿红色雨衣重返旧书店。",
    episode: { id: "episode-2", title: "第 2 集", index: 1, total: 2 },
    assetMemory: first.assetMemory
  });
  assert.equal(second.result.episode.id, "episode-2");
  assert.equal(second.result.assets.find((asset) => asset.id === "character-linxiao").reuseMode, "reuse");
  assert.equal(second.result.assets.find((asset) => asset.id === "costume-linxiao-raincoat").variantOf, "character-linxiao");
  assert.equal(second.assetMemory.length, 3);
  assert.equal(second.assetMemory.find((asset) => asset.id === "character-linxiao").appearanceCount, 2);

  const firstPrompt = requests[0].messages.map((message) => message.content).join("\n");
  const secondPrompt = requests[1].messages.map((message) => message.content).join("\n");
  assert.match(firstPrompt, /<当前集剧本开始>[\s\S]*第1集/u);
  assert.doesNotMatch(firstPrompt, /第2集/u);
  assert.match(secondPrompt, /character-linxiao/u);
  assert.match(secondPrompt, /reuse/u);
  assert.match(secondPrompt, /variant/u);
  assert.match(secondPrompt, /<当前集剧本开始>[\s\S]*第2集/u);

  console.log("Story API episode-memory integration checks passed.");
} finally {
  child.kill();
  await Promise.race([onceExit(child), new Promise((resolve) => setTimeout(resolve, 3000))]);
  mock.close();
  await rm(testCache, { recursive: true, force: true });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")));
  });
}

function waitForCanvasPort(processHandle) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timer = setTimeout(() => reject(new Error(`Canvas server did not start.\n${output}`)), 15000);
    const read = (chunk) => {
      output += chunk.toString("utf8");
      const match = output.match(/cc无限画布 is running at http:\/\/127\.0\.0\.1:(\d+)/u);
      if (!match) return;
      clearTimeout(timer);
      resolve(Number(match[1]));
    };
    processHandle.stdout.on("data", read);
    processHandle.stderr.on("data", read);
    processHandle.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Canvas server exited with code ${code}.\n${output}`));
    });
  });
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  assert.equal(response.ok, true, JSON.stringify(data));
  return data;
}

function onceExit(processHandle) {
  return new Promise((resolve) => processHandle.once("exit", resolve));
}
