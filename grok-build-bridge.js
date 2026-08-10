import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";

export const grokBuildImageModel = "grok-build-image";
export const grokBuildVideoModel = "grok-build-video";
export const grokBuildAssistantPrefix = "grok-build-chat:";
export const grokBuildDefaultChatModel = "grok-4.5";
export const grokBuildImageRatios = new Set(["auto", "1:1", "16:9", "9:16", "3:2", "2:3"]);
export const grokBuildVideoRatios = new Set(["1:1", "16:9", "9:16", "3:2", "2:3"]);

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm", ".m4v"]);

export function isGrokBuildImageModel(model) {
  return String(model || "").trim().toLowerCase() === grokBuildImageModel;
}

export function isGrokBuildVideoModel(model) {
  return String(model || "").trim().toLowerCase() === grokBuildVideoModel;
}

export function isGrokBuildAssistantModel(model) {
  return String(model || "").trim().toLowerCase().startsWith(grokBuildAssistantPrefix);
}

export function grokBuildAssistantModelId(model) {
  const value = String(model || "").trim();
  return value.toLowerCase().startsWith(grokBuildAssistantPrefix)
    ? value.slice(grokBuildAssistantPrefix.length) || grokBuildDefaultChatModel
    : grokBuildDefaultChatModel;
}

export function normalizeGrokBuildRatio(value, kind = "image") {
  const ratio = String(value || "").trim();
  const allowed = kind === "video" ? grokBuildVideoRatios : grokBuildImageRatios;
  if (allowed.has(ratio)) return ratio;
  const dimensions = ratio.match(/^(\d+)x(\d+)$/iu);
  if (dimensions) {
    const width = Number(dimensions[1]);
    const height = Number(dimensions[2]);
    const candidates = [...allowed].filter((item) => item !== "auto");
    candidates.sort((left, right) => ratioDistance(width / height, left) - ratioDistance(width / height, right));
    if (candidates[0]) return candidates[0];
  }
  return kind === "video" ? "16:9" : "1:1";
}

export function describeGrokBuildMediaFailure(value, kind = "video") {
  const raw = stripAnsi(String(value || "")).trim();
  const mediaLabel = kind === "image" ? "图片" : "视频";
  if (!raw) return `Grok 官方${mediaLabel}生成失败，但没有返回具体原因。`;
  if (/zero data retention[\s\S]*output\.upload_url|output\.upload_url[\s\S]*zero data retention/iu.test(raw)) {
    return "Grok 官方视频生成失败：当前 Grok 团队启用了零数据保留（ZDR），视频生成必须配置外部 S3 存储。请为 Grok Build 配置 tools.zdr_video_output_s3，或联系团队管理员调整 ZDR 设置。";
  }
  const detail = compactGrokError(raw)
    .replace(/^tool\s+`[^`]+`\s+failed:\s*/iu, "")
    .slice(0, 1200);
  return `Grok 官方${mediaLabel}生成失败：${detail || "未返回具体原因。"}`;
}

export async function grokBuildStatus(options = {}) {
  const executable = await findGrokExecutable();
  if (!executable) {
    return { installed: false, loggedIn: false, version: "", executable: "", models: [] };
  }

  const versionResult = await runGrokProcess(executable, ["--version"], {
    timeoutMs: 15000,
    proxyUrl: options.proxyUrl,
    allowFailure: true
  });
  const version = parseGrokVersion(`${versionResult.stdout}\n${versionResult.stderr}`);
  const modelsResult = await runGrokProcess(executable, ["models"], {
    timeoutMs: 30000,
    proxyUrl: options.proxyUrl,
    allowFailure: true
  });
  const output = `${modelsResult.stdout}\n${modelsResult.stderr}`;
  const models = parseGrokModels(output);
  const loggedIn = modelsResult.code === 0 && (models.length > 0 || /you are logged in/iu.test(output));
  return {
    installed: true,
    loggedIn,
    version,
    executable,
    models: loggedIn ? models : [],
    error: loggedIn ? "" : compactGrokError(output) || "Grok Build 尚未登录。"
  };
}

export async function launchGrokBuildAction(action, options = {}) {
  const executable = await findGrokExecutable();
  if (action !== "install" && !executable) throw new Error("尚未安装 Grok Build CLI，请先点击安装/更新。");

  let command;
  if (action === "install") {
    command = executable
      ? `& ${powershellQuote(executable)} update --stable`
      : [
          "$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue",
          "if (-not $npm) { throw '未找到 npm，请先安装 Node.js 18 或更高版本。' }",
          "& $npm.Source install -g @xai-official/grok"
        ].join("; ");
  } else if (action === "login") {
    command = `& ${powershellQuote(executable)} login --device-auth`;
  } else if (action === "relogin") {
    command = `& ${powershellQuote(executable)} logout; & ${powershellQuote(executable)} login --device-auth`;
  } else if (action === "logout") {
    command = `& ${powershellQuote(executable)} logout`;
  } else {
    throw new Error(`不支持的 Grok Build 操作：${action}`);
  }

  const proxyPrefix = grokProxyPowerShell(options.proxyUrl);
  const title = action === "install" ? "Grok Build Install or Update" : action === "relogin" ? "Grok Build Switch Account" : action === "logout" ? "Grok Build Logout" : "Grok Build Login";
  const script = [
    `$Host.UI.RawUI.WindowTitle = ${powershellQuote(`cc infinite canvas - ${title}`)}`,
    proxyPrefix,
    command,
    "Write-Host ''",
    "Write-Host '操作完成后可关闭此窗口，并回到画布点击测试连接。' -ForegroundColor Cyan",
    "Read-Host '按 Enter 关闭窗口'"
  ].filter(Boolean).join("; ");

  if (process.platform === "win32") {
    const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const ps1Path = path.join(tmpdir(), `cc-grok-${action}-${stamp}.ps1`);
    const cmdPath = path.join(tmpdir(), `cc-grok-${action}-${stamp}.cmd`);
    await writeFile(ps1Path, `\uFEFF${script}`, "utf8");
    const cmdScript = [
      "@echo off",
      `title ${sanitizeGrokCmdTitle(title)}`,
      `powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "${ps1Path.replace(/"/gu, '""')}"`,
      "pause"
    ].join("\r\n");
    await writeFile(cmdPath, cmdScript, "utf8");
    const terminal = spawn("cmd.exe", ["/c", "start", "", cmdPath], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      windowsHide: false,
      shell: false
    });
    terminal.unref();
  } else {
    const terminal = spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], {
      detached: true,
      stdio: "ignore",
      windowsHide: false
    });
    terminal.unref();
  }
  return { started: true, action, executable: executable || "npm.cmd" };
}

