export const imageMediaTiers = Object.freeze(["64", "256", "1024", "original"]);

export function imageMediaTierForScreenPixels(value) {
  const pixels = Math.max(0, Number(value) || 0);
  if (pixels <= 48) return "64";
  if (pixels <= 220) return "256";
  if (pixels <= 900) return "1024";
  return "original";
}

export function imageMediaTierRank(tier) {
  return imageMediaTiers.indexOf(String(tier || ""));
}

export function mediaUrlForTier(source, tier, baseUrl) {
  const rawSource = String(source || "").trim();
  const normalizedTier = String(tier || "");
  if (!rawSource || normalizedTier === "original") return rawSource;
  if (!["64", "256", "1024"].includes(normalizedTier)) return rawSource;

  try {
    const base = new URL(baseUrl);
    const target = new URL(rawSource, base);
    if (target.origin !== base.origin) return rawSource;
    if (!/^\/(?:project-cache|outputs|cache\/assets)\//u.test(target.pathname)) return rawSource;
    target.searchParams.set("thumbnail", normalizedTier);
    return target.href;
  } catch {
    return rawSource;
  }
}
