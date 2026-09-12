import assert from "node:assert/strict";
import {
  convertedImageFilename,
  normalizeCanvasImageFormat,
  normalizeDecomposedLayerImages,
  reorderLayerItemsByZ,
  resolveSeedreamLayerAnchor,
  resolveSeedreamLayerPlacement,
  restoreNodesPreservingActiveGenerations,
  seedreamLayerLayoutVersion
} from "../public/canvas-runtime.js";

assert.equal(seedreamLayerLayoutVersion, 3);

assert.equal(normalizeCanvasImageFormat("image/jpeg"), "jpeg");
assert.equal(normalizeCanvasImageFormat("image/webp; charset=binary"), "webp");
assert.equal(normalizeCanvasImageFormat(".JPG"), "jpeg");
assert.equal(normalizeCanvasImageFormat("webp"), "webp");
assert.equal(normalizeCanvasImageFormat("gif"), "");
assert.equal(convertedImageFilename("character.final.png", "webp"), "character.final.webp");
assert.equal(convertedImageFilename("C:\\art\\角色.jpeg?cache=1", "png"), "角色.png");
assert.equal(convertedImageFilename("", "jpeg"), "canvas-image.jpg");

const normalizedLayers = normalizeDecomposedLayerImages([
  { url: "base.png" },
  { url: "named.png", zIndex: 4, layerName: "标题" },
  { url: "subject.png" }
]);
assert.deepEqual(normalizedLayers.map((image) => image.zIndex), [0, 4, 1]);
assert.deepEqual(normalizedLayers.map((image) => image.layerName), ["底图", "标题", "图层 1"]);
assert.ok(normalizedLayers.every((image) => image.layerDecomposition));

const stack = [
  { id: "background", z: 10 },
  { id: "subject", z: 20 },
  { id: "title", z: 30 },
  { id: "effect", z: 40 }
];
assert.deepEqual(
  reorderLayerItemsByZ(stack, ["subject"], "forward").items.map((item) => item.id),
  ["background", "title", "subject", "effect"]
);
assert.deepEqual(
  reorderLayerItemsByZ(stack, ["title"], "backward").items.map((item) => item.id),
  ["background", "title", "subject", "effect"]
);
assert.deepEqual(
  reorderLayerItemsByZ(stack, ["background", "subject"], "front").items.map((item) => item.id),
  ["title", "effect", "background", "subject"]
);
assert.deepEqual(
  reorderLayerItemsByZ(stack, ["title", "effect"], "back").items.map((item) => item.id),
  ["title", "effect", "background", "subject"]
);
assert.equal(reorderLayerItemsByZ(stack, ["effect"], "forward").changed, false);

const sourceNode = {
  id: "source",
  x: 100,
  y: 200,
  originalWidth: 2000,
  originalHeight: 1000,
  scale: 0.25
};
const anchor = resolveSeedreamLayerAnchor({ sourceNode, baseWidth: 1000, baseHeight: 500 });
assert.deepEqual(anchor, { x: 100, y: 200, scale: 0.5, sourceNodeId: "source" });

assert.deepEqual(
  resolveSeedreamLayerPlacement({
    anchor,
    baseWidth: 1000,
    baseHeight: 500,
    layerWidth: 200,
    layerHeight: 100,
    boundingBox: [300, 100, 500, 200]
  }),
  { x: 250, y: 250, scale: 0.5, scaleMultiplier: 1, positioned: true }
);

assert.deepEqual(
  resolveSeedreamLayerPlacement({
    anchor,
    baseWidth: 1000,
    baseHeight: 500,
    layerWidth: 1000,
    layerHeight: 500
  }),
  { x: 100, y: 200, scale: 0.5, scaleMultiplier: 1, positioned: true }
);

const active = { id: "active", status: "running" };
const restored = restoreNodesPreservingActiveGenerations(
  [{ id: "other" }, { id: "active", status: "idle" }],
  [{ id: "other", value: "live" }, active],
  new Set(["active"])
);
assert.equal(restored[1], active);
assert.equal(restored[1].status, "running");

const restoredWithoutTask = restoreNodesPreservingActiveGenerations(
  [{ id: "other" }],
  [{ id: "other" }, active],
  ["active"]
);
assert.equal(restoredWithoutTask.at(-1), active);

const controller = new AbortController();
const liveRequestNode = { id: "request", status: "running", images: [] };
const canvasAfterUndo = restoreNodesPreservingActiveGenerations(
  [{ id: "request", status: "idle", images: [] }, { id: "unrelated", x: 10 }],
  [liveRequestNode, { id: "unrelated", x: 20 }],
  new Set(["request"])
);
liveRequestNode.images.push({ url: "completed-after-undo.png" });
assert.equal(canvasAfterUndo[0], liveRequestNode);
assert.equal(canvasAfterUndo[0].images[0].url, "completed-after-undo.png");
assert.equal(controller.signal.aborted, false);

console.log("Canvas runtime tests passed.");
