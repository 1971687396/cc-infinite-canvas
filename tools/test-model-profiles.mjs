import assert from "node:assert/strict";
import { seedreamImageProfile, seedreamImageProfiles } from "../public/model-profiles.js";

const cases = [
  ["seedream5.0pro", seedreamImageProfiles.PRO_5],
  ["Seedream 5.0 Pro", seedreamImageProfiles.PRO_5],
  ["seedream-5-0-pro", seedreamImageProfiles.PRO_5],
  ["doubao-seedream-5-0-260128", seedreamImageProfiles.PRO_5],
  ["seedream5.0lite", seedreamImageProfiles.LITE_5],
  ["doubao-seedream-5-0-lite-260128", seedreamImageProfiles.LITE_5],
  ["seedream-4.5", seedreamImageProfiles.V4_5],
  ["doubao-seedream-4-0-250828", seedreamImageProfiles.V4_0]
];

for (const [model, expected] of cases) {
  assert.equal(seedreamImageProfile(model), expected, model);
}

assert.equal(
  seedreamImageProfile("my-seedream", "doubao-seedream-5-0-260128"),
  seedreamImageProfiles.PRO_5
);
assert.equal(seedreamImageProfile("gpt-image-2"), "");

console.log(`Seedream model profile tests passed (${cases.length + 2} cases).`);
