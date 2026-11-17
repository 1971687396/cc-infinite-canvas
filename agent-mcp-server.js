#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  agentControlRequest,
  cacheLocalAsset,
  ensureCanvasAgentService,
  publicAgentConnection
} from "./agent-control-client.js";

const nodeSpecSchema = z.object({
  kind: z.enum(["note", "image_task", "video_task", "image", "video", "raw"])
    .describe("High-level node kind. Use raw only for a node schema already supported by cc Infinite Canvas."),
  id: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  z: z.number().optional(),
  text: z.string().optional(),
  prompt: z.string().optional(),
  model: z.string().optional(),
  mode: z.enum(["create", "edit"]).optional(),
  size: z.string().optional(),
  quality: z.string().optional(),
  format: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional()
}).passthrough();

export function createCanvasMcpServer() {
  const server = new McpServer(
    { name: "cc-infinite-canvas", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  registerTool(server, "canvas_status", {
    title: "Canvas service status",
    description: "Start or connect to cc Infinite Canvas in the background and return the available Agent Control capabilities.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, async () => {
    const connection = await ensureCanvasAgentService();
    const status = await agentControlRequest("/status");
    return { ...status, connection: publicAgentConnection(connection) };
  });

  registerTool(server, "list_canvas_projects", {
    title: "List canvas projects",
    description: "List all cc Infinite Canvas projects with ids, names, modification times and node counts.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, () => agentControlRequest("/projects"));

  registerTool(server, "get_canvas_project", {
    title: "Read a canvas project",
    description: "Read project metadata and, by default, its full node graph. Use this before editing an existing canvas.",
    inputSchema: z.object({
      project_id: z.string().describe("Canvas project id from list_canvas_projects."),
      include_nodes: z.boolean().optional().default(true)
    }),
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, ({ project_id, include_nodes }) => agentControlRequest(
    `/projects/${encodeURIComponent(project_id)}?includeNodes=${include_nodes !== false}`
  ));

  registerTool(server, "create_canvas_project", {
    title: "Create a canvas project",
    description: "Create a new persistent cc Infinite Canvas project. The result appears in the desktop project list.",
    inputSchema: z.object({
      name: z.string().min(1),
      project_id: z.string().optional().describe("Optional stable id; an id is generated when omitted."),
      grok_project_memory: z.boolean().optional().default(false)
    }),
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false }
  }, ({ name, project_id, grok_project_memory }) => agentControlRequest("/projects", {
    method: "POST",
    body: { id: project_id, name, grokProjectMemory: grok_project_memory }
  }));

  registerTool(server, "update_canvas_project", {
    title: "Update canvas project metadata",
    description: "Rename a canvas, change its viewport, or toggle Grok project memory without replacing its nodes.",
    inputSchema: z.object({
      project_id: z.string(),
      name: z.string().min(1).optional(),
      viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number().positive() }).optional(),
      grok_project_memory: z.boolean().optional()
    }),
    annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, ({ project_id, name, viewport, grok_project_memory }) => agentControlRequest(`/projects/${encodeURIComponent(project_id)}`, {
    method: "PATCH",
    body: { name, viewport, grokProjectMemory: grok_project_memory }
  }));

  registerTool(server, "list_canvas_nodes", {
    title: "List or search canvas nodes",
    description: "List nodes in a project, optionally filtering by node type or searching prompt/text/model/id fields.",
    inputSchema: z.object({
      project_id: z.string(),
      types: z.array(z.string()).optional(),
      search: z.string().optional(),
      offset: z.number().int().nonnegative().optional().default(0),
      limit: z.number().int().min(1).max(500).optional().default(200)
    }),
    annotations: { readOnlyHint: true, openWorldHint: false }
  }, ({ project_id, types, search, offset, limit }) => {
    const query = new URLSearchParams();
    if (types?.length) query.set("types", types.join(","));
    if (search) query.set("search", search);
    query.set("offset", String(offset));
    query.set("limit", String(limit));
    return agentControlRequest(`/projects/${encodeURIComponent(project_id)}/nodes?${query}`);
  });

  registerTool(server, "add_canvas_nodes", {
    title: "Add canvas nodes",
    description: "Add one or more notes, image tasks, video tasks, media results, or supported raw nodes. Changes live-sync into an open canvas.",
    inputSchema: z.object({
      project_id: z.string(),
      nodes: z.array(nodeSpecSchema).min(1).max(100)
    }),
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false }
  }, ({ project_id, nodes }) => agentControlRequest(`/projects/${encodeURIComponent(project_id)}/nodes`, {
    method: "POST",
    body: { nodes }
  }));

  registerTool(server, "update_canvas_node", {
    title: "Update a canvas node",
    description: "Patch a node's prompt, model, parameters, text, position, size, status, references or other supported fields. id and type cannot be changed.",
    inputSchema: z.object({
      project_id: z.string(),
      node_id: z.string(),
      patch: z.record(z.string(), z.unknown())
    }),
    annotations: { destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, ({ project_id, node_id, patch }) => agentControlRequest(
    `/projects/${encodeURIComponent(project_id)}/nodes/${encodeURIComponent(node_id)}`,
    { method: "PATCH", body: { patch } }
  ));

  registerTool(server, "delete_canvas_nodes", {
    title: "Delete canvas nodes",
    description: "Delete selected nodes from a project. This is destructive but remains undoable in an already-open canvas until its history is cleared.",
    inputSchema: z.object({
      project_id: z.string(),
      node_ids: z.array(z.string()).min(1).max(500)
    }),
    annotations: { destructiveHint: true, idempotentHint: false, openWorldHint: false }
  }, ({ project_id, node_ids }) => agentControlRequest(`/projects/${encodeURIComponent(project_id)}/nodes`, {
    method: "DELETE",
    body: { ids: node_ids }
  }));

  registerTool(server, "import_canvas_asset", {
    title: "Import a local media asset",
    description: "Copy a local image, video, audio or mask into a canvas project's managed cache and return a reference usable by generation tools.",
    inputSchema: z.object({
      project_id: z.string(),
      file_path: z.string().min(1),
      kind: z.enum(["image", "video", "audio", "mask"]).optional().default("image")
    }),
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: false }
  }, async ({ project_id, file_path, kind }) => ({
    projectId: project_id,
    asset: await cacheLocalAsset(project_id, file_path, kind)
  }));

  registerTool(server, "generate_canvas_media", {
    title: "Generate image or video on canvas",
    description: "Run any model already configured in cc Infinite Canvas. Local reference files are cached automatically, and outputs are placed as task/media nodes unless place_on_canvas is false.",
    inputSchema: z.object({
      project_id: z.string(),
      prompt: z.string().optional().default(""),
      model: z.string().min(1),
      mode: z.enum(["create", "edit", "video"]).optional(),
      size: z.string().optional().default("auto"),
      quality: z.string().optional().default(""),
      format: z.string().optional(),
      count: z.number().int().min(1).max(16).optional().default(1),
      seedream_mode: z.enum(["standard", "fusion", "layers"]).optional(),
      video_mode: z.string().optional(),
      background: z.string().optional(),
      tt_image_version: z.enum(["flare", "sunburst"]).optional(),
      tt_image_aspect_ratio: z.string().optional(),
      tt_image_resolution: z.string().optional(),
      image_26: z.object({
        complexity: z.enum(["low", "medium", "high"]).optional(),
        frameCount: z.number().int().min(2).max(16).optional(),
        frameDurationMs: z.number().int().min(20).max(655350).optional(),
        svgModel: z.string().optional(),
        svgReasoning: z.string().optional(),
        imageGuideMode: z.enum(["mask", "markup"]).optional()
      }).optional(),
      reference_image_paths: z.array(z.string()).max(16).optional(),
      reference_video_paths: z.array(z.string()).max(4).optional(),
      reference_audio_paths: z.array(z.string()).max(4).optional(),
      mask_path: z.string().optional(),
      extra_params: z.record(z.string(), z.unknown()).optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      place_on_canvas: z.boolean().optional().default(true),
      include_raw_response: z.boolean().optional().default(false)
    }),
    annotations: { destructiveHint: false, idempotentHint: false, openWorldHint: true }
  }, async (input) => {
    const cachedImages = await cachePaths(input.project_id, input.reference_image_paths, "image");
    const cachedVideos = await cachePaths(input.project_id, input.reference_video_paths, "video");
    const cachedAudios = await cachePaths(input.project_id, input.reference_audio_paths, "audio");
    const cachedMask = input.mask_path ? await cacheLocalAsset(input.project_id, input.mask_path, "mask") : null;
    const inferredMode = input.mode || (cachedVideos.length || cachedAudios.length ? "video" : cachedImages.length || cachedMask ? "edit" : "create");
    const request = {
      mode: inferredMode,
      prompt: input.prompt,
      model: input.model,
      n: String(input.count),
      size: input.size,
      quality: input.quality,
      format: input.format || (inferredMode === "video" ? "mp4" : "png"),
      seedreamMode: input.seedream_mode,
      videoMode: input.video_mode,
      background: input.background,
      ttImageVersion: input.tt_image_version,
      ttImageAspectRatio: input.tt_image_aspect_ratio,
      ttImageResolution: input.tt_image_resolution,
      image26: input.image_26 || {},
      cachedImages,
      cachedVideos,
      cachedAudios,
      cachedMask: cachedMask ? [cachedMask] : null,
      extraParams: input.extra_params || {}
    };
    return agentControlRequest(`/projects/${encodeURIComponent(input.project_id)}/generate`, {
      method: "POST",
      body: {
        request,
        placeOnCanvas: input.place_on_canvas,
        includeRaw: input.include_raw_response,
        placement: { x: input.x, y: input.y }
      },
      timeoutMs: 31 * 60 * 1000
    });
  });

  return server;
}

function registerTool(server, name, config, handler) {
  server.registerTool(name, config, async (input) => {
    try {
      const data = await handler(input || {});
      return toolResult(data);
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error.message || String(error),
            status: Number(error.status) || undefined,
            details: error.data || undefined
          }, null, 2)
        }]
      };
    }
  });
}

function toolResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data
  };
}

async function cachePaths(projectId, paths, kind) {
  const assets = [];
  for (const filePath of paths || []) {
    const asset = await cacheLocalAsset(projectId, filePath, kind);
    if (asset) assets.push(asset);
  }
  return assets;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  serveStdio(() => createCanvasMcpServer());
}
