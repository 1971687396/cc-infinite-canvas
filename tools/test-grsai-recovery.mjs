import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { GrsaiTaskJournal } from "../grsai-task-runtime.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await mkdir(path.join(root, "cache"), { recursive: true });
const fixture = await mkdtemp(path.join(root, "cache", "grsai-recovery-test-"));
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0sAAAAASUVORK5CYII=", "base64");
const tasks = new Map();
let submissions = 0, queries = 0;
const mock = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/v1/api/")) assert.equal(req.headers.authorization, "Bearer recovery-fixture-key");
  if (req.method === "POST" && url.pathname === "/v1/api/generate") {
    let text = "";
    for await (const chunk of req) text += chunk;
    const body = JSON.parse(text);
    assert.equal(body.replyType, "async");
    submissions++;
    const id = `recovery-${submissions}`;
    tasks.set(id, { prompt: body.prompt, polls: 0, downloads: 0 });
    if (body.prompt === "drop-submit") return req.socket.destroy();
    return send(res, { id, status: "running" });
  }
  const id = url.searchParams.get("id");
  const task = tasks.get(id);
  assert.ok(task, id);
  if (url.pathname === "/v1/api/result") {
    assert.equal(req.method, "GET");
    queries++;
    task.polls++;
    if (task.prompt === "network" && task.polls === 1) return req.socket.destroy();
    if (task.prompt === "network" && task.polls === 2) return send(res, { error: "temporary upstream outage" }, 503);
    if (task.prompt === "network" && task.polls === 3) return send(res, { id, status: "running", progress: 75 });
    if (task.prompt === "failed") return send(res, { id, status: "failed", error: "fixture failure" }, 400);
    return send(res, { id, status: "succeeded", results: [{ url: `http://127.0.0.1:${mock.address().port}/output?id=${id}` }] });
  }
  if (url.pathname === "/output") {
    task.downloads++;
    if (task.prompt === "network" && task.downloads === 1) return send(res, { error: "download interrupted" }, 503);
    res.setHeader("Content-Type", "image/png");
    return res.end(png);
  }
  send(res, { error: "unexpected mock route" }, 404);
});
mock.listen(0, "127.0.0.1");
await once(mock, "listening");
let child, base;
const model = "grsai-gpt-image-2.6-sunburst";
const channel = { preset: "grsai", capability: "image", protocol: "grsai", authType: "bearer", apiModel: "gpt-image-2.6-sunburst",
  baseUrl: `http://127.0.0.1:${mock.address().port}`, imageEndpoint: "/v1/api/generate", editEndpoint: "/v1/api/generate" };
