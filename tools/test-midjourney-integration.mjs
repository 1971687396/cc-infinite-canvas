import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  buildMidjourneyEndpointUrl,
  midjourneyPromptMaxLength,
  trimMidjourneyPrompt
} from "../midjourney-api.js";

assert.equal(
  new URL(buildMidjourneyEndpointUrl({ baseUrl: "https://example.test", routePrefix: "/mj", mode: "fast", operation: "imagine" })).pathname,
  "/mj/submit/imagine"
);
assert.equal(
  new URL(buildMidjourneyEndpointUrl({ baseUrl: "https://example.test", routePrefix: "/mj", mode: "relax", operation: "imagine" })).pathname,
  "/mj/submit/imagine"
);
assert.equal(
  new URL(buildMidjourneyEndpointUrl({ baseUrl: "https://example.test", routePrefix: "/mj", mode: "turbo", operation: "action" })).pathname,
  "/mj/submit/action"
);
assert.equal(
  new URL(
    buildMidjourneyEndpointUrl({
      baseUrl: "https://example.test",
      routePrefix: "/mj-{mode}",
      mode: "relax",
      operation: "imagine"
    })
  ).pathname,
  "/mj-relax/mj/submit/imagine"
);
assert.deepEqual(trimMidjourneyPrompt("portrait"), {
  prompt: "portrait",
  truncated: false,
  originalLength: 8
});
const oversizedPrompt = "人".repeat(midjourneyPromptMaxLength + 25);
const trimmedPrompt = trimMidjourneyPrompt(oversizedPrompt);
assert.equal(trimmedPrompt.prompt.length, midjourneyPromptMaxLength);
assert.equal(trimmedPrompt.originalLength, midjourneyPromptMaxLength + 25);
assert.equal(trimmedPrompt.truncated, true);

const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64"
);
const requests = [];
const upstream = http.createServer(async (req, res) => {
  requests.push({ method: req.method, url: req.url, authorization: req.headers.authorization });
  if (req.url === "/result.png") {
    res.writeHead(200, { "Content-Type": "image/png", "Content-Length": pngBytes.length });
    return res.end(pngBytes);
  }
  if (req.method === "POST" && req.url === "/mj/submit/imagine") {
    const body = await readBody(req);
    if (body.prompt === "force upstream error") {
      return json(res, { code: 4, description: "all_retries_failed", type: "upstream_error" }, 503);
    }
    if (body.prompt.startsWith("人")) {
      assert.equal(body.prompt.length, midjourneyPromptMaxLength);
      return json(res, { code: 1, description: "提交成功", result: "task-long-prompt" });
    }
    assert.equal(body.prompt, "portrait --ar 1:1");
    assert.equal(body.botType, "MID_JOURNEY");
    assert.deepEqual(body.base64Array, []);
    return json(res, { code: 1, description: "提交成功", result: "task-imagine" });
  }
  if (req.method === "POST" && req.url === "/mj/submit/action") {
    const body = await readBody(req);
    assert.equal(body.chooseSameChannel, true);
    assert.equal(body.taskId, "task-imagine");
    assert.equal(body.customId, "MJ::JOB::upsample::1");
    return json(res, { code: 1, result: "task-upscale" });
  }
  if (req.method === "GET" && /^\/mj\/task\/task-(?:imagine|upscale)\/fetch$/u.test(req.url || "")) {
    const taskId = req.url.includes("upscale") ? "task-upscale" : "task-imagine";
    return json(res, {
      id: taskId,
      action: taskId === "task-upscale" ? "UPSCALE" : "IMAGINE",
      status: "SUCCESS",
      progress: "100%",
      imageUrl: `http://127.0.0.1:${upstream.address().port}/result.png`,
      buttons: [{ customId: "MJ::JOB::upsample::1", label: "U1", emoji: "1" }]
    });
  }
  json(res, { error: "not found" }, 404);
});

