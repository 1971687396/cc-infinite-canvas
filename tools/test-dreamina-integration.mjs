import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  dreaminaVideoModes,
  dreaminaVideoReferenceLimits,
  normalizeDreaminaVideoMode
} from "../public/model-profiles.js";

const [serverSource, appSource, styleSource] = await Promise.all([
  readFile(new URL("../server.js", import.meta.url), "utf8"),
  readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  readFile(new URL("../public/styles.css", import.meta.url), "utf8")
]);

assert.equal(normalizeDreaminaVideoMode("text2video"), dreaminaVideoModes.TEXT);
assert.equal(normalizeDreaminaVideoMode("image2video"), dreaminaVideoModes.IMAGE);
assert.equal(normalizeDreaminaVideoMode("frames2video"), dreaminaVideoModes.FRAMES);
assert.equal(normalizeDreaminaVideoMode("multiframe2video"), dreaminaVideoModes.MULTIFRAME);
assert.equal(normalizeDreaminaVideoMode("multimodal2video"), dreaminaVideoModes.MULTIMODAL);
assert.deepEqual(dreaminaVideoReferenceLimits("seedance2.5", "multiframe"), {
  images: 20,
  videos: 0,
  audios: 0,
  total: 20,
  minImages: 2
});

assert.match(serverSource, /api\/dreamina\/upscale/u);
assert.match(serverSource, /"image_upscale"/u);
assert.match(serverSource, /"multiframe2video"/u);
assert.match(serverSource, /"frames2video"/u);
assert.match(serverSource, /args\.push\(`--video=\$\{videoPath\}`\)/u);
assert.match(serverSource, /args\.push\(`--audio=\$\{audioPath\}`\)/u);
assert.match(serverSource, /\["image", "mask", "video", "audio"\]/u);

assert.match(appSource, /智能多帧/u);
assert.match(appSource, /参考视频（最多/u);
assert.match(appSource, /参考音频（最多/u);
assert.match(appSource, /upscaleImageNode/u);
assert.match(appSource, /\/api\/dreamina\/upscale/u);
assert.match(styleSource, /\.video-transition-row/u);

console.log("Dreamina integration checks passed.");
