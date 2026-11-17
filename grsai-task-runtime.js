import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const operations = new Map();

export function grsaiRecoveryId(value) {
  const id = String(value || "").trim();
  if (!/^[a-zA-Z0-9_-]{1,180}$/u.test(id)) throw new Error("Grsai 任务编号格式无效。");
  return id;
}

export function manualGrsaiRequestId(model, taskId) {
  return `manual-${createHash("sha256").update(`${model}:${grsaiRecoveryId(taskId)}`).digest("hex")}`;
}

export function publicGrsaiTask(record) {
  return Object.fromEntries(["requestId", "taskId", "model", "status", "progress", "message", "createdAt", "updatedAt"].map((key) => [key, record[key] ?? ""]));
}

export class GrsaiTaskJournal {
  constructor(directory) { this.directory = directory; }
  file(requestId) {
    return path.join(this.directory, `${createHash("sha256").update(grsaiRecoveryId(requestId)).digest("hex")}.json`);
  }
  async read(requestId) {
    try { return JSON.parse(await readFile(this.file(requestId), "utf8")); }
    catch (error) { if (error.code === "ENOENT") return null; throw error; }
  }
  async write(value) {
    // Explicit allowlist: never persist API keys, headers, or request reference-image bytes.
    const record = Object.fromEntries(["requestId", "taskId", "model", "apiModel", "apiUrl", "format", "mode", "status", "progress", "message", "createdAt", "results", "images"].filter((key) => value[key] !== undefined).map((key) => [key, value[key]]));
    record.updatedAt = new Date().toISOString();
    const file = this.file(record.requestId);
    await mkdir(this.directory, { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(record), { encoding: "utf8", mode: 0o600 });
    await rename(temporary, file);
    return record;
  }
  async exclusive(requestId, action) {
    const key = this.file(requestId);
    const previous = operations.get(key) || Promise.resolve();
    const operation = previous.catch(() => {}).then(action);
    operations.set(key, operation);
    try { return await operation; }
    finally { if (operations.get(key) === operation) operations.delete(key); }
  }
}
