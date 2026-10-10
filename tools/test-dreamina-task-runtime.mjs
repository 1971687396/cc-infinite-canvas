import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { restoreNodesPreservingActiveGenerations } from "../public/canvas-runtime.js";
import {
  dreaminaSubmitId,
  isRetryableDreaminaQueryError,
  queryDreaminaTask,
  waitForDreaminaTask
} from "../public/dreamina-task-runtime.js";

const taskId = "2a1d0c8e-609b-4de0-9922-66e54caca004";
const submitted = { submit_id: taskId, gen_status: "querying" };
const lookupError = () => Object.assign(new Error("get_history_by_ids failed: ret=1015, msg="), { code: "EDREAMINA" });
const success = { ...submitted, gen_status: "success", result_json: { videos: [{ path: "/output.mp4" }] } };

assert.equal(dreaminaSubmitId(submitted), taskId);
assert.equal(dreaminaSubmitId("--session=2"), "");
assert.equal(dreaminaSubmitId("../invalid"), "");
assert.equal(isRetryableDreaminaQueryError(lookupError()), true);
assert.equal(isRetryableDreaminaQueryError(new Error("get_history_by_ids failed: ret=1001, msg=login required")), false);
assert.equal(isRetryableDreaminaQueryError(new Error("get_history_by_ids failed: ret=1015, msg=unauthorized")), false);
assert.equal(isRetryableDreaminaQueryError(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" })), true);
assert.equal(isRetryableDreaminaQueryError(new Error("HTTP status code 503")), true);
assert.equal(isRetryableDreaminaQueryError(new Error("unsupported model")), false);

const transient = await queryDreaminaTask(submitted, async () => { throw lookupError(); });
assert.equal(transient.pending, true);
assert.equal(transient.data.submit_id, taskId);
assert.match(transient.queryError, /1015/u);
assert.equal(transient.data.gen_status, "querying");
const missingId = await queryDreaminaTask(submitted, async () => ({ gen_status: "success" }));
assert.equal(missingId.data.submit_id, taskId);
await assert.rejects(queryDreaminaTask(submitted, async () => ({ submit_id: "other-task-id", gen_status: "success" })), /different submit_id/u);

let calls = 0;
const waits = [];
const recovered = await waitForDreaminaTask(submitted, async (id) => {
  assert.equal(id, taskId);
  calls += 1;
  if (calls === 1) throw lookupError();
  if (calls === 2) return submitted;
  return success;
}, { attempts: 5, waitMs: 4, sleep: async (ms) => waits.push(ms) });
assert.equal(recovered.gen_status, "success");
assert.equal(calls, 3);
assert.deepEqual(waits, [8, 4]);

for (const status of ["fail", "failed", "cancelled"]) {
  await assert.rejects(queryDreaminaTask(submitted, async () => ({ ...submitted, gen_status: status, fail_reason: "policy rejected" })), (error) => {
    assert.equal(error.code, "EDREAMINATASKFAILED");
    assert.equal(error.taskId, taskId);
    assert.equal(error.data.gen_status, status);
    return true;
  });
}
let authCalls = 0;
await assert.rejects(waitForDreaminaTask(submitted, async () => {
  authCalls += 1;
  throw new Error("login required");
}, { sleep: async () => {} }), (error) => {
  assert.equal(error.taskId, taskId);
  assert.equal(error.data.submit_id, taskId);
  return /login required/u.test(error.message);
});
assert.equal(authCalls, 1);

let clock = 0;
let deadlineCalls = 0;
await assert.rejects(waitForDreaminaTask(submitted, async () => {
  deadlineCalls += 1;
  throw lookupError();
}, { attempts: 100, waitMs: 4, maxWaitMs: 10, now: () => clock, sleep: async (ms) => { clock += ms; } }), (error) => {
  assert.equal(error.code, "EDREAMINAPENDING");
  assert.equal(error.taskId, taskId);
  assert.equal(error.data.gen_status, "querying");
  assert.match(error.queryError, /1015/u);
  return true;
});
assert.equal(deadlineCalls, 2);

// Execute the actual browser workflow with deterministic fetches, without paid generation.
const appSource = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
const workflowSource = appSource.slice(appSource.indexOf("async function generateVideoNode("), appSource.indexOf("function removeGeneratedTaskNode("));
async function runBrowserWorkflow({ resumed = false, terminal = false, networkError = false, permanentQueryError = false, paused = false, deadline = false } = {}) {
  const node = { id: "video-test", type: "video-task", model: "dreamina-video-seedance2.5", status: resumed ? "pending" : "idle", prompt: "poster scene", videos: [], dreaminaSubmitId: resumed ? taskId : "" };
  const requests = [];
  const savedIds = [];
  let queryCount = 0;
  let browserClock = 1;
  const context = vm.createContext({
    AbortController, Date: { now: () => browserClock }, Promise, Error, JSON, Math,
    dreaminaSubmitId, isRetryableDreaminaQueryError,
    canvasState: { nodes: [node], nextZ: 1 },
    generationControllers: new Map(), selectedNodeIds: new Set(), fileStore: new Map(), currentProjectId: "test-project",
    rawResponse: { textContent: "" },
    window: { setTimeout: (fn) => setTimeout(fn, 0), clearTimeout },
    isDreaminaVideoModelName: (model) => model.startsWith("dreamina-video-"), isArkVideoModelName: () => false,
    effectivePromptForNode: (item) => item.prompt,
    syncNodeExtraParams: () => true, validateVideoNodeReferences: () => "",
    showToast: () => {}, updateNode: () => {}, renderCanvas: () => {}, updateCanvasMeta: () => {},
    saveCanvasState: () => savedIds.push(node.dreaminaSubmitId),
    buildNodeRequest: () => ({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dreaminaAsync: true }) }),
    readJsonResponse: (response) => response.json(),
    normalizeNodeVideo: (video) => video, dedupeNodeVideos: (videos) => videos,
    createVideoNodesForTask: () => {}, removeGeneratedTaskNode: () => {},
    fetch: async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body) });
      if (url === "/api/generate") return { ok: true, json: async () => ({ pending: true, taskId }) };
      queryCount += 1;
      if (paused) {
        context.generationControllers.get(node.id).abort();
        throw Object.assign(new Error("paused"), { name: "AbortError" });
      }
      if (deadline) browserClock += 31 * 60 * 1000;
      if (networkError && queryCount === 1) throw new TypeError("fetch failed");
      if (terminal) return { ok: false, json: async () => ({ taskId, taskFailed: true, error: "policy rejected" }) };
      if (permanentQueryError) return { ok: false, json: async () => ({ taskId, taskFailed: false, error: "login required" }) };
      if (queryCount === 1) return { ok: true, json: async () => ({ pending: true, taskId, queryError: "get_history_by_ids failed: ret=1015, msg=" }) };
      return { ok: true, json: async () => ({ taskStatus: "success", taskId, videos: [{ url: "/video.mp4" }] }) };
    }
  });
  vm.runInContext(workflowSource, context);
  await vm.runInContext('generateVideoNode("video-test")', context);
  assert.ok(savedIds.includes(taskId), "Submission ID must be saved before progress queries.");
  return { node, requests };
}

