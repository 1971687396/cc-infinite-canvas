export const defaultYunwuBaseUrl = "https://api.openlux.ai";

const legacyYunwuHosts = new Set(["yunwu.ai", "api.yunwu.ai", "api.apiplus.org"]);
const connectionUrlFields = ["baseUrl", "imageEndpoint", "editEndpoint", "chatEndpoint", "videoEndpoint", "endpointPath"];
const envUrlFields = new Set(["YUNWU_BASE_URL", "YUNWU_IMAGE_ENDPOINT", "YUNWU_EDIT_ENDPOINT", "YUNWU_CHAT_ENDPOINT"]);

export function migrateYunwuUrl(value) {
  if (typeof value !== "string" || !value.trim()) return value;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || !legacyYunwuHosts.has(url.hostname.toLowerCase())) return value;
    if (url.username || url.password || url.port) return value;
    return value.trim().replace(/^https?:\/\/[^/?#]+/iu, defaultYunwuBaseUrl);
  } catch {
    return value;
  }
}

export function migrateYunwuConnection(value) {
  if (!isRecord(value)) return value;
  let result = value;
  for (const field of connectionUrlFields) {
    const migrated = migrateYunwuUrl(value[field]);
    if (migrated !== value[field]) {
      if (result === value) result = { ...value };
      result[field] = migrated;
    }
  }
  return result;
}

export function migrateYunwuNodeConnections(node) {
  if (!isRecord(node)) return node;
  let result = migrateYunwuConnection(node);
  const update = (field, value) => {
    if (value === node[field]) return;
    if (result === node) result = { ...node };
    result[field] = value;
  };
  update("generation", migrateYunwuConnection(node.generation));
  for (const field of ["image", "video"]) update(field, migrateAssetGeneration(node[field]));
  for (const field of ["images", "videos"]) {
    if (!Array.isArray(node[field])) continue;
    const values = node[field].map(migrateAssetGeneration);
    if (values.some((value, index) => value !== node[field][index])) update(field, values);
  }
  return result;
}

export function migrateYunwuEnvValue(key, value) {
  if (envUrlFields.has(key)) return migrateYunwuUrl(value);
  if (key !== "CC_CANVAS_MODEL_CONNECTIONS_B64" || !value) return value;
  try {
    // Both Node and Chromium support atob/btoa; the map may contain Chinese aliases.
    const binary = atob(value.replace(/-/gu, "+").replace(/_/gu, "/"));
    const records = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0))));
    if (!isRecord(records)) return value;
    let changed = false;
    const migrated = Object.fromEntries(Object.entries(records).map(([model, connection]) => {
      const next = migrateYunwuConnection(connection);
      changed ||= next !== connection;
      return [model, next];
    }));
    if (!changed) return value;
    const encoded = btoa(Array.from(new TextEncoder().encode(JSON.stringify(migrated)), (byte) => String.fromCharCode(byte)).join(""));
    return encoded.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
  } catch {
    // A malformed settings map must never be replaced with an empty map.
    return value;
  }
}

export function migrateYunwuEnvText(text) {
  return text.replace(/^(\s*([A-Za-z_][A-Za-z0-9_]*)\s*=)([^\r\n]*)/gmu, (line, prefix, key, raw) => {
    const trimmed = raw.trim();
    const quote = ["\"", "'"].includes(trimmed[0]) && trimmed.at(-1) === trimmed[0] ? trimmed[0] : "";
    const value = quote ? trimmed.slice(1, -1) : trimmed;
    const migrated = migrateYunwuEnvValue(key, value);
    return migrated === value ? line : `${prefix}${quote}${migrated}${quote}`;
  });
}

function migrateAssetGeneration(asset) {
  if (!isRecord(asset)) return asset;
  const generation = migrateYunwuConnection(asset.generation);
  return generation === asset.generation ? asset : { ...asset, generation };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
