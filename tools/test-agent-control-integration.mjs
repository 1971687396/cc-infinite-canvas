import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mediaNodesFromGeneration } from "../agent-control-runtime.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "cc-canvas-agent-test-"));
const cacheDirectory = path.join(temporaryRoot, "cache");
const descriptorFile = path.join(temporaryRoot, "agent-control.json");
const token = "cc-agent-integration-test-token";
let serverProcess;
let mcpProcess;
let upstreamServer;
const autoStartMcpProcesses = [];
const autoStartDescriptor = path.join(temporaryRoot, "auto-start", "agent-control.json");

try {
  const layerNodes = mediaNodesFromGeneration(
    { id: "layer-task", type: "task", x: 100, y: 50, width: 620, prompt: "split", model: "seedream", size: "2K", format: "png" },
    {
      images: [
        { url: "/base.png", width: 1000, height: 1000, layerDecomposition: true, zIndex: 0 },
        { url: "/part.png", width: 200, height: 300, layerDecomposition: true, zIndex: 2, boundingBox: { absolute: [250, 100, 450, 400] } }
      ]
    },
    { nextZ: 2 }
  );
  assert.equal(layerNodes.length, 2);
  assert.equal(layerNodes[1].x - layerNodes[0].x, 105);
  assert.equal(layerNodes[1].y - layerNodes[0].y, 42);

  upstreamServer = http.createServer(async (req, res) => {
    for await (const _chunk of req) {
      // Drain the request before returning the deterministic image.
    }
    const payload = JSON.stringify({
      data: [{ b64_json: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" }]
    });
    res.writeHead(200, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) });
    res.end(payload);
  });
  upstreamServer.listen(0, "127.0.0.1");
  await once(upstreamServer, "listening");
  const upstreamPort = upstreamServer.address().port;
  const mockConnectionMap = Buffer.from(JSON.stringify({
    "gpt-image-2": {
      preset: "custom",
      capability: "image",
      protocol: "openai-images",
      authType: "bearer",
      apiModel: "gpt-image-2",
      baseUrl: `http://127.0.0.1:${upstreamPort}`,
      imageEndpoint: "/v1/images/generations",
      editEndpoint: "/v1/images/edits"
    }
  }), "utf8").toString("base64url");
  const mockKeyMap = Buffer.from(JSON.stringify({ "gpt-image-2": "test-image-key" }), "utf8").toString("base64url");

  serverProcess = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      PORT: "0",
      CC_CANVAS_CACHE_DIR: cacheDirectory,
      CC_CANVAS_AGENT_DESCRIPTOR: descriptorFile,
      CC_CANVAS_AGENT_TOKEN: token,
      YUNWU_API_KEY: "test-image-key",
      YUNWU_BASE_URL: `http://127.0.0.1:${upstreamPort}`,
      YUNWU_IMAGE_ENDPOINT: "/v1/images/generations",
      YUNWU_EDIT_ENDPOINT: "/v1/images/edits",
      CC_CANVAS_MODEL_CONNECTIONS_B64: mockConnectionMap,
      CC_CANVAS_MODEL_KEYS_B64: mockKeyMap
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let serverLog = "";
  serverProcess.stdout.on("data", (chunk) => { serverLog += chunk.toString(); });
  serverProcess.stderr.on("data", (chunk) => { serverLog += chunk.toString(); });
  const descriptor = await waitForJsonFile(descriptorFile, 15000, () => serverLog);
  const baseUrl = descriptor.baseUrl;

  const unauthorized = await fetch(`${baseUrl}/api/agent/v1/status`);
  assert.equal(unauthorized.status, 401);

  const status = await request(baseUrl, token, "/status");
  assert.equal(status.ok, true);
  assert.ok(status.capabilities.includes("canvas.live-sync"));

  const openapi = await request(baseUrl, token, "/openapi.json");
  assert.equal(openapi.openapi, "3.1.0");

  const created = await request(baseUrl, token, "/projects", {
    method: "POST",
    body: { id: "agent-integration", name: "Agent Integration" }
  });
  assert.equal(created.project.id, "agent-integration");
  assert.equal(created.project.agentRevision, 1);

  const added = await request(baseUrl, token, "/projects/agent-integration/nodes", {
    method: "POST",
    body: {
      nodes: [
        { kind: "note", id: "agent-note", text: "first", x: 10, y: 20 },
        { kind: "image_task", id: "agent-image-task", prompt: "a red kite", model: "gpt-image-2", x: 400, y: 20 }
      ]
    }
  });
  assert.equal(added.nodes.length, 2);
  assert.equal(added.agentRevision, 2);

  const staleProject = (await request(baseUrl, token, "/projects/agent-integration")).project;
  const patched = await request(baseUrl, token, "/projects/agent-integration/nodes/agent-note", {
    method: "PATCH",
    body: { patch: { text: "patched by agent", x: 88 } }
  });
  assert.equal(patched.node.text, "patched by agent");

  const staleSaveResponse = await fetch(`${baseUrl}/api/project?projectId=agent-integration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...staleProject, name: "Saved by stale UI" })
  });
  assert.equal(staleSaveResponse.status, 200);
  const afterStaleSave = (await request(baseUrl, token, "/projects/agent-integration")).project;
  assert.equal(afterStaleSave.name, "Saved by stale UI");
  assert.equal(afterStaleSave.nodes.find((node) => node.id === "agent-note")?.text, "patched by agent");
  assert.equal(afterStaleSave.agentRevision, 3);

  await request(baseUrl, token, "/projects/agent-integration/nodes", {
    method: "POST",
    body: { nodes: [{ kind: "note", id: "agent-note-2", text: "second" }] }
  });
  await request(baseUrl, token, "/projects/agent-integration/nodes/agent-note", { method: "DELETE" });
  const secondStaleSave = await fetch(`${baseUrl}/api/project?projectId=agent-integration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(staleProject)
  });
  assert.equal(secondStaleSave.status, 200);
  const afterDeleteMerge = (await request(baseUrl, token, "/projects/agent-integration")).project;
  assert.equal(afterDeleteMerge.nodes.some((node) => node.id === "agent-note"), false);
  assert.equal(afterDeleteMerge.nodes.some((node) => node.id === "agent-note-2"), true);

  const pngFile = path.join(temporaryRoot, "pixel.png");
  await writeFile(pngFile, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
  const form = new FormData();
  form.append("image", new Blob([await readFile(pngFile)], { type: "image/png" }), "pixel.png");
  const uploaded = await request(baseUrl, token, "/projects/agent-integration/assets", { method: "POST", body: form });
  assert.equal(uploaded.assets.length, 1);
  assert.match(uploaded.assets[0].url, /^\/project-cache\/agent-integration\/assets\//);

  const generated = await request(baseUrl, token, "/projects/agent-integration/generate", {
    method: "POST",
    body: {
      request: { model: "gpt-image-2", mode: "create", prompt: "tiny test image", size: "1024x1024", format: "png" },
      placeOnCanvas: true,
      placement: { x: 900, y: 120 }
    }
  });
  assert.equal(generated.generation.images.length, 1);
  assert.equal(generated.placement.taskNode.type, "task");
  assert.equal(generated.placement.mediaNodes[0].type, "image");
  assert.equal(generated.placement.taskNode.x, 900);

  const nodes = await request(baseUrl, token, "/projects/agent-integration/nodes?types=note&search=second");
  assert.equal(nodes.total, 1);
  const sync = await fetch(`${baseUrl}/api/agent/v1/sync?projectId=agent-integration`).then((response) => response.json());
  assert.equal(sync.revision, generated.placement.agentRevision);

  mcpProcess = spawn(process.execPath, [path.join(root, "agent-mcp-server.js")], {
    cwd: root,
    windowsHide: true,
    env: {
      ...process.env,
      CC_CANVAS_AGENT_DESCRIPTOR: descriptorFile,
      CC_CANVAS_AGENT_AUTO_START: "0"
    },
    stdio: ["pipe", "pipe", "pipe"]
  });
  const peer = createJsonRpcPeer(mcpProcess);
  const initialized = await peer.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "agent-control-integration-test", version: "1.0.0" }
  });
  assert.equal(initialized.serverInfo.name, "cc-infinite-canvas");
  peer.notify("notifications/initialized", {});
  const toolList = await peer.request("tools/list", {});
  assert.ok(toolList.tools.some((tool) => tool.name === "generate_canvas_media"));
  assert.ok(toolList.tools.some((tool) => tool.name === "add_canvas_nodes"));
  const mcpProjects = await peer.request("tools/call", { name: "list_canvas_projects", arguments: {} });
  assert.equal(mcpProjects.isError, undefined);
  assert.match(mcpProjects.content[0].text, /agent-integration/);

  const autoStartEnvironment = {
    ...process.env,
    PORT: "0",
    CC_CANVAS_CACHE_DIR: path.join(temporaryRoot, "auto-start", "cache"),
    CC_CANVAS_AGENT_DESCRIPTOR: autoStartDescriptor,
    CC_CANVAS_AGENT_TOKEN: "auto-start-agent-token",
    CC_CANVAS_AGENT_AUTO_START: "1"
  };
  const autoStartPeers = [0, 1].map(() => {
    const child = spawn(process.execPath, [path.join(root, "agent-mcp-server.js")], {
      cwd: root,
      windowsHide: true,
      env: autoStartEnvironment,
      stdio: ["pipe", "pipe", "pipe"]
    });
    autoStartMcpProcesses.push(child);
    return createJsonRpcPeer(child);
  });
  await Promise.all(autoStartPeers.map((autoPeer, index) => autoPeer.request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: `auto-start-test-${index}`, version: "1.0.0" }
  }).then(() => autoPeer.notify("notifications/initialized", {}))));
  const autoStatuses = await Promise.all(autoStartPeers.map((autoPeer) => autoPeer.request("tools/call", {
    name: "canvas_status",
    arguments: {}
  })));
  assert.ok(autoStatuses.every((result) => /cc-infinite-canvas-agent-control/.test(result.content[0].text)));
  const autoDescriptor = JSON.parse(await readFile(autoStartDescriptor, "utf8"));
  assert.ok(Number(autoDescriptor.pid) > 0);

  console.log("Agent Control API and MCP integration tests passed.");
} finally {
  for (const child of autoStartMcpProcesses) {
    if (!child.killed) {
      child.stdin.end();
      await Promise.race([once(child, "exit"), delay(1000)]).catch(() => {});
      if (!child.killed) child.kill();
    }
  }
  try {
    const descriptor = JSON.parse(await readFile(autoStartDescriptor, "utf8"));
    if (Number(descriptor.pid) > 0) process.kill(Number(descriptor.pid));
  } catch {
    // The auto-start service may not have reached the descriptor stage.
  }
  if (mcpProcess && !mcpProcess.killed) {
    mcpProcess.stdin.end();
    await Promise.race([once(mcpProcess, "exit"), delay(1500)]).catch(() => {});
    if (!mcpProcess.killed) mcpProcess.kill();
  }
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    await Promise.race([once(serverProcess, "exit"), delay(1500)]).catch(() => {});
  }
  if (upstreamServer) {
    upstreamServer.close();
    await once(upstreamServer, "close").catch(() => {});
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}

