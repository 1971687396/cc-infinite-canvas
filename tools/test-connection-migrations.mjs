import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defaultYunwuBaseUrl,
  migrateYunwuConnection,
  migrateYunwuEnvText,
  migrateYunwuNodeConnections,
  migrateYunwuUrl
} from "../public/connection-migrations.js";
import { gptImage25Profile } from "../public/model-profiles.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(process.argv[2] || root);
const encode = (value) => Buffer.from(JSON.stringify(value), "utf8").toString("base64url");

for (const url of ["https://yunwu.ai", "http://API.YUNWU.AI/v1", "https://api.apiplus.org:443/v1/images/edits?route=one"]) {
  const migrated = migrateYunwuUrl(url);
  assert.ok(migrated.startsWith(defaultYunwuBaseUrl));
  assert.equal(migrateYunwuUrl(migrated), migrated);
}
assert.equal(migrateYunwuUrl("https://api.apiplus.org/v1?route=one"), `${defaultYunwuBaseUrl}/v1?route=one`);
for (const url of [
  "https://ai.t8star.org", "https://api.lk888.ai", "https://ark.cn-beijing.volces.com",
  "https://api.openai.com", "https://my-yunwu.ai", "https://yunwu.ai.other.example",
  "https://yunwu.ai:8443/v1", "/v1/images/edits", "not-a-url", ""
]) assert.equal(migrateYunwuUrl(url), url);

const legacyConnection = {
  preset: "custom", capability: "image", protocol: "openai-images", authType: "bearer",
  apiModel: "gpt-image-2.5-sunburst", baseUrl: "https://api.apiplus.org",
  imageEndpoint: "https://yunwu.ai/v1/images/generations", editEndpoint: "/v1/images/edits"
};
const migratedConnection = migrateYunwuConnection(legacyConnection);
assert.equal(migratedConnection.baseUrl, defaultYunwuBaseUrl);
assert.equal(migratedConnection.imageEndpoint, `${defaultYunwuBaseUrl}/v1/images/generations`);
assert.equal(migratedConnection.editEndpoint, legacyConnection.editEndpoint);
assert.equal(migrateYunwuConnection(migratedConnection), migratedConnection);

const legacyNode = {
  id: "legacy", type: "task", model: "gpt-2.5", connectionOverride: true,
  baseUrl: "https://yunwu.ai", endpointPath: "https://api.apiplus.org/v1/images/edits",
  apiKeyOverride: "node-test-key", prompt: "Keep the literal text https://yunwu.ai unchanged",
  image: { url: "https://yunwu.ai/old-generated.png", generation: { baseUrl: "https://api.apiplus.org", prompt: "reuse" } },
  images: [{ url: "https://yunwu.ai/asset.png", generation: { baseUrl: "https://yunwu.ai" } }]
};
const migratedNode = migrateYunwuNodeConnections(legacyNode);
assert.equal(migratedNode.baseUrl, defaultYunwuBaseUrl);
assert.equal(migratedNode.endpointPath, `${defaultYunwuBaseUrl}/v1/images/edits`);
assert.equal(migratedNode.apiKeyOverride, legacyNode.apiKeyOverride);
assert.equal(migratedNode.connectionOverride, true);
assert.equal(migratedNode.prompt, legacyNode.prompt);
assert.equal(migratedNode.image.url, legacyNode.image.url);
assert.equal(migratedNode.image.generation.baseUrl, defaultYunwuBaseUrl);
assert.equal(migratedNode.images[0].generation.baseUrl, defaultYunwuBaseUrl);
assert.equal(migrateYunwuNodeConnections(migratedNode), migratedNode);