export async function runGrokBuildAssistant({ messages, model, proxyUrl, signal, timeoutMs = 300000 }) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "cc-grok-chat-"));
  try {
    const promptFile = path.join(tempDir, "prompt.txt");
    const prompt = await serializeGrokAssistantMessages(messages, tempDir);
    await writeFile(promptFile, prompt, "utf8");
    const result = await runGrokHeadless({
      promptFile,
      model: model || grokBuildDefaultChatModel,
      proxyUrl,
      signal,
      timeoutMs,
      media: false
    });
    return result;
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function runGrokBuildImage({ prompt, ratio, count = 1, references = [], proxyUrl, signal, cwd, timeoutMs = 600000 }) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "cc-grok-image-"));
  try {
    const referencePaths = await writeReferenceFiles(references, tempDir);
    const runs = [];
    const total = Math.min(4, Math.max(1, Number(count) || 1));
    for (let index = 0; index < total; index += 1) {
      const promptFile = path.join(tempDir, `prompt-${index + 1}.txt`);
      await writeFile(promptFile, buildGrokImageInstruction(prompt, ratio, referencePaths), "utf8");
      runs.push(await runGrokHeadless({
        promptFile,
        model: grokBuildDefaultChatModel,
        proxyUrl,
        signal,
        timeoutMs,
        media: true,
        cwd
      }));
    }
    const files = [];
    const failures = [];
    for (const result of runs) {
      const runFiles = await grokSessionMediaFiles(result.sessionId, "images", cwd);
      files.push(...runFiles);
      if (!runFiles.length) {
        const failure = await grokSessionToolFailure(result.sessionId, cwd) || grokResultFailure(result);
        if (failure) failures.push(failure);
      }
    }
    if (!files.length && failures.length) throw new Error(describeGrokBuildMediaFailure(failures.at(-1), "image"));
    return { files: dedupePaths(files), runs };
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function runGrokBuildVideo({ prompt, ratio, duration, resolution, references = [], proxyUrl, signal, cwd, timeoutMs = 900000 }) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "cc-grok-video-"));
  try {
    const referencePaths = await writeReferenceFiles(references, tempDir);
    const promptFile = path.join(tempDir, "prompt.txt");
    await writeFile(promptFile, buildGrokVideoInstruction(prompt, ratio, duration, resolution, referencePaths), "utf8");
    const result = await runGrokHeadless({
      promptFile,
      model: grokBuildDefaultChatModel,
      proxyUrl,
      signal,
      timeoutMs,
      media: true,
      cwd
    });
    const files = await grokSessionMediaFiles(result.sessionId, "videos", cwd);
    if (!files.length) {
      const failure = await grokSessionToolFailure(result.sessionId, cwd) || grokResultFailure(result);
      if (failure) throw new Error(describeGrokBuildMediaFailure(failure, "video"));
    }
    return { files, run: result };
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function persistGrokMedia(files, destinationDir, prefix) {
  await mkdir(destinationDir, { recursive: true });
  const saved = [];
  for (const [index, sourcePath] of dedupePaths(files).entries()) {
    const extension = path.extname(sourcePath).toLowerCase() || ".bin";
    const filename = `${prefix}-${Date.now()}-${index + 1}-${Math.random().toString(16).slice(2, 8)}${extension}`;
    const destination = path.join(destinationDir, filename);
    await copyFile(sourcePath, destination);
    saved.push({ filename, path: destination, extension });
  }
  return saved;
}

async function runGrokHeadless({ promptFile, model, proxyUrl, signal, timeoutMs, media, cwd = process.cwd() }) {
  const executable = await findGrokExecutable();
  if (!executable) throw new Error("尚未安装 Grok Build CLI，请先在设置中安装。");
  const args = [
    "--prompt-file", promptFile,
    "--agent", "general-purpose",
    "--model", model || grokBuildDefaultChatModel,
    "--no-memory",
    "--no-plan",
    "--disable-web-search",
    media ? "--always-approve" : "--permission-mode",
    ...(media ? [] : ["dontAsk"]),
    "--output-format", "json",
    "--no-auto-update"
  ];
  const result = await runGrokProcess(executable, args, { timeoutMs, proxyUrl, signal, cwd });
  const data = parseGrokJson(result.stdout);
  if (!data || typeof data !== "object") throw new Error("Grok Build 返回了无法识别的结果。");
  if (data.type === "error" || data.error) throw new Error(data.message || data.error?.message || data.error || "Grok Build 执行失败。");
  return data;
}

async function runGrokProcess(executable, args, options = {}) {
  return await new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd || process.cwd(),
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      env: grokEnvironment(options.proxyUrl)
    });
    let stdout = "";
    let stderr = "";
    const maxOutput = 8 * 1024 * 1024;
    const append = (current, chunk) => `${current}${chunk}`.slice(-maxOutput);
    child.stdout.on("data", (chunk) => { stdout = append(stdout, chunk.toString("utf8")); });
    child.stderr.on("data", (chunk) => { stderr = append(stderr, chunk.toString("utf8")); });

    let settled = false;
    let timer = 0;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(value);
    };
    const abort = () => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1500).unref?.();
      finish(options.signal?.reason instanceof Error ? options.signal.reason : new Error("Grok Build 任务已停止。"));
    };
    if (options.signal?.aborted) return abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 1500).unref?.();
      finish(new Error(`Grok Build 请求超时（${Math.round((options.timeoutMs || 300000) / 1000)} 秒）。`));
    }, options.timeoutMs || 300000);

    child.once("error", (error) => finish(error));
    child.once("close", (code) => {
      const value = { code: Number(code), stdout, stderr };
      if (code === 0 || options.allowFailure) return finish(null, value);
      finish(new Error(compactGrokError(`${stdout}\n${stderr}`) || `Grok Build 退出码：${code}`));
    });
  });
}