async function request(baseUrl, bearerToken, route, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${bearerToken}`);
  let body = options.body;
  if (body !== undefined && !(body instanceof FormData) && typeof body !== "string") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  const response = await fetch(`${baseUrl}/api/agent/v1${route}`, {
    method: options.method || "GET",
    headers,
    body
  });
  const data = await response.json().catch(() => ({}));
  assert.equal(response.ok, true, data.error || `HTTP ${response.status}`);
  return data;
}

async function waitForJsonFile(filename, timeoutMs, logs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      return JSON.parse(await readFile(filename, "utf8"));
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Timed out waiting for ${filename}.\n${logs()}`);
}

function createJsonRpcPeer(child) {
  let nextId = 1;
  let buffer = "";
  const pending = new Map();
  let stderr = "";
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  child.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    while (buffer.includes("\n")) {
      const newline = buffer.indexOf("\n");
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;
      const message = JSON.parse(line);
      if (message.id === undefined || !pending.has(message.id)) continue;
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`${message.error.message}\n${stderr}`));
      else waiter.resolve(message.result);
    }
  });
  return {
    request(method, params) {
      const id = nextId++;
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`MCP request ${method} timed out.\n${stderr}`));
        }, 25000);
        pending.set(id, {
          resolve: (value) => { clearTimeout(timer); resolve(value); },
          reject: (error) => { clearTimeout(timer); reject(error); }
        });
      });
    },
    notify(method, params) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`);
    }
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