const connections = { [model]: channel, other: { ...channel, apiModel: "gpt-image-2.6-flare" } };
try {
  for (const file of ["server.js", "package.json", "midjourney-api.js", "grok-build-bridge.js", "agent-control-runtime.js", "agent-control-client.js", "grsai-task-runtime.js"]) await cp(path.join(root, file), path.join(fixture, file));
  await cp(path.join(root, "public"), path.join(fixture, "public"), { recursive: true });
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^(?:YUNWU_|GRSAI_|CC_CANVAS_|VOLCENGINE_|ARK_|GOOGLE_API_KEY|GEMINI_API_KEY)/u.test(key)) delete env[key];
  Object.assign(env, { PORT: "0", GRSAI_API_KEY: "recovery-fixture-key", CC_CANVAS_AGENT_TOKEN: "recovery-test-token",
    CC_CANVAS_CACHE_DIR: path.join(fixture, "storage"), CC_CANVAS_MODEL_CONNECTIONS_B64: Buffer.from(JSON.stringify(connections)).toString("base64url") });
  async function start() {
    child = spawn(process.execPath, ["server.js"], { cwd: fixture, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    base = await new Promise((resolve, reject) => {
      let log = "";
      const timer = setTimeout(() => reject(new Error(`startup timeout: ${log}`)), 15000);
      child.stdout.on("data", (chunk) => { log += chunk; const match = log.match(/running at (http:\/\/127\.0\.0\.1:\d+)/u); if (match) { clearTimeout(timer); resolve(match[1]); } });
      child.stderr.on("data", (chunk) => { log += chunk; });
      child.once("exit", (code) => { clearTimeout(timer); reject(new Error(`early exit ${code}: ${log}`)); });
    });
  }
  async function stop() {
    if (child?.exitCode === null) { const exited = once(child, "exit"); child.kill(); await exited; }
  }
  await start();
  const request = { projectId: "recovery", mode: "create", prompt: "network", model, size: "1024x1024", quality: "high", format: "png", grsaiRequestId: "client-network" };
  let result = await post("/api/generate", request);
  assert.equal(result.status, 200);
  assert.equal(result.data.taskStatus, "running");
  assert.equal(result.data.taskId, "recovery-1");
  assert.equal(result.data.grsaiTask.requestId, "client-network");
  assert.equal(submissions, 1);
  const lookup = { projectId: "recovery", model, requestId: "client-network" };
  assert.equal((await post("/api/generate", request)).data.taskId, "recovery-1");
  assert.equal(submissions, 1, "duplicate POST request IDs must not submit generation again");
  result = await post("/api/grsai/result", lookup);
  assert.equal(result.data.retryable, true);
  assert.equal(result.data.taskId, "recovery-1");
  assert.equal(result.data.taskStatus, "query_error");
  result = await post("/api/grsai/result", lookup);
  assert.equal(result.data.retryable, true);
  assert.equal(result.data.taskStatus, "query_error");
  result = await post("/api/grsai/result", lookup);
  assert.equal(result.data.taskStatus, "running");
  assert.equal(result.data.grsaiTask.progress, 75);
  result = await post("/api/grsai/result", lookup);
  assert.equal(result.data.taskStatus, "query_error", "failed downloads must remain recoverable");
  const queriesBeforeDownloadRetry = queries;
  result = await post("/api/grsai/result", lookup);
  assert.equal(result.data.images.length, 1);
  assert.equal(result.data.images[0].type, "file");
  assert.equal(queries, queriesBeforeDownloadRetry, "retry persisted result URLs without querying expired upstream state again");
  const finalImage = result.data.images[0].url;
  assert.equal((await post("/api/grsai/result", lookup)).data.images[0].url, finalImage);
  assert.equal(submissions, 1);
  const noQuery = queries;
  assert.equal((await post("/api/grsai/result", { ...lookup, projectId: "unrelated-project" })).status, 404);
  assert.equal((await post("/api/grsai/result", { ...lookup, model: "other" })).status, 409);
  assert.equal(queries, noQuery);

  // Survive a backend restart with only the client request ID from the canvas.
  await post("/api/generate", { ...request, prompt: "restart", grsaiRequestId: "client-restart" });
  await stop();
  await start();
  result = await post("/api/grsai/result", { ...lookup, requestId: "client-restart" });
  assert.equal(result.data.images.length, 1);
  assert.equal(result.data.taskId, "recovery-2");
  assert.equal(submissions, 2);

  // Upstream accepted a job but lost its submission response. Never repeat POST.
  result = await post("/api/generate", { ...request, prompt: "drop-submit", grsaiRequestId: "client-lost-ack" });
  assert.equal(result.status, 502);
  assert.equal(result.data.taskStatus, "unknown");
  assert.equal(submissions, 3);
  await post("/api/generate", { ...request, prompt: "drop-submit", grsaiRequestId: "client-lost-ack" });
  assert.equal(submissions, 3);
  result = await post("/api/grsai/result", { ...lookup, requestId: "client-lost-ack", taskId: "recovery-3" });
  assert.equal(result.data.images.length, 1);
  assert.equal(result.data.taskId, "recovery-3");
  assert.equal(submissions, 3);
  const concurrent = await Promise.all([post("/api/grsai/result", { ...lookup, taskId: "recovery-3", requestId: result.data.grsaiTask.requestId }), post("/api/grsai/result", { ...lookup, taskId: "recovery-3", requestId: result.data.grsaiTask.requestId })]);
  assert.equal(concurrent[0].data.images[0].url, concurrent[1].data.images[0].url);

  result = await post("/api/generate", { ...request, prompt: "failed", grsaiRequestId: "client-failed" });
  result = await post("/api/grsai/result", { ...lookup, requestId: "client-failed" });
  assert.equal(result.data.taskStatus, "failed");
  assert.equal(result.data.retryable, false);
  const terminalQueries = queries;
  await post("/api/grsai/result", { ...lookup, requestId: "client-failed" });
  assert.equal(queries, terminalQueries);
  assert.equal(submissions, 4);

  const journalDir = path.join(fixture, "journal-unit");
  const journal = new GrsaiTaskJournal(journalDir);
  await journal.write({ requestId: "secret-test", status: "running", apiKey: "never-persist", headers: { Authorization: "never-persist" }, images: [] });
  const serialized = await readFile(path.join(journalDir, (await readdir(journalDir))[0]), "utf8");
  assert.equal(serialized.includes("never-persist"), false);
  await assert.rejects(journal.read("../outside"));
  const appSource = await readFile(path.join(root, "public", "app.js"), "utf8");
  const extract = (name) => {
    const match = new RegExp(`(?:async )?function ${name}\\(`, "u").exec(appSource);
    assert.ok(match, name);
    const tail = appSource.slice(match.index);
    const end = tail.slice(1).search(/\n(?:async )?function /u);
    return end < 0 ? tail : tail.slice(0, end + 1);
  };
  const browserNode = { id: "browser-task", type: "task", model, mode: "create", prompt: "browser mock", images: [], status: "idle", format: "png" };
  let browserPosts = 0, browserQueries = 0, placed = 0;
  const browser = vm.createContext({
    AbortController, DOMException, FormData,
    canvasState: { nodes: [browserNode], nextZ: 0 }, currentProjectId: "browser-project",
    generationControllers: new Map(), selectedNodeIds: new Set(), fileStore: new Map(), rawResponse: {},
    imageModelConnectionForModel: () => channel,
    seedreamModeForNode: () => "standard", seedreamProModes: { LAYERS: "layers", FUSION: "fusion", INTERACTIVE: "interactive" },
    effectivePromptForNode: (node) => node.prompt, referenceImageCountForNode: () => 0, syncNodeExtraParams: () => true,
    createId: () => "browser-client-request", prepareSeedreamAnnotatedReferenceFiles: async () => [],
    buildNodeRequest: (node) => ({ body: JSON.stringify({ grsaiRequestId: node.grsaiTask?.requestId }) }),
    saveCanvasState() {}, updateNode() {}, updateCanvasMeta() {}, renderCanvas() {}, showToast() {},
    normalizeNodeImage: (image) => image, dedupeNodeImages: (images) => [...new Map(images.map((image) => [image.url, image])).values()], getImageKey: (image) => image.url,
    createImageNodesForTask: (_node, images) => { placed += images.length; }, removeGeneratedTaskNode() {},
    waitForDreaminaVideoQuery: async () => {},
    fetch: async (url, options) => {
      if (url === "/api/generate") {
        browserPosts++;
        assert.equal(JSON.parse(options.body).grsaiRequestId, "browser-client-request");
        throw new TypeError("local acknowledgement lost");
      }
      assert.equal(url, "/api/grsai/result");
      browserQueries++;
      const status = browserQueries === 1 ? "running" : "succeeded";
      return { ok: true, json: async () => ({ taskStatus: status, grsaiTask: { requestId: "browser-client-request", taskId: "browser-upstream", model, status }, images: status === "succeeded" ? [{ url: "/cached-browser.png" }] : [] }) };
    }
  });
  vm.runInContext(["isGrsaiTaskNode", "hasPendingGrsaiTask", "applyGrsaiTaskState", "waitForGrsaiTaskResult", "generateNode"].map(extract).join("\n"), browser);
  await browser.generateNode(browserNode.id);
  assert.equal(browserPosts, 1);
  assert.equal(browserQueries, 2);
  assert.equal(placed, 1);
  assert.equal(browserNode.grsaiTask.taskId, "browser-upstream");
  browserNode.status = "idle";
  browserNode.prompt = "";
  browserNode.mode = "edit";
  browserNode.grsaiTask.status = "query_error";
  await browser.generateNode(browserNode.id);
  assert.equal(browserPosts, 1, "a pending task's generate button must only query, even without prompt/references");
  assert.equal(placed, 1, "repeat recovery must not place the same image twice");
  console.log("Grsai recovery passed: durable IDs, restart, network/503/download retry, manual ID, terminal state, project/channel isolation, cached-result dedupe and zero resubmissions.");
  async function post(route, body) {
    const response = await fetch(`${base}${route}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { status: response.status, data: await response.json() };
  }
} finally {
  if (child?.exitCode === null) { const exited = once(child, "exit"); child.kill(); await exited; }
  await new Promise((resolve) => mock.close(resolve));
  assert.ok(fixture.startsWith(path.join(root, "cache", "grsai-recovery-test-")));
  await rm(fixture, { recursive: true, force: true });
}

function send(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