async function findGrokExecutable() {
  const names = process.platform === "win32" ? ["grok.exe", "grok.cmd", "grok"] : ["grok"];
  const candidates = [
    process.env.GROK_CLI_PATH,
    ...names.map((name) => path.join(homedir(), ".grok", "bin", name)),
    ...names
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (!path.isAbsolute(candidate)) {
      const located = await locateOnPath(candidate);
      if (located) return located;
      continue;
    }
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return "";
}

async function locateOnPath(name) {
  const pathEntries = String(process.env.PATH || "").split(path.delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    const candidate = path.join(entry.replace(/^"|"$/g, ""), name);
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {
      // Continue.
    }
  }
  return "";
}

function parseGrokVersion(output) {
  return String(output || "").match(/\bgrok\s+v?(\d+\.\d+\.\d+)/iu)?.[1] || "";
}

function parseGrokModels(output) {
  const models = [];
  for (const line of String(output || "").split(/\r?\n/u)) {
    const match = stripAnsi(line).match(/^\s*\*\s+([^\s(]+)(?:\s+\(default\))?/u);
    if (match?.[1] && !models.includes(match[1])) models.push(match[1]);
  }
  return models;
}

function parseGrokJson(output) {
  const text = stripAnsi(String(output || "")).trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function serializeGrokAssistantMessages(messages, tempDir) {
  const blocks = [];
  let imageIndex = 0;
  for (const message of Array.isArray(messages) ? messages : []) {
    const role = String(message?.role || "user").toUpperCase();
    const parts = Array.isArray(message?.content) ? message.content : [{ type: "text", text: String(message?.content || "") }];
    const values = [];
    for (const part of parts) {
      if (typeof part === "string") {
        values.push(part);
        continue;
      }
      if (part?.type === "text" && part.text) values.push(String(part.text));
      const imageUrl = typeof part?.image_url === "string" ? part.image_url : part?.image_url?.url;
      const match = String(imageUrl || "").match(/^data:([^;,]+);base64,(.+)$/su);
      if (match) {
        imageIndex += 1;
        const extension = mimeExtension(match[1]);
        const imagePath = path.join(tempDir, `assistant-image-${imageIndex}.${extension}`);
        await writeFile(imagePath, Buffer.from(match[2], "base64"));
        values.push(`图片附件 ${imageIndex} 的本地路径：${imagePath}。请先读取图片再回答。`);
      } else if (/^https?:\/\//iu.test(String(imageUrl || ""))) {
        values.push(`图片附件 URL：${imageUrl}`);
      }
    }
    blocks.push(`[${role}]\n${values.filter(Boolean).join("\n")}`);
  }
  return `请严格遵守下面 SYSTEM 指令，并根据完整对话继续回答。只输出本轮助手回复，不要复述角色标签。\n\n${blocks.join("\n\n")}`;
}

function buildGrokImageInstruction(prompt, ratio, referencePaths) {
  const aspectRatio = normalizeGrokBuildRatio(ratio, "image");
  if (referencePaths.length) {
    return [
      "立即且只调用一次 image_edit 工具，不要调用终端、代码、搜索或其他工具。",
      `编辑要求：${String(prompt || "").trim()}`,
      `参考图片路径：${referencePaths.join(" ; ")}`,
      referencePaths.length > 1 ? `输出比例：${aspectRatio}` : "单张参考图时保持原图比例。",
      "工具完成后只简短确认。"
    ].join("\n");
  }
  return [
    "立即且只调用一次 image_gen 工具，不要调用终端、代码、搜索或其他工具。",
    `将以下文字原样作为生成提示词：${String(prompt || "").trim()}`,
    `aspect_ratio：${aspectRatio}`,
    "工具完成后只简短确认。"
  ].join("\n");
}

function buildGrokVideoInstruction(prompt, ratio, duration, resolution, referencePaths) {
  const aspectRatio = normalizeGrokBuildRatio(ratio, "video");
  const seconds = Number(duration) >= 8 ? 10 : 6;
  const outputResolution = String(resolution || "").toLowerCase() === "480p" ? "480p" : "720p";
  const lines = ["立即执行一次视频生成，不要调用终端、代码或搜索工具。", `视频提示词：${String(prompt || "").trim()}`, `时长：${seconds} 秒`, `清晰度：${outputResolution}`];
  if (referencePaths.length > 1) {
    lines.push(`调用 reference_to_video，参考图片路径：${referencePaths.slice(0, 7).join(" ; ")}`, `输出比例：${aspectRatio}`);
  } else if (referencePaths.length === 1) {
    lines.push(`调用 image_to_video，首帧图片路径：${referencePaths[0]}`);
  } else {
    lines.push(`先调用 image_gen 生成 ${aspectRatio} 的首帧，再调用 image_to_video 动画化该首帧。`);
  }
  lines.push("工具完成后只简短确认。");
  return lines.join("\n");
}

async function writeReferenceFiles(references, directory) {
  const paths = [];
  for (const [index, reference] of (Array.isArray(references) ? references : []).slice(0, 7).entries()) {
    const data = Buffer.from(reference?.data || []);
    if (!data.length) continue;
    const extension = mimeExtension(reference.contentType, reference.filename);
    const filename = `reference-${index + 1}.${extension}`;
    const filePath = path.join(directory, filename);
    await writeFile(filePath, data);
    paths.push(filePath);
  }
  return paths;
}

async function grokSessionMediaFiles(sessionId, kind, cwd = process.cwd()) {
  if (!sessionId) return [];
  const sessionDir = await findGrokSessionDirectory(sessionId, cwd);
  if (!sessionDir) return [];
  const mediaDir = path.join(sessionDir, kind);
  let entries;
  try {
    entries = await readdir(mediaDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const allowed = kind === "videos" ? videoExtensions : imageExtensions;
  const files = entries.filter((entry) => entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase())).map((entry) => path.join(mediaDir, entry.name));
  const metadata = await Promise.all(files.map(async (file) => ({ file, modified: (await stat(file)).mtimeMs })));
  return metadata.sort((left, right) => left.modified - right.modified).map(({ file }) => file);
}

async function grokSessionToolFailure(sessionId, cwd = process.cwd()) {
  if (!sessionId) return "";
  const sessionDir = await findGrokSessionDirectory(sessionId, cwd);
  if (!sessionDir) return "";
  let source;
  try {
    source = await readFile(path.join(sessionDir, "updates.jsonl"), "utf8");
  } catch {
    return "";
  }
  let latest = "";
  for (const line of source.split(/\r?\n/u)) {
    if (!line.trim()) continue;
    try {
      const update = JSON.parse(line)?.params?.update;
      if (update?.status !== "failed" && !update?.rawOutput?.error) continue;
      latest = String(
        update?.rawOutput?.message
        || update?.content?.content?.text
        || update?.message
        || update?.rawOutput?.error
        || ""
      ).trim() || latest;
    } catch {
      // Ignore incomplete session log lines and keep the latest valid failure.
    }
  }
  return latest;
}

function grokResultFailure(result) {
  const text = String(result?.text || result?.message || "").trim();
  return /失败|未完成|failed|error|bad request|http\s+4\d\d/iu.test(text) ? text : "";
}

async function findGrokSessionDirectory(sessionId, cwd) {
  const root = path.join(homedir(), ".grok", "sessions");
  const direct = path.join(root, encodeURIComponent(path.resolve(cwd)), sessionId);
  try {
    if ((await stat(direct)).isDirectory()) return direct;
  } catch {
    // Search all workspace buckets below.
  }
  let workspaces;
  try {
    workspaces = await readdir(root, { withFileTypes: true });
  } catch {
    return "";
  }
  for (const workspace of workspaces) {
    if (!workspace.isDirectory()) continue;
    const candidate = path.join(root, workspace.name, sessionId);
    try {
      if ((await stat(candidate)).isDirectory()) return candidate;
    } catch {
      // Continue.
    }
  }
  return "";
}

function grokEnvironment(proxyUrl) {
  const env = { ...process.env, HOME: process.env.HOME || homedir(), GROK_HOME: process.env.GROK_HOME || path.join(homedir(), ".grok") };
  const proxy = String(proxyUrl || "").trim();
  if (proxy) {
    env.HTTP_PROXY = proxy;
    env.HTTPS_PROXY = proxy;
    env.http_proxy = proxy;
    env.https_proxy = proxy;
  }
  return env;
}

function grokProxyPowerShell(proxyUrl) {
  const proxy = String(proxyUrl || "").trim();
  if (!proxy) return "";
  const quoted = powershellQuote(proxy);
  return `$env:HTTP_PROXY=${quoted}; $env:HTTPS_PROXY=${quoted}`;
}

function powershellQuote(value) {
  return `'${String(value || "").replace(/'/g, "''")}'`;
}

function sanitizeGrokCmdTitle(value) {
  return String(value || "cc infinite canvas")
    .replace(/[\r\n"&|<>^%!]/gu, "")
    .slice(0, 120);
}

function compactGrokError(value) {
  return stripAnsi(String(value || ""))
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !/auto worktree gc failed/iu.test(line))
    .slice(-8)
    .join("\n")
    .slice(0, 2000);
}

function stripAnsi(value) {
  return String(value || "").replace(/\u001b\[[0-?]*[ -\/]*[@-~]/gu, "");
}

function mimeExtension(contentType, filename = "") {
  const fileExtension = path.extname(String(filename || "")).replace(/^\./u, "").toLowerCase();
  if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) return fileExtension === "jpeg" ? "jpg" : fileExtension;
  const mime = String(contentType || "").toLowerCase();
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}

function ratioDistance(value, ratio) {
  const parts = String(ratio).split(":").map(Number);
  return Math.abs(Math.log(value / (parts[0] / parts[1])));
}

function dedupePaths(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => path.resolve(String(value))).filter(Boolean))];
}