await listen(upstream);
const tempDir = await mkdtemp(path.join(tmpdir(), "cc-midjourney-test-"));
const upstreamBaseUrl = `http://127.0.0.1:${upstream.address().port}`;
const modelConnections = {
  midjourney: {
    preset: "yunwu",
    capability: "image",
    protocol: "midjourney-proxy",
    authType: "bearer",
    apiModel: "MID_JOURNEY",
    baseUrl: upstreamBaseUrl,
    imageEndpoint: "/mj-fast",
    editEndpoint: "/mj-fast"
  }
};
const child = spawn(process.execPath, ["server.js"], {
  cwd: path.resolve(import.meta.dirname, ".."),
  env: {
    ...process.env,
    PORT: "0",
    CC_CANVAS_CACHE_DIR: tempDir,
    CC_CANVAS_MODEL_CONNECTIONS_B64: encodeMap(modelConnections),
    CC_CANVAS_MODEL_KEYS_B64: encodeMap({ midjourney: "test-midjourney-key" }),
    YUNWU_MODEL_KEY_MIDJOURNEY: "test-midjourney-key"
  },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  const canvasBaseUrl = await readCanvasAddress(child);
  const submitted = await postJson(`${canvasBaseUrl}/api/midjourney/submit`, {
    projectId: "midjourney-test",
    prompt: "portrait --ar 1:1",
    speed: "fast",
    botType: "MID_JOURNEY",
    cachedImages: []
  });
  assert.equal(submitted.taskId, "task-imagine");

  const longPromptSubmission = await postJson(`${canvasBaseUrl}/api/midjourney/submit`, {
    projectId: "midjourney-test",
    prompt: oversizedPrompt,
    speed: "fast",
    botType: "MID_JOURNEY",
    cachedImages: []
  });
  assert.equal(longPromptSubmission.taskId, "task-long-prompt");
  assert.equal(longPromptSubmission.promptLength, midjourneyPromptMaxLength);
  assert.equal(longPromptSubmission.promptOriginalLength, midjourneyPromptMaxLength + 25);
  assert.equal(longPromptSubmission.promptTruncated, true);

  const task = await postJson(`${canvasBaseUrl}/api/midjourney/task`, {
    projectId: "midjourney-test",
    taskId: submitted.taskId,
    speed: "fast"
  });
  assert.equal(task.task.status, "SUCCESS");
  assert.equal(task.task.buttons[0].label, "U1");
  assert.match(task.images[0].url, /^\/project-cache\/midjourney-test\/outputs\//u);

  const action = await postJson(`${canvasBaseUrl}/api/midjourney/action`, {
    taskId: submitted.taskId,
    customId: "MJ::JOB::upsample::1",
    speed: "fast"
  });
  assert.equal(action.taskId, "task-upscale");

  const failed = await postJsonFailure(`${canvasBaseUrl}/api/midjourney/submit`, {
    projectId: "midjourney-test",
    prompt: "force upstream error",
    speed: "fast",
    botType: "MID_JOURNEY",
    cachedImages: []
  });
  assert.equal(failed.status, 503);
  assert.match(failed.data.error, /上游通道全部重试失败/u);
  assert.ok(
    requests.every((request) => request.url === "/result.png" || request.authorization === "Bearer test-midjourney-key"),
    JSON.stringify(requests)
  );
  console.log("Midjourney integration test passed.");
} finally {
  child.kill();
  await Promise.all([
    close(upstream),
    rm(tempDir, { recursive: true, force: true })
  ]);
}

function encodeMap(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function json(res, value, status = 200) {
  const body = JSON.stringify(value);
  res.writeHead(status, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readCanvasAddress(process) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Canvas server did not start.\n${output}`)), 15000);
    const inspect = (chunk) => {
      output += chunk.toString();
      const match = output.match(/cc无限画布 is running at (http:\/\/127\.0\.0\.1:\d+)/u);
      if (!match) return;
      clearTimeout(timeout);
      resolve(match[1]);
    };
    process.stdout.on("data", inspect);
    process.stderr.on("data", inspect);
    process.once("exit", (code) => {
      clearTimeout(timeout);
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

async function postJsonFailure(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  assert.equal(response.ok, false, JSON.stringify(data));
  return { status: response.status, data };
}
