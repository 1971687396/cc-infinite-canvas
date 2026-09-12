export const storyAssetKinds = Object.freeze(["character", "scene", "prop", "costume", "vehicle", "creature"]);
export const storyAssetReuseModes = Object.freeze({
  NEW: "new",
  REUSE: "reuse",
  VARIANT: "variant"
});

const defaultEpisodeMaxChars = 18_000;
const maxRememberedAssets = 500;

export function storyScriptSignature(value) {
  const text = String(value || "").replace(/\r\n?/gu, "\n");
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${(hash >>> 0).toString(36)}-${text.length.toString(36)}`;
}

export function splitStoryIntoEpisodes(value, options = {}) {
  const script = String(value || "").replace(/\r\n?/gu, "\n").trim();
  if (!script) return [];
  const requestedMax = Number(options.maxChars);
  const maxChars = Number.isFinite(requestedMax)
    ? Math.min(40_000, Math.max(4_000, Math.round(requestedMax)))
    : defaultEpisodeMaxChars;
  const headings = storyEpisodeHeadings(script);
  const sections = [];

  if (headings.length) {
    headings.forEach((heading, index) => {
      const start = index === 0 ? 0 : heading.index;
      const end = headings[index + 1]?.index ?? script.length;
      const sectionText = script.slice(start, end).trim();
      if (!sectionText) return;
      sections.push({ title: heading.title, text: sectionText, explicitNumber: heading.number });
    });
  } else {
    sections.push({ title: "第 1 集", text: script, explicitNumber: 1 });
  }

  const units = [];
  sections.forEach((section, sectionIndex) => {
    const parts = splitStorySection(section.text, maxChars);
    parts.forEach((part, partIndex) => {
      const partCount = parts.length;
      const baseTitle = section.title || `第 ${sectionIndex + 1} 集`;
      const title = partCount > 1 ? `${baseTitle} · 片段 ${partIndex + 1}/${partCount}` : baseTitle;
      units.push({
        title,
        script: part,
        episodeNumber: section.explicitNumber || sectionIndex + 1,
        partIndex: partIndex + 1,
        partCount
      });
    });
  });

  return units.map((unit, index) => {
    const signature = storyScriptSignature(unit.script);
    return {
      id: `episode-${index + 1}-${signature.split("-")[0]}`,
      index,
      title: unit.title,
      script: unit.script,
      charCount: unit.script.length,
      episodeNumber: unit.episodeNumber,
      partIndex: unit.partIndex,
      partCount: unit.partCount,
      signature
    };
  });
}

function storyEpisodeHeadings(script) {
  const pattern = /^(?:[ \t]{0,3}#{1,6}[ \t]*)?(?:(第[ \t]*([0-9０-９一二三四五六七八九十百千零〇两]+)[ \t]*[集话回])|((?:EP(?:ISODE)?|E)[ \t]*[._#：:\-—]?[ \t]*(\d+)))(?:[ \t]*[：:._\-—][ \t]*.*|[ \t]+.*)?[ \t]*$/gimu;
  const headings = [];
  let match;
  while ((match = pattern.exec(script))) {
    const line = match[0].replace(/^[ \t]*#{1,6}[ \t]*/u, "").trim();
    headings.push({
      index: match.index,
      title: line || `第 ${headings.length + 1} 集`,
      number: parseStoryEpisodeNumber(match[2] || match[4])
    });
  }
  return headings;
}

function parseStoryEpisodeNumber(value) {
  const normalized = String(value || "").replace(/[０-９]/gu, (digit) => String("０１２３４５６７８９".indexOf(digit)));
  if (/^\d+$/u.test(normalized)) return Number(normalized) || 0;
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  let total = 0;
  let current = 0;
  for (const char of normalized) {
    if (Object.hasOwn(digits, char)) {
      current = digits[char];
    } else if (char === "十") {
      total += (current || 1) * 10;
      current = 0;
    } else if (char === "百") {
      total += (current || 1) * 100;
      current = 0;
    } else if (char === "千") {
      total += (current || 1) * 1000;
      current = 0;
    }
  }
  return total + current;
}

function splitStorySection(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const parts = [];
  let remaining = text;
  while (remaining.length > maxChars) {
    const minimum = Math.floor(maxChars * 0.55);
    const window = remaining.slice(0, maxChars + 1);
    let splitAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf("\n"));
    if (splitAt < minimum) {
      splitAt = Math.max(
        window.lastIndexOf("。"),
        window.lastIndexOf("！"),
        window.lastIndexOf("？"),
        window.lastIndexOf("；")
      );
      if (splitAt >= minimum) splitAt += 1;
    }
    if (splitAt < minimum) splitAt = maxChars;
    const part = remaining.slice(0, splitAt).trim();
    if (part) parts.push(part);
    remaining = remaining.slice(splitAt).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

export function normalizeStoryAssetReuseMode(value, fallback = storyAssetReuseModes.NEW) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["reuse", "reused", "same", "existing", "复用", "沿用"].includes(normalized)) return storyAssetReuseModes.REUSE;
  if (["variant", "variation", "changed", "变体", "变化"].includes(normalized)) return storyAssetReuseModes.VARIANT;
  if (["new", "create", "新增", "新建"].includes(normalized)) return storyAssetReuseModes.NEW;
  return Object.values(storyAssetReuseModes).includes(fallback) ? fallback : storyAssetReuseModes.NEW;
}

export function normalizeStoryAssetMemory(value) {
  const source = Array.isArray(value) ? value : Array.isArray(value?.assets) ? value.assets : [];
  const seen = new Set();
  return source.slice(0, maxRememberedAssets).map((item, index) => {
    const input = item && typeof item === "object" ? item : {};
    const fallbackId = `memory-asset-${index + 1}`;
    const id = uniqueMemoryId(input.id || input.canonicalAssetId || input.name, fallbackId, seen);
    const variantOf = cleanMemoryId(input.variantOf || input.baseAssetId);
    const episodeIds = uniqueStrings(input.episodeIds || [input.firstEpisodeId, input.lastEpisodeId], 120);
    const sourceMode = variantOf
      ? storyAssetReuseModes.VARIANT
      : normalizeStoryAssetReuseMode(input.sourceMode || input.reuseMode, storyAssetReuseModes.NEW);
    return {
      id,
      kind: storyAssetKinds.includes(input.kind) ? input.kind : "prop",
      name: cleanMemoryText(input.name, 240) || `资产 ${index + 1}`,
      continuityKey: cleanMemoryText(input.continuityKey || input.identityKey, 500),
      description: cleanMemoryText(input.description, 5000),
      prompt: cleanMemoryText(input.prompt || input.description, 12000),
      negativePrompt: cleanMemoryText(input.negativePrompt, 4000),
      sourceMode,
      variantOf,
      variantNotes: cleanMemoryText(input.variantNotes || input.changeSummary, 3000),
      aliases: uniqueStrings(input.aliases || [], 40),
      episodeIds,
      firstEpisodeId: cleanMemoryText(input.firstEpisodeId, 160) || episodeIds[0] || "",
      lastEpisodeId: cleanMemoryText(input.lastEpisodeId, 160) || episodeIds.at(-1) || "",
      appearanceCount: Math.max(Number(input.appearanceCount) || episodeIds.length || 1, 1)
    };
  });
}

export function mergeStoryAssetMemory(memory, episodeAssets, episode = {}) {
  const result = normalizeStoryAssetMemory(memory);
  const byId = new Map(result.map((item) => [item.id, item]));
  const episodeId = cleanMemoryText(episode.id, 160);
  const assets = Array.isArray(episodeAssets) ? episodeAssets : [];

  assets.forEach((rawAsset, index) => {
    const asset = rawAsset && typeof rawAsset === "object" ? rawAsset : {};
    const reuseMode = normalizeStoryAssetReuseMode(asset.reuseMode || asset.reuse || asset.action);
    const canonicalId = cleanMemoryId(asset.canonicalAssetId || asset.memoryAssetId);
    const declaredId = cleanMemoryId(asset.id);
    const semanticMatch = findSemanticMemoryMatch(result, asset);
    const existing = byId.get(canonicalId) || byId.get(declaredId) || semanticMatch;

    if (reuseMode === storyAssetReuseModes.REUSE && existing) {
      touchMemoryAsset(existing, asset, episodeId);
      return;
    }

    const variantBase = reuseMode === storyAssetReuseModes.VARIANT
      ? byId.get(cleanMemoryId(asset.variantOf || asset.baseAssetId || canonicalId)) || semanticMatch
      : null;
    let id = declaredId || canonicalId || `asset-${result.length + index + 1}`;
    if (reuseMode === storyAssetReuseModes.VARIANT && variantBase && id === variantBase.id) {
      id = `${variantBase.id}-variant-${storyScriptSignature(`${asset.name || "variant"}:${episodeId}`).split("-")[0]}`;
    }
    id = uniqueMemoryId(id, `asset-${result.length + 1}`, new Set(result.map((item) => item.id)));
    const episodeIds = episodeId ? [episodeId] : [];
    const record = normalizeStoryAssetMemory([{
      ...asset,
      id,
      sourceMode: reuseMode === storyAssetReuseModes.VARIANT ? storyAssetReuseModes.VARIANT : storyAssetReuseModes.NEW,
      variantOf: variantBase?.id || cleanMemoryId(asset.variantOf || asset.baseAssetId),
      firstEpisodeId: episodeId,
      lastEpisodeId: episodeId,
      episodeIds,
      appearanceCount: 1
    }])[0];
    if (!record) return;
    result.push(record);
    byId.set(record.id, record);
  });

  return normalizeStoryAssetMemory(result).slice(0, maxRememberedAssets);
}

export function removeStoryEpisodeFromAssetMemory(value, episodeId) {
  const targetId = cleanMemoryText(episodeId, 160);
  if (!targetId) return normalizeStoryAssetMemory(value);
  return normalizeStoryAssetMemory(value).flatMap((asset) => {
    if (!asset.episodeIds.includes(targetId)) return [asset];
    const episodeIds = asset.episodeIds.filter((id) => id !== targetId);
    if (!episodeIds.length) return [];
    return [{
      ...asset,
      episodeIds,
      firstEpisodeId: asset.firstEpisodeId === targetId ? episodeIds[0] : asset.firstEpisodeId,
      lastEpisodeId: asset.lastEpisodeId === targetId ? episodeIds.at(-1) : asset.lastEpisodeId,
      appearanceCount: Math.max(episodeIds.length, asset.appearanceCount - 1, 1)
    }];
  });
}

export function storyAssetMemoryForPrompt(value, maxItemsOrOptions = 120) {
  const memory = normalizeStoryAssetMemory(value);
  const options = maxItemsOrOptions && typeof maxItemsOrOptions === "object" ? maxItemsOrOptions : {};
  const requestedMax = typeof maxItemsOrOptions === "number" ? maxItemsOrOptions : options.maxItems;
  const maxItems = Math.max(1, Math.min(Number(requestedMax) || 120, maxRememberedAssets));
  const context = normalizedMemoryKey(options.context);
  const priority = { character: 0, scene: 1, costume: 2, prop: 3, vehicle: 4, creature: 5 };
  return memory
    .map((item, index) => {
      const names = [item.name, ...item.aliases]
        .map(normalizedMemoryKey)
        .filter((name) => name.length >= 2);
      const mentioned = context && names.some((name) => context.includes(name));
      return { item, index, mentioned };
    })
    .sort((left, right) =>
      Number(right.mentioned) - Number(left.mentioned)
      || right.item.appearanceCount - left.item.appearanceCount
      || (priority[left.item.kind] ?? 9) - (priority[right.item.kind] ?? 9)
      || right.index - left.index
    )
    .slice(0, maxItems)
    .map(({ item }) => ({
      id: item.id,
      kind: item.kind,
      name: item.name,
      continuityKey: cleanMemoryText(item.continuityKey, 300),
      description: cleanMemoryText(item.description, 500),
      prompt: cleanMemoryText(item.prompt, 650),
      variantOf: item.variantOf,
      variantNotes: cleanMemoryText(item.variantNotes, 300),
      aliases: item.aliases.slice(0, 12),
      lastEpisodeId: item.lastEpisodeId
    }));
}

function touchMemoryAsset(record, asset, episodeId) {
  const alreadySeen = episodeId && record.episodeIds.includes(episodeId);
  if (episodeId && !alreadySeen) record.episodeIds.push(episodeId);
  if (episodeId) {
    record.firstEpisodeId ||= episodeId;
    record.lastEpisodeId = episodeId;
  }
  if (!alreadySeen) record.appearanceCount += 1;
  record.aliases = uniqueStrings([...record.aliases, asset.name, ...(asset.aliases || [])], 40);
  record.continuityKey ||= cleanMemoryText(asset.continuityKey || asset.identityKey, 500);
  record.description ||= cleanMemoryText(asset.description, 5000);
  record.prompt ||= cleanMemoryText(asset.prompt || asset.description, 12000);
  record.negativePrompt ||= cleanMemoryText(asset.negativePrompt, 4000);
}

function findSemanticMemoryMatch(memory, asset) {
  const kind = storyAssetKinds.includes(asset.kind) ? asset.kind : "prop";
  const continuityKey = normalizedMemoryKey(asset.continuityKey || asset.identityKey);
  const name = normalizedMemoryKey(asset.name);
  if (continuityKey) {
    const match = memory.find((item) => item.kind === kind && normalizedMemoryKey(item.continuityKey) === continuityKey);
    if (match) return match;
  }
  if (!name) return null;
  return memory.find((item) =>
    item.kind === kind
    && (normalizedMemoryKey(item.name) === name || item.aliases.some((alias) => normalizedMemoryKey(alias) === name))
  ) || null;
}

function normalizedMemoryKey(value) {
  return String(value || "").trim().toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
}

function cleanMemoryId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 96);
}

function uniqueMemoryId(value, fallback, seen) {
  const base = cleanMemoryId(value) || fallback;
  let id = base;
  let suffix = 2;
  while (seen.has(id)) id = `${base}-${suffix++}`;
  seen.add(id);
  return id;
}

function cleanMemoryText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function uniqueStrings(value, maxItems) {
  const items = Array.isArray(value) ? value : [];
  return [...new Set(items.map((item) => cleanMemoryText(String(item || ""), 240)).filter(Boolean))].slice(0, maxItems);
}
