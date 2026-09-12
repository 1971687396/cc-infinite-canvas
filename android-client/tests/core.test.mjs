import test from "node:test";
import assert from "node:assert/strict";
import {
  buildApiUrl,
  buildChatPayload,
  defaultSettings,
  extractImageToolCalls,
  extractTaskId,
  generateImageWithConnection,
  imageSizingProfile,
  normalizeSettings,
  openAiImageSizingPayload,
  resolveModelConnection,
  resolveRuntimeSettings,
  resolveImageSizing,
  settingsNeedMigration,
  shouldOfferImageTool,
  taskIsFinal
} from "../src/core.js";

test("normalizes settings and API URLs", () => {
  const settings = normalizeSettings({ chat: { model: "custom-chat" } });
  const runtime = resolveRuntimeSettings(settings);
  assert.equal(runtime.chat.model, "custom-chat");
  assert.equal(runtime.image.model, defaultSettings.models.find((model) => model.type === "image").model);
  assert.equal(buildApiUrl("https://api.example.com/", "/v1/chat/completions"), "https://api.example.com/v1/chat/completions");
});

test("migrates legacy connections into provider and model libraries", () => {
  const legacy = {
    version: 1,
    chat: { baseUrl: "https://gateway.example.com", endpoint: "/chat", model: "chat-a", authType: "bearer" },
    image: { baseUrl: "https://gateway.example.com", endpoint: "/images", model: "image-a", authType: "bearer", size: "2K", aspectRatio: "9:16" }
  };
  assert.equal(settingsNeedMigration(legacy), true);
  const migrated = normalizeSettings(legacy);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.providers.length, 1);
  assert.equal(migrated.models.length, 2);
  assert.equal(resolveModelConnection(migrated, "chat").connection.endpoint, "/chat");
  assert.equal(resolveModelConnection(migrated, "image").connection.endpoint, "/images");
});

test("builds chat payload with image generation tool", () => {
  const payload = buildChatPayload([{ role: "user", content: "画一张海报" }], normalizeSettings());
  assert.equal(payload.tools[0].function.name, "generate_image");
  assert.equal(payload.tool_choice, "auto");

  const fallback = buildChatPayload(
    [{ role: "user", content: "画一张海报" }],
    normalizeSettings(),
    { tools: false, toolFallback: true }
  );
  assert.equal(fallback.tools, undefined);
  assert.match(fallback.messages[0].content, /JSON 对象/u);
  assert.match(fallback.messages[0].content, /generate_image/u);
});

test("offers image generation only for explicit image requests", () => {
  assert.equal(shouldOfferImageTool("1"), false);
  assert.equal(shouldOfferImageTool("你好，介绍一下你自己"), false);
  assert.equal(shouldOfferImageTool("解释一下生图模型的区别"), false);
  assert.equal(shouldOfferImageTool("不要生成图片，只讨论提示词"), false);
  assert.equal(shouldOfferImageTool("帮我生成一张 16:9 的电影海报"), true);
  assert.equal(shouldOfferImageTool("把这张图片改成雨夜场景"), true);
});

test("extracts native and JSON fallback image calls", () => {
  const native = extractImageToolCalls({
    tool_calls: [{ id: "call-1", function: { name: "generate_image", arguments: "{\"prompt\":\"雨夜街道\"}" } }]
  });
  assert.equal(native[0].args.prompt, "雨夜街道");
  const fallback = extractImageToolCalls({ content: "```json\n{\"tool\":\"generate_image\",\"prompt\":\"雪山\"}\n```" });
  assert.equal(fallback[0].args.prompt, "雪山");
});

test("adapts sizing to the selected image model", () => {
  const migrated = normalizeSettings({ image: { model: "gpt-image-2", size: "2K", aspectRatio: "9:16" } });
  const migratedImage = resolveRuntimeSettings(migrated).image;
  assert.equal(migratedImage.size, "1152x2048");
  assert.equal(migratedImage.aspectRatio, "");

  const arbitraryGptSize = resolveImageSizing({ model: "gpt-image-2", size: "1600x1200" });
  assert.equal(arbitraryGptSize.size, "1600x1200");

  const banana = resolveImageSizing({ model: "banana2", size: "4k", aspectRatio: "16:9" });
  assert.deepEqual(openAiImageSizingPayload("banana2", banana), { image_size: "4K", aspect_ratio: "16:9" });
  assert.equal(imageSizingProfile("doubao-seedream-5-0-lite-260628", "media-generate").defaultSize, "2K");
});

test("sends GPT Image 2 compatible pixel sizing and format", async () => {
  const settings = normalizeSettings({ image: { model: "gpt-image-2", size: "1024x1024", aspectRatio: "" } });
  let submitted;
  const result = await generateImageWithConnection({
    settings,
    apiKey: "secret",
    args: { prompt: "电影感女孩肖像", size: "2K" },
    request: async ({ data }) => {
      submitted = data;
      return { data: [{ url: "https://cdn.example.com/gpt-image.png" }] };
    },
    sleep: async () => {}
  });
  assert.equal(submitted.size, "2048x2048");
  assert.equal(submitted.format, "png");
  assert.equal(submitted.response_format, undefined);
  assert.equal(result.url, "https://cdn.example.com/gpt-image.png");
});

test("uses numeric nested task id and waits for is_final", async () => {
  const settings = normalizeSettings({
    image: {
      baseUrl: "https://api.example.com",
      endpoint: "/v1/media/generate",
      statusEndpoint: "/v1/media/status",
      model: "doubao-seedream-5-0-pro-260628",
      protocol: "media-generate",
      size: "2K",
      aspectRatio: "9:16"
    }
  });
  let polls = 0;
  const request = async ({ method, url, data }) => {
    if (method === "POST") {
      assert.equal(data.params.aspect_ratio, "9:16");
      return { code: 200, data: { task_id: 123456 } };
    }
    assert.match(url, /task_id=123456/u);
    polls += 1;
    if (polls === 1) return { task_id: 123456, state: "success", is_final: false, result_url: "" };
    return { task_id: 123456, state: "success", is_final: true, result_url: "https://cdn.example.com/result.png" };
  };
  const result = await generateImageWithConnection({
    settings,
    apiKey: "secret",
    args: { prompt: "竖屏人物海报" },
    request,
    sleep: async () => {}
  });
  assert.equal(result.url, "https://cdn.example.com/result.png");
  assert.equal(polls, 2);
  assert.equal(extractTaskId({ data: { task_id: 123456 } }), "123456");
  assert.equal(taskIsFinal({ state: "success", is_final: false }), false);
});
