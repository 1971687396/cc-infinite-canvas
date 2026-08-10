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
const mediaGeneratePayloads = [];
const mediaGeneratePolls = new Map();
const gptCreateModels = [];

const mock = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
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
      assert.equal(payload.Name, "新角色");
      assert.equal(payload.Title, "新角色");
      assert.equal(payload.GroupType, "AIGC");
      assert.equal(payload.ProjectName, "default");
      sendJson(res, { Result: { Id: "group-created", Name: payload.Name, GroupType: payload.GroupType } });
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
      gptCreateModels.push(payload.model);
      if (payload.model === "gpt-image-2") {
        res.statusCode = 400;
        return sendJson(res, { error: { message: "Unknown model: gpt-image-2 (request id: fallback-smoke)" } });
      }
      assert.equal(payload.model, "gpt-image-2-c");
      return sendJson(res, { data: [{ b64_json: pngBase64 }] });
    });
  }
  if (req.method === "POST" && req.url === "/api/v3/images/generations") {
    return readJson(req).then((payload) => sendJson(res, {
      data: [{ b64_json: pngBase64, size: payload.size, output_format: "png" }]
    }));
  }
  if (req.method === "POST" && req.url === "/v1/media/generate") {
    return readJson(req).then((payload) => {
      mediaGeneratePayloads.push(payload);
      const taskId = 900000 + mediaGeneratePayloads.length;
      return sendJson(res, {
        code: 200,
        msg: "任务创建成功",
        data: {
          "任务ids": [taskId],
          "成功数量": 1,
          task_id: taskId
        }
      });
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
      result_url: `http://127.0.0.1:${address.port}/media-result`
    });
  }
  if (req.method === "GET" && req.url === "/media-result") {
    res.setHeader("Content-Type", "image/png");
    res.end(Buffer.from(pngBase64, "base64"));
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
    VOLCENGINE_ARK_ASSET_GROUP_ID: "group-smoke",
    VOLCENGINE_ARK_OPEN_API_BASE_URL: `http://127.0.0.1:${mockPort}`,
    VOLCENGINE_ARK_BASE_URL: `http://127.0.0.1:${mockPort}`,
    CC_CANVAS_ALLOW_LOCAL_ARK_ASSET_URLS: "1",
    CC_CANVAS_MEDIA_POLL_INTERVAL_MS: "10",
    CC_CANVAS_MEDIA_POLL_TIMEOUT_MS: "2000",
    YUNWU_MODEL_KEY_GPT_IMAGE_2: "smoke-gpt-image-key",
    CC_CANVAS_MODEL_CONNECTIONS_B64: Buffer.from(JSON.stringify(connections), "utf8").toString("base64url")
  },
  stdio: ["ignore", "pipe", "pipe"]
});

try {
  const appPort = await waitForCanvasPort(child);
  const config = await getJson(`http://127.0.0.1:${appPort}/api/config`);
  assert.equal(config.hasArkApiKey, true);
  assert.equal(config.arkModels.length, 8);
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].protocol, "media-generate");
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].imageEndpoint, "/v1/media/generate");
  assert.equal(config.modelConnections["seedream5.0pro-aggregate"].editEndpoint, "/v1/media/generate");

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
  assert.match(mediaGeneratePayloads[1].params.images[0], /^data:image\/png;base64,/u);
  assert.equal(mediaGeneratePolls.get("900002"), 2);

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
  assert.equal(video25.request.payload.resolution, "720p");
  assert.equal(video25.request.payload.ratio, "21:9");
  assert.equal(lastVideoPayload.model, "doubao-seedance-2-5-260628");
  assert.equal(lastVideoPayload.generate_audio, false);

  console.log(JSON.stringify({
    ok: true,
    arkModelCount: config.arkModels.length,
    assetGroupCount: assetGroups.items.length,
    createdAssetGroupId: createdAssetGroup.item.groupId,
    assetLibraryCount: assetLibrary.items.length,
    downloadedAssetUri: downloadedAsset.arkAsset.assetUri,
    gptImageFallback: `${gptImage.fallback.from}->${gptImage.fallback.to}`,
    imageCount: image.images.length,
    migratedImageSize: migratedImage.request.payload.size,
    mediaGenerateModel: mediaGeneratePayloads[0].model,
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
