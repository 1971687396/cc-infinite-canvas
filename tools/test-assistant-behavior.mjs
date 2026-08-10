import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [appSource, htmlSource, serverSource] = await Promise.all([
  readFile(new URL("../public/app.js", import.meta.url), "utf8"),
  readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  readFile(new URL("../server.js", import.meta.url), "utf8")
]);

assert.match(htmlSource, /id="assistantAutoAttachReferencesToggle"/u);
assert.match(htmlSource, /id="assistantAutoGenerateToggle"/u);
assert.match(appSource, /assistantBehaviorStorageKey/u);
assert.match(appSource, /selectedReferenceImageIds/u);
assert.match(appSource, /await useCanvasImagesAsReference\(nodeId, applyContext\.selectedReferenceImageIds\)/u);
assert.match(appSource, /autoGenerateIds\.forEach\(\(nodeId\) => void generateNode\(nodeId\)\)/u);
assert.match(appSource, /await autoApplyAssistantPlanMessage\(assistantMessage, selectedReferenceImageIds\)/u);
assert.match(appSource, /skipConfirmation: true/u);
assert.match(appSource, /if \(!options\.skipConfirmation && !window\.confirm/u);
assert.match(appSource, /autoAttachSelectedReferences: assistantBehavior\.autoAttachReferences/u);
assert.match(appSource, /autoApplyPlans: assistantBehavior\.autoGenerate/u);
assert.match(serverSource, /assistantBehavior: isPlainObject\(context\.assistantBehavior\)/u);
assert.match(serverSource, /前端会把当前 selection 中的 image 节点自动添加/u);

console.log("Assistant behavior integration checks passed.");