const initialRun = await runBrowserWorkflow();
assert.equal(initialRun.node.status, "done");
assert.equal(initialRun.requests.filter((item) => item.url === "/api/generate").length, 1);
assert.equal(initialRun.requests.filter((item) => item.url.endsWith("/query")).length, 2);
const resumedRun = await runBrowserWorkflow({ resumed: true, networkError: true });
assert.equal(resumedRun.node.status, "done");
assert.ok(resumedRun.requests.every((item) => item.url === "/api/dreamina/video/query"), "Resuming must never submit a new generation.");
const terminalRun = await runBrowserWorkflow({ terminal: true });
assert.equal(terminalRun.node.status, "error");
assert.equal(terminalRun.node.dreaminaSubmitId, "");
const loginRun = await runBrowserWorkflow({ permanentQueryError: true });
assert.equal(loginRun.node.status, "pending");
assert.equal(loginRun.node.dreaminaSubmitId, taskId);
assert.equal(loginRun.node.error, "login required");
const pausedRun = await runBrowserWorkflow({ paused: true });
assert.equal(pausedRun.node.status, "pending");
assert.equal(pausedRun.node.dreaminaSubmitId, taskId);
assert.match(pausedRun.node.error, /暂停查询/u);
const deadlineRun = await runBrowserWorkflow({ deadline: true });
assert.equal(deadlineRun.node.status, "pending");
assert.equal(deadlineRun.node.dreaminaSubmitId, taskId);
assert.match(deadlineRun.node.error, /等待时间较长/u);

