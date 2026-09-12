export const seedreamLayerLayoutVersion = 3;

export function normalizeCanvasImageFormat(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .split(";", 1)[0]
    .replace(/^image\//, "")
    .replace(/^\./, "");
  if (["jpg", "jpeg", "jfif", "pjpeg"].includes(normalized)) return "jpeg";
  if (normalized === "png") return "png";
  if (normalized === "webp") return "webp";
  return "";
}

export function convertedImageFilename(filename, targetFormat) {
  const format = normalizeCanvasImageFormat(targetFormat);
  if (!format) return "";
  const extension = format === "jpeg" ? "jpg" : format;
  const clean = String(filename || "")
    .split(/[?#]/, 1)[0]
    .split(/[\\/]/)
    .pop()
    ?.trim() || "canvas-image";
  const dotIndex = clean.lastIndexOf(".");
  const stem = (dotIndex > 0 ? clean.slice(0, dotIndex) : clean) || "canvas-image";
  return `${stem}.${extension}`;
}

export function reorderLayerItemsByZ(items, selectedItemIds, action) {
  const source = Array.isArray(items) ? items : [];
  const selectedIds = selectedItemIds instanceof Set
    ? selectedItemIds
    : new Set(selectedItemIds || []);
  const ordered = source
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const zDelta = finiteNumber(left.item?.z, 0) - finiteNumber(right.item?.z, 0);
      return zDelta || left.index - right.index;
    })
    .map((entry) => entry.item);
  const isSelected = (item) => Boolean(item?.id && selectedIds.has(item.id));
  if (!ordered.some(isSelected)) return { items: ordered, changed: false };

  let next = [...ordered];
  if (action === "front") {
    next = [...ordered.filter((item) => !isSelected(item)), ...ordered.filter(isSelected)];
  } else if (action === "back") {
    next = [...ordered.filter(isSelected), ...ordered.filter((item) => !isSelected(item))];
  } else if (action === "forward") {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      if (!isSelected(next[index]) || isSelected(next[index + 1])) continue;
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
    }
  } else if (action === "backward") {
    for (let index = 1; index < next.length; index += 1) {
      if (!isSelected(next[index]) || isSelected(next[index - 1])) continue;
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
    }
  }

  const changed = next.some((item, index) => item !== ordered[index]);
  return { items: next, changed };
}

export function normalizeDecomposedLayerImages(images) {
  const source = Array.isArray(images) ? images : [];
  const usedIndexes = new Set(
    source
      .map((image) => Number(image?.zIndex))
      .filter(Number.isFinite)
  );
  let nextIndex = 0;

  return source.map((image) => {
    let zIndex = Number(image?.zIndex);
    if (!Number.isFinite(zIndex)) {
      while (usedIndexes.has(nextIndex)) nextIndex += 1;
      zIndex = nextIndex;
      usedIndexes.add(zIndex);
      nextIndex += 1;
    }
    return {
      ...image,
      layerDecomposition: true,
      zIndex,
      layerName: image?.layerName || (zIndex === 0 ? "底图" : `图层 ${zIndex}`)
    };
  });
}

export function restoreNodesPreservingActiveGenerations(restoredNodes, liveNodes, activeNodeIds) {
  const restored = Array.isArray(restoredNodes) ? restoredNodes : [];
  const live = Array.isArray(liveNodes) ? liveNodes : [];
  const activeIds = activeNodeIds instanceof Set ? activeNodeIds : new Set(activeNodeIds || []);
  if (!activeIds.size) return restored;

  const activeNodes = new Map(
    live
      .filter((node) => node?.id && activeIds.has(node.id))
      .map((node) => [node.id, node])
  );
  if (!activeNodes.size) return restored;

  const merged = restored.map((node) => activeNodes.get(node?.id) || node);
  const restoredIds = new Set(merged.map((node) => node?.id).filter(Boolean));
  for (const node of live) {
    if (!node?.id || restoredIds.has(node.id) || !activeNodes.has(node.id)) continue;
    merged.push(node);
    restoredIds.add(node.id);
  }
  return merged;
}

export function resolveSeedreamLayerAnchor({
  sourceNode,
  baseWidth,
  baseHeight,
  fallbackX = 0,
  fallbackY = 0,
  fallbackScale = 1
} = {}) {
  const width = positiveNumber(baseWidth, 512);
  const height = positiveNumber(baseHeight, 512);
  const sourceWidth = positiveNumber(sourceNode?.originalWidth, 0);
  const sourceHeight = positiveNumber(sourceNode?.originalHeight, 0);
  const sourceScale = positiveNumber(sourceNode?.scale, 0);
  if (!sourceNode || !sourceWidth || !sourceHeight || !sourceScale) {
    return {
      x: finiteNumber(fallbackX, 0),
      y: finiteNumber(fallbackY, 0),
      scale: positiveNumber(fallbackScale, 1),
      sourceNodeId: ""
    };
  }

  const displayWidth = sourceWidth * sourceScale;
  const displayHeight = sourceHeight * sourceScale;
  const scale = Math.min(displayWidth / width, displayHeight / height);
  return {
    x: finiteNumber(sourceNode.x, fallbackX) + (displayWidth - width * scale) / 2,
    y: finiteNumber(sourceNode.y, fallbackY) + (displayHeight - height * scale) / 2,
    scale: positiveNumber(scale, fallbackScale),
    sourceNodeId: sourceNode.id || ""
  };
}

export function resolveSeedreamLayerPlacement({
  anchor,
  baseWidth,
  baseHeight,
  layerWidth,
  layerHeight,
  boundingBox
} = {}) {
  const baseW = positiveNumber(baseWidth, 512);
  const baseH = positiveNumber(baseHeight, 512);
  const layerW = positiveNumber(layerWidth, baseW);
  const layerH = positiveNumber(layerHeight, baseH);
  const baseScale = positiveNumber(anchor?.scale, 1);
  const anchorX = finiteNumber(anchor?.x, 0);
  const anchorY = finiteNumber(anchor?.y, 0);
  const fullCanvas = Math.abs(layerW - baseW) <= 2 && Math.abs(layerH - baseH) <= 2;
  const box = normalizeLayerBoundingBox(boundingBox);

  if (fullCanvas) {
    return { x: anchorX, y: anchorY, scale: baseScale, scaleMultiplier: 1, positioned: true };
  }

  if (box) {
    const boxWidth = box[2] - box[0];
    const boxHeight = box[3] - box[1];
    if (boxWidth > 0 && boxHeight > 0) {
      const scaleMultiplier = Math.min(boxWidth / layerW, boxHeight / layerH);
      const offsetX = box[0] + (boxWidth - layerW * scaleMultiplier) / 2;
      const offsetY = box[1] + (boxHeight - layerH * scaleMultiplier) / 2;
      return {
        x: anchorX + offsetX * baseScale,
        y: anchorY + offsetY * baseScale,
        scale: baseScale * scaleMultiplier,
        scaleMultiplier,
        positioned: true
      };
    }
  }

  return {
    x: anchorX + ((baseW - layerW) / 2) * baseScale,
    y: anchorY + ((baseH - layerH) / 2) * baseScale,
    scale: baseScale,
    scaleMultiplier: 1,
    positioned: false
  };
}

export function normalizeLayerBoundingBox(value) {
  if (!Array.isArray(value) || value.length < 4) return null;
  const numbers = value.slice(0, 4).map(Number);
  if (!numbers.every(Number.isFinite)) return null;
  if (numbers[2] <= numbers[0] || numbers[3] <= numbers[1]) return null;
  return numbers;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
