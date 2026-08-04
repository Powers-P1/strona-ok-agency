import process from "node:process";
import { chromium } from "playwright";

const BASE_URL = process.env.OK_ANNOTATION_BASE_URL || "http://127.0.0.1:7133";
const ROUTES = [
  "/strony-internetowe",
  "/kampanie",
  "/social-media",
  "/proces",
  "/diagnoza",
  "/o-nas",
];
const SCENE_SELECTOR = [
  ".campaign-frame",
  ".social-frame",
  ".process-frame",
  ".diagnosis-frame",
  ".about-page .scene",
].join(",");
const CALLOUT_SELECTOR = ".annotation-callout, .annotation";
const SEARCH_RADIUS = 220;
const CENTER_TOLERANCE = 6;
const requestedRoute = process.env.OK_ANNOTATION_ROUTE || "";
const suggest = process.argv.includes("--suggest");
const selectedRoutes = requestedRoute
  ? ROUTES.filter(route => route === requestedRoute)
  : ROUTES;

if (!selectedRoutes.length) throw new Error(`Unknown annotation route: ${requestedRoute}`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const failures = [];
const suggestions = [];
const tierCounts = { energy: 0, highlight: 0, structure: 0 };

const assignSeparatedCandidates = entries => {
  const solve = minimumSeparation => {
    let best = null;
    const chosen = [];
    const search = (index, cost) => {
      if (best && cost >= best.cost) return;
      if (index === entries.length) {
        best = { cost, points: chosen.map(point => ({ ...point })) };
        return;
      }
      const entry = entries[index];
      for (const candidate of entry.candidates.slice(0, 24)) {
        if (chosen.some(point => Math.hypot(point.x - candidate.x, point.y - candidate.y) < minimumSeparation)) {
          continue;
        }
        const distance = Math.hypot(candidate.x - entry.anchor.x, candidate.y - entry.anchor.y);
        chosen.push(candidate);
        search(index + 1, cost + distance * distance);
        chosen.pop();
      }
    };
    search(0, 0);
    return best;
  };
  return solve(88) || solve(72) || solve(56);
};

try {
  for (const route of selectedRoutes) {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${route}?audit=hotspots`, {
      waitUntil: "domcontentloaded",
    });
    await page.evaluate(async sceneSelector => {
      const images = [...document.querySelectorAll(sceneSelector)]
        .map(scene => scene.querySelector(":scope > .campaign-art, :scope > .scene-art"))
        .filter(Boolean);
      images.forEach(image => { image.loading = "eager"; });
      await Promise.all(images.map(image => image.decode().catch(() => undefined)));
      if (document.fonts) await document.fonts.ready;
    }, SCENE_SELECTOR);

    const routeResult = await page.evaluate(async ({
      sceneSelector,
      calloutSelector,
      searchRadius,
      centerTolerance,
    }) => {
      const tierFor = value => (
        value >= 220 ? "energy" : value >= 96 ? "highlight" : value > 0 ? "structure" : null
      );
      const profilePair = (callout, profile) => {
        const suffix = profile === "base"
          ? ""
          : profile[0].toUpperCase() + profile.slice(1);
        const x = Number(callout.dataset[`artX${suffix}`]);
        const y = Number(callout.dataset[`artY${suffix}`]);
        return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
      };
      const sample = (pixels, width, height, x, y) => {
        const sampleX = Math.min(width - 1, Math.max(0, Math.round(x)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.round(y)));
        const value = pixels[(sampleY * width + sampleX) * 4];
        return { x: sampleX, y: sampleY, value, tier: tierFor(value) };
      };
      const nearestPlacement = (pixels, width, height, anchor, requiredTier, energyPixels) => {
        let best = null;
        if (requiredTier === "energy") {
          for (let index = 0; index < energyPixels.length; index += 2) {
            const x = energyPixels[index];
            const y = energyPixels[index + 1];
            const distance = Math.hypot(x - anchor.x, y - anchor.y);
            if (!best || distance < best.distance) {
              best = { x, y, value: 255, tier: "energy", distance };
            }
          }
          return best;
        }
        const minimumX = Math.max(0, Math.floor(anchor.x - searchRadius));
        const maximumX = Math.min(width - 1, Math.ceil(anchor.x + searchRadius));
        const minimumY = Math.max(0, Math.floor(anchor.y - searchRadius));
        const maximumY = Math.min(height - 1, Math.ceil(anchor.y + searchRadius));
        for (let y = minimumY; y <= maximumY; y += 1) {
          for (let x = minimumX; x <= maximumX; x += 1) {
            const distance = Math.hypot(x - anchor.x, y - anchor.y);
            if (distance > searchRadius) continue;
            const candidate = sample(pixels, width, height, x, y);
            if (!candidate.tier) continue;
            if (requiredTier && candidate.tier !== requiredTier) continue;
            if (
              !best
              || distance < best.distance - 0.01
              || (Math.abs(distance - best.distance) <= 0.01 && candidate.value > best.value)
            ) {
              best = { ...candidate, distance };
            }
          }
        }
        return best;
      };

      const results = [];
      const scenes = [...document.querySelectorAll(sceneSelector)];
      for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex += 1) {
        const scene = scenes[sceneIndex];
        const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
        const callouts = [...scene.querySelectorAll(calloutSelector)];
        if (!art || !callouts.length) continue;

        const coordinateWidth = Number(art.getAttribute("width")) || art.naturalWidth;
        const coordinateHeight = Number(art.getAttribute("height")) || art.naturalHeight;
        const requiredTier = art.dataset.placementEnergy === "none" ? null : "energy";
        const maskSource = art.dataset.placementMask;
        if (!maskSource) {
          results.push({
            scene: scene.id || `scene-${sceneIndex + 1}`,
            key: "mask",
            profile: "base",
            source: art.getAttribute("src"),
            maskSource: null,
            maskProblem: "missing data-placement-mask",
          });
          continue;
        }

        const mask = new Image();
        mask.decoding = "async";
        mask.src = new URL(maskSource, location.href).href;
        try {
          await mask.decode();
        } catch {
          results.push({
            scene: scene.id || `scene-${sceneIndex + 1}`,
            key: "mask",
            profile: "base",
            source: art.getAttribute("src"),
            maskSource,
            maskProblem: "mask failed to decode",
          });
          continue;
        }
        if (mask.naturalWidth !== coordinateWidth || mask.naturalHeight !== coordinateHeight) {
          results.push({
            scene: scene.id || `scene-${sceneIndex + 1}`,
            key: "mask",
            profile: "base",
            source: art.getAttribute("src"),
            maskSource,
            maskProblem: `mask is ${mask.naturalWidth}x${mask.naturalHeight}, expected ${coordinateWidth}x${coordinateHeight}`,
          });
          continue;
        }

        const canvas = document.createElement("canvas");
        canvas.width = coordinateWidth;
        canvas.height = coordinateHeight;
        const drawing = canvas.getContext("2d", { willReadFrequently: true });
        drawing.drawImage(mask, 0, 0);
        const pixels = drawing.getImageData(0, 0, coordinateWidth, coordinateHeight).data;
        const energyPixels = [];
        const energyBuckets = new Map();
        for (let y = 0; y < coordinateHeight; y += 1) {
          for (let x = 0; x < coordinateWidth; x += 1) {
            if (pixels[(y * coordinateWidth + x) * 4] < 220) continue;
            energyPixels.push(x, y);
            const bucketKey = `${Math.floor(x / 24)}:${Math.floor(y / 24)}`;
            if (!energyBuckets.has(bucketKey)) energyBuckets.set(bucketKey, { x, y });
          }
        }
        const energyCandidatePool = [...energyBuckets.values()];

        callouts.forEach((callout, calloutIndex) => {
          const key = callout.dataset.annotation
            || callout.querySelector(".annotation-dot")?.getAttribute("aria-controls")
            || callout.id
            || `callout-${calloutIndex + 1}`;
          ["base", "compact", "short"].forEach(profile => {
            const anchor = profilePair(callout, profile);
            if (!anchor) return;
            const center = sample(pixels, coordinateWidth, coordinateHeight, anchor.x, anchor.y);
            const nearest = nearestPlacement(
              pixels,
              coordinateWidth,
              coordinateHeight,
              anchor,
              requiredTier,
              energyPixels,
            );
            const centerMatches = requiredTier
              ? center.tier === requiredTier
              : Boolean(center.tier);
            const candidates = requiredTier === "energy"
              ? [
                ...(centerMatches ? [{ x: anchor.x, y: anchor.y }] : []),
                ...energyCandidatePool
                  .map(point => ({
                    ...point,
                    distance: Math.hypot(point.x - anchor.x, point.y - anchor.y),
                  }))
                  .sort((first, second) => first.distance - second.distance)
                  .slice(0, 48),
              ].filter((point, index, list) => (
                list.findIndex(candidate => candidate.x === point.x && candidate.y === point.y) === index
              ))
              : [];
            results.push({
              scene: scene.id || `scene-${sceneIndex + 1}`,
              key,
              profile,
              source: art.getAttribute("src"),
              maskSource,
              coordinateWidth,
              coordinateHeight,
              anchor,
              requiredTier,
              center,
              nearest,
              candidates,
              centerPasses: Boolean(centerMatches || (nearest && nearest.distance <= centerTolerance)),
            });
          });
        });
      }
      return results;
    }, {
      sceneSelector: SCENE_SELECTOR,
      calloutSelector: CALLOUT_SELECTOR,
      searchRadius: SEARCH_RADIUS,
      centerTolerance: CENTER_TOLERANCE,
    });

    routeResult.forEach(result => {
      if (result.maskProblem) failures.push({ route, ...result });
    });
    await page.waitForFunction(() => (
      window.OKAgencyAnnotationGeometryDebug?.snapshot?.().some(entry => (
        entry.status !== "pending" && entry.selected?.length
      ))
    ));
    const runtimeResults = await page.evaluate(() => (
      window.OKAgencyAnnotationGeometryDebug.snapshot().flatMap(entry => (
        (entry.selected || []).map(selection => ({
          scene: entry.scene,
          status: entry.status,
          ...selection,
        }))
      ))
    ));
    runtimeResults.forEach(result => {
      if (result.state === "hidden") return;
      const minimum = result.tier === "energy" ? 220 : result.tier === "highlight" ? 96 : 1;
      if (!Number.isFinite(result.value) || result.value < minimum) {
        failures.push({
          route,
          scene: result.scene,
          key: result.key,
          profile: "runtime",
          runtimeProblem: `selected ${result.tier || "unknown"} pixel ${result.value}, expected at least ${minimum}`,
        });
        return;
      }
      tierCounts[result.tier] += 1;
    });
    const groups = new Map();
    routeResult
      .filter(result => result.requiredTier === "energy" && result.candidates?.length)
      .forEach(result => {
        const groupKey = `${result.scene}:${result.profile}`;
        if (!groups.has(groupKey)) groups.set(groupKey, []);
        groups.get(groupKey).push(result);
      });
    groups.forEach(entries => {
      const assignment = assignSeparatedCandidates(entries);
      if (!assignment) return;
      entries.forEach((entry, index) => {
        const point = assignment.points[index];
        const distance = Math.hypot(point.x - entry.anchor.x, point.y - entry.anchor.y);
        if (distance <= CENTER_TOLERANCE && entry.centerPasses) return;
        suggestions.push({
          route,
          scene: entry.scene,
          key: entry.key,
          profile: entry.profile,
          from: entry.anchor,
          to: { x: point.x, y: point.y },
          tier: "energy",
          distance: Math.round(distance * 10) / 10,
        });
      });
    });
    await page.close();
  }
} finally {
  await context.close();
  await browser.close();
}

if (suggest) console.log(JSON.stringify(suggestions, null, 2));

if (failures.length) {
  console.error(`Annotation placement-mask audit failed (${failures.length} anchors/masks).`);
  failures.forEach(failure => {
    if (failure.maskProblem) {
      console.error(`- ${failure.route} #${failure.scene}: ${failure.maskProblem}`);
      return;
    }
    if (failure.runtimeProblem) {
      console.error(`- ${failure.route} #${failure.scene} ${failure.key}: ${failure.runtimeProblem}`);
      return;
    }
    const nearest = failure.nearest
      ? `nearest required ${failure.requiredTier || "artwork"} pixel ${failure.nearest.distance.toFixed(1)}px away at ${failure.nearest.x},${failure.nearest.y}`
      : `no required ${failure.requiredTier || "artwork"} pixel within ${SEARCH_RADIUS}px`;
    console.error(
      `- ${failure.route} #${failure.scene} ${failure.key} [${failure.profile}] `
      + `at ${failure.anchor.x},${failure.anchor.y}: ${nearest}`,
    );
  });
  process.exitCode = 1;
} else {
  console.log(
    `Annotation placement-mask audit passed (${selectedRoutes.length} routes): `
    + `${tierCounts.energy} energy, ${tierCounts.highlight} highlight, ${tierCounts.structure} structure anchors.`,
  );
}
