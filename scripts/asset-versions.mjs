export const ASSET_VERSIONS = Object.freeze({
  "assets/analytics.js": "20260801-1",
  "assets/annotation-system.css": "20260802-2",
  "assets/art-coordinate-system.js": "20260802-4",
  "assets/design-tokens.css": "20260801-1",
  "assets/fonts.css": "20260801-1",
  "assets/responsive-foundation.v20260730-8.css": "20260801-2",
  "assets/responsive-safety.css": "20260801-5",
  "assets/responsive-safety.js": "20260801-3",
  "assets/route-motion.css": "20260801-2",
  "assets/scene-viewport.css": "20260802-8",
  "assets/service-interactions.js": "20260802-2",
  "assets/services/about/styles.css": "20260802-3",
  "assets/services/campaign/styles.css": "20260801-4",
  "assets/services/diagnosis/styles.css": "20260801-6",
  "assets/services/process/styles.css": "20260802-1",
  "assets/services/social/styles.css": "20260801-4",
  "assets/services/web/styles.css": "20260802-1",
  "assets/site-enhancements.css": "20260801-4",
  "assets/site-footer.css": "20260801-2",
  "assets/site-footer.js": "20260801-2",
  "assets/site-navigation.css": "20260801-3",
  "assets/story-standard.css": "20260801-4",
  "assets/tree-map-loader.js": "20260801-2",
});

export const versionedAsset = assetPath => {
  const normalized = assetPath.replace(/^\//, "");
  const version = ASSET_VERSIONS[normalized];
  if (!version) throw new Error(`Brak wersji wspólnego assetu: ${normalized}`);
  return `${normalized}?v=${version}`;
};
