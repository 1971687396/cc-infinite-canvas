import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildGrsaiImage26Payload, grsaiImage26Models, grsaiImage26SizeOptions, normalizeGrsaiImage26Size, isGrsaiImage26Connection } from "../public/model-profiles.js";

for (const { model, apiModel } of grsaiImage26Models) {
  assert.equal(isGrsaiImage26Connection({ protocol: "grsai", apiModel }), true);
  assert.equal(isGrsaiImage26Connection({ protocol: "openai-images", apiModel }), false);
  const generic = apiModel === "gpt-image-2.6";
  for (const [size] of grsaiImage26SizeOptions(apiModel)) assert.equal(normalizeGrsaiImage26Size(size, apiModel), size);
  const payload = buildGrsaiImage26Payload(apiModel, { size: generic ? "16:9" : "3840x2160", quality: generic ? "auto" : "high", format: "gif", background: "transparent" }, "test", ["data:image/png;base64,fixture"], { complexity: "high", output_format: "jpeg", frame_count: 99 });
  assert.equal(payload.model, apiModel);
  assert.equal(payload.outputFormat, "gif");
  assert.equal(payload.replyType, "async");
  assert.equal(payload.background, "transparent");
  for (const field of ["imageSize", "size", "output_format", "response_format", "complexity", "frame_count"]) assert.equal(payload[field], undefined);
  if (apiModel.endsWith("sunburst")) {
    for (const quality of ["xhigh", "max"]) assert.equal(buildGrsaiImage26Payload(apiModel, { quality }, "test").quality, quality);
  } else assert.throws(() => buildGrsaiImage26Payload(apiModel, { quality: "max" }, "test"));
  assert.throws(() => buildGrsaiImage26Payload(apiModel, { format: "jpeg" }, "test"));
  assert.throws(() => buildGrsaiImage26Payload(apiModel, {}, "test", [], { replyType: "stream" }));
  if (!generic) {
    for (const size of ["16:9", "4096x2048", "2049x1024", "64x64", "3840x3840", "3840x1024"]) assert.throws(() => normalizeGrsaiImage26Size(size, apiModel), size);
    assert.throws(() => buildGrsaiImage26Payload(apiModel, { format: "svg" }, "test"));
  } else {
    assert.throws(() => normalizeGrsaiImage26Size("2048x2048", apiModel));
    assert.equal(buildGrsaiImage26Payload(apiModel, { format: "svg" }, "test").outputFormat, "svg");
  }
  assert.ok(model.startsWith("grsai-"));
}

// Exercise long polling without waiting in real time or contacting an API.
const source = await readFile(new URL("../server.js", import.meta.url), "utf8");
const start = source.indexOf("async function resolveGrsaiResult(");
const end = source.indexOf("\nfunction hasImageCandidates", start);
let now = 0, polls = 0;
const context = vm.createContext({
  Date: { now: () => now }, AbortSignal,
  normalizeModelName: (value) => String(value || "").toLowerCase(),
  readUpstreamError: (data) => data?.error || "failed",
  hasImageCandidates: (data) => !!data?.results?.length,
  grsaiResultUrl: (_url, id) => `https://mock.invalid/result?id=${id}`,
  delay: async (ms) => { now += ms; },
  tryParseJson: JSON.parse,
  fetch: async (url, options) => {
    assert.match(url, /id=task-26/u);
    assert.equal(options.headers.Authorization, "Bearer mock-key");
    polls++;
    return { ok: true, text: async () => JSON.stringify(polls < 400 ? { id: "task-26", status: "running" } : { id: "task-26", status: "succeeded", results: [{ url: "https://mock.invalid/result.png" }] }) };
  }
});
vm.runInContext(source.slice(start, end), context);
const result = await context.resolveGrsaiResult({ id: "task-26", status: "running" }, "https://mock.invalid/generate", "mock-key", { timeoutMs: 30 * 60 * 1000, intervalMs: 2000 });
assert.equal(result.status, "succeeded");
assert.equal(now, 800000);
assert.equal(polls, 400);
now = 0; polls = 0;
await assert.rejects(context.resolveGrsaiResult({ id: "task-26", status: "running" }, "https://mock.invalid/generate", "mock-key", { timeoutMs: 5000, intervalMs: 2000 }), /task-26/u);
console.log("Grsai 2.6 schema, variants, pixel limits, format restrictions and simulated 800-second polling passed; no paid requests.");
