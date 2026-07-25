const midjourneyModes = new Set(["fast", "relax", "turbo"]);
export const midjourneyPromptMaxLength = 1800;

export function normalizeMidjourneyMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return midjourneyModes.has(normalized) ? normalized : "fast";
}

export function trimMidjourneyPrompt(value, maxLength = midjourneyPromptMaxLength) {
  const prompt = String(value || "");
  const limit = Math.max(1, Number(maxLength) || midjourneyPromptMaxLength);
  if (prompt.length <= limit) {
    return {
      prompt,
      truncated: false,
      originalLength: prompt.length
    };
  }

  let trimmed = prompt.slice(0, limit);
  const lastCodeUnit = trimmed.charCodeAt(trimmed.length - 1);
  if (lastCodeUnit >= 0xd800 && lastCodeUnit <= 0xdbff) trimmed = trimmed.slice(0, -1);
  return {
    prompt: trimmed,
    truncated: true,
    originalLength: prompt.length
  };
}

export function buildMidjourneyEndpointUrl({
  baseUrl,
  routePrefix = "/mj",
  mode = "fast",
  operation,
  taskId = ""
}) {
  const normalizedMode = normalizeMidjourneyMode(mode);
  const base = new URL(String(baseUrl || "https://yunwu.ai"));
  const routeValue = String(routePrefix || "/mj").replaceAll("{mode}", normalizedMode);
  const route = new URL(routeValue, `${base.toString().replace(/\/+$/u, "")}/`);

  let prefix = route.pathname.replace(/\/+$/u, "");
  prefix = prefix
    .replace(/\/mj\/submit\/(?:imagine|action)$/iu, "")
    .replace(/\/mj\/task\/[^/]+\/fetch$/iu, "")
    .replace(/\/mj$/iu, "");
  prefix = prefix.replace(/\/mj-(?:fast|relax|turbo)$/iu, `/mj-${normalizedMode}`);

  const suffix =
    operation === "imagine"
      ? "/mj/submit/imagine"
      : operation === "action"
        ? "/mj/submit/action"
        : operation === "task"
          ? `/mj/task/${encodeURIComponent(String(taskId || "").trim())}/fetch`
          : "";
  if (!suffix) throw new Error(`Unsupported Midjourney operation: ${operation}`);
  if (operation === "task" && !String(taskId || "").trim()) throw new Error("Midjourney task ID is required.");

  route.pathname = `${prefix}${suffix}`.replace(/\/{2,}/gu, "/");
  route.search = "";
  route.hash = "";
  return route.toString();
}

export function extractMidjourneyTaskId(value) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (!value || typeof value !== "object") return "";
  const directId = value.taskId || value.id || value.result?.taskId || value.result?.id;
  if (typeof directId === "string" || typeof directId === "number") return String(directId).trim();
  if (typeof value.result === "string" || typeof value.result === "number") return String(value.result).trim();
  return "";
}

export function normalizeMidjourneyTask(value) {
  const source =
    value?.result && typeof value.result === "object" && !Array.isArray(value.result)
      ? value.result
      : value?.data && typeof value.data === "object" && !Array.isArray(value.data)
        ? value.data
        : value || {};
  return {
    ...source,
    id: String(source.id || source.taskId || "").trim(),
    action: String(source.action || "").trim(),
    status: String(source.status || "").trim().toUpperCase(),
    progress: String(source.progress || "").trim(),
    imageUrl: String(source.imageUrl || source.image_url || source.url || "").trim(),
    prompt: String(source.prompt || "").trim(),
    promptEn: String(source.promptEn || source.prompt_en || "").trim(),
    failReason: String(source.failReason || source.fail_reason || source.error || "").trim(),
    buttons: Array.isArray(source.buttons)
      ? source.buttons
          .map((button) => ({
            customId: String(button?.customId || button?.custom_id || "").trim(),
            emoji: String(button?.emoji || "").trim(),
            label: String(button?.label || "").trim(),
            style: Number(button?.style) || 0,
            type: Number(button?.type) || 0
          }))
          .filter((button) => button.customId)
      : []
  };
}
