import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testCache = path.join(root, "cache", "ark-smoke-test");
const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0sAAAAASUVORK5CYII=";
const bananaNativePayloads = [];
const googleBananaNativePayloads = [];
const grsai26Payloads = [];
const grsai26Tasks = new Map();
let lastVideoPayload = null;
const arkImagePayloads = [];
const mediaGeneratePayloads = [];
const mediaGeneratePolls = new Map();
const gptCreateModels = [];
const gptImage25CreatePayloads = [];
const gptImage26CreatePayloads = [];
const mediaGenerateFormats = new Map();
const svgFixture = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="teal"/></svg>';
const gifMinimal = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
const gifFixture = Buffer.concat([gifMinimal.subarray(0, -1), Buffer.from([0x21,0xfe,64]), Buffer.alloc(64, 65), Buffer.from([0,0x3b])]);
const ttImage25CreatePayloads = [];
const grokCreatePayloads = [];
const grokEditPayloads = [];
const grokGenerationEditPayloads = [];
let grokEditContentType = "";
let openAiEditContentType = "";
let openAiEditBody = "";
let ttImage25EditBody = "";

const mock = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  if (req.method === "POST" && requestUrl.pathname === "/v1/api/generate") {
    return readJson(req).then((payload) => {
      assert.equal(req.headers.authorization, "Bearer smoke-grsai-shared-key");
      grsai26Payloads.push(payload);
      const id = `grsai-${grsai26Payloads.length}`;
      grsai26Tasks.set(id, { payload, polls: 0 });
      if (payload.replyType === "json") return sendJson(res, { id, status: "succeeded", results: [{ url: `http://127.0.0.1:${mock.address().port}/grsai-output?id=${id}` }] });
      sendJson(res, { id, status: "running" });
    });
  }
  if (req.method === "GET" && requestUrl.pathname === "/v1/api/result") {
    assert.equal(req.headers.authorization, "Bearer smoke-grsai-shared-key");
    const id = requestUrl.searchParams.get("id");
    const task = grsai26Tasks.get(id);
    task.polls++;
    return sendJson(res, task.polls < 2 ? { id, status: "running", progress: 50 } : { id, status: "succeeded", results: [{ url: `http://127.0.0.1:${mock.address().port}/grsai-output?id=${id}` }] });
  }
  if (req.method === "GET" && requestUrl.pathname === "/grsai-output") {
    const format = grsai26Tasks.get(requestUrl.searchParams.get("id")).payload.outputFormat || "png";
    res.setHeader("Content-Type", format === "svg" ? "image/svg+xml" : `image/${format}`);
    return res.end(format === "svg" ? svgFixture : format === "gif" ? gifFixture : Buffer.from(pngBase64, "base64"));
  }
  if (req.method === "POST" && requestUrl.pathname === "/v1beta/models/gemini-nano-banana-2.1:generateContent") {
    return readJson(req).then((payload) => {
      const google = req.headers["x-goog-api-key"] === "smoke-google-banana-key";
      if (google) assert.equal(req.headers.authorization, undefined);
      else assert.equal(req.headers.authorization, "Bearer smoke-banana-native-key");
      (google ? googleBananaNativePayloads : bananaNativePayloads).push(payload);
      sendJson(res, { candidates: [{ ...(google ? { groundingMetadata: { groundingChunks: [{ web: { uri: "https://never-fetch.example/grounding.png" } }] } } : {}), content: { parts: [
        ...(google ? [{ thought: true, inlineData: { mimeType: "image/png", data: pngBase64 } }] : []),
        payload.response_format === "url"
        ? { fileData: { mimeType: "image/png", fileUri: `http://127.0.0.1:${mock.address().port}/native-artifact` } }
        : { inlineData: { mimeType: "image/png", data: pngBase64 } }] }, finishReason: "STOP" }] });
    });
  }
  if (req.method === "GET" && requestUrl.pathname === "/native-artifact") {
    res.setHeader("Content-Type", "image/png");
    return res.end(Buffer.from(pngBase64, "base64"));
  }
  const arkAction = requestUrl.searchParams.get("Action");
  if (req.method === "POST" && arkAction === "ListAssetGroups") {
    return readJson(req).then((payload) => {
      assert.equal(payload.Filter.GroupType, "AIGC");
      assert.equal(payload.ProjectName, "default");
      sendJson(res, {
        Result: {
          Items: [{
            Id: "group-smoke",
            Name: "云澜",
            Description: "女主角色素材",
            GroupType: "AIGC",
            ProjectName: "default",
            CreateTime: "2026-07-20T00:00:00Z"
          }],
          PageNumber: payload.PageNumber,
          PageSize: payload.PageSize,
          TotalCount: 1
        }
      });
    });
  }
  if (req.method === "POST" && arkAction === "CreateAssetGroup") {
    return readJson(req).then((payload) => {
      assert.ok(["新角色", "cc-infinite-canvas-portraits"].includes(payload.Name));
      assert.equal(payload.Title, payload.Name);
      assert.equal(payload.GroupType, "AIGC");
      assert.equal(payload.ProjectName, "default");
      sendJson(res, { Result: { Id: payload.Name === "新角色" ? "group-created" : "group-quick", Name: payload.Name, GroupType: payload.GroupType } });
    });
  }
  if (req.method === "POST" && arkAction === "CreateAsset") {
    return readJson(req).then((payload) => {
      assert.equal(payload.GroupId, "group-quick");
      assert.equal(payload.AssetType, "Image");
      assert.equal(payload.ProjectName, "default");
      assert.equal(payload.URL, "https://example.com/quick-portrait.png");
      sendJson(res, { Result: { Id: "asset-quick-smoke" } });
    });
  }
  if (req.method === "POST" && arkAction === "ListAssets") {
    return readJson(req).then((payload) => {
      const address = mock.address();
      assert.equal(payload.Filter.GroupType, "AIGC");
      assert.deepEqual(payload.Filter.GroupIds, ["group-smoke"]);
      sendJson(res, {
        Result: {
          Items: [{
            Id: "asset-library-smoke",
            Name: "跨设备素材",
            URL: `http://127.0.0.1:${address.port}/ark-library.png`,
            AssetType: "Image",
            GroupId: "group-smoke",
            Status: "Active",
            ProjectName: "default",
            CreateTime: "2026-07-20T01:00:00Z"
          }],
          PageNumber: payload.PageNumber,
          PageSize: payload.PageSize,
          TotalCount: 1
        }
      });
    });
  }
  if (req.method === "POST" && arkAction === "GetAsset") {
    return readJson(req).then((payload) => {
      if (payload.Id === "asset-quick-smoke") {
        return sendJson(res, { Result: { Id: payload.Id, GroupId: "group-quick", Status: "Active" } });
      }
      const address = mock.address();
      assert.equal(payload.Id, "asset-library-smoke");
      sendJson(res, {
        Result: {
          Id: payload.Id,
          Name: "跨设备素材",
          URL: `http://127.0.0.1:${address.port}/ark-library.png`,
          AssetType: "Image",
          GroupId: "group-smoke",
          Status: "Active",
          ProjectName: "default"
        }
      });
    });
  }
  if (req.method === "GET" && req.url === "/ark-library.png") {
    res.setHeader("Content-Type", "image/png");
    res.end(Buffer.from(pngBase64, "base64"));
    return;
  }
  if (req.method === "POST" && req.url === "/v1/images/generations") {
    return readJson(req).then((payload) => {
      if (payload.model === "grok-imagine-image-2.0") {
        if (Array.isArray(payload.image)) grokGenerationEditPayloads.push(payload);
        else grokCreatePayloads.push(payload);
        return sendJson(res, { data: [{ b64_json: pngBase64 }] });
      }
      if (payload.model === "tt-image-2.5") {
        ttImage25CreatePayloads.push(payload);
        return sendJson(res, { data: [{ b64_json: pngBase64 }] });
      }
      if (String(payload.model || "").startsWith("gpt-image-2.5-")) {
        gptImage25CreatePayloads.push(payload);
        return sendJson(res, { data: [{ b64_json: pngBase64 }] });
      }
      if (String(payload.model || "").startsWith("gpt-image-2.6-")) {
        gptImage26CreatePayloads.push(payload);
        if (payload.output_format === "svg") return sendJson(res, { data: [{ b64_json: Buffer.from(svgFixture).toString("base64") }] });
        if (payload.output_format === "gif") return sendJson(res, { data: [{ b64_json: gifFixture.toString("base64") }] });
        return sendJson(res, { data: [{ b64_json: pngBase64 }] });
      }
      gptCreateModels.push(payload.model);
      if (payload.model === "gpt-image-2") {
        res.statusCode = 400;
        return sendJson(res, { error: { message: "Unknown model: gpt-image-2 (request id: fallback-smoke)" } });
      }
      assert.equal(payload.model, "gpt-image-2-c");
      return sendJson(res, { data: [{ b64_json: pngBase64 }] });
    });
  }
  if (req.method === "POST" && req.url === "/v1/images/edits") {
    if (String(req.headers["content-type"] || "").includes("application/json")) {
      return readJson(req).then((payload) => {
        grokEditContentType = String(req.headers["content-type"] || "");
        grokEditPayloads.push(payload);
        if (payload.prompt === "test Grok Imagine generations JSON fallback") {
          res.statusCode = 400;
          return sendJson(res, { error: { message: "failed to parse multipart form (request id: mock-grok-fallback)" } });
        }
        return sendJson(res, { data: [{ b64_json: pngBase64 }] });
      });
    }
    return readBuffer(req).then((body) => {
      openAiEditContentType = String(req.headers["content-type"] || "");
      openAiEditBody = body.toString("utf8");
      if (/name="model"\r?\n\r?\ntt-image-2\.5/iu.test(openAiEditBody)) ttImage25EditBody = openAiEditBody;
      if (/name="model"\r?\n\r?\ngpt-image-2\.6/iu.test(openAiEditBody)) {
        return sendJson(res, { data: [{ b64_json: /name="output_format"\r\n\r\ngif/u.test(openAiEditBody) ? gifFixture.toString("base64") : pngBase64 }] });
      }
      return sendJson(res, {
        data: [
          { b64_json: pngBase64, z_index: 0, name: "background" },
          { b64_json: pngBase64, z_index: 1, name: "subject" }
        ]
      });
    });
  }
  if (req.method === "POST" && req.url === "/api/v3/images/generations") {
    return readJson(req).then((payload) => {
      arkImagePayloads.push(payload);
      if (payload.layer_decomposition) {
        return sendJson(res, {
          data: [
            { b64_json: pngBase64, size: "2048x2048", output_format: "png", z_index: 0, name: "background" },
            {
              b64_json: pngBase64,
              size: "640x900",
              output_format: "png",
              z_index: 1,
              name: "main_character",
              description: "主视觉人物",
              bounding_box: { absolute: [120, 240, 760, 1140], normalized: [59, 117, 371, 557] }
            },
            {
              b64_json: pngBase64,
              size: "800x260",
              output_format: "png",
              z_index: 2,
              name: "title",
              description: "标题文字",
              bounding_box: { absolute: [200, 80, 1000, 340], normalized: [98, 39, 488, 166] }
            }
          ]
        });
      }
      return sendJson(res, {
        data: [{ b64_json: pngBase64, size: payload.size, output_format: "png" }]
      });
    });
  }
  if (req.method === "POST" && req.url === "/v1/media/generate") {
    return readJson(req).then((payload) => {
      mediaGeneratePayloads.push(payload);
      if (payload.prompt === "test media generate business error") {
        return sendJson(res, { code: 422, msg: "上游不支持当前尺寸", data: null });
      }
      if (payload.prompt === "test media generate synchronous nested output") {
        return sendJson(res, { code: 200, data: { output: { images: [{ b64_json: pngBase64 }] } } });
      }
      if (payload.prompt === "test media generate OpenAI data array") {
        return sendJson(res, { code: 200, data: [{ b64_json: pngBase64 }] });
      }
      const taskId = 900000 + mediaGeneratePayloads.length;
      mediaGenerateFormats.set(String(taskId), payload.params.output_format || "png");
      if (mediaGeneratePayloads.length === 1) {
        return sendJson(res, { code: 200, msg: "任务创建成功", data: { task: { id: taskId } } });
      }
      return sendJson(res, { code: 200, msg: "任务创建成功", result: { task_ids: [taskId] } });
    });
  }
  if (req.method === "GET" && requestUrl.pathname === "/v1/media/status") {
    const taskId = requestUrl.searchParams.get("task_id");
    const polls = (mediaGeneratePolls.get(taskId) || 0) + 1;
    mediaGeneratePolls.set(taskId, polls);
    if (polls === 1) {
      return sendJson(res, {
        task_id: taskId,
        is_final: false,
        state: "success",
        progress: "50%",
        result: { status: "still-working" }
      });
    }
    const address = mock.address();
    return sendJson(res, {
      task_id: taskId,
      is_final: true,
      state: "success",
      result_url: `http://127.0.0.1:${address.port}/media-result?format=${mediaGenerateFormats.get(taskId) || "png"}`
    });
  }
  if (req.method === "GET" && requestUrl.pathname === "/media-result") {
    const format = requestUrl.searchParams.get("format");
    res.setHeader("Content-Type", format === "svg" ? "image/svg+xml" : format === "gif" ? "image/gif" : "image/png");
    res.end(format === "svg" ? svgFixture : format === "gif" ? gifFixture : Buffer.from(pngBase64, "base64"));
    return;
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
  ...Object.fromEntries(["gpt-image-2.6", "gpt-image-2.6-flare", "gpt-image-2.6-sunburst"].map((apiModel) => [`grsai-${apiModel}`, {
    preset: "grsai", capability: "image", protocol: "grsai", authType: "bearer", apiModel,
    baseUrl: `http://127.0.0.1:${mockPort}`, imageEndpoint: "/v1/api/generate", editEndpoint: "/v1/api/generate"
  }])),
  "nano-banana-2": {
    preset: "grsai", capability: "image", protocol: "grsai", authType: "bearer", apiModel: "nano-banana-2",
    baseUrl: `http://127.0.0.1:${mockPort}`, imageEndpoint: "/v1/api/generate", editEndpoint: "/v1/api/generate"
  },
  ...Object.fromEntries(["gpt-image-2.6-sunburst", "gpt-image-2.6-flare"].map((model) => [model, {
    preset: "custom", capability: "image", protocol: "openai-images", authType: "bearer", apiModel: model,
    baseUrl: "https://api.openlux.ai", imageEndpoint: `http://127.0.0.1:${mockPort}/v1/images/generations`, editEndpoint: `http://127.0.0.1:${mockPort}/v1/images/edits`
  }])),
  ...Object.fromEntries(["tt-image-2.6", "tt-image-2.6-guan"].map((model) => [model, {
    preset: "custom", capability: "image", protocol: "media-generate", authType: "bearer", apiModel: model,
    baseUrl: `http://127.0.0.1:${mockPort}`, imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate"
  }])),
  "tt26-legacy-smoke": {
    preset: "custom", capability: "image", protocol: "openai-images", authType: "bearer", apiModel: "tt-image-2.6-guan",
    baseUrl: "https://api.lk888.ai", imageEndpoint: "/v1/images/generations", editEndpoint: "/v1/images/edits"
  },
  "gpt-image-2": {
    preset: "yunwu",
    capability: "image",
    protocol: "openai-images",
    authType: "bearer",
    apiModel: "gpt-image-2",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "sunburst-custom-relay": {
    preset: "custom",
    capability: "image",
    protocol: "openai-images",
    authType: "bearer",
    apiModel: "gpt-image-2.5-sunburst-2026-09-08",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "openlux-gpt25-smoke": {
    preset: "custom",
    capability: "image",
    protocol: "openai-images",
    authType: "bearer",
    apiModel: "gpt-image-2.5-sunburst",
    baseUrl: "https://api.openlux.ai",
    imageEndpoint: `http://127.0.0.1:${mockPort}/v1/images/generations`,
    editEndpoint: `http://127.0.0.1:${mockPort}/v1/images/edits`,
    chatEndpoint: "/v1/chat/completions"
  },
  "tt-image-2.5-openai-smoke": {
    preset: "custom",
    capability: "image",
    protocol: "openai-images",
    authType: "bearer",
    apiModel: "tt-image-2.5",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "tt-image-2.5-media-smoke": {
    preset: "custom",
    capability: "image",
    protocol: "media-generate",
    authType: "bearer",
    apiModel: "tt-image-2.5",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/media/generate",
    editEndpoint: "/v1/media/generate",
    chatEndpoint: "/v1/chat/completions"
  },
  "banana2.1": {
    preset: "custom", capability: "image", protocol: "media-generate", authType: "bearer",
    apiModel: "banana-2.1", baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate"
  },
  "yunb21-smoke": {
    preset: "custom", capability: "image", protocol: "gemini-native", authType: "bearer",
    apiModel: "gemini-nano-banana-2.1", baseUrl: "https://api.openlux.ai",
    imageEndpoint: `http://127.0.0.1:${mockPort}/v1beta/models/{model}:generateContent`,
    editEndpoint: `http://127.0.0.1:${mockPort}/v1beta/models/{model}:generateContent`
  },
  "google-banana21-smoke": {
    preset: "google", capability: "image", protocol: "gemini-native", authType: "x-goog-api-key",
    apiModel: "gemini-nano-banana-2.1", baseUrl: "https://generativelanguage.googleapis.com",
    imageEndpoint: `http://127.0.0.1:${mockPort}/v1beta/models/{model}:generateContent`,
    editEndpoint: `http://127.0.0.1:${mockPort}/v1beta/models/{model}:generateContent`
  },
  "banana2.1官": {
    preset: "custom", capability: "image", protocol: "media-generate", authType: "bearer",
    apiModel: "banana-2.1-token", baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/media/generate", editEndpoint: "/v1/media/generate"
  },
  "banana21-legacy-smoke": {
    preset: "custom", capability: "image", protocol: "gemini-native", authType: "bearer",
    apiModel: "banana-2.1-token", baseUrl: "https://api.lk888.ai",
    imageEndpoint: "/v1/images/generations", editEndpoint: "/v1/images/edits"
  },
  grokimagezhenzhen: {
    preset: "custom",
    capability: "image",
    protocol: "openai-images",
    authType: "bearer",
    apiModel: "grok-imagine-image-2.0",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "seedream5.0pro-aggregate": {
    preset: "custom",
    capability: "image",
    protocol: "ark-images",
    authType: "bearer",
    apiModel: "doubao-seedream-5-0-pro-260628",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "seedream-v5-pro/layer-decomposition": arkConnection("image", "seedream-v5-pro/layer-decomposition", mockPort),
  "seedream-v5-pro-zhenzhen-layer-decomposition": {
    preset: "custom",
    capability: "image",
    protocol: "ark-images",
    authType: "bearer",
    apiModel: "seedream-v5-pro/layer-decomposition",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    imageEndpoint: "/v1/images/generations",
    editEndpoint: "/v1/images/edits",
    chatEndpoint: "/v1/chat/completions"
  },
  "seedream5.0pro-official-route": arkConnection("image", "doubao-seedream-5-0-pro-260628", mockPort),
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
    VOLCENGINE_ACCESS_KEY_ID: "smoke-access-key",
    VOLCENGINE_SECRET_ACCESS_KEY: "smoke-secret-key",
    VOLCENGINE_ARK_ASSET_GROUP_ID: " ",
    VOLCENGINE_ARK_OPEN_API_BASE_URL: `http://127.0.0.1:${mockPort}`,
    VOLCENGINE_ARK_BASE_URL: `http://127.0.0.1:${mockPort}`,
    CC_CANVAS_ALLOW_LOCAL_ARK_ASSET_URLS: "1",
    CC_CANVAS_MEDIA_POLL_INTERVAL_MS: "10",
    CC_CANVAS_MEDIA_POLL_TIMEOUT_MS: "2000",
    GOOGLE_API_KEY: "",
    GRSAI_API_KEY: "smoke-grsai-shared-key",
    GEMINI_API_KEY: "",
    CC_CANVAS_MODEL_KEYS_B64: Buffer.from(JSON.stringify({
      "gpt-image-2.6-sunburst": "smoke-openlux26-key",
      "gpt-image-2.6-flare": "smoke-openlux26-key",
      "tt-image-2.6": "smoke-tt26-key",
      "tt-image-2.6-guan": "smoke-tt26-guan-key",
      "sunburst-custom-relay": "smoke-gpt-image-25-key",
      "openlux-gpt25-smoke": "smoke-openlux-image-key",
      "tt-image-2.5-openai-smoke": "smoke-tt-image-25-key",
      "tt-image-2.5-media-smoke": "smoke-tt-image-25-key",
      "banana2.1": "smoke-banana-key",
      "yunb21-smoke": "smoke-banana-native-key",
      "google-banana21-smoke": "smoke-google-banana-key",
      "banana2.1官": "smoke-banana-token-key",
      grokimagezhenzhen: "smoke-grok-image-key",
      "seedream5.0pro-aggregate": "smoke-seedream-aggregate-key",
      "seedream5.0pro-official-route": "smoke-seedream-official-route-key",
      "seedream-v5-pro/layer-decomposition": "smoke-layer-key",
      "seedream-v5-pro-zhenzhen-layer-decomposition": "smoke-zhenzhen-layer-key"
    }), "utf8").toString("base64url"),
    YUNWU_MODEL_KEY_GPT_IMAGE_2: "smoke-gpt-image-key",
    YUNWU_MODEL_KEY_GROKIMAGEZHENZHEN: "smoke-grok-image-key",
    YUNWU_MODEL_KEY_SEEDREAM_V5_PRO_LAYER_DECOMPOSITION: "smoke-layer-key",
    YUNWU_MODEL_KEY_SEEDREAM_V5_PRO_ZHENZHEN_LAYER_DECOMPOSITION: "smoke-zhenzhen-layer-key",
    CC_CANVAS_MODEL_CONNECTIONS_B64: Buffer.from(JSON.stringify(connections), "utf8").toString("base64url")
  },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  const appPort = await waitForCanvasPort(child);
  const config = await getJson(`http://127.0.0.1:${appPort}/api/config`);
  assert.equal(config.hasArkApiKey, true);
  assert.equal(config.modelConnections["tt26-legacy-smoke"].protocol, "media-generate");
  for (const model of ["gpt-image-2.6-sunburst", "gpt-image-2.6-flare", "tt-image-2.6", "tt-image-2.6-guan"]) {
    assert.ok(config.connectionModels.some((item) => item.model === model && item.capability === "image"));
  }
  assert.equal(config.arkModels.length, 8);
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].protocol, "media-generate");
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].imageEndpoint, "/v1/media/generate");
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].editEndpoint, "/v1/media/generate");
  assert.equal(config.modelConnections["seedream5.0pro-official-route"].protocol, "ark-images");
  assert.equal(config.modelConnections["banana21-legacy-smoke"].protocol, "media-generate");
  assert.equal(config.modelConnections["banana21-legacy-smoke"].imageEndpoint, "/v1/media/generate");
  assert.equal(config.modelConnections["banana21-legacy-smoke"].editEndpoint, "/v1/media/generate");
  assert.equal(config.modelConnections["seedream5.0pro-official-route"].imageEndpoint, "/api/v3/images/generations");
  assert.equal(config.modelConnections["sunburst-custom-relay"].apiModel, "gpt-image-2.5-sunburst-2026-09-08");
  assert.equal(config.connectionModels.some(({ model }) => model === "gpt-image-2.5-sunburst"), true);
  assert.equal(config.connectionModels.some(({ model }) => model === "gpt-image-2.5-flare"), true);
  const ttImageDefinition = config.connectionModels.find(({ model }) => model === "tt-image-2.5");
  assert.equal(ttImageDefinition?.presetDefaults?.lingke?.baseUrl, "https://api.lk888.ai");
  assert.equal(ttImageDefinition?.presetDefaults?.lingke?.protocol, "openai-images");
  assert.equal(ttImageDefinition?.presetDefaults?.["lingke-media"]?.protocol, "media-generate");
  assert.equal(ttImageDefinition?.presetDefaults?.["lingke-media"]?.imageEndpoint, "/v1/media/generate");

  const assetGroups = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/groups`, {
    projectName: "default",
    pageNumber: 1,
    pageSize: 24
  });
  assert.equal(assetGroups.totalCount, 1);
  assert.equal(assetGroups.items[0].groupId, "group-smoke");
  assert.equal(assetGroups.items[0].name, "云澜");

  const createdAssetGroup = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/groups/create`, {
    projectName: "default",
    name: "新角色"
  });
  assert.equal(createdAssetGroup.item.groupId, "group-created");
  assert.equal(createdAssetGroup.item.name, "新角色");

  const missingGroupResponse = await fetch(`http://127.0.0.1:${appPort}/api/ark-assets/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: "ark-smoke",
      projectName: "default",
      items: [{ url: `http://127.0.0.1:${mockPort}/ark-library.png`, filename: "missing-group.png" }]
    })
  });
  const missingGroup = await missingGroupResponse.json();
  assert.equal(missingGroupResponse.status, 400);
  assert.match(missingGroup.error, /角色素材组/u);

  const quickImport = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/quick-import`, {
    projectId: "ark-smoke",
    projectName: "default",
    sourceUrl: "https://example.com/quick-portrait.png",
    filename: "quick-portrait.png"
  });
  assert.equal(quickImport.groupId, "group-quick");
  assert.equal(quickImport.assetUri, "asset://asset-quick-smoke");
  assert.equal(quickImport.status, "Processing");
  const quickStatus = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/status`, {
    projectName: "default",
    items: [{ clientId: "quick-image", assetId: quickImport.assetId }]
  });
  assert.equal(quickStatus.items[0].status, "Active");

  const assetLibrary = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/list`, {
    projectName: "default",
    groupId: "group-smoke",
    pageNumber: 1,
    pageSize: 24
  });
  assert.equal(assetLibrary.totalCount, 1);
  assert.equal(assetLibrary.items[0].assetUri, "asset://asset-library-smoke");

  const downloadedAsset = await postJson(`http://127.0.0.1:${appPort}/api/ark-assets/download`, {
    projectId: "ark-smoke",
    projectName: "default",
    assetId: "asset-library-smoke"
  });
  assert.equal(downloadedAsset.arkAsset.status, "Active");
  assert.equal(downloadedAsset.arkAsset.assetUri, "asset://asset-library-smoke");
  assert.match(downloadedAsset.asset.url, /^\/project-cache\/ark-smoke\/assets\/ark-asset-library-smoke\.png$/u);
  const downloadedBytes = Buffer.from(await (await fetch(`http://127.0.0.1:${appPort}${downloadedAsset.asset.url}`)).arrayBuffer());
  assert.deepEqual(downloadedBytes, Buffer.from(pngBase64, "base64"));

  const gptImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test gpt image fallback",
    model: "gpt-image-2",
    n: "1",
    size: "1024x1024",
    format: "png",
    extraParams: {}
  });
  assert.deepEqual(gptCreateModels, ["gpt-image-2", "gpt-image-2-c"]);
  assert.equal(gptImage.fallback.from, "gpt-image-2");
  assert.equal(gptImage.fallback.to, "gpt-image-2-c");
  assert.equal(gptImage.images.length, 1);

  const gptImage25 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test GPT Image 2.5 parameter synchronization",
    model: "sunburst-custom-relay",
    n: "1",
    size: "1536 X 1024",
    quality: "MAX",
    format: "webp",
    extraParams: {}
  });
  assert.equal(gptImage25.images.length, 1);
  assert.match(gptImage25.raw.data[0].b64_json, /^\[base64 image omitted;/u);
  assert.equal(gptImage25CreatePayloads.length, 1);
  assert.equal(gptImage25CreatePayloads[0].model, "gpt-image-2.5-sunburst-2026-09-08");
  assert.equal(gptImage25CreatePayloads[0].size, "1536x1024");
  assert.equal(gptImage25CreatePayloads[0].quality, "max");
  assert.equal(gptImage25CreatePayloads[0].output_format, "webp");
  assert.equal(gptImage25CreatePayloads[0].format, undefined);

  const gptImage25EditForm = new FormData();
  appendFields(gptImage25EditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test GPT Image 2.5 edit parameter synchronization",
    model: "sunburst-custom-relay",
    n: "1",
    size: "1024 X 1536",
    quality: "XHIGH",
    format: "jpeg",
    extraParams: "{}"
  });
  gptImage25EditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "gpt-25-reference.png");
  const gptImage25Edit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, gptImage25EditForm);
  assert.equal(gptImage25Edit.images.length, 2);
  assert.match(openAiEditContentType, /^multipart\/form-data; boundary=/iu);
  assert.match(openAiEditBody, /name="size"\r\n\r\n1024x1536\r\n/u);
  assert.match(openAiEditBody, /name="quality"\r\n\r\nxhigh\r\n/u);
  assert.match(openAiEditBody, /name="output_format"\r\n\r\njpeg\r\n/u);
  assert.doesNotMatch(openAiEditBody, /name="format"\r\n/u);

  const openLux4k = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test OpenLux 4K default URL",
    model: "openlux-gpt25-smoke",
    size: "3840x2160",
    quality: "max",
    format: "webp",
    moderation: "low",
    extraParams: {}
  });
  assert.equal(openLux4k.images.length, 1);
  const openLux4kPayload = gptImage25CreatePayloads.at(-1);
  assert.equal(openLux4kPayload.response_format, "url");
  assert.equal(openLux4kPayload.format, "webp");
  assert.equal(openLux4kPayload.output_format, undefined);
  assert.equal(openLux4kPayload.moderation, "low");

  await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test OpenLux explicit base64",
    model: "openlux-gpt25-smoke",
    size: "1024x1024",
    format: "png",
    moderation: "auto",
    responseFormat: "b64_json",
    extraParams: {}
  });
  const openLux1kPayload = gptImage25CreatePayloads.at(-1);
  assert.equal(openLux1kPayload.response_format, "b64_json");
  assert.equal(openLux1kPayload.moderation, "auto");

  const openLuxEditForm = new FormData();
  appendFields(openLuxEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test OpenLux edit documented fields",
    model: "openlux-gpt25-smoke",
    size: "1024x1024",
    format: "png",
    moderation: "low",
    responseFormat: "url",
    extraParams: JSON.stringify({ response_format: "url" })
  });
  openLuxEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "openlux-reference.png");
  await postForm(`http://127.0.0.1:${appPort}/api/generate`, openLuxEditForm);
  assert.match(openAiEditBody, /name="moderation"\r\n\r\nlow\r\n/u);
  assert.match(openAiEditBody, /name="response_format"\r\n\r\nurl\r\n/u);
  assert.doesNotMatch(openAiEditBody, /name="output_format"\r\n/u);

  const ttImage25OpenAi = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test TT Image 2.5 OpenAI-compatible sizing",
    model: "tt-image-2.5-openai-smoke",
    n: "4",
    size: "auto",
    quality: "XHIGH",
    ttImageVersion: "sunburst",
    ttImageAspectRatio: "16:9",
    ttImageResolution: "2K",
    background: "transparent",
    format: "webp",
    extraParams: {}
  });
  assert.equal(ttImage25OpenAi.images.length, 1);
  assert.equal(ttImage25CreatePayloads.length, 1);
  assert.equal(ttImage25CreatePayloads[0].model, "tt-image-2.5");
  assert.equal(ttImage25CreatePayloads[0].n, 1);
  assert.equal(ttImage25CreatePayloads[0].version, "sunburst");
  assert.equal(ttImage25CreatePayloads[0].size, "2560x1440");
  assert.equal(ttImage25CreatePayloads[0].quality, "xhigh");
  assert.equal(ttImage25CreatePayloads[0].background, "transparent");
  assert.equal(ttImage25CreatePayloads[0].output_format, "png");
  assert.equal(ttImage25CreatePayloads[0].aspect_ratio, undefined);
  assert.equal(ttImage25CreatePayloads[0].resolution, undefined);

  const ttImage25EditForm = new FormData();
  appendFields(ttImage25EditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test TT Image 2.5 multi-reference edit",
    model: "tt-image-2.5-openai-smoke",
    n: "1",
    size: "1536 X 1024",
    quality: "MAX",
    ttImageVersion: "flare",
    ttImageAspectRatio: "auto",
    ttImageResolution: "auto",
    background: "opaque",
    format: "jpeg",
    extraParams: "{}"
  });
  ttImage25EditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "tt-reference-1.png");
  ttImage25EditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "tt-reference-2.png");
  const ttImage25Edit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, ttImage25EditForm);
  assert.equal(ttImage25Edit.images.length, 2);
  assert.match(ttImage25EditBody, /name="size"\r\n\r\n1536x1024\r\n/u);
  assert.match(ttImage25EditBody, /name="n"\r\n\r\n1\r\n/u);
  assert.match(ttImage25EditBody, /name="version"\r\n\r\nflare\r\n/u);
  assert.match(ttImage25EditBody, /name="quality"\r\n\r\nmax\r\n/u);
  assert.match(ttImage25EditBody, /name="background"\r\n\r\nopaque\r\n/u);
  assert.match(ttImage25EditBody, /name="output_format"\r\n\r\njpeg\r\n/u);
  assert.equal((ttImage25EditBody.match(/name="image";/gu) || []).length, 2);

  const customConnectionResponse = await fetch(`http://127.0.0.1:${appPort}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: "ark-smoke",
      mode: "create",
      prompt: "custom connections must not switch models",
      model: "gpt-image-2",
      n: "1",
      size: "1024x1024",
      format: "png",
      connectionOverride: true,
      apiKeyOverride: "smoke-custom-key",
      baseUrl: `http://127.0.0.1:${mockPort}`,
      endpointPath: "/v1/images/generations",
      extraParams: {}
    })
  });
  const customConnectionError = await customConnectionResponse.json();
  assert.equal(customConnectionResponse.status, 400);
  assert.match(customConnectionError.error, /Unknown model: gpt-image-2/u);
  assert.equal(customConnectionError.fallback, null);
  assert.deepEqual(gptCreateModels, ["gpt-image-2", "gpt-image-2-c", "gpt-image-2"]);

  const grokCreate = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test Grok Imagine JSON create",
    model: "grokimagezhenzhen",
    n: "1",
    size: "2048x1152",
    quality: "high",
    format: "png",
    extraParams: {}
  });
  assert.equal(grokCreate.images.length, 1);
  assert.equal(grokCreatePayloads.length, 1);
  assert.equal(grokCreatePayloads[0].size, undefined);
  assert.equal(grokCreatePayloads[0].aspect_ratio, "16:9");
  assert.equal(grokCreatePayloads[0].resolution, "2k");
  assert.equal(grokCreatePayloads[0].quality, "medium");
  assert.equal(grokCreatePayloads[0].response_format, "url");

  const grokEditForm = new FormData();
  appendFields(grokEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test Grok Imagine JSON edit",
    model: "grokimagezhenzhen",
    n: "1",
    size: "2048x1152",
    quality: "",
    format: "png",
    extraParams: "{}"
  });
  grokEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "grok-reference.png");
  const grokEdit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, grokEditForm);
  assert.equal(grokEdit.images.length, 1);
  assert.match(grokEditContentType, /^application\/json/iu);
  assert.equal(grokEditPayloads.length, 1);
  assert.equal(grokEditPayloads[0].size, undefined);
  assert.equal(grokEditPayloads[0].aspect_ratio, "16:9");
  assert.equal(grokEditPayloads[0].resolution, "2k");
  assert.equal(grokEditPayloads[0].image.type, "image_url");
  assert.match(grokEditPayloads[0].image.url, /^data:image\/png;base64,/u);
  assert.equal(grokEditPayloads[0].images, undefined);

  const grokMultiEditForm = new FormData();
  appendFields(grokMultiEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test Grok Imagine multi-image JSON edit",
    model: "grokimagezhenzhen",
    n: "1",
    size: "3:2|1k",
    quality: "low",
    format: "png",
    extraParams: "{}"
  });
  grokMultiEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "grok-reference-1.png");
  grokMultiEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "grok-reference-2.png");
  const grokMultiEdit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, grokMultiEditForm);
  assert.equal(grokMultiEdit.images.length, 1);
  assert.equal(grokEditPayloads.length, 2);
  assert.equal(grokEditPayloads[1].image, undefined);
  assert.equal(grokEditPayloads[1].images.length, 2);
  assert.equal(grokEditPayloads[1].aspect_ratio, "3:2");
  assert.equal(grokEditPayloads[1].resolution, "1k");
  assert.equal(grokEditPayloads[1].quality, "low");

  const grokFallbackEditForm = new FormData();
  appendFields(grokFallbackEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test Grok Imagine generations JSON fallback",
    model: "grokimagezhenzhen",
    n: "1",
    size: "2048x1152",
    quality: "medium",
    format: "png",
    extraParams: "{}"
  });
  grokFallbackEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "grok-fallback-reference.png");
  const grokFallbackEdit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, grokFallbackEditForm);
  assert.equal(grokFallbackEdit.images.length, 1);
  assert.equal(grokFallbackEdit.request.transport, "generations-json");
  assert.match(grokFallbackEdit.fallback.reason, /failed to parse multipart form/iu);
  assert.equal(grokGenerationEditPayloads.length, 1);
  assert.equal(Array.isArray(grokGenerationEditPayloads[0].image), true);
  assert.equal(grokGenerationEditPayloads[0].image.length, 1);
  assert.match(grokGenerationEditPayloads[0].image[0], /^data:image\/png;base64,/u);
  assert.equal(grokGenerationEditPayloads[0].images, undefined);

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

  const upgradedSeedream = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test Seedream 5.0 Pro upgraded parameters",
    model: "ark-seedream-5.0-pro",
    n: "9",
    size: "1.5K",
    quality: "fast",
    background: "transparent",
    format: "jpeg",
    extraParams: {
      n: 12,
      output_format: "jpeg",
      background: "opaque",
      sequential_image_generation: "auto",
      stream: true,
      tools: [{ type: "unsupported" }],
      watermark: true
    }
  });
  const upgradedSeedreamPayload = arkImagePayloads.at(-1);
  assert.equal(upgradedSeedream.images.length, 1);
  assert.equal(upgradedSeedreamPayload.size, "1.5K");
  assert.deepEqual(upgradedSeedreamPayload.optimize_prompt_options, { mode: "fast" });
  assert.equal(upgradedSeedreamPayload.background, "transparent");
  assert.equal(upgradedSeedreamPayload.output_format, "png");
  assert.equal(upgradedSeedreamPayload.watermark, true);
  assert.equal(upgradedSeedreamPayload.n, undefined);
  assert.equal(upgradedSeedreamPayload.sequential_image_generation, undefined);
  assert.equal(upgradedSeedreamPayload.stream, undefined);
  assert.equal(upgradedSeedreamPayload.tools, undefined);

  const aggregateImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test migrated media generate endpoint",
    model: "seedream5.0pro-aggregate",
    n: "1",
    size: "2816x1584",
    format: "png",
    connectionOverride: true,
    apiKeyOverride: "smoke-key",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    endpointPath: "/v1/images/generations",
    extraParams: {}
  });
  assert.equal(aggregateImage.images.length, 1);
  assert.equal(aggregateImage.request.provider, "media-generate");
  assert.equal(aggregateImage.request.taskId, "900001");
  assert.equal(mediaGeneratePayloads[0].model, "doubao-seedream-5-0-pro-260628");
  assert.equal(mediaGeneratePayloads[0].prompt, "test migrated media generate endpoint");
  assert.equal(mediaGeneratePayloads[0].params.size, "2K");
  assert.equal(mediaGeneratePayloads[0].params.aspect_ratio, "16:9");
  assert.equal(mediaGeneratePayloads[0].params.n, undefined);
  assert.equal(mediaGeneratePolls.get("900001"), 2);

  const aggregateEditForm = new FormData();
  appendFields(aggregateEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "layers",
    prompt: "test media generate reference image",
    model: "seedream5.0pro-aggregate",
    n: "1",
    size: "1K",
    format: "png",
    extraParams: "{}"
  });
  aggregateEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "media-reference.png");
  const aggregateEdit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, aggregateEditForm);
  assert.equal(aggregateEdit.images.length, 1);
  assert.equal(mediaGeneratePayloads[1].params.size, "1K");
  assert.equal(mediaGeneratePayloads[1].params.images.length, 1);
  assert.equal(mediaGeneratePayloads[1].params.layer_decomposition, true);
  assert.match(mediaGeneratePayloads[1].params.images[0], /^data:image\/png;base64,/u);
  assert.equal(mediaGeneratePolls.get("900002"), 2);

  const synchronousAggregateImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test media generate synchronous nested output",
    model: "seedream5.0pro-aggregate",
    n: "1",
    size: "1K",
    format: "png",
    connectionOverride: true,
    apiKeyOverride: "smoke-key",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    endpointPath: "/v1/media/generate",
    extraParams: {}
  });
  assert.equal(synchronousAggregateImage.images.length, 1);
  assert.equal(synchronousAggregateImage.request.taskId, "");

  const openAiStyleAggregateImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test media generate OpenAI data array",
    model: "seedream5.0pro-aggregate",
    n: "1",
    size: "1K",
    format: "png",
    connectionOverride: true,
    apiKeyOverride: "smoke-key",
    baseUrl: `http://127.0.0.1:${mockPort}`,
    endpointPath: "/v1/media/generate",
    extraParams: {}
  });
  assert.equal(openAiStyleAggregateImage.images.length, 1);
  assert.equal(openAiStyleAggregateImage.request.taskId, "");

  const upgradedAggregateImage = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test media generate Seedream 5.0 Pro upgraded parameters",
    model: "seedream5.0pro-aggregate",
    n: "8",
    size: "1.5K",
    quality: "fast",
    background: "opaque",
    format: "jpeg",
    extraParams: {
      notify_url: "https://example.com/seedream-hook",
      stream: true,
      tools: [{ type: "unsupported" }],
      params: {
        size: "2K",
        output_format: "png",
        sequential_image_generation: "auto"
      }
    }
  });
  const upgradedAggregatePayload = mediaGeneratePayloads.at(-1);
  assert.equal(upgradedAggregateImage.images.length, 1);
  assert.equal(upgradedAggregatePayload.notify_url, "https://example.com/seedream-hook");
  assert.equal(upgradedAggregatePayload.stream, undefined);
  assert.equal(upgradedAggregatePayload.tools, undefined);
  assert.equal(upgradedAggregatePayload.params.size, "1.5K");
  assert.equal(upgradedAggregatePayload.params.output_format, "jpeg");
  assert.equal(upgradedAggregatePayload.params.background, "opaque");
  assert.deepEqual(upgradedAggregatePayload.params.optimize_prompt_options, { mode: "fast" });
  assert.equal(upgradedAggregatePayload.params.sequential_image_generation, undefined);

  const aggregateBusinessErrorResponse = await fetch(`http://127.0.0.1:${appPort}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectId: "ark-smoke",
      mode: "create",
      prompt: "test media generate business error",
      model: "seedream5.0pro-aggregate",
      n: "1",
      size: "1K",
      format: "png",
      connectionOverride: true,
      apiKeyOverride: "smoke-key",
      baseUrl: `http://127.0.0.1:${mockPort}`,
      endpointPath: "/v1/media/generate",
      extraParams: {}
    })
  });
  const aggregateBusinessError = await aggregateBusinessErrorResponse.json();
  assert.equal(aggregateBusinessErrorResponse.status, 502);
  assert.match(aggregateBusinessError.error, /上游不支持当前尺寸/u);
  assert.doesNotMatch(aggregateBusinessError.error, /task_id/u);

  const ttImage25Media = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke",
    mode: "create",
    prompt: "test TT Image 2.5 native media parameters",
    model: "tt-image-2.5-media-smoke",
    n: "1",
    size: "auto",
    quality: "MAX",
    ttImageVersion: "SUNBURST",
    ttImageAspectRatio: "21:9",
    ttImageResolution: "4k",
    background: "transparent",
    format: "webp",
    extraParams: { notify_url: "https://example.com/hook" }
  });
  const ttImage25MediaPayload = mediaGeneratePayloads.at(-1);
  assert.equal(ttImage25Media.images.length, 1);
  assert.equal(ttImage25Media.request.provider, "media-generate");
  assert.equal(ttImage25MediaPayload.model, "tt-image-2.5");
  assert.equal(ttImage25MediaPayload.notify_url, "https://example.com/hook");
  assert.equal(ttImage25MediaPayload.params.version, "sunburst");
  assert.equal(ttImage25MediaPayload.params.aspect_ratio, "21:9");
  assert.equal(ttImage25MediaPayload.params.resolution, "4K");
  assert.equal(ttImage25MediaPayload.params.quality, "max");
  assert.equal(ttImage25MediaPayload.params.background, "transparent");
  assert.equal(ttImage25MediaPayload.params.size, undefined);
  assert.equal(ttImage25MediaPayload.params.images, undefined);

  const ttImage25MediaEditForm = new FormData();
  appendFields(ttImage25MediaEditForm, {
    projectId: "ark-smoke",
    mode: "edit",
    prompt: "test TT Image 2.5 native multi-image fusion",
    model: "tt-image-2.5-media-smoke",
    n: "1",
    size: "3200x2560",
    quality: "high",
    ttImageVersion: "flare",
    ttImageAspectRatio: "auto",
    ttImageResolution: "auto",
    background: "opaque",
    format: "png",
    extraParams: "{}"
  });
  ttImage25MediaEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "tt-media-reference-1.png");
  ttImage25MediaEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "tt-media-reference-2.png");
  const ttImage25MediaEdit = await postForm(`http://127.0.0.1:${appPort}/api/generate`, ttImage25MediaEditForm);
  const ttImage25MediaEditPayload = mediaGeneratePayloads.at(-1);
  assert.equal(ttImage25MediaEdit.images.length, 1);
  assert.equal(ttImage25MediaEditPayload.params.version, "flare");
  assert.equal(ttImage25MediaEditPayload.params.size, "3200x2560");
  assert.equal(ttImage25MediaEditPayload.params.aspect_ratio, undefined);
  assert.equal(ttImage25MediaEditPayload.params.resolution, undefined);
  assert.equal(ttImage25MediaEditPayload.params.images.length, 2);
  assert.match(ttImage25MediaEditPayload.params.images[0], /^data:image\/png;base64,/u);

  for (const responseFormat of ["base64", "url"]) {
    const nativeCreated = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", prompt: "native banana", model: "yunb21-smoke",
      size: "4:1", quality: "2K", bananaThinkingLevel: "high", responseFormat,
      extraParams: { stream: true, generationConfig: { thinkingConfig: { thinkingBudget: 2048 } } }
    });
    assert.equal(nativeCreated.images.length, 1);
    assert.match(nativeCreated.images[0].url, /^\/project-cache\//u);
    const payload = bananaNativePayloads.at(-1);
    assert.equal(payload.response_format, responseFormat);
    assert.equal(payload.stream, undefined);
    assert.deepEqual(payload.generationConfig.imageConfig, { aspectRatio: "4:1", imageSize: "2K" });
    assert.equal(payload.generationConfig.thinkingConfig.thinkingLevel, "high");
    assert.equal(payload.generationConfig.thinkingConfig.thinkingBudget, undefined);
    assert.deepEqual(payload.generationConfig.responseModalities, ["IMAGE", "TEXT"]);
    const nativeForm = new FormData();
    appendFields(nativeForm, { projectId: "ark-smoke", mode: "edit", prompt: "native multi reference", model: "yunb21-smoke", size: "1:8", quality: "4K", bananaThinkingLevel: "minimal", responseFormat });
    for (let i = 0; i < 2; i++) nativeForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), `native-${i}.png`);
    const nativeEdited = await postForm(`http://127.0.0.1:${appPort}/api/generate`, nativeForm);
    assert.equal(nativeEdited.images.length, 1);
    const editPayload = bananaNativePayloads.at(-1);
    assert.equal(editPayload.response_format, responseFormat);
    assert.equal(editPayload.generationConfig.imageConfig.aspectRatio, "1:8");
    assert.equal(editPayload.generationConfig.thinkingConfig.thinkingLevel, "minimal");
    assert.equal(editPayload.contents[0].parts.filter((part) => part.inlineData).length, 2);
    assert.equal(editPayload.contents[0].parts[1].inlineData.mimeType, "image/png");
  }
  for (const apiModel of ["gpt-image-2.6", "gpt-image-2.6-flare", "gpt-image-2.6-sunburst"]) {
    const model = `grsai-${apiModel}`;
    const generic = apiModel === "gpt-image-2.6";
    const generated = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", prompt: "Grsai 2.6 smoke", model,
      size: generic ? "16:9" : "3840x2160", quality: generic ? "auto" : "high", format: "gif",
      image26: { complexity: "high", frameCount: 16 }
    });
    assert.equal(generated.images.length, 1);
    assert.match(generated.images[0].filename, /\.gif$/u);
    const payload = grsai26Payloads.at(-1);
    assert.equal(payload.model, apiModel);
    assert.equal(payload.outputFormat, "gif");
    assert.equal(payload.replyType, "async");
    assert.equal(payload.aspectRatio, generic ? "16:9" : "3840x2160");
    for (const key of ["size", "imageSize", "output_format", "complexity", "frame_count", "response_format"]) assert.equal(payload[key], undefined);
    const form = new FormData();
    appendFields(form, { projectId: "ark-smoke", mode: "edit", prompt: "Grsai multi image", model, size: "1024x1024", quality: "auto", format: "png", background: "transparent" });
    for (let i = 0; i < 2; i++) form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), `grsai-ref-${i}.png`);
    const edited = await postForm(`http://127.0.0.1:${appPort}/api/generate`, form);
    assert.equal(edited.images.length, 1);
    assert.equal(grsai26Payloads.at(-1).images.length, 2);
    assert.equal(grsai26Payloads.at(-1).background, "transparent");
    assert.match(grsai26Payloads.at(-1).images[0], /^data:image\/png;base64,/u);
  }
  const grsaiSvg = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke", mode: "create", prompt: "Grsai SVG", model: "grsai-gpt-image-2.6", size: "1:1", format: "svg", extraParams: { replyType: "json" }
  });
  assert.match(grsaiSvg.images[0].filename, /\.svg$/u);
  assert.equal(grsai26Payloads.at(-1).replyType, "json");
  for (const patch of [
    { model: "grsai-gpt-image-2.6-flare", size: "16:9" },
    { model: "grsai-gpt-image-2.6-flare", quality: "max" },
    { model: "grsai-gpt-image-2.6-flare", format: "svg" },
    { model: "grsai-gpt-image-2.6", size: "2048x2048" }
  ]) {
    const count = grsai26Payloads.length;
    const response = await fetch(`http://127.0.0.1:${appPort}/api/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "create", prompt: "reject invalid Grsai options", ...patch }) });
    assert.equal(response.ok, false);
    await response.text();
    assert.equal(grsai26Payloads.length, count);
  }
  for (const quality of ["xhigh", "max"]) {
    await postJson(`http://127.0.0.1:${appPort}/api/generate`, { projectId: "ark-smoke", mode: "create", model: "grsai-gpt-image-2.6-sunburst", prompt: "Grsai Sunburst extended quality", quality, size: "2048x2048", format: "png" });
    assert.equal(grsai26Payloads.at(-1).quality, quality);
    const form = new FormData();
    appendFields(form, { projectId: "ark-smoke", mode: "edit", model: "grsai-gpt-image-2.6-sunburst", prompt: "Grsai Sunburst extended edit quality", quality, size: "1024x1024", format: "png" });
    form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "sunburst-extended.png");
    await postForm(`http://127.0.0.1:${appPort}/api/generate`, form);
    assert.equal(grsai26Payloads.at(-1).quality, quality);
  }
  await postJson(`http://127.0.0.1:${appPort}/api/generate`, { projectId: "ark-smoke", mode: "create", model: "nano-banana-2", prompt: "legacy Grsai unaffected", size: "16:9|2K" });
  const oldGrsai = grsai26Payloads.at(-1);
  assert.equal(oldGrsai.model, "nano-banana-2");
  assert.equal(oldGrsai.aspectRatio, "16:9");
  assert.equal(oldGrsai.imageSize, "2K");
  assert.equal(oldGrsai.replyType, "json");
  const googleConfig = (await getJson(`http://127.0.0.1:${appPort}/api/config`)).modelConnections["google-nano-banana-2.1"];
  assert.equal(googleConfig.apiModel, "gemini-nano-banana-2.1");
  assert.equal(googleConfig.baseUrl, "https://generativelanguage.googleapis.com");
  assert.equal(googleConfig.authType, "x-goog-api-key");
  assert.equal(googleConfig.imageEndpoint, "/v1beta/models/{model}:generateContent");
  assert.equal(googleConfig.hasKey, false);
  const missingGoogleKey = await fetch(`http://127.0.0.1:${appPort}/api/generate`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "create", prompt: "must not use relay key", model: "google-nano-banana-2.1" })
  });
  assert.equal(missingGoogleKey.status, 500);
  await missingGoogleKey.text();
  assert.equal(googleBananaNativePayloads.length, 0);
  for (const level of ["minimal", "medium", "high"]) {
    const googleResult = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model: "google-banana21-smoke", prompt: "official banana",
      bananaThinkingLevel: level, bananaWebSearch: level !== "minimal",
      extraParams: { response_format: "url", replyType: "json" }
    });
    assert.equal(googleResult.images.length, 1);
    const payload = googleBananaNativePayloads.at(-1);
    assert.deepEqual(payload.generationConfig.imageConfig, { aspectRatio: "1:1", imageSize: "1K" });
    assert.equal(payload.generationConfig.thinkingConfig.thinkingLevel, level);
    assert.equal(payload.response_format, undefined);
    assert.equal(payload.replyType, undefined);
    assert.deepEqual(payload.tools, level === "minimal" ? undefined : [{ googleSearch: {} }]);
  }
  const googleEditForm = new FormData();
  appendFields(googleEditForm, { projectId: "ark-smoke", mode: "edit", model: "google-banana21-smoke", prompt: "official edit", size: "3:4", quality: "2K", bananaThinkingLevel: "medium", bananaWebSearch: false });
  googleEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "google-reference.png");
  assert.equal((await postForm(`http://127.0.0.1:${appPort}/api/generate`, googleEditForm)).images.length, 1);
  assert.equal(googleBananaNativePayloads.at(-1).contents[0].parts.filter((part) => part.inlineData).length, 1);
  for (let i = 0; i < 14; i++) googleEditForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), `overflow-${i}.png`);
  const googleOverflow = await fetch(`http://127.0.0.1:${appPort}/api/generate`, { method: "POST", body: googleEditForm });
  assert.equal(googleOverflow.status, 400);
  await googleOverflow.text();
  assert.equal(googleBananaNativePayloads.length, 4);
  for (const [model, apiModel] of [["banana2.1", "banana-2.1"], ["banana2.1官", "banana-2.1-token"]]) {
    const created = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", prompt: "Banana 2.1 search and thinking smoke", model,
      size: "4:5", quality: "2K", bananaWebSearch: true, bananaThinkingLevel: "high", format: "png",
      extraParams: { notify_url: "https://example.com/banana-hook", params: { web_search: false, thinkingLevel: "minimal", aspectRatio: "1:1" } }
    });
    assert.equal(created.images.length, 1);
    assert.equal(created.request.provider, "media-generate");
    const createPayload = mediaGeneratePayloads.at(-1);
    assert.equal(createPayload.model, apiModel);
    assert.equal(createPayload.notify_url, "https://example.com/banana-hook");
    assert.equal(createPayload.params.web_search, true);
    assert.equal(createPayload.params.thinkingLevel, "high");
    assert.equal(createPayload.params.aspectRatio, "4:5");
    assert.equal(createPayload.params.imageSize, "2K");
    assert.equal(createPayload.params.n, 1);
    assert.equal(createPayload.params.size, undefined);
    assert.equal(createPayload.params.aspect_ratio, undefined);
    assert.equal(createPayload.params.images, undefined);
    assert.equal(createPayload.web_search, undefined);
    assert.equal(createPayload.thinkingLevel, undefined);

    const form = new FormData();
    appendFields(form, {
      projectId: "ark-smoke", mode: "edit", prompt: "Banana 2.1 multipart references", model,
      size: "1:8", quality: "1K", bananaWebSearch: "false", bananaThinkingLevel: "minimal", format: "png", extraParams: "{}"
    });
    for (let i = 0; i < 14; i++) {
      form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), `banana-ref-${i}.png`);
    }
    const edited = await postForm(`http://127.0.0.1:${appPort}/api/generate`, form);
    assert.equal(edited.images.length, 1);
    const editPayload = mediaGeneratePayloads.at(-1);
    assert.equal(editPayload.params.web_search, false);
    assert.equal(editPayload.params.thinkingLevel, "minimal");
    assert.equal(editPayload.params.aspectRatio, "1:8");
    assert.equal(editPayload.params.imageSize, "1K");
    assert.equal(editPayload.params.images.length, 14);
    assert.match(editPayload.params.images[13], /^data:image\/png;base64,/u);
    form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "banana-ref-over-limit.png");
    const submittedBeforeLimitCheck = mediaGeneratePayloads.length;
    const tooManyReferences = await fetch(`http://127.0.0.1:${appPort}/api/generate`, { method: "POST", body: form });
    assert.equal(tooManyReferences.status, 400);
    assert.match((await tooManyReferences.json()).error, /14 张参考图片/u);
    assert.equal(mediaGeneratePayloads.length, submittedBeforeLimitCheck);

    const cacheForm = new FormData();
    cacheForm.append("projectId", "ark-smoke");
    cacheForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "banana-cached-reference.png");
    const cachedReference = await postForm(`http://127.0.0.1:${appPort}/api/cache-assets`, cacheForm);
    const cachedEdit = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "edit", prompt: "Banana 2.1 cached canvas reference", model,
      cachedImages: cachedReference.assets, size: "16:9", quality: "4K",
      bananaWebSearch: "true", bananaThinkingLevel: "high", format: "png"
    });
    assert.equal(cachedEdit.images.length, 1);
    assert.equal(mediaGeneratePayloads.at(-1).params.images.length, 1);
    assert.equal(mediaGeneratePayloads.at(-1).params.web_search, true);
    assert.equal(mediaGeneratePayloads.at(-1).params.thinkingLevel, "high");
  }

  const bananaDefaults = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke", mode: "create", prompt: "Banana defaults", model: "banana2.1", format: "png"
  });
  assert.equal(bananaDefaults.images.length, 1);
  assert.equal(mediaGeneratePayloads.at(-1).params.web_search, false);
  assert.equal(mediaGeneratePayloads.at(-1).params.thinkingLevel, "minimal");

  for (const model of ["gpt-image-2.6-sunburst", "gpt-image-2.6-flare"]) {
    const created26 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model, prompt: "Image 2.6 create", size: "1536x1024", quality: "xhigh",
      format: "webp", background: "transparent", moderation: "low", responseFormat: "url", image26: { complexity: "low" }
    });
    assert.equal(created26.images.length, 1);
    const payload = gptImage26CreatePayloads.at(-1);
    assert.equal(payload.model, model);
    assert.equal(payload.output_format, "webp");
    assert.equal(payload.format, undefined);
    assert.equal(payload.complexity, "low");
    assert.equal(payload.quality, "xhigh");
    assert.equal(payload.moderation, "low");
    assert.equal(payload.response_format, "url");

    const svg26 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model, prompt: "Image 2.6 SVG", format: "svg",
      image26: { svgModel: "gpt-6-luna", svgReasoning: "low" }
    });
    assert.match(svg26.images[0].filename, /\.svg$/u);
    assert.deepEqual(gptImage26CreatePayloads.at(-1).svg, { model: "gpt-6-luna", reasoning: { effort: "low" } });
    const savedSvg = await fetch(`http://127.0.0.1:${appPort}${svg26.images[0].url}`);
    assert.equal(await savedSvg.text(), svgFixture);

    const gif26 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model, prompt: "Image 2.6 GIF", format: "gif", size: "1024x1024",
      image26: { frameCount: 6, frameDurationMs: 300, complexity: "high" }
    });
    assert.match(gif26.images[0].filename, /\.gif$/u);
    assert.equal(gptImage26CreatePayloads.at(-1).frame_count, 6);
    assert.equal(gptImage26CreatePayloads.at(-1).frame_duration_ms, 300);
    assert.deepEqual(Buffer.from(await (await fetch(`http://127.0.0.1:${appPort}${gif26.images[0].url}`)).arrayBuffer()), gifFixture);

    const edit26Form = new FormData();
    appendFields(edit26Form, { projectId: "ark-smoke", mode: "edit", model, prompt: "Image 2.6 markup edit", size: "1024x1024", quality: "max", format: "webp", responseFormat: "url", image26: JSON.stringify({ complexity: "low", imageGuideMode: "markup" }) });
    edit26Form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "input.png");
    edit26Form.append("mask", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "markup.png");
    const edited26 = await postForm(`http://127.0.0.1:${appPort}/api/generate`, edit26Form);
    assert.equal(edited26.images.length, 1);
    assert.match(openAiEditBody, /name="markup"; filename="markup.png"/u);
    assert.doesNotMatch(openAiEditBody, /name="mask";/u);
    assert.match(openAiEditBody, /name="output_format"\r\n\r\nwebp\r\n/u);
    assert.match(openAiEditBody, /name="complexity"\r\n\r\nlow\r\n/u);
    assert.match(openAiEditBody, /name="response_format"\r\n\r\nurl\r\n/u);
    assert.doesNotMatch(openAiEditBody, /name="format"\r\n/u);
  }

  for (const model of ["tt-image-2.6", "tt-image-2.6-guan"]) {
    const created26 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model, prompt: "TT 2.6 media generate", size: "auto", format: "webp",
      quality: "max", ttImageVersion: "sunburst", ttImageAspectRatio: "16:9", ttImageResolution: "4K", background: "transparent",
      image26: { complexity: "high" }
    });
    assert.equal(created26.images.length, 1);
    const payload = mediaGeneratePayloads.at(-1);
    assert.equal(payload.model, model);
    assert.equal(payload.params.version, "sunburst");
    assert.equal(payload.params.aspect_ratio, "16:9");
    assert.equal(payload.params.resolution, "4K");
    assert.equal(payload.params.output_format, "webp");
    assert.equal(payload.params.complexity, "high");
    assert.equal(payload.params.background, "transparent");
    assert.equal(payload.params.quality, "max");

    const gif26 = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
      projectId: "ark-smoke", mode: "create", model, prompt: "TT GIF", size: "3840x2160", format: "gif",
      ttImageAspectRatio: "16:9", ttImageResolution: "4K", image26: { frameCount: 12, frameDurationMs: 500 }
    });
    assert.match(gif26.images[0].filename, /\.gif$/u);
    assert.equal(mediaGeneratePayloads.at(-1).params.size, undefined);
    assert.equal(mediaGeneratePayloads.at(-1).params.aspect_ratio, undefined);
    assert.equal(mediaGeneratePayloads.at(-1).params.resolution, undefined);
    assert.equal(mediaGeneratePayloads.at(-1).params.frame_count, 12);
    assert.equal(mediaGeneratePayloads.at(-1).params.frame_duration_ms, 500);
    assert.equal(mediaGeneratePayloads.at(-1).params.complexity, "medium");

    const edit26 = new FormData();
    appendFields(edit26, { projectId: "ark-smoke", mode: "edit", model, prompt: "TT 16 image edit", format: "png", size: "1280x720", image26: JSON.stringify({ complexity: "low" }) });
    for (let i = 0; i < 16; i++) edit26.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), `ref-${i}.png`);
    await postForm(`http://127.0.0.1:${appPort}/api/generate`, edit26);
    assert.equal(mediaGeneratePayloads.at(-1).params.images.length, 16);
    assert.equal(mediaGeneratePayloads.at(-1).params.size, "1280x720");
    assert.equal(mediaGeneratePayloads.at(-1).params.complexity, "low");
    edit26.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "excess.png");
    const overflow = await fetch(`http://127.0.0.1:${appPort}/api/generate`, { method: "POST", body: edit26 });
    assert.equal(overflow.status, 400);
  }

  const ttSvg = await postJson(`http://127.0.0.1:${appPort}/api/generate`, {
    projectId: "ark-smoke", mode: "create", model: "tt-image-2.6", prompt: "TT SVG", format: "svg"
  });
  assert.match(ttSvg.images[0].filename, /\.svg$/u);
  for (const request of [
    { model: "tt-image-2.6-guan", format: "svg" },
    { model: "gpt-image-2.6-flare", format: "svg" },
    { model: "gpt-image-2.6-sunburst", format: "gif", image26: { frameCount: 17 } },
    { model: "tt-image-2.6", format: "gif", image26: { frameCount: 3 } }
  ]) {
    const countBefore = gptImage26CreatePayloads.length + mediaGeneratePayloads.length;
    const rejected = await fetch(`http://127.0.0.1:${appPort}/api/generate`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...request, mode: "create", projectId: "ark-smoke", prompt: "must reject before billing" })
    });
    assert.equal(rejected.status, 400, JSON.stringify(await rejected.json()));
    assert.equal(gptImage26CreatePayloads.length + mediaGeneratePayloads.length, countBefore);
  }

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

  const interactiveForm = new FormData();
  appendFields(interactiveForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "interactive",
    prompt: "只修改 <bbox>100 120 760 880</bbox> 内的衣服颜色",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "1.5K",
    quality: "fast",
    background: "transparent",
    format: "jpeg",
    extraParams: JSON.stringify({ layer_decomposition: true, stream: true })
  });
  interactiveForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "interactive-reference.png");
  const interactive = await postForm(`http://127.0.0.1:${appPort}/api/generate`, interactiveForm);
  const interactivePayload = arkImagePayloads.at(-1);
  assert.equal(interactive.images.length, 1);
  assert.match(interactivePayload.prompt, /<bbox>100 120 760 880<\/bbox>/u);
  assert.equal(interactivePayload.size, "1.5K");
  assert.equal(interactivePayload.background, "transparent");
  assert.equal(interactivePayload.output_format, "png");
  assert.equal(interactivePayload.layer_decomposition, undefined);
  assert.equal(interactivePayload.stream, undefined);

  const fusionForm = new FormData();
  appendFields(fusionForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "fusion",
    prompt: "把图 1 的主体放进图 2 的场景",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "2K",
    quality: "standard",
    format: "png",
    extraParams: "{}"
  });
  fusionForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "fusion-1.png");
  fusionForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "fusion-2.png");
  const fusion = await postForm(`http://127.0.0.1:${appPort}/api/generate`, fusionForm);
  const fusionPayload = arkImagePayloads.at(-1);
  assert.equal(fusion.images.length, 1);
  assert.equal(Array.isArray(fusionPayload.image), true);
  assert.equal(fusionPayload.image.length, 2);
  assert.equal(fusionPayload.layer_decomposition, undefined);

  const layerForm = new FormData();
  appendFields(layerForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "layers",
    prompt: "",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "1.5K",
    format: "png",
    extraParams: JSON.stringify({ layer_decomposition: false })
  });
  layerForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "layer-source.png");
  const layers = await postForm(`http://127.0.0.1:${appPort}/api/generate`, layerForm);
  const layerPayload = arkImagePayloads.at(-1);
  assert.equal(layerPayload.layer_decomposition, true);
  assert.equal(layerPayload.size, "1.5K");
  assert.equal(typeof layerPayload.image, "string");
  assert.equal(layers.images.length, 3);
  assert.deepEqual(layers.images.map((item) => item.zIndex), [0, 1, 2]);
  assert.equal(layers.images[1].layerName, "main_character");
  assert.deepEqual(layers.images[1].boundingBox.absolute, [120, 240, 760, 1140]);

  const autoLayerForm = new FormData();
  appendFields(autoLayerForm, {
    projectId: "ark-smoke",
    mode: "create",
    seedreamMode: "standard",
    prompt: "",
    model: "seedream-v5-pro/layer-decomposition",
    n: "1",
    size: "auto",
    format: "png",
    extraParams: "{}"
  });
  autoLayerForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "auto-layer-source.png");
  const autoLayers = await postForm(`http://127.0.0.1:${appPort}/api/generate`, autoLayerForm);
  const autoLayerPayload = arkImagePayloads.at(-1);
  assert.equal(autoLayerPayload.model, "seedream-v5-pro/layer-decomposition");
  assert.equal(autoLayerPayload.layer_decomposition, true);
  assert.equal(autoLayerPayload.size, "auto");
  assert.equal(typeof autoLayerPayload.image, "string");
  assert.equal(autoLayers.images.length, 3);

  const openAiLayerForm = new FormData();
  appendFields(openAiLayerForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "layers",
    prompt: "",
    model: "seedream-v5-pro-zhenzhen-layer-decomposition",
    n: "1",
    size: "auto",
    format: "png",
    extraParams: "{}"
  });
  openAiLayerForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "zhenzhen-layer.png");
  const openAiLayers = await postForm(`http://127.0.0.1:${appPort}/api/generate`, openAiLayerForm);
  assert.equal(openAiLayers.images.length, 2);
  assert.match(openAiEditContentType, /^multipart\/form-data;\s*boundary=/iu);
  assert.match(openAiEditBody, /name="image";\s*filename="zhenzhen-layer\.png"/iu);
  assert.match(openAiEditBody, /name="model"\r?\n\r?\nseedream-v5-pro\/layer-decomposition/iu);
  assert.match(openAiEditBody, /name="layer_decomposition"\r?\n\r?\ntrue/iu);

  const autoFusionForm = new FormData();
  appendFields(autoFusionForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "fusion",
    prompt: "按画布构图融合两张图片",
    model: "seedream-v5-pro/layer-decomposition",
    n: "1",
    size: "2K",
    format: "png",
    extraParams: "{}"
  });
  autoFusionForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "auto-fusion-1.png");
  autoFusionForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "auto-fusion-2.png");
  const autoFusion = await postForm(`http://127.0.0.1:${appPort}/api/generate`, autoFusionForm);
  const autoFusionPayload = arkImagePayloads.at(-1);
  assert.equal(autoFusionPayload.model, "seedream-v5-pro/layer-decomposition");
  assert.equal(autoFusionPayload.layer_decomposition, undefined);
  assert.equal(Array.isArray(autoFusionPayload.image), true);
  assert.equal(autoFusionPayload.image.length, 2);
  assert.equal(autoFusion.images.length, 1);

  const transparentMultiForm = new FormData();
  appendFields(transparentMultiForm, {
    projectId: "ark-smoke",
    mode: "edit",
    seedreamMode: "interactive",
    prompt: "透明背景编辑",
    model: "ark-seedream-5.0-pro",
    n: "1",
    size: "2K",
    background: "transparent",
    format: "png",
    extraParams: "{}"
  });
  transparentMultiForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "transparent-1.png");
  transparentMultiForm.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "transparent-2.png");
  const transparentMultiResponse = await fetch(`http://127.0.0.1:${appPort}/api/generate`, {
    method: "POST",
    body: transparentMultiForm
  });
  const transparentMultiError = await transparentMultiResponse.json();
  assert.equal(transparentMultiResponse.status, 400);
  assert.match(transparentMultiError.error, /透明背景编辑仅支持 1 张参考图片/u);

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

  const video25Form = new FormData();
  appendFields(video25Form, {
    projectId: "ark-smoke",
    mode: "video",
    prompt: "test seedance 2.5",
    model: "ark-seedance-2.5",
    n: "30",
    size: "21:9",
    quality: "1080p",
    format: "mp4",
    extraParams: JSON.stringify({ generate_audio: false })
  });
  const video25 = await postForm(`http://127.0.0.1:${appPort}/api/generate`, video25Form);
  assert.equal(video25.request.payload.duration, 30);
  assert.equal(video25.request.payload.resolution, "1080p");
  assert.equal(video25.request.payload.ratio, "21:9");
  assert.equal(video25.request.payload.output_format, "mp4");
  assert.equal(video25.request.videoMode, "text");
  assert.equal(lastVideoPayload.model, "doubao-seedance-2-5-260628");
  assert.equal(lastVideoPayload.generate_audio, false);

  const multimodal25Form = new FormData();
  appendFields(multimodal25Form, {
    projectId: "ark-smoke",
    mode: "video",
    videoMode: "reference",
    prompt: "test seedance 2.5 multimodal reference",
    model: "ark-seedance-2.5",
    n: "12",
    size: "16:9",
    quality: "1080p",
    format: "mp4",
    extraParams: JSON.stringify({ generate_audio: true })
  });
  multimodal25Form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "reference.png");
  multimodal25Form.append("video", new Blob([Buffer.from("seedance-reference-video")], { type: "video/mp4" }), "reference.mp4");
  multimodal25Form.append("audio", new Blob([Buffer.from("seedance-reference-audio")], { type: "audio/mpeg" }), "reference.mp3");
  const multimodal25 = await postForm(`http://127.0.0.1:${appPort}/api/generate`, multimodal25Form);
  assert.equal(multimodal25.request.videoMode, "reference");
  assert.deepEqual(lastVideoPayload.content.slice(1).map((item) => item.role), [
    "reference_image",
    "reference_video",
    "reference_audio"
  ]);
  assert.match(lastVideoPayload.content[1].image_url.url, /^data:image\/png;base64,/u);
  assert.match(lastVideoPayload.content[2].video_url.url, /^data:video\/mp4;base64,/u);
  assert.match(lastVideoPayload.content[3].audio_url.url, /^data:audio\/mpeg;base64,/u);

  const frames25Form = new FormData();
  appendFields(frames25Form, {
    projectId: "ark-smoke",
    mode: "video",
    videoMode: "frames",
    prompt: "test seedance 2.5 first and last frames",
    model: "ark-seedance-2.5",
    n: "8",
    size: "16:9",
    quality: "720p",
    format: "mp4",
    extraParams: "{}"
  });
  frames25Form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "first.png");
  frames25Form.append("image", new Blob([Buffer.from(pngBase64, "base64")], { type: "image/png" }), "last.png");
  await postForm(`http://127.0.0.1:${appPort}/api/generate`, frames25Form);
  assert.deepEqual(lastVideoPayload.content.slice(1).map((item) => item.role), ["first_frame", "last_frame"]);
  assert.equal(lastVideoPayload.ratio, "adaptive");

  const edit25Form = new FormData();
  appendFields(edit25Form, {
    projectId: "ark-smoke",
    mode: "video",
    videoMode: "edit",
    prompt: "test seedance 2.5 video edit",
    model: "ark-seedance-2.5",
    n: "20",
    size: "9:16",
    quality: "1080p",
    format: "mov",
    extraParams: "{}"
  });
  edit25Form.append("video", new Blob([Buffer.from("seedance-edit-video")], { type: "video/mp4" }), "edit.mp4");
  const edit25 = await postForm(`http://127.0.0.1:${appPort}/api/generate`, edit25Form);
  assert.equal(edit25.request.videoMode, "edit");
  assert.equal(lastVideoPayload.content[1].role, "reference_video");
  assert.equal(lastVideoPayload.duration, -1);
  assert.equal(lastVideoPayload.ratio, "adaptive");
  assert.equal(lastVideoPayload.output_format, "mov");

  const extend25Form = new FormData();
  appendFields(extend25Form, {
    projectId: "ark-smoke",
    mode: "video",
    videoMode: "extend",
    prompt: "test seedance 2.5 video extension",
    model: "ark-seedance-2.5",
    n: "30",
    size: "9:16",
    quality: "1080p",
    format: "mov",
    extraParams: "{}"
  });
  extend25Form.append("video", new Blob([Buffer.from("seedance-extend-video")], { type: "video/mp4" }), "extend.mp4");
  const extend25 = await postForm(`http://127.0.0.1:${appPort}/api/generate`, extend25Form);
  assert.equal(extend25.request.videoMode, "extend");
  assert.equal(lastVideoPayload.duration, 30);
  assert.equal(lastVideoPayload.ratio, "adaptive");
  assert.equal(lastVideoPayload.output_format, "mov");

  console.log(JSON.stringify({
    ok: true,
    arkModelCount: config.arkModels.length,
    assetGroupCount: assetGroups.items.length,
    createdAssetGroupId: createdAssetGroup.item.groupId,
    assetLibraryCount: assetLibrary.items.length,
    downloadedAssetUri: downloadedAsset.arkAsset.assetUri,
    gptImageFallback: `${gptImage.fallback.from}->${gptImage.fallback.to}`,
    grokImagineJsonEdit: grokEditContentType,
    imageCount: image.images.length,
    migratedImageSize: migratedImage.request.payload.size,
    mediaGenerateModel: mediaGeneratePayloads[0].model,
    editImageCount: edit.images.length,
    fusionReferenceCount: fusionPayload.image.length,
    decomposedLayerCount: layers.images.length,
    autoDetectedLayerChannel: autoLayerPayload.layer_decomposition,
    openAiLayerMultipart: openAiEditContentType.startsWith("multipart/form-data;"),
    sharedChannelFusionReferences: autoFusionPayload.image.length,
    seedance25MultimodalRoles: multimodal25.request.payload.content.slice(1).map((item) => item.role),
    seedance25EditDuration: edit25.request.payload.duration,
    seedance25ExtendDuration: extend25.request.payload.duration,
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

function readBuffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks)));
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
