export function dreaminaSubmitId(data) {
  const value = String(typeof data === "string" ? data : data?.submit_id || "").trim();
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{5,127}$/u.test(value) ? value : "";
}

export function dreaminaTaskStatus(data) {
  return String(data?.gen_status || "").trim().toLowerCase();
}

export function dreaminaTaskFailed(data) {
  return ["fail", "failed", "failure", "cancel", "cancelled", "canceled"].includes(dreaminaTaskStatus(data));
}

export function isRetryableDreaminaQueryError(error) {
  if (["EDREAMINATASKFAILED", "ENOENT", "EACCES", "EOUTPUTLIMIT"].includes(error?.code)) return false;
  const message = [error?.message, error?.result?.stderr, error?.result?.stdout].filter(Boolean).join("\n");
  if (/\b(?:unauthorized|forbidden|invalid|unsupported|required)\b|oauth|not logged in|login required|未登录|登录态|重新登录|参数错误/iu.test(message)) return false;
  return ["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "ENETUNREACH", "EHOSTUNREACH"].includes(error?.code)
    || /get_history_by_ids\s+failed:\s*ret\s*=\s*1015\b/iu.test(message)
    || /\b(?:timeout|timed out|eof|connection reset|connection refused|temporary failure|fetch failed)\b|tls handshake|i\/o timeout|context deadline exceeded|超时|网络异常/iu.test(message)
    || /(?:http|status(?: code)?)\D{0,12}(?:408|429|500|502|503|504)\b|too many requests|service unavailable/iu.test(message)
    || /Dreamina CLI returned an (?:empty|unreadable) response/iu.test(message);
}

function taskError(message, code, data) {
  const error = new Error(message);
  error.code = code;
  error.data = data;
  error.taskId = dreaminaSubmitId(data);
  return error;
}

export function assertDreaminaTask(data) {
  if (!dreaminaSubmitId(data)) {
    throw taskError("Dreamina CLI response did not include submit_id.", "EDREAMINARESPONSE", data);
  }
  if (dreaminaTaskFailed(data)) {
    throw taskError(data?.fail_reason || "即梦已返回任务生成失败。", "EDREAMINATASKFAILED", data);
  }
}

// A failed progress lookup is not evidence that the upstream generation failed.
export async function queryDreaminaTask(data, query) {
  assertDreaminaTask(data);
  const submitId = dreaminaSubmitId(data);
  try {
    const result = await query(submitId);
    if (!result || typeof result !== "object" || Array.isArray(result) || !dreaminaTaskStatus(result)) {
      throw taskError("Dreamina CLI returned an unreadable response.", "EDREAMINARESPONSE", data);
    }
    const returnedId = dreaminaSubmitId(result);
    if (returnedId && returnedId !== submitId) {
      throw taskError("Dreamina query returned a different submit_id.", "EDREAMINARESPONSE", data);
    }
    const current = { ...result, submit_id: submitId };
    assertDreaminaTask(current);
    return { data: current, pending: dreaminaTaskStatus(current) !== "success", queryError: "" };
  } catch (error) {
    error.taskId = submitId;
    error.data ||= data;
    if (!isRetryableDreaminaQueryError(error)) throw error;
    return { data, pending: true, queryError: String(error.message || "进度查询暂时失败").slice(0, 1600) };
  }
}

export async function waitForDreaminaTask(initialData, query, options = {}) {
  let current = initialData;
  assertDreaminaTask(current);
  const attempts = Math.max(1, Number(options.attempts) || 240);
  const waitMs = Math.max(1, Number(options.waitMs) || 2500);
  const maxWaitMs = Math.max(1, Number(options.maxWaitMs) || 10 * 60 * 1000);
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const now = options.now || Date.now;
  const startedAt = now();
  let queryError = "";
  let retryCount = 0;
  if (dreaminaTaskStatus(current) === "success" && (!options.isReady || options.isReady(current))) return current;

  for (let attempt = 0; attempt < attempts && now() - startedAt < maxWaitMs; attempt += 1) {
    const result = await queryDreaminaTask(current, query);
    current = result.data;
    queryError = result.queryError;
    if (!result.pending) return current;
    retryCount = queryError ? retryCount + 1 : 0;
    if (attempt + 1 >= attempts) break;
    const remainingMs = maxWaitMs - (now() - startedAt);
    if (remainingMs <= 0) break;
    const retryWaitMs = queryError ? Math.min(15000, waitMs * 2 ** Math.min(retryCount, 3)) : waitMs;
    await sleep(Math.min(retryWaitMs, remainingMs));
  }

  const error = taskError("即梦任务尚未取得结果，已保留任务编号，可继续查询；请勿重复提交。", "EDREAMINAPENDING", current);
  error.queryError = queryError;
  throw error;
}