// Exercise the real query endpoint handler; only query_result is permitted here.
const serverSource = await readFile(new URL("../server.js", import.meta.url), "utf8");
assert.doesNotMatch(serverSource, /--poll=30/u);
assert.match(serverSource, /url\.pathname === "\/api\/dreamina\/video\/query"/u);
const queryHandlerSource = serverSource.slice(serverSource.indexOf("async function handleDreaminaVideoQuery("), serverSource.indexOf("function dreaminaModelVersion("));
async function runQueryHandler(value, queryError) {
  let queryCalls = 0;
  let mediaCalls = 0;
  const context = vm.createContext({
    dreaminaSubmitId, queryDreaminaTask, isRetryableDreaminaQueryError,
    dreaminaTaskStatus: (data) => String(data.gen_status || "").toLowerCase(),
    readJsonBody: async () => ({ taskId, projectId: "test-project" }),
    normalizeProjectId: (id) => id, projectOutputDir: () => "/test-output", mkdir: async () => {},
    queryDreaminaResult: async (id, directory) => {
      queryCalls += 1;
      assert.equal(id, taskId);
      assert.equal(directory, "/test-output");
      if (queryError) throw queryError;
      return value;
    },
    dreaminaResultVideos: async () => { mediaCalls += 1; return [{ url: "/output.mp4" }]; },
    dreaminaErrorStatus: () => 502, dreaminaErrorMessage: (error) => error.message,
    sendJson: (_res, status, data) => ({ status, data })
  });
  vm.runInContext(queryHandlerSource, context);
  const result = await vm.runInContext("handleDreaminaVideoQuery({}, {})", context);
  assert.equal(queryCalls, 1);
  return { ...result, mediaCalls };
}
const transientResponse = await runQueryHandler(null, lookupError());
assert.equal(transientResponse.status, 202);
assert.equal(transientResponse.data.pending, true);
assert.equal(transientResponse.data.taskId, taskId);
assert.equal(transientResponse.mediaCalls, 0);
const readyResponse = await runQueryHandler(success);
assert.equal(readyResponse.status, 200);
assert.equal(readyResponse.data.videos.length, 1);
assert.equal(readyResponse.mediaCalls, 1);
const failedResponse = await runQueryHandler({ ...submitted, gen_status: "fail", fail_reason: "policy rejected" });
assert.equal(failedResponse.status, 502);
assert.equal(failedResponse.data.taskFailed, true);
assert.equal(failedResponse.mediaCalls, 0);
const unauthorizedResponse = await runQueryHandler(null, new Error("login required"));
assert.equal(unauthorizedResponse.data.taskFailed, false);
assert.equal(unauthorizedResponse.data.taskId, taskId);

const accountContext = vm.createContext({
  dreaminaStatusText: {}, dreaminaAccountMeta: {}, dreaminaStatus: {}, config: {},
  updateDreaminaModelOptions: () => {}, setKeyStatus: () => {}, updateDreaminaButtons: () => {}
});
const accountSource = appSource.slice(appSource.indexOf("function renderDreaminaStatus("), appSource.indexOf("function dreaminaModelOptionsForVersions("));
vm.runInContext(accountSource, accountContext);
vm.runInContext('renderDreaminaStatus({ installed: true, loggedIn: true, userName: "Test account", userId: "1234567890" })', accountContext);
assert.match(accountContext.dreaminaAccountMeta.textContent, /Test account.*7890/u);
assert.doesNotMatch(accountContext.dreaminaAccountMeta.textContent, /1234567890/u);

const pendingNode = { id: "pending-video", type: "video-task", status: "pending", dreaminaSubmitId: taskId };
const historyContext = vm.createContext({
  restoreNodesPreservingActiveGenerations,
  canvasState: { nodes: [pendingNode], viewport: {} }, generationControllers: new Map(),
  migrateNode: (node) => node, setCanvasNodes: (nodes) => { historyContext.canvasState.nodes = nodes; },
  syncAllArkAssetMarks: () => {}, normalizeZoom: (zoom) => zoom,
  updateAssistantProjectMemoryControl: () => {}
});
const historySource = appSource.slice(appSource.indexOf("function applySavedState("), appSource.indexOf("\nfunction ", appSource.indexOf("function applySavedState(") + 1));
vm.runInContext(historySource, historyContext);
vm.runInContext('applySavedState({ nodes: [{ id: "pending-video", type: "video-task", status: "idle" }] }, { preserveActiveGenerations: true, materializeImages: false })', historyContext);
assert.equal(historyContext.canvasState.nodes[0].dreaminaSubmitId, taskId, "Undo must preserve a submitted task even while progress queries are paused.");
assert.equal(historyContext.canvasState.nodes[0].status, "pending");

console.log("Dreamina task recovery and polling checks passed.");
