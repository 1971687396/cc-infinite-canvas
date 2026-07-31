import assert from "node:assert/strict";
import {
  imageMediaTierForScreenPixels,
  imageMediaTierRank,
  mediaUrlForTier
} from "../public/media-virtualization.js";

assert.equal(imageMediaTierForScreenPixels(1), "64");
assert.equal(imageMediaTierForScreenPixels(48), "64");
assert.equal(imageMediaTierForScreenPixels(49), "256");
assert.equal(imageMediaTierForScreenPixels(220), "256");
assert.equal(imageMediaTierForScreenPixels(221), "1024");
assert.equal(imageMediaTierForScreenPixels(900), "1024");
assert.equal(imageMediaTierForScreenPixels(901), "original");

assert.equal(imageMediaTierRank("64"), 0);
assert.equal(imageMediaTierRank("original"), 3);
assert.equal(imageMediaTierRank("unloaded"), -1);

const baseUrl = "http://127.0.0.1:32000/";
assert.equal(
  mediaUrlForTier("/project-cache/demo/outputs/image.png", "256", baseUrl),
  "http://127.0.0.1:32000/project-cache/demo/outputs/image.png?thumbnail=256"
);
assert.equal(
  mediaUrlForTier("/outputs/image.png?token=one", "64", baseUrl),
  "http://127.0.0.1:32000/outputs/image.png?token=one&thumbnail=64"
);
assert.equal(
  mediaUrlForTier("https://example.com/image.png", "64", baseUrl),
  "https://example.com/image.png"
);
assert.equal(
  mediaUrlForTier("/project-cache/demo/outputs/image.png", "original", baseUrl),
  "/project-cache/demo/outputs/image.png"
);

console.log("Media virtualization tests passed.");
