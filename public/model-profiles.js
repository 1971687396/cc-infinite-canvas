export const seedreamImageProfiles = Object.freeze({
  PRO_5: "ark-seedream-5.0-pro",
  LITE_5: "ark-seedream-5.0-lite",
  V4_5: "ark-seedream-4.5",
  V4_0: "ark-seedream-4.0"
});

function compactModelName(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function seedreamImageProfile(...values) {
  for (const value of values.flat(Infinity)) {
    const compact = compactModelName(value);
    if (!compact.includes("seedream")) continue;
    if (compact.includes("seedream50lite")) return seedreamImageProfiles.LITE_5;
    if (compact.includes("seedream50")) return seedreamImageProfiles.PRO_5;
    if (compact.includes("seedream45")) return seedreamImageProfiles.V4_5;
    if (compact.includes("seedream40")) return seedreamImageProfiles.V4_0;
  }
  return "";
}