const keyMap = encode({ "gpt-2.5": "dedicated-test-key", other: "other-test-key" });
const untouchedConnection = { ...legacyConnection, apiModel: "other-model", baseUrl: "https://ai.t8star.org", imageEndpoint: "/custom/generate" };
const connectionMap = encode({ "gpt-2.5": legacyConnection, other: untouchedConnection });
const legacyEnv = [
  "# Preserve comments and all credentials",
  'YUNWU_BASE_URL="https://yunwu.ai"',
  'YUNWU_API_KEY="global-test-key"',
  "VOLCENGINE_ARK_API_KEY=ark-test-key",
  "GRSAI_API_KEY=grsai-test-key",
  `CC_CANVAS_MODEL_KEYS_B64=${keyMap}`,
  `CC_CANVAS_MODEL_CONNECTIONS_B64=${connectionMap}`,
  ""
].join("\r\n");
const migratedEnv = migrateYunwuEnvText(legacyEnv);
assert.ok(migratedEnv.includes('YUNWU_BASE_URL="https://api.openlux.ai"'));
for (const line of legacyEnv.split("\r\n").filter((line) => !/^(YUNWU_BASE_URL|CC_CANVAS_MODEL_CONNECTIONS_B64)=/u.test(line))) {
  assert.ok(migratedEnv.includes(line));
}
assert.equal(migrateYunwuEnvText(migratedEnv), migratedEnv);
assert.equal(migrateYunwuEnvText("CC_CANVAS_MODEL_CONNECTIONS_B64=bad-json\n"), "CC_CANVAS_MODEL_CONNECTIONS_B64=bad-json\n");

