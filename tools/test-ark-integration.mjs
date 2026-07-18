import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testCache = path.join(root, "cache", "ark-smoke-test");
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0sAAAAASUVORK5CYII=";
let lastVideoPayload = null;

const mock = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/v3/images/generations") {
    return readJson(req).then((payload) => sendJson(res, {
      data: [{ b64_json: pngBase64, size: payload.size, output_format: "png" }]
    }));
  }
  if (req.method === "POST" && req.url === "/api/v3/contents/generations/tasks") {
    return readJson(req).then((payload) => {
      lastVideoPayload = payload;
      sendJson(res, { id: "task-smoke" });
    });
  }
  if (req.method === "GET" && req.url === "/api/v3/contents/generations/tasks/task-smoke") {
    const address = mock.address();
    return sendJson(res, {
      id: "task-smoke",
      status: "succeeded",
      duration: 5,
      content: {
        video_url: `http://127.0.0.1:${address.port}/result.mp4`,
        width: 1280,
        height: 720
      }
    });
  }
  if (req.method === "GET" && req.url === "/result.mp4") {
    res.setHeader("Content-Type", "video/mp4");
    res.end(Buffer.from("000000206674797069736F6D0000020069736F6D69736F32", "hex"));
    return;
  }
  res.statusCode = 404;
  res.end("not found");
});

await listen(mock);
const mockPort = mock.address().port;
const connections = {
  "ark-seedream-5.0-pro": arkConnection("image", "mock-seedream", mockPort),
  "ark-seedance-2.0": arkConnection("video", "mock-seedance", mockPort)
};
const child = spawn(process.execPath, ["server.js"], {
  cwd: root,
  env: {
    ...process.env,
    PORT: "0",
    CC_CANVAS_CACHE_DIR: testCache,
    VOLCENGINE_ARK_API_KEY: "smoke-key",
    CC_CANVAS_MODEL_CONNECTIONS_B64: Buffer.from(JSON.stringify(connections), "utf8").toString("base64url")
  },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  const appPort = await waitForCanvasPort(child);
  const config = await getJson(`http://127.0.0.1:${appPort}/api/config`);
  assert.equal(config.hasArkApiKey, true);
  assert.equal(config.arkModels.length, 7);

  const image = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test image",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "2K",
    quality: "standard",
    format: "png",
    extraParams: {}
  });
  assert.equal(image.request.provider, "volcengine-ark");
  assert.equal(image.images.length, 1);
  assert.match(image.images[0].url, /^\/project-cache\/ark-smoke\/outputs\//u);

  const migratedImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test migrated image size",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "1424x800",
    quality: "standard",
    format: "png",
    extraParams: {}
  });
  assert.equal(migratedImage.request.payload.size, "2816x1584");

  const editForm = new FormData();
  appendFields(editForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test edit",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "2K",
    quality: "standard",
    format: "png",
    extraParams: "{}"
  });
  editForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "reference.png");
  const edit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, editForm);
  assert.equal(edit.images.length, 1);
  assert.equal(edit.request.payload.image, "<1 reference image(s)>");

  const videoForm = new FormData();
  appendFields(videoForm, {
    projectId: "ark-smoke",
    mode: "video",
    prompt: "test video",
    model: "ark-seedance-2.0",
    n: "5",
    size: "16:9",
    quality: "720p",
    format: "mp4",
    extraParams: JSON.stringify({ generate_audio: true }),
    arkAssetUris: JSON.stringify(["asset://asset-demo-1"])
  });
  videoForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "video-reference.png");
  const video = await postForm(`http://127.0.0.1:${appPort}/api/generate`, videoForm);
  assert.equal(video.request.provider, "volcengine-ark");
  assert.equal(video.videos.length, 1);
  assert.equal(video.request.payload.content[1].role, "reference_image");
  assert.equal(video.request.payload.content[2].role, "reference_image");
  assert.equal(video.request.virtualHumanAssetCount, 1);
  assert.equal(lastVideoPayload.content[1].image_url.url, "asset://asset-demo-1");
  assert.match(lastVideoPayload.content[2].image_url.url, /^data:image\/png;base64,/u);
  assert.match(video.videos[0].url, /^\/project-cache\/ark-smoke\/outputs\//u);

  console.log(JSON.stringify({
    ok: true,
    arkModelCount: config.arkModels.length,
    imageCount: image.images.length,
    migratedImageSize: migratedImage.request.payload.size,
    editImageCount: edit.images.length,
    videoCount: video.videos.length,
    cachedVideo: video.videos[0].url
  }, null, 2));
} finally {
  child.kill();
  await Promise.race([onceExit(child), wait(1500)]);
  await new Promise((resolve) => mock.close(resolve));
  await rm(testCache, { recursive: true, force: true });
}

function arkConnection(capability, apiModel, port) {
  return {
    preset: "doubao",
    capability,
    protocol: capability === "video" ? "ark-video" : "ark-images",
    authType: "bearer",
    apiModel,
    baseUrl: `http://127.0.0.1:${port}`,
    imageEndpoint: "/api/v3/images/generations",
    editEndpoint: "/api/v3/images/generations",
    chatEndpoint: "/api/v3/chat/completions",
    videoEndpoint: "/api/v3/contents/generations/tasks"
  };
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

function sendJson(res, value) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(value));
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

async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  assert.equal(response.ok, true, JSON.stringify(data));
  return data;
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

async function postForm(url, body) {
  const response = await fetch(url, { method: "POST", body });
  const data = await response.json();
  assert.equal(response.ok, true, JSON.stringify(data));
  return data;
}

function appendFields(form, fields) {
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
}

function onceExit(processHandle) {
  return new Promise((resolve) => processHandle.once("exit", resolve));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