await mkdir(path.join(root, "cache"), { recursive: true });
const fixtureRoot = await mkdtemp(path.join(root, "cache", "connection-migration-test-"));
try {
  for (const file of ["server.js", "package.json", "midjourney-api.js", "grok-build-bridge.js", "agent-control-runtime.js", "agent-control-client.js"]) {
    await cp(path.join(source, file), path.join(fixtureRoot, file));
  }
  await cp(path.join(source, "public"), path.join(fixtureRoot, "public"), { recursive: true });
  const envFile = path.join(fixtureRoot, ".env.local");
  const template = await readFile(path.join(source, ".env.local.example"), "utf8");
  assert.match(template, /^YUNWU_BASE_URL=https:\/\/api\.openlux\.ai\r?$/mu);

  await withServer("fresh", async (base) => {
    const cfg = await getJson(`${base}/api/config`);
    assertOpenLuxOptionsAvailable(cfg);
    assert.equal(cfg.baseUrl, defaultYunwuBaseUrl);
  });
  await writeFile(envFile, template, "utf8");
  await withServer("template", async (base) => assertOpenLuxOptionsAvailable(await getJson(`${base}/api/config`)));

  await writeFile(envFile, legacyEnv, "utf8");
  const projectDirectory = path.join(fixtureRoot, "cache-upgrade", "canvases", "legacy-project");
  await mkdir(projectDirectory, { recursive: true });
  const legacyProject = { id: "legacy-project", name: "Migration fixture", savedAt: "2026-10-21T01:00:00Z", nodes: [legacyNode, { id: "other-node", type: "task", baseUrl: "https://ai.t8star.org" }] };
  await writeFile(path.join(projectDirectory, "project.json"), JSON.stringify(legacyProject), "utf8");
  await withServer("upgrade", async (base) => {
    const cfg = await getJson(`${base}/api/config`);
    assertOpenLuxOptionsAvailable(cfg, "gpt-2.5");
    assert.equal(cfg.modelConnections["gpt-2.5"].hasKey, true);
    assert.equal(cfg.modelConnections["gpt-2.5"].imageEndpoint, `${defaultYunwuBaseUrl}/v1/images/generations`);
    for (const [key, value] of Object.entries(untouchedConnection)) assert.equal(cfg.modelConnections.other[key], value);
    assert.equal(await readFile(`${envFile}.openlux-backup`, "utf8"), legacyEnv);
    assert.equal(await readFile(envFile, "utf8"), migratedEnv);

    const loaded = await getJson(`${base}/api/project?projectId=legacy-project`);
    assert.equal(loaded.project.nodes[0].baseUrl, defaultYunwuBaseUrl);
    assert.equal(loaded.project.nodes[0].image.generation.baseUrl, defaultYunwuBaseUrl);
    assert.equal(loaded.project.nodes[1].baseUrl, "https://ai.t8star.org");
    const saved = JSON.parse(await readFile(path.join(projectDirectory, "project.json"), "utf8"));
    assert.equal(saved.nodes[0].endpointPath, `${defaultYunwuBaseUrl}/v1/images/edits`);
    assert.equal(saved.nodes[0].apiKeyOverride, legacyNode.apiKeyOverride);
    assert.equal(saved.savedAt, legacyProject.savedAt);

    const response = await fetch(`${base}/api/settings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baseUrl: "https://api.apiplus.org", modelConnections: { "gpt-2.5": legacyConnection } })
    });
    assert.equal(response.status, 200);
    assertOpenLuxOptionsAvailable(await response.json(), "gpt-2.5");
  });
  const persisted = await readFile(envFile, "utf8");
  await withServer("repeat", async (base) => {
    assertOpenLuxOptionsAvailable(await getJson(`${base}/api/config`), "gpt-2.5");
    assert.equal(await readFile(envFile, "utf8"), persisted);
    assert.equal(await readFile(`${envFile}.openlux-backup`, "utf8"), legacyEnv);
  });
  await withServer("preloaded", async (base) => {
    // Electron loads .env.local before importing the server module.
    const cfg = await getJson(`${base}/api/config`);
    assert.equal(cfg.baseUrl, defaultYunwuBaseUrl);
    assertOpenLuxOptionsAvailable(cfg, "gpt-2.5");
  }, { YUNWU_BASE_URL: "https://yunwu.ai", CC_CANVAS_MODEL_CONNECTIONS_B64: connectionMap });
  await writeFile(envFile, "YUNWU_BASE_URL=https://other-relay.example\n", "utf8");
  await withServer("custom", async (base) => {
    const cfg = await getJson(`${base}/api/config`);
    assert.equal(cfg.baseUrl, "https://other-relay.example");
  });
  console.log("Connection migration tests passed: fresh install, template install, legacy settings and keys, saved canvas, repeat startup, other channels.");
} finally {
  assert.ok(fixtureRoot.startsWith(path.join(root, "cache", "connection-migration-test-")));
  await rm(fixtureRoot, { recursive: true, force: true });
}

function assertOpenLuxOptionsAvailable(cfg, model = "gpt-image-2.5-sunburst") {
  const connection = cfg.modelConnections[model];
  assert.equal(new URL(connection.baseUrl).hostname, "api.openlux.ai");
  assert.ok(gptImage25Profile(model, connection.apiModel));
}

async function getJson(url) {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  return response.json();
}

async function withServer(scenario, action, preloadedEnv = {}) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(?:YUNWU_|CC_CANVAS_|VOLCENGINE_|ARK_|GRSAI_)/u.test(key)) delete env[key];
  }
  Object.assign(env, {
    PORT: "0", CC_CANVAS_CACHE_DIR: path.join(fixtureRoot, scenario === "repeat" ? "cache-upgrade" : `cache-${scenario}`),
    CC_CANVAS_AGENT_TOKEN: "migration-test-token"
  }, preloadedEnv);
  const child = spawn(process.execPath, [path.join(fixtureRoot, "server.js")], { cwd: fixtureRoot, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  try {
    const base = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Server startup timed out (${scenario})`)), 15000);
      child.once("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited during ${scenario}: ${code}`)); });
      child.stderr.on("data", () => {});
      child.stdout.on("data", (chunk) => {
        const match = String(chunk).match(/cc无限画布 is running at (http:\/\/127\.0\.0\.1:\d+)/u);
        if (match) { clearTimeout(timer); resolve(match[1]); }
      });
    });
    await action(base);
  } finally {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill();
      await exited;
    }
  }
}
