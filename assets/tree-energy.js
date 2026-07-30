(() => {
  "use strict";

  const map = window.TREE_LIGHT_MAP;
  const hero = document.getElementById("hero");
  const rig = document.getElementById("image-rig");
  const sculpture = document.getElementById("sculpture");
  const canvas = document.getElementById("light-canvas");
  const context = canvas?.getContext("2d");
  const stoneMap = window.STONE_NEURAL_MAP;
  const stoneCanvas = document.getElementById("stone-neural-canvas");
  const stoneContext = stoneCanvas?.getContext("2d");
  const intro = document.getElementById("intro");
  const explore = document.getElementById("explore");
  const detail = document.getElementById("root-detail");
  const back = document.getElementById("back");
  const activationLinks = [...document.querySelectorAll("[data-activate-hero]")];
  const emissiveMap = new Image();
  const emissiveScratch = document.createElement("canvas");
  const emissiveContext = emissiveScratch.getContext("2d");
  const stoneScratch = document.createElement("canvas");
  const stoneScratchContext = stoneScratch.getContext("2d");
  const stoneAtlases = {
    back: document.createElement("canvas"),
    mid: document.createElement("canvas"),
    front: document.createElement("canvas")
  };
  const stoneAtlasContexts = {
    back: stoneAtlases.back.getContext("2d"),
    mid: stoneAtlases.mid.getContext("2d"),
    front: stoneAtlases.front.getContext("2d")
  };

  if (
    !map
    || !hero
    || !rig
    || !sculpture
    || !context
    || !emissiveContext
    || !intro
    || !explore
    || !detail
    || !back
  ) return;

  const params = new URLSearchParams(window.location.search);
  const debugMap = params.get("debugMap") === "1";
  const editMap = debugMap && params.get("editMap") === "1";
  const debugRoute = debugMap ? params.get("debugRoute") : null;
  const debugPerformance = params.get("debugPerf") === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const motionPaused = () => (
    reducedMotion.matches
    || document.documentElement.dataset.motion === "paused"
  );
  const originalCtaLabel = explore.textContent.trim();
  const edgeById = new Map(map.edges.map((edge) => [edge.id, edge]));
  const sampledEdges = new Map();
  const signalTimeScale = .5;
  const signalTime = (milliseconds) => milliseconds * signalTimeScale;
  const speedByKind = { root: 250, trunk: 285, branch: 360, twig: 430 };
  const widthByKind = { root: 5.2, trunk: 4.5, branch: 3.2, twig: 2.15 };
  const depthAlpha = { front: 1, mid: .79, back: .56 };
  /*
   * Responsive hero plates use the same sculpture as the 1672 x 941 master,
   * but recompose it inside 4:3 and portrait canvases. These registrations map
   * master-image pixels into the native pixels of each responsive plate.
   */
  const responsiveArtMaps = [
    {
      id: "compact",
      sourceMatch: "editorial-atelier-scene-compact-v2",
      image: { width: 1448, height: 1086 },
      registration: {
        scaleX: .6084,
        scaleY: .632,
        offsetX: 249.7,
        offsetY: 478.2
      }
    },
    {
      id: "portrait",
      sourceMatch: "editorial-atelier-scene-mobile-v1",
      image: { width: 941, height: 1672 },
      registration: {
        scaleX: .7149,
        scaleY: .7251,
        offsetX: -270.3,
        offsetY: 841
      }
    }
  ];
  const idleIntervals = [1.7, 3.8, 2.25, 4.55, 1.9, 3.05, 2.6, 4.2, 2.05, 3.45, 1.8, 4.75];
  const groupOrder = [2, 0, 4, 1, 5, 3, 2, 5, 0, 4, 1, 3];
  const bloomMeta = {
    endLL1: { rotation: -.35, scale: 1.06 },
    endLL2: { rotation: .22, scale: .82 },
    endLFar: { rotation: -.72, scale: .98 },
    endLUpper: { rotation: .36, scale: .9 },
    endTopLeft: { rotation: -.18, scale: .92 },
    endTopCenter: { rotation: .45, scale: .86 },
    endTopRight: { rotation: -.52, scale: 1.02 },
    endRUpper: { rotation: .12, scale: .94 },
    endRFar: { rotation: -.28, scale: 1.08 },
    endRMid: { rotation: .61, scale: .86 },
    endRLow: { rotation: -.44, scale: 1.05 }
  };

  let cssWidth = 0;
  let cssHeight = 0;
  let dpr = 1;
  let frame = 0;
  let lastRenderedAt = 0;
  const frameInterval = 1000 / 30;
  let pageVisible = !document.hidden;
  let hiddenAt = 0;
  let nextIdleAt = Number.POSITIVE_INFINITY;
  let nextRelayAt = Number.POSITIVE_INFINITY;
  let idleIndex = 0;
  let lastIdleRootIndex = -1;
  let lastRelayIndex = -1;
  let pulses = [];
  let blossoms = [];
  let coreFeeds = [];
  let synapseFlashes = [];
  let endpointRoutes = [];
  let relayRoutes = [];
  let synapseNodeIds = [];
  let nodeDegree = new Map();
  let pointerHighlight = null;
  let activationRunning = false;
  let activationStarted = 0;
  let activationOpenAt = 0;
  let activationScroll = 0;
  let reducedPending = false;
  let reducedTimer = 0;
  let detailOpen = false;
  let activationTrigger = explore;
  let emissiveReady = false;
  let performancePrevious = 0;
  let performanceSamples = [];
  let stoneCssWidth = 0;
  let stoneCssHeight = 0;
  let stonePulses = [];
  let nextStoneAt = Number.POSITIVE_INFINITY;
  let lastStoneRoute = -1;
  let stonePointerX = 0;
  let stonePointerY = 0;
  let stoneEdgeCache = new Map();
  let stoneRoutes = [];
  let stoneSprites = {};
  let artTransform = {
    id: "desktop",
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0
  };
  const stoneDirectionCounts = { forward: 0, reverse: 0 };

  emissiveMap.decoding = "async";
  emissiveMap.addEventListener("load", () => {
    emissiveReady = true;
    rebuildStoneAtlases();
    if (cssWidth > 0 && cssHeight > 0) drawFrame(performance.now());
  });
  emissiveMap.src = "assets/wire-base-emissive-map-v4.png";

  function recordPerformance(now) {
    if (!debugPerformance) return;
    if (performancePrevious) {
      const delta = now - performancePrevious;
      if (delta > 0 && delta < 250) performanceSamples.push(delta);
      if (performanceSamples.length >= 45) {
        const recent = performanceSamples.slice(-45);
        const sorted = [...recent].sort((a, b) => a - b);
        const average = recent.reduce((sum, value) => sum + value, 0) / recent.length;
        document.documentElement.dataset.treeFps = (1000 / average).toFixed(1);
        document.documentElement.dataset.treeFrameP95 = sorted[Math.floor(sorted.length * .95)].toFixed(1);
        performanceSamples = performanceSamples.slice(-24);
      }
    }
    performancePrevious = now;
  }

  function cubic(a, c1, c2, b, t) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    return [
      mt2 * mt * a[0] + 3 * mt2 * t * c1[0] + 3 * mt * t2 * c2[0] + t2 * t * b[0],
      mt2 * mt * a[1] + 3 * mt2 * t * c1[1] + 3 * mt * t2 * c2[1] + t2 * t * b[1]
    ];
  }

  function intrinsicDistance(a, b) {
    return Math.hypot(
      (b[0] - a[0]) * map.image.width,
      (b[1] - a[1]) * map.image.height
    );
  }

  function stoneLocalPoint(point) {
    if (!stoneMap) return [0, 0];
    return [
      (point[0] - stoneMap.region.x) / stoneMap.region.width,
      (point[1] - stoneMap.region.y) / stoneMap.region.height
    ];
  }

  function buildStoneEdgeCache(edge) {
    const start = stoneMap.nodes[edge.from];
    const end = stoneMap.nodes[edge.to];
    const samples = [];
    const cumulative = [0];
    let length = 0;
    const steps = 28;
    for (let index = 0; index <= steps; index += 1) {
      const fullPoint = cubic(start, edge.c1, edge.c2, end, index / steps);
      const point = stoneLocalPoint(fullPoint);
      samples.push(point);
      if (index > 0) {
        const previous = samples[index - 1];
        length += Math.hypot(
          (point[0] - previous[0]) * stoneMap.region.width * stoneMap.image.width,
          (point[1] - previous[1]) * stoneMap.region.height * stoneMap.image.height
        );
        cumulative.push(length);
      }
    }
    return { edge, samples, cumulative, length };
  }

  function rebuildStoneGraph() {
    stoneEdgeCache = new Map();
    stoneRoutes = [];
    if (!stoneMap) return;
    stoneMap.edges.forEach((edge) => {
      stoneEdgeCache.set(edge.id, buildStoneEdgeCache(edge));
    });
    stoneRoutes = stoneMap.routes.map((edgeIds, index) => {
      const segments = edgeIds.map((id) => stoneEdgeCache.get(id)).filter(Boolean);
      const cumulative = [0];
      let length = 0;
      segments.forEach((segment) => {
        length += segment.length;
        cumulative.push(length);
      });
      return { index, edgeIds, segments, cumulative, length };
    }).filter((route) => route.segments.length);
  }

  function sampleStoneEdge(cache, progress) {
    const target = Math.max(0, Math.min(.999999, progress)) * cache.length;
    let index = 1;
    while (index < cache.cumulative.length && cache.cumulative[index] < target) index += 1;
    index = Math.min(index, cache.samples.length - 1);
    const previousLength = cache.cumulative[index - 1];
    const segmentLength = Math.max(.0001, cache.cumulative[index] - previousLength);
    const local = (target - previousLength) / segmentLength;
    const a = cache.samples[index - 1];
    const b = cache.samples[index];
    return {
      x: a[0] + (b[0] - a[0]) * local,
      y: a[1] + (b[1] - a[1]) * local,
      edge: cache.edge
    };
  }

  function sampleStonePath(path, progress) {
    const target = Math.max(0, Math.min(.999999, progress)) * path.length;
    let index = 0;
    while (index < path.segments.length - 1 && path.cumulative[index + 1] < target) index += 1;
    const segment = path.segments[index];
    return sampleStoneEdge(
      segment,
      (target - path.cumulative[index]) / Math.max(.0001, segment.length)
    );
  }

  function sampleStonePulsePath(pulse, progress) {
    return sampleStonePath(
      pulse.route,
      pulse.direction === -1 ? 1 - progress : progress
    );
  }

  function createStoneSprite(depth, tone) {
    const sprite = document.createElement("canvas");
    const size = 64;
    sprite.width = size;
    sprite.height = size;
    const spriteContext = sprite.getContext("2d");
    if (!spriteContext) return sprite;
    const center = size / 2;
    const radius = depth === "back" ? 26 : depth === "mid" ? 21 : 16;
    const gradient = spriteContext.createRadialGradient(center, center, 0, center, center, radius);
    gradient.addColorStop(0, depth === "front" ? "rgba(255,255,241,.98)" : "rgba(255,232,196,.86)");
    gradient.addColorStop(.13, tone === "pink" ? "rgba(255,151,166,.78)" : "rgba(255,188,126,.8)");
    gradient.addColorStop(.43, tone === "pink" ? "rgba(255,76,125,.28)" : "rgba(229,107,62,.25)");
    gradient.addColorStop(1, "rgba(255,70,105,0)");
    spriteContext.fillStyle = gradient;
    spriteContext.fillRect(0, 0, size, size);
    return sprite;
  }

  function rebuildStoneSprites() {
    stoneSprites = {};
    ["back", "mid", "front"].forEach((depth) => {
      ["amber", "pink"].forEach((tone) => {
        stoneSprites[`${depth}:${tone}`] = createStoneSprite(depth, tone);
      });
    });
  }

  function rebuildStoneAtlases() {
    if (!stoneMap || !emissiveReady || !stoneCssWidth || !stoneCssHeight) return;
    const width = Math.max(2, Math.round(stoneCssWidth));
    const height = Math.max(2, Math.round(stoneCssHeight));
    const sourceX = stoneMap.region.x * stoneMap.image.width;
    const sourceY = stoneMap.region.y * stoneMap.image.height;
    const sourceWidth = stoneMap.region.width * stoneMap.image.width;
    const sourceHeight = stoneMap.region.height * stoneMap.image.height;
    const settings = {
      back: { blur: 2.2, alpha: .54 },
      mid: { blur: .75, alpha: .78 },
      front: { blur: 0, alpha: 1 }
    };
    Object.entries(stoneAtlases).forEach(([depth, atlas]) => {
      atlas.width = width;
      atlas.height = height;
      const atlasContext = stoneAtlasContexts[depth];
      if (!atlasContext) return;
      atlasContext.clearRect(0, 0, width, height);
      atlasContext.save();
      atlasContext.globalAlpha = settings[depth].alpha;
      atlasContext.filter = settings[depth].blur ? `blur(${settings[depth].blur}px)` : "none";
      atlasContext.drawImage(
        emissiveMap,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height
      );
      atlasContext.restore();
    });
  }

  rebuildStoneGraph();
  rebuildStoneSprites();

  function buildEdgeCache(edge) {
    const start = map.nodes[edge.from];
    const end = map.nodes[edge.to];
    const samples = [];
    const cumulative = [0];
    const steps = edge.kind === "twig" ? 34 : 46;
    let length = 0;

    for (let index = 0; index <= steps; index += 1) {
      const point = cubic(start, edge.c1, edge.c2, end, index / steps);
      samples.push(point);
      if (index > 0) {
        length += intrinsicDistance(samples[index - 1], point);
        cumulative.push(length);
      }
    }

    return { edge, samples, cumulative, length };
  }

  map.edges.forEach((edge) => sampledEdges.set(edge.id, buildEdgeCache(edge)));

  function rebuildEdgeCaches() {
    edgeById.clear();
    sampledEdges.clear();
    map.edges.forEach((edge) => {
      edgeById.set(edge.id, edge);
      sampledEdges.set(edge.id, buildEdgeCache(edge));
    });
    rebuildGraphRoutes();
  }

  function activeRoots() {
    const configured = map.roots.filter((route) => (
      route.length > 0 && route.every((edgeId) => edgeById.has(edgeId))
    ));
    const directCoreRoots = map.edges
      .filter((edge) => edge.kind === "root" && edge.from === "source")
      .map((edge) => [edge.id]);
    const seen = new Set();
    return [...configured, ...directCoreRoots].filter((route) => {
      const key = route.join("|");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function sourceNodeIds() {
    const ids = activeRoots()
      .map((route) => edgeById.get(route[0])?.from)
      .filter((id) => id && map.nodes[id]);
    return [...new Set(ids.length ? ids : ["source"])];
  }

  function shuffledRoots() {
    const roots = activeRoots();
    for (let index = roots.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [roots[index], roots[swap]] = [roots[swap], roots[index]];
    }
    return roots;
  }

  function randomRoot() {
    const roots = activeRoots();
    if (roots.length <= 1) return roots[0] || [];
    let index = Math.floor(Math.random() * roots.length);
    if (index === lastIdleRootIndex) {
      index = (index + 1 + Math.floor(Math.random() * (roots.length - 1))) % roots.length;
    }
    lastIdleRootIndex = index;
    return roots[index];
  }

  function pathFrom(startNode, targetNode) {
    if (!map.nodes[startNode] || !map.nodes[targetNode]) return [];
    if (startNode === targetNode) return [];
    const outgoing = new Map();
    map.edges.forEach((edge) => {
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
      outgoing.get(edge.from).push(edge);
    });
    const queue = [{ node: startNode, edges: [] }];
    const visited = new Set([startNode]);
    while (queue.length) {
      const current = queue.shift();
      for (const edge of outgoing.get(current.node) || []) {
        const edges = [...current.edges, edge.id];
        if (edge.to === targetNode) return edges;
        if (visited.has(edge.to)) continue;
        visited.add(edge.to);
        queue.push({ node: edge.to, edges });
      }
    }
    return [];
  }

  function rebuildGraphRoutes() {
    const outgoing = new Map();
    const incoming = new Map();
    nodeDegree = new Map(Object.keys(map.nodes).map((id) => [id, 0]));
    map.edges.forEach((edge) => {
      if (!outgoing.has(edge.from)) outgoing.set(edge.from, []);
      if (!incoming.has(edge.to)) incoming.set(edge.to, []);
      outgoing.get(edge.from).push(edge);
      incoming.get(edge.to).push(edge);
      nodeDegree.set(edge.from, (nodeDegree.get(edge.from) || 0) + 1);
      nodeDegree.set(edge.to, (nodeDegree.get(edge.to) || 0) + 1);
    });

    endpointRoutes = [...nodeDegree.entries()]
      .filter(([id, degree]) => degree === 1 && !["source", ...sourceNodeIds()].includes(id))
      .map(([endpoint]) => ({ endpoint, edges: pathFrom("flare", endpoint) }))
      .filter((route) => route.edges.length)
      .sort((a, b) => map.nodes[a.endpoint][0] - map.nodes[b.endpoint][0]);

    synapseNodeIds = Object.keys(map.nodes).filter((id) => (
      id !== "source"
      && !sourceNodeIds().includes(id)
      && (nodeDegree.get(id) || 0) !== 2
    ));

    relayRoutes = [];
    const starts = Object.keys(map.nodes).filter((id) => (
      id !== "source"
      && !sourceNodeIds().includes(id)
      && (outgoing.get(id)?.length || 0) > 0
      && (nodeDegree.get(id) || 0) >= 3
    ));
    starts.forEach((start) => {
      (outgoing.get(start) || []).forEach((firstEdge) => {
        if (firstEdge.kind === "root") return;
        const edges = [];
        let edge = firstEdge;
        let end = start;
        for (let step = 0; edge && step < 6; step += 1) {
          edges.push(edge.id);
          end = edge.to;
          const next = outgoing.get(end) || [];
          if ((nodeDegree.get(end) || 0) !== 2 || next.length !== 1) break;
          edge = next[0];
        }
        if (
          edges.length
          && end !== start
          && edges.some((id) => edgeById.get(id)?.kind !== "trunk")
          && buildPath(edges).durationSeconds <= 1.35
        ) {
          relayRoutes.push({ start, end, edges });
        }
      });
    });
  }

  rebuildGraphRoutes();

  function sampleEdge(edgeId, progress) {
    const cache = sampledEdges.get(edgeId);
    const target = Math.max(0, Math.min(1, progress)) * cache.length;
    let index = 1;
    while (index < cache.cumulative.length && cache.cumulative[index] < target) index += 1;
    index = Math.min(index, cache.samples.length - 1);
    const previousLength = cache.cumulative[index - 1];
    const segmentLength = Math.max(.0001, cache.cumulative[index] - previousLength);
    const local = (target - previousLength) / segmentLength;
    const a = cache.samples[index - 1];
    const b = cache.samples[index];
    return {
      x: a[0] + (b[0] - a[0]) * local,
      y: a[1] + (b[1] - a[1]) * local,
      tangentX: b[0] - a[0],
      tangentY: b[1] - a[1],
      edge: cache.edge
    };
  }

  function buildPath(edgeIds) {
    const segments = edgeIds.map((id) => sampledEdges.get(id));
    const cumulative = [0];
    let length = 0;
    let durationSeconds = 0;

    segments.forEach((segment) => {
      length += segment.length;
      cumulative.push(length);
      durationSeconds += segment.length / speedByKind[segment.edge.kind];
    });

    return {
      edgeIds,
      segments,
      cumulative,
      length,
      durationSeconds: Math.max(.24, durationSeconds)
    };
  }

  function samplePath(path, progress) {
    const target = Math.max(0, Math.min(.999999, progress)) * path.length;
    let index = 0;
    while (index < path.segments.length - 1 && path.cumulative[index + 1] < target) index += 1;
    const start = path.cumulative[index];
    const segment = path.segments[index];
    return sampleEdge(segment.edge.id, (target - start) / Math.max(.0001, segment.length));
  }

  function addPulse(edgeIds, start, options = {}) {
    const validIds = edgeIds.filter((id) => edgeById.has(id));
    if (!validIds.length) return null;
    const path = buildPath(validIds);
    const duration = Math.max(
      180,
      path.durationSeconds * 1000 * (options.durationScale || 1) * signalTimeScale
    );
    const pulse = {
      path,
      start,
      duration,
      end: start + duration,
      intensity: options.intensity || 1,
      terminal: options.terminal || null,
      bloomScale: options.bloomScale || 1,
      bloomTriggered: false,
      charge: Boolean(options.charge),
      relay: Boolean(options.relay)
    };
    pulses.push(pulse);
    return pulse;
  }

  function pulseArrivalAfter(pulse, completedEdges) {
    if (!pulse) return performance.now();
    const boundary = pulse.path.cumulative[Math.min(completedEdges, pulse.path.segments.length)];
    return pulse.start + pulse.duration * (boundary / Math.max(.0001, pulse.path.length));
  }

  function addCoreFeed(targetNode, start, options = {}) {
    const target = map.nodes[targetNode];
    if (!target) return null;
    const duration = options.duration || (targetNode === "source" ? 520 : 760);
    const feed = {
      targetNode,
      start,
      duration,
      end: start + duration,
      intensity: options.intensity || 1,
      charge: Boolean(options.charge),
      mappedHandoff: Boolean(options.mappedHandoff)
    };
    coreFeeds.push(feed);
    if (!motionPaused()) {
      scheduleStoneSource(
        targetNode,
        start + duration * (.055 + Math.random() * .035),
        {
          intensity: feed.intensity,
          charge: feed.charge
        }
      );
    }
    synapseFlashes.push({
      node: targetNode,
      start: feed.end - 80,
      duration: options.charge ? 940 : 620,
      intensity: options.charge ? .9 : .58
    });
    return feed;
  }

  function coreFeedPoint(feed, progress) {
    const start = map.source.center;
    const end = map.nodes[feed.targetNode] || start;
    const direction = Math.sign(end[0] - start[0]) || 1;
    const c1 = [
      start[0] + (end[0] - start[0]) * .28,
      start[1] - .012 - Math.abs(end[0] - start[0]) * .08
    ];
    const c2 = [
      start[0] + (end[0] - start[0]) * .72,
      end[1] + .01 + direction * .002
    ];
    return cubic(start, c1, c2, end, progress);
  }

  function mapPoint(point) {
    return [point[0] * cssWidth, point[1] * cssHeight];
  }

  function objectPositionFraction(value, axis) {
    const parts = String(value || "").trim().split(/\s+/);
    const token = parts[axis] || parts[0] || "50%";
    const keywords = {
      left: 0,
      top: 0,
      center: .5,
      right: 1,
      bottom: 1
    };
    if (token in keywords) return keywords[token];
    const match = token.match(/^(-?\d+(?:\.\d+)?)%$/);
    return match ? Number(match[1]) / 100 : .5;
  }

  function syncArtTransform() {
    const currentSource = sculpture.currentSrc || sculpture.src || "";
    const preset = responsiveArtMaps.find(({ sourceMatch }) => (
      currentSource.includes(sourceMatch)
    ));

    if (!preset || !cssWidth || !cssHeight) {
      artTransform = {
        id: "desktop",
        scaleX: 1,
        scaleY: 1,
        offsetX: 0,
        offsetY: 0
      };
      canvas.dataset.artMode = artTransform.id;
      return;
    }

    const style = getComputedStyle(sculpture);
    const fitScale = style.objectFit === "contain"
      ? Math.min(
          cssWidth / preset.image.width,
          cssHeight / preset.image.height
        )
      : Math.max(
          cssWidth / preset.image.width,
          cssHeight / preset.image.height
        );
    const renderedWidth = preset.image.width * fitScale;
    const renderedHeight = preset.image.height * fitScale;
    const objectLeft = (
      cssWidth - renderedWidth
    ) * objectPositionFraction(style.objectPosition, 0);
    const objectTop = (
      cssHeight - renderedHeight
    ) * objectPositionFraction(style.objectPosition, 1);

    artTransform = {
      id: preset.id,
      scaleX:
        preset.registration.scaleX
        * map.image.width
        * fitScale
        / cssWidth,
      scaleY:
        preset.registration.scaleY
        * map.image.height
        * fitScale
        / cssHeight,
      offsetX:
        objectLeft
        + preset.registration.offsetX * fitScale,
      offsetY:
        objectTop
        + preset.registration.offsetY * fitScale
    };
    canvas.dataset.artMode = artTransform.id;
  }

  function beginSourceClip() {
    context.beginPath();
    map.source.clip.forEach((point, index) => {
      const [x, y] = mapPoint(point);
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
  }

  function coreFeedLevel(feed, now) {
    if (now < feed.start || now > feed.end) return 0;
    const progress = Math.max(0, Math.min(1, (now - feed.start) / feed.duration));
    const envelope = progress < .22
      ? 1 - Math.pow(1 - progress / .22, 3)
      : Math.pow(Math.max(0, 1 - (progress - .22) / .78), .58);
    return Math.min(1.3, envelope * feed.intensity * (feed.charge ? 1.08 : .9));
  }

  function activeCoreSources(now) {
    return coreFeeds
      .map((feed, index) => ({
        feed,
        index,
        level: coreFeedLevel(feed, now),
        point: map.nodes[feed.targetNode] || map.source.center
      }))
      .filter((source) => source.level > .004);
  }

  function coreChargeAt(now) {
    return activeCoreSources(now).reduce(
      (strongest, source) => Math.max(strongest, source.level),
      0
    );
  }

  function sourceStrength(now, coreCharge = coreChargeAt(now)) {
    if (motionPaused()) return reducedPending ? 1.12 : .88;
    const slow = Math.sin((now / 7300) * Math.PI * 2 + .35);
    const slower = Math.sin((now / 10700) * Math.PI * 2 + 1.7);
    let value = .76 + slow * .05 + slower * .03 + coreCharge * .58;

    if (activationRunning) {
      const elapsed = now - activationStarted;
      if (elapsed < 680) value += .22 * Math.sin((elapsed / 680) * Math.PI * .5);
      else value += Math.max(0, .22 * (1 - (elapsed - 680) / 2600));
    }
    return Math.max(.66, Math.min(1.58, value));
  }

  function drawEmissiveFilaments(source, now, prominence = 1) {
    if (!emissiveReady) return;

    const [cx, cy] = mapPoint(source.point);
    const level = Math.min(1.25, source.level);
    const scale = cssWidth / map.image.width;
    const breath = motionPaused() ? .5 : (Math.sin(now / 940 + source.index * 1.7) + 1) * .5;
    const radiusX = Math.max(76, 190 * scale);
    const radiusY = Math.max(41, 96 * (cssHeight / map.image.height));
    const sourceRadiusX = radiusX / cssWidth * map.image.width;
    const sourceRadiusY = radiusY / cssHeight * map.image.height;
    const sourceX = source.point[0] * map.image.width;
    const sourceY = source.point[1] * map.image.height;
    const scratchWidth = Math.max(2, Math.ceil(radiusX * 2));
    const scratchHeight = Math.max(2, Math.ceil(radiusY * 2));

    if (emissiveScratch.width !== scratchWidth || emissiveScratch.height !== scratchHeight) {
      emissiveScratch.width = scratchWidth;
      emissiveScratch.height = scratchHeight;
    } else {
      emissiveContext.clearRect(0, 0, scratchWidth, scratchHeight);
    }

    emissiveContext.globalCompositeOperation = "source-over";
    emissiveContext.globalAlpha = Math.min(.94, (.38 + level * .38) * (.76 + prominence * .24));
    emissiveContext.drawImage(
      emissiveMap,
      sourceX - sourceRadiusX,
      sourceY - sourceRadiusY,
      sourceRadiusX * 2,
      sourceRadiusY * 2,
      0,
      0,
      scratchWidth,
      scratchHeight
    );

    emissiveContext.globalCompositeOperation = "destination-in";
    emissiveContext.globalAlpha = 1;
    emissiveContext.save();
    emissiveContext.translate(scratchWidth / 2, scratchHeight / 2);
    emissiveContext.scale(1, radiusY / radiusX);
    const reveal = emissiveContext.createRadialGradient(0, 0, radiusX * .06, 0, 0, radiusX);
    const revealAlpha = Math.min(.86, (.2 + level * .5 + breath * .025) * (.8 + prominence * .2));
    reveal.addColorStop(0, `rgba(255, 255, 255, ${revealAlpha})`);
    reveal.addColorStop(.19, `rgba(255, 255, 255, ${revealAlpha * .96})`);
    reveal.addColorStop(.48, `rgba(255, 255, 255, ${revealAlpha * .7})`);
    reveal.addColorStop(.76, `rgba(255, 255, 255, ${revealAlpha * .24})`);
    reveal.addColorStop(1, "rgba(255, 255, 255, 0)");
    emissiveContext.fillStyle = reveal;
    emissiveContext.beginPath();
    emissiveContext.arc(0, 0, radiusX, 0, Math.PI * 2);
    emissiveContext.fill();
    emissiveContext.restore();

    context.save();
    context.globalCompositeOperation = "lighter";
    context.globalAlpha = Math.min(.86, (.34 + level * .36) * prominence);
    context.drawImage(
      emissiveScratch,
      cx - radiusX,
      cy - radiusY,
      radiusX * 2,
      radiusY * 2
    );
    context.restore();
  }

  function drawSourceNucleus(source, now, prominence = 1, dominant = false) {
    const [cx, cy] = mapPoint(source.point);
    const level = Math.min(1.25, source.level);
    const scale = Math.max(.66, cssWidth / map.image.width);
    const pulse = motionPaused() ? .5 : (Math.sin(now / 430 + source.index * 2.1) + 1) * .5;
    const radius = Math.max(6.8, 16.5 * scale)
      * (1 + level * .1 + pulse * .025)
      * (dominant ? 1 : .68);
    const strength = sourceStrength(now, level);
    const intensity = Math.min(.88, prominence * (.68 + level * .16));

    context.save();
    context.globalCompositeOperation = "lighter";

    const scatterRadius = radius * 6.3;
    const scatter = context.createRadialGradient(
      cx - radius * .35,
      cy + radius * .12,
      radius * .35,
      cx,
      cy,
      scatterRadius
    );
    scatter.addColorStop(0, `rgba(255, 183, 139, ${Math.min(.18, (.08 + level * .085) * intensity)})`);
    scatter.addColorStop(.3, `rgba(255, 112, 126, ${Math.min(.12, (.045 + level * .055) * intensity)})`);
    scatter.addColorStop(.68, `rgba(218, 49, 82, ${Math.min(.05, (.018 + level * .022) * intensity)})`);
    scatter.addColorStop(1, "rgba(196, 37, 75, 0)");
    context.fillStyle = scatter;
    context.beginPath();
    context.ellipse(cx, cy, scatterRadius, scatterRadius * .67, -.12, 0, Math.PI * 2);
    context.fill();

    const aura = context.createRadialGradient(cx, cy, radius * .08, cx, cy, radius * 4.8);
    aura.addColorStop(0, `rgba(255, 226, 188, ${Math.min(.72, (.29 + level * .26) * intensity)})`);
    aura.addColorStop(.15, `rgba(255, 166, 124, ${Math.min(.58, (.22 + level * .22) * intensity)})`);
    aura.addColorStop(.38, `rgba(255, ${dominant ? 103 : 87}, ${dominant ? 103 : 126}, ${Math.min(.34, (.08 + level * .16) * intensity)})`);
    aura.addColorStop(.72, `rgba(217, 49, 83, ${Math.min(.1, (.025 + level * .045) * intensity)})`);
    aura.addColorStop(1, "rgba(196, 37, 75, 0)");
    context.fillStyle = aura;
    context.beginPath();
    context.arc(cx, cy, radius * 4.65, 0, Math.PI * 2);
    context.fill();

    const core = context.createRadialGradient(
      cx - radius * .16,
      cy - radius * .18,
      0,
      cx,
      cy,
      radius
    );
    core.addColorStop(0, `rgba(255, 239, 207, ${Math.min(.8, (.36 + level * .28) * intensity)})`);
    core.addColorStop(.26, `rgba(255, 204, 157, ${Math.min(.78, (.34 + level * .28) * intensity)})`);
    core.addColorStop(.58, `rgba(255, ${dominant ? 127 : 105}, ${dominant ? 112 : 139}, ${Math.min(.56, (.2 + level * .22) * intensity)})`);
    core.addColorStop(1, "rgba(239, 63, 96, 0)");
    context.fillStyle = core;
    context.beginPath();
    context.ellipse(cx, cy, radius, radius * .82, -.18, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = `rgba(255, 234, 199, ${Math.min(.72, (.12 + strength * .2 + level * .18) * intensity)})`;
    context.beginPath();
    context.arc(
      cx - radius * .14,
      cy - radius * .15,
      Math.max(.9, radius * .14),
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();

    context.save();
    context.globalCompositeOperation = "lighter";
    /*
      The accepted plate is keyed from upper-left/front. Let emitted light
      bounce down and a little to the right instead of mirroring it directly
      under the nucleus; this keeps the live caustic consistent with the baked
      floor shadow.
    */
    const reflectionX = Math.min(cssWidth * .985, cx + radius * 1.15);
    const reflectionY = Math.min(cssHeight * .925, cy + cssHeight * .066);
    const reflectionRadius = Math.max(22, 58 * scale);
    const reflection = context.createRadialGradient(
      reflectionX,
      reflectionY,
      0,
      reflectionX,
      reflectionY,
      reflectionRadius
    );
    reflection.addColorStop(0, `rgba(255, 171, 128, ${Math.min(.15, level * .1 * prominence)})`);
    reflection.addColorStop(.38, `rgba(255, 85, 117, ${Math.min(.06, level * .04 * prominence)})`);
    reflection.addColorStop(1, "rgba(255, 91, 126, 0)");
    context.fillStyle = reflection;
    context.beginPath();
    context.ellipse(
      reflectionX,
      reflectionY,
      reflectionRadius,
      Math.max(2.5, 5.2 * scale),
      .055,
      0,
      Math.PI * 2
    );
    context.fill();
    context.restore();
  }

  function drawInternalSource(now) {
    const activeSources = activeCoreSources(now);
    if (!activeSources.length) return;

    const dominant = activeSources.reduce(
      (strongest, source) => (
        source.level * source.feed.intensity > strongest.level * strongest.feed.intensity
          ? source
          : strongest
      )
    );

    activeSources.forEach((source) => {
      const prominence = source === dominant
        ? .98
        : .16 + Math.min(.08, source.level * .07);
      drawEmissiveFilaments(source, now, prominence);
    });
    drawSourceNucleus(dominant, now, .96, true);
  }

  function drawCoreFeeds(now) {
    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    coreFeeds.forEach((feed) => {
      if (now < feed.start || now > feed.end) return;
      const progress = Math.max(0, Math.min(1, (now - feed.start) / feed.duration));
      const sourceTarget = map.nodes[feed.targetNode];
      const isCorePulse = sourceTarget
        && Math.hypot(
          sourceTarget[0] - map.source.center[0],
          sourceTarget[1] - map.source.center[1]
        ) < .006;
      if (isCorePulse || feed.mappedHandoff) {
        // The internal source renders this charge as living energy spreading
        // through the material. A separate geometric ring reads like a lamp.
        return;
      }

      let previous = null;
      const trailLength = feed.charge ? .46 : .34;
      for (let step = 16; step >= 0; step -= 1) {
        const local = progress - trailLength * (step / 16);
        if (local < 0) continue;
        const point = coreFeedPoint(feed, local);
        const [x, y] = mapPoint(point);
        if (previous) {
          const alpha = (1 - step / 17) * feed.intensity;
          context.beginPath();
          context.moveTo(previous[0], previous[1]);
          context.lineTo(x, y);
          context.strokeStyle = `rgba(255, 154, 158, ${alpha * (feed.charge ? .46 : .29)})`;
          context.lineWidth = Math.max(.7, cssWidth / map.image.width * (feed.charge ? 2.1 : 1.35));
          context.stroke();
        }
        previous = [x, y];
      }
      const head = mapPoint(coreFeedPoint(feed, progress));
      const radius = Math.max(3, cssWidth * .0048) * (feed.charge ? 1.15 : 1);
      const glow = context.createRadialGradient(head[0], head[1], 0, head[0], head[1], radius);
      glow.addColorStop(0, `rgba(255, 253, 234, ${.94 * feed.intensity})`);
      glow.addColorStop(.25, `rgba(255, 206, 174, ${.7 * feed.intensity})`);
      glow.addColorStop(.62, `rgba(255, 92, 141, ${.25 * feed.intensity})`);
      glow.addColorStop(1, "rgba(255, 92, 141, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(head[0], head[1], radius, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function drawSynapses(now) {
    const scale = Math.max(.72, cssWidth / map.image.width);
    context.save();
    context.globalCompositeOperation = "lighter";
    synapseNodeIds.forEach((id, index) => {
      const point = map.nodes[id];
      if (!point) return;
      const [x, y] = mapPoint(point);
      const shimmer = motionPaused() ? .72 : .65 + Math.sin(now / 2300 + index * .87) * .2;
      context.fillStyle = `rgba(255, 218, 198, ${.11 * shimmer})`;
      context.beginPath();
      context.arc(x, y, Math.max(.62, .9 * scale), 0, Math.PI * 2);
      context.fill();
    });
    synapseFlashes.forEach((flash) => {
      if (now < flash.start || now > flash.start + flash.duration) return;
      const point = map.nodes[flash.node];
      if (!point) return;
      const phase = (now - flash.start) / flash.duration;
      const envelope = phase < .22 ? phase / .22 : Math.pow(1 - (phase - .22) / .78, 1.6);
      const [x, y] = mapPoint(point);
      const radius = Math.max(4.5, 7.5 * scale) * (1 + phase * .22);
      const glow = context.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `rgba(255, 249, 225, ${.88 * envelope * flash.intensity})`);
      glow.addColorStop(.25, `rgba(255, 188, 172, ${.55 * envelope * flash.intensity})`);
      glow.addColorStop(.65, `rgba(255, 92, 141, ${.18 * envelope * flash.intensity})`);
      glow.addColorStop(1, "rgba(255, 92, 141, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();
  }

  function addStonePulse(routeIndex, start, options = {}) {
    const route = stoneRoutes[routeIndex];
    if (!route || !route.length) return null;
    const limit = coarsePointer.matches ? 3 : 5;
    const live = stonePulses.filter((pulse) => pulse.end > start - 100);
    if (live.length >= limit) return null;
    const speed = options.sourceDriven ? 470 : 390;
    const duration = Math.max(
      options.sourceDriven ? 440 : 360,
      Math.min(options.sourceDriven ? 980 : 820, route.length / speed * 1000)
    );
    const pulse = {
      route,
      start,
      duration,
      end: start + duration,
      intensity: options.intensity || .7,
      tone: options.tone || (Math.random() < .24 ? "pink" : "amber"),
      sourceDriven: Boolean(options.sourceDriven),
      charge: Boolean(options.charge),
      sourceNode: options.sourceNode || null,
      direction: options.direction === -1 || options.direction === 1
        ? options.direction
        : Math.random() < .5 ? -1 : 1
    };
    stonePulses.push(pulse);
    if (debugPerformance) {
      const key = pulse.direction === -1 ? "reverse" : "forward";
      stoneDirectionCounts[key] += 1;
      document.documentElement.dataset.stoneForward = String(stoneDirectionCounts.forward);
      document.documentElement.dataset.stoneReverse = String(stoneDirectionCounts.reverse);
    }
    return pulse;
  }

  function shuffledStoneRouteIndices(indices) {
    const values = [...indices];
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [values[index], values[swap]] = [values[swap], values[index]];
    }
    return values;
  }

  function scheduleStoneSource(sourceNode, start, options = {}) {
    if (!stoneMap || motionPaused()) return;
    const indices = stoneMap.sourceRoutes[sourceNode]
      || stoneMap.sourceRoutes.source
      || [];
    const branchCount = options.charge
      ? Math.min(4, indices.length)
      : Math.min(indices.length, 2 + (Math.random() < .46 ? 1 : 0));
    shuffledStoneRouteIndices(indices).slice(0, branchCount).forEach((routeIndex, index) => {
      addStonePulse(routeIndex, start + index * (72 + Math.random() * 72), {
        intensity: (options.intensity || 1) * (index ? .66 : .9),
        tone: index === 1 && Math.random() < .5 ? "pink" : "amber",
        sourceDriven: true,
        sourceNode,
        charge: options.charge
      });
    });
  }

  function scheduleStoneIdle(now) {
    if (!stoneRoutes.length || motionPaused()) return;
    const burstCount = Math.random() < .18 ? 2 + Math.floor(Math.random() * 3) : 1;
    let cursor = now;
    for (let index = 0; index < burstCount; index += 1) {
      let routeIndex = Math.floor(Math.random() * stoneRoutes.length);
      if (stoneRoutes.length > 1 && routeIndex === lastStoneRoute) {
        routeIndex = (routeIndex + 1 + Math.floor(Math.random() * (stoneRoutes.length - 1))) % stoneRoutes.length;
      }
      lastStoneRoute = routeIndex;
      addStonePulse(routeIndex, cursor, {
        intensity: .44 + Math.random() * .23,
        tone: Math.random() < .22 ? "pink" : "amber"
      });
      if (Math.random() < .25) {
        addStonePulse(
          (routeIndex + 1 + Math.floor(Math.random() * Math.max(1, stoneRoutes.length - 1))) % stoneRoutes.length,
          cursor + 90 + Math.random() * 75,
          {
            intensity: .28 + Math.random() * .14,
            tone: "pink"
          }
        );
      }
      cursor += 70 + Math.random() * 110;
    }
    const random = Math.random();
    const gap = random < .09
      ? 220 + Math.random() * 250
      : random > .91
        ? 1180 + Math.random() * 620
        : 620 + Math.random() * 260;
    nextStoneAt = now + Math.max(220, Math.min(1800, gap));
  }

  function stonePulseProgress(pulse, now) {
    return (now - pulse.start) / pulse.duration;
  }

  function stonePulseEnvelope(pulse, now) {
    const progress = stonePulseProgress(pulse, now);
    if (progress < 0 || progress > 1) return 0;
    const attack = Math.min(1, progress / .12);
    const release = Math.min(1, (1 - progress) / .2);
    return Math.max(0, Math.min(attack, release));
  }

  function stoneDepthOffset(depth) {
    if (motionPaused()) return [0, 0];
    const factor = detailOpen ? .28 : 1;
    const amount = depth === "back" ? -2.2 : depth === "mid" ? 1.1 : .52;
    return [
      stonePointerX * amount * factor,
      stonePointerY * amount * .72 * factor
    ];
  }

  function drawStoneDepth(depth, now) {
    if (!stoneContext || !stoneScratchContext || !stoneAtlases[depth]) return;
    const scale = Math.max(.55, cssWidth / stoneMap.image.width);
    const lineWidth = (depth === "back" ? 19 : depth === "mid" ? 12 : 7) * scale;
    const depthAlpha = depth === "back" ? .34 : depth === "mid" ? .66 : .82;
    let drew = false;
    let pinkActivity = 0;

    stoneScratchContext.globalCompositeOperation = "source-over";
    stoneScratchContext.clearRect(0, 0, stoneScratch.width, stoneScratch.height);
    stoneScratchContext.lineCap = "round";
    stoneScratchContext.lineJoin = "round";

    stonePulses.forEach((pulse) => {
      const progress = stonePulseProgress(pulse, now);
      if (progress < 0 || progress > 1) return;
      const trailLength = pulse.sourceDriven ? .32 : .2;
      const start = Math.max(0, progress - trailLength);
      const steps = pulse.sourceDriven ? 18 : 13;
      let previous = null;
      for (let index = 0; index <= steps; index += 1) {
        const sampleProgress = start + (progress - start) * index / steps;
        const point = sampleStonePulsePath(pulse, sampleProgress);
        if (point.edge.depth !== depth) {
          previous = null;
          continue;
        }
        const x = point.x * stoneCssWidth;
        const y = point.y * stoneCssHeight;
        if (previous) {
          const fade = .18 + .82 * index / steps;
          stoneScratchContext.beginPath();
          stoneScratchContext.moveTo(previous[0], previous[1]);
          stoneScratchContext.lineTo(x, y);
          stoneScratchContext.lineWidth = lineWidth * (.72 + fade * .28);
          stoneScratchContext.strokeStyle = `rgba(255,255,255,${Math.min(.95, fade * pulse.intensity * depthAlpha)})`;
          stoneScratchContext.stroke();
          drew = true;
        }
        previous = [x, y];
      }
      if (pulse.tone === "pink") pinkActivity = Math.max(pinkActivity, pulse.intensity);
    });

    if (!drew) return;
    stoneScratchContext.globalCompositeOperation = "source-in";
    stoneScratchContext.globalAlpha = 1;
    stoneScratchContext.drawImage(
      stoneAtlases[depth],
      0,
      0,
      stoneScratch.width,
      stoneScratch.height
    );
    if (pinkActivity) {
      stoneScratchContext.globalCompositeOperation = "source-atop";
      stoneScratchContext.fillStyle = `rgba(255,68,126,${Math.min(.24, pinkActivity * .18)})`;
      stoneScratchContext.fillRect(0, 0, stoneScratch.width, stoneScratch.height);
    }

    const [offsetX, offsetY] = stoneDepthOffset(depth);
    stoneContext.save();
    stoneContext.globalCompositeOperation = "lighter";
    stoneContext.globalAlpha = depth === "back" ? .56 : depth === "mid" ? .76 : .92;
    stoneContext.drawImage(
      stoneScratch,
      offsetX,
      offsetY,
      stoneCssWidth,
      stoneCssHeight
    );
    stoneContext.restore();

    stonePulses.forEach((pulse) => {
      const progress = stonePulseProgress(pulse, now);
      if (progress < 0 || progress > 1) return;
      const point = sampleStonePulsePath(pulse, progress);
      if (point.edge.depth !== depth) return;
      const sprite = stoneSprites[`${depth}:${pulse.tone}`];
      if (!sprite) return;
      const size = (depth === "back" ? 22 : depth === "mid" ? 17 : 12)
        * scale
        * (pulse.sourceDriven ? 1.15 : 1);
      stoneContext.save();
      stoneContext.globalCompositeOperation = "lighter";
      stoneContext.globalAlpha = stonePulseEnvelope(pulse, now) * pulse.intensity;
      stoneContext.drawImage(
        sprite,
        point.x * stoneCssWidth + offsetX - size,
        point.y * stoneCssHeight + offsetY - size,
        size * 2,
        size * 2
      );
      stoneContext.restore();
    });
  }

  function drawStoneSourceResponse(now) {
    if (!stoneContext) return;
    const scale = Math.max(.55, cssWidth / stoneMap.image.width);
    stonePulses.forEach((pulse) => {
      if (!pulse.sourceDriven) return;
      const progress = stonePulseProgress(pulse, now);
      if (progress < 0 || progress > .64) return;

      /*
        The source peaks quickly, then fades while the signal is already in
        flight. This reads as neural activation rather than a lamp waiting to
        switch off before the pulse can move.
      */
      const attack = Math.min(1, progress / .09);
      const decay = Math.pow(Math.max(0, 1 - progress / .64), 1.42);
      const envelope = attack * decay;
      const origin = sampleStonePulsePath(pulse, 0);
      const x = origin.x * stoneCssWidth;
      const y = origin.y * stoneCssHeight;
      const radius = (pulse.charge ? 32 : 25) * scale;

      /*
        A shallow, anisotropic volume follows the glass perspective. It is
        deliberately broader along the embedded fibers and much thinner
        vertically, avoiding the synthetic circular-patch effect.
      */
      stoneContext.save();
      stoneContext.globalCompositeOperation = "lighter";
      stoneContext.translate(x - radius * .08, y + radius * .08);
      stoneContext.rotate(-.11);
      stoneContext.scale(1.22, .7);
      const volume = stoneContext.createRadialGradient(0, 0, radius * .04, 0, 0, radius * 2.8);
      volume.addColorStop(0, `rgba(255,231,197,${.34 * envelope * pulse.intensity})`);
      volume.addColorStop(.16, `rgba(255,166,118,${.24 * envelope * pulse.intensity})`);
      volume.addColorStop(.46, `rgba(255,78,121,${.075 * envelope * pulse.intensity})`);
      volume.addColorStop(1, "rgba(255,74,116,0)");
      stoneContext.fillStyle = volume;
      stoneContext.beginPath();
      stoneContext.arc(0, 0, radius * 2.8, 0, Math.PI * 2);
      stoneContext.fill();
      stoneContext.restore();

      stoneContext.save();
      stoneContext.globalCompositeOperation = "lighter";
      stoneContext.fillStyle = `rgba(255,236,205,${.52 * envelope * pulse.intensity})`;
      stoneContext.beginPath();
      stoneContext.arc(x, y, Math.max(1.25, radius * .105), 0, Math.PI * 2);
      stoneContext.fill();
      stoneContext.restore();

      /*
        Short local floor caustic. Its down-right bias follows the global key
        and its low opacity keeps the static contact shadow dominant.
      */
      const causticX = Math.min(stoneCssWidth * .97, x + radius * .58);
      const causticY = Math.min(stoneCssHeight * .965, y + radius * 2.05);
      const causticRadius = radius * 2.35;
      stoneContext.save();
      stoneContext.globalCompositeOperation = "lighter";
      stoneContext.translate(causticX, causticY);
      stoneContext.rotate(.055);
      stoneContext.scale(1, .18);
      const caustic = stoneContext.createRadialGradient(0, 0, 0, 0, 0, causticRadius);
      caustic.addColorStop(0, `rgba(255,178,126,${.14 * envelope * pulse.intensity})`);
      caustic.addColorStop(.38, `rgba(255,92,126,${.055 * envelope * pulse.intensity})`);
      caustic.addColorStop(1, "rgba(255,81,118,0)");
      stoneContext.fillStyle = caustic;
      stoneContext.beginPath();
      stoneContext.arc(0, 0, causticRadius, 0, Math.PI * 2);
      stoneContext.fill();
      stoneContext.restore();
    });
  }

  function drawStoneNeural(now) {
    if (!stoneContext || !stoneMap || !stoneCssWidth || !stoneCssHeight) return;
    stoneContext.clearRect(0, 0, stoneCssWidth, stoneCssHeight);
    if (motionPaused()) {
      if (emissiveReady && stoneAtlases.mid.width) {
        stoneContext.save();
        stoneContext.globalAlpha = .075;
        stoneContext.globalCompositeOperation = "lighter";
        stoneContext.drawImage(stoneAtlases.mid, 0, 0, stoneCssWidth, stoneCssHeight);
        stoneContext.restore();
      }
      return;
    }
    drawStoneDepth("back", now);
    drawStoneDepth("mid", now);
    drawStoneDepth("front", now);
    drawStoneSourceResponse(now);
  }

  function updateStoneEffects(now) {
    stonePulses = stonePulses.filter((pulse) => now < pulse.end + 40);
  }

  function drawPulse(pulse, now) {
    if (now < pulse.start || now > pulse.end) return;
    const progress = (now - pulse.start) / pulse.duration;
    const head = samplePath(pulse.path, progress);
    const sectionScale = cssWidth / map.image.width;
    const activationPulse = pulse.charge;
    const relayPulse = pulse.relay;
    const trailCount = activationPulse
      ? coarsePointer.matches ? 13 : 18
      : relayPulse
        ? coarsePointer.matches ? 6 : 9
        : coarsePointer.matches ? 9 : 13;
    const trailLength = activationPulse
      ? head.edge.kind === "root" || head.edge.kind === "trunk" ? .19 : .15
      : relayPulse
        ? .065
        : head.edge.kind === "root" || head.edge.kind === "trunk" ? .135 : .092;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.lineCap = "round";
    context.lineJoin = "round";
    context.filter = "none";

    let previous = null;
    for (let index = trailCount; index >= 0; index -= 1) {
      const trailProgress = progress - (trailLength * index) / trailCount;
      if (trailProgress < 0) continue;
      const point = samplePath(pulse.path, trailProgress);
      const x = point.x * cssWidth;
      const y = point.y * cssHeight;
      if (previous) {
        const fade = 1 - index / (trailCount + 1);
        context.beginPath();
        context.moveTo(previous[0], previous[1]);
        context.lineTo(x, y);
        context.lineWidth = Math.max(
          activationPulse ? .86 : relayPulse ? .48 : .65,
          widthByKind[point.edge.kind] * sectionScale * (.48 + fade * .52) * (activationPulse ? 1.2 : relayPulse ? .72 : 1)
        );
        context.strokeStyle = `rgba(255, ${relayPulse ? 214 : 191}, ${relayPulse ? 198 : 170}, ${(activationPulse ? .31 : relayPulse ? .15 : .19) * fade * pulse.intensity * depthAlpha[point.edge.depth] * point.edge.intensity})`;
        context.stroke();
      }
      previous = [x, y];
    }

    const hx = head.x * cssWidth;
    const hy = head.y * cssHeight;
    const headRadius = Math.max(
      activationPulse ? coarsePointer.matches ? 3.75 : 3.55 : relayPulse ? 2.15 : 3.05,
      widthByKind[head.edge.kind]
        * sectionScale
        * (activationPulse ? 3.72 : relayPulse ? 2.25 : 3.35)
        * pulse.intensity
    );
    const glow = context.createRadialGradient(hx, hy, 0, hx, hy, headRadius);
    const alpha = pulse.intensity * depthAlpha[head.edge.depth] * head.edge.intensity;
    glow.addColorStop(0, `rgba(255, 249, 225, ${.96 * alpha})`);
    glow.addColorStop(.16, `rgba(255, 211, 182, ${.78 * alpha})`);
    glow.addColorStop(.46, `rgba(255, 92, 141, ${(relayPulse ? .2 : .3) * alpha})`);
    glow.addColorStop(1, "rgba(255, 92, 141, 0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(hx, hy, headRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function addBlossom(endpoint, start, intensity = 1, activation = false) {
    blossoms.push({
      endpoint,
      start,
      duration: activation ? 1260 : 960,
      intensity,
      activation,
      meta: bloomMeta[endpoint] || { rotation: 0, scale: 1 }
    });
  }

  function drawBlossom(blossom, now) {
    if (now < blossom.start || now > blossom.start + blossom.duration) return;
    const phase = (now - blossom.start) / blossom.duration;
    const attack = phase < .16
      ? phase / .16
      : Math.pow(1 - (phase - .16) / .84, 1.65);
    const strength = Math.max(0, attack) * blossom.intensity;
    const point = map.nodes[blossom.endpoint];
    const x = point[0] * cssWidth;
    const y = point[1] * cssHeight;
    const scale = Math.max(
      blossom.activation ? .62 : .42,
      cssWidth / map.image.width
    ) * blossom.meta.scale * (blossom.activation ? 1.14 : 1);

    context.save();
    context.globalCompositeOperation = "lighter";
    context.translate(x, y);
    context.rotate(blossom.meta.rotation);

    const petals = [
      [0, -5.4, 2.5, 5.5, 0],
      [5.1, -1.5, 2.35, 5.1, 1.16],
      [3.2, 4.4, 2.3, 4.8, 2.4],
      [-3.5, 4.1, 2.4, 5, -2.45],
      [-5.1, -1.3, 2.25, 4.9, -1.13]
    ];

    petals.forEach(([px, py, prx, pry, rotation], index) => {
      context.save();
      context.translate(px * scale, py * scale);
      context.rotate(rotation);
      const petalAlpha = blossom.activation ? .4 + index * .025 : .25 + index * .025;
      context.fillStyle = `rgba(255, ${index % 2 ? 174 : 194}, ${index % 2 ? 201 : 214}, ${petalAlpha * strength})`;
      context.beginPath();
      context.ellipse(0, 0, prx * scale, pry * scale, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });

    context.fillStyle = `rgba(255, 244, 214, ${(blossom.activation ? .98 : .86) * strength})`;
    context.beginPath();
    context.arc(0, 0, (blossom.activation ? 2 : 1.7) * scale, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function updateEffects(now) {
    pulses.forEach((pulse) => {
      if (!pulse.bloomTriggered && pulse.terminal && now >= pulse.end) {
        pulse.bloomTriggered = true;
        addBlossom(pulse.terminal, pulse.end, pulse.intensity * pulse.bloomScale, pulse.charge);
      }
    });
    pulses = pulses.filter((pulse) => now < pulse.end + 90);
    blossoms = blossoms.filter((blossom) => now < blossom.start + blossom.duration + 30);
    coreFeeds = coreFeeds.filter((feed) => now < feed.end + 90);
    synapseFlashes = synapseFlashes.filter((flash) => now < flash.start + flash.duration + 30);
  }

  function scheduleIdle(now) {
    const root = randomRoot();
    const route = endpointRoutes.length
      ? endpointRoutes[(idleIndex * 7 + groupOrder[idleIndex % groupOrder.length]) % endpointRoutes.length]
      : null;
    if (!root.length || !route) {
      nextIdleAt = now + signalTime(4000);
      return;
    }
    const rootStart = edgeById.get(root[0])?.from || "source";
    const feed = addCoreFeed(rootStart, now + signalTime(80), {
      intensity: .82,
      mappedHandoff: true
    });
    const rootPulse = addPulse(
      root,
      feed ? feed.start + feed.duration * .38 : now + 290,
      {
        intensity: .82,
        durationScale: 1.02
      }
    );
    addPulse(route.edges, (rootPulse?.end || now + signalTime(940)) - signalTime(28), {
      intensity: .78,
      durationScale: 1.02,
      terminal: route.endpoint
    });
    const baseInterval = idleIntervals[idleIndex % idleIntervals.length];
    const jitter = .56 + Math.random() * .88;
    nextIdleAt = now + signalTime(baseInterval * jitter * 1000);
    nextRelayAt = Math.min(nextRelayAt, now + signalTime(2200 + Math.random() * 1900));
    idleIndex += 1;
  }

  function selectActivationRoutes(count = 5) {
    if (endpointRoutes.length <= count) return [...endpointRoutes];
    const selected = [];
    for (let index = 0; index < count; index += 1) {
      const position = Math.round((index / (count - 1)) * (endpointRoutes.length - 1));
      const route = endpointRoutes[position];
      if (route && !selected.includes(route)) selected.push(route);
    }
    return selected;
  }

  function commonPrefixLength(routes) {
    if (!routes.length) return 0;
    const limit = Math.min(...routes.map((route) => route.edges.length));
    let length = 0;
    while (
      length < limit
      && routes.every((route) => route.edges[length] === routes[0].edges[length])
    ) {
      length += 1;
    }
    return length;
  }

  function scheduleRelay(now) {
    if (!relayRoutes.length) {
      nextRelayAt = now + signalTime(9000);
      return;
    }
    let index = Math.floor(Math.random() * relayRoutes.length);
    if (relayRoutes.length > 1 && index === lastRelayIndex) index = (index + 1) % relayRoutes.length;
    lastRelayIndex = index;
    const route = relayRoutes[index];
    synapseFlashes.push({
      node: route.start,
      start: now - 80,
      duration: 580,
      intensity: .48
    });
    const pulse = addPulse(route.edges, now + signalTime(60), {
      intensity: .46,
      durationScale: 1.22,
      relay: true
    });
    if (pulse) {
      synapseFlashes.push({
        node: route.end,
        start: pulse.end - 30,
        duration: 720,
        intensity: .58
      });
    }
    nextRelayAt = now + signalTime(4300 + Math.random() * 3400);
  }

  function scheduleActivation(now) {
    const roots = shuffledRoots();
    let rootsArriveAt = now + signalTime(820);
    roots.forEach((root, index) => {
      const rootStart = edgeById.get(root[0])?.from || "source";
      const feed = addCoreFeed(rootStart, now + signalTime(150 + index * 86), {
        intensity: 1.05 + index * .03,
        duration: 610 + index * 24,
        charge: true,
        mappedHandoff: true
      });
      const rootPulse = addPulse(root, feed ? feed.start + feed.duration * .42 : now + 320, {
        intensity: .98 + index * .055,
        durationScale: .52,
        charge: true
      });
      rootsArriveAt = Math.max(rootsArriveAt, rootPulse?.end || rootsArriveAt);
    });

    const selected = selectActivationRoutes(10);
    const sharedCount = commonPrefixLength(selected);
    const sharedIds = selected[0]?.edges.slice(0, sharedCount) || [];
    const shared = addPulse(sharedIds, rootsArriveAt - signalTime(38), {
      intensity: 1.3,
      durationScale: .58,
      charge: true
    });
    const branchStart = shared?.end || rootsArriveAt;
    let activationEnd = branchStart;
    selected.forEach((route, index) => {
      const tail = route.edges.slice(sharedCount);
      const pulse = addPulse(tail, branchStart - signalTime(22) + signalTime(index * 72), {
        intensity: 1.08 - index * .025,
        durationScale: .6,
        terminal: route.endpoint,
        bloomScale: 1.22,
        charge: true
      });
      if (pulse) activationEnd = Math.max(activationEnd, pulse.end + signalTime(680));
      else {
        addBlossom(route.endpoint, branchStart + signalTime(index * 72), 1.05, true);
        activationEnd = Math.max(
          activationEnd,
          branchStart + signalTime(index * 72 + 680)
        );
      }
    });
    return activationEnd;
  }

  function drawPointerRefinement() {
    if (!pointerHighlight || coarsePointer.matches || motionPaused() || detailOpen) return;
    const center = sampleEdge(pointerHighlight.edgeId, pointerHighlight.progress);
    const before = sampleEdge(pointerHighlight.edgeId, Math.max(0, pointerHighlight.progress - .035));
    const after = sampleEdge(pointerHighlight.edgeId, Math.min(1, pointerHighlight.progress + .035));
    const alpha = pointerHighlight.alpha;

    context.save();
    context.globalCompositeOperation = "lighter";
    context.beginPath();
    context.moveTo(before.x * cssWidth, before.y * cssHeight);
    context.quadraticCurveTo(
      center.x * cssWidth,
      center.y * cssHeight,
      after.x * cssWidth,
      after.y * cssHeight
    );
    context.lineCap = "round";
    context.lineWidth = Math.max(.65, cssWidth / map.image.width);
    context.strokeStyle = `rgba(202, 229, 238, ${alpha})`;
    context.stroke();
    context.restore();
  }

  function findPointerHighlight(clientX, clientY) {
    if (coarsePointer.matches || motionPaused() || detailOpen) return null;
    const rect = rig.getBoundingClientRect();
    const localX = (clientX - rect.left) * cssWidth / Math.max(1, rect.width);
    const localY = (clientY - rect.top) * cssHeight / Math.max(1, rect.height);
    const px = (
      (localX - artTransform.offsetX)
      / Math.max(.001, artTransform.scaleX)
    ) / cssWidth;
    const py = (
      (localY - artTransform.offsetY)
      / Math.max(.001, artTransform.scaleY)
    ) / cssHeight;
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    sampledEdges.forEach((cache, edgeId) => {
      if (cache.edge.kind === "root") return;
      for (let index = 0; index < cache.samples.length; index += 3) {
        const point = cache.samples[index];
        const distance = Math.hypot(
          (point[0] - px) * (map.image.width / map.image.height),
          point[1] - py
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = {
            edgeId,
            progress: index / (cache.samples.length - 1)
          };
        }
      }
    });

    if (!nearest || nearestDistance > .15) return null;
    nearest.alpha = Math.min(.15, (1 - nearestDistance / .15) * .15);
    return nearest;
  }

  function drawArrow(point, angle, color) {
    const size = Math.max(3, cssWidth / 420);
    context.save();
    context.translate(point.x * cssWidth, point.y * cssHeight);
    context.rotate(angle);
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(size, 0);
    context.lineTo(-size * .65, size * .52);
    context.lineTo(-size * .65, -size * .52);
    context.closePath();
    context.fill();
    context.restore();
  }

  function curveRadius(edge, atEnd) {
    const p0 = map.nodes[edge.from];
    const p1 = edge.c1;
    const p2 = edge.c2;
    const p3 = map.nodes[edge.to];
    const point = (value) => [value[0] * map.image.width, value[1] * map.image.height];
    const [a, b, c, d] = [p0, p1, p2, p3].map(point);
    const first = atEnd
      ? [3 * (d[0] - c[0]), 3 * (d[1] - c[1])]
      : [3 * (b[0] - a[0]), 3 * (b[1] - a[1])];
    const second = atEnd
      ? [6 * (d[0] - 2 * c[0] + b[0]), 6 * (d[1] - 2 * c[1] + b[1])]
      : [6 * (a[0] - 2 * b[0] + c[0]), 6 * (a[1] - 2 * b[1] + c[1])];
    const cross = Math.abs(first[0] * second[1] - first[1] * second[0]);
    if (cross < .0001) return Number.POSITIVE_INFINITY;
    return Math.pow(Math.hypot(first[0], first[1]), 3) / cross;
  }

  function debugRouteEdgeIds() {
    if (!debugRoute) return null;
    const group = map.groups.find((candidate) => candidate.id === debugRoute);
    if (!group) return null;
    const terminal = group.terminals[0];
    return new Set([...map.roots[2], ...group.prefix, ...terminal.edges]);
  }

  function drawDebugMap() {
    context.save();
    context.globalCompositeOperation = "source-over";
    context.lineCap = "round";
    context.font = `${Math.max(7, cssWidth / 175)}px ui-monospace, monospace`;
    context.textBaseline = "middle";

    beginSourceClip();
    context.setLineDash([5, 4]);
    context.lineWidth = 1;
    context.strokeStyle = "#ffe08f";
    context.stroke();
    context.setLineDash([]);

    const routeEdges = debugRouteEdgeIds();
    map.edges.forEach((edge) => {
      const cache = sampledEdges.get(edge.id);
      const color = map.debug.colors[edge.kind];
      const inRoute = !routeEdges || routeEdges.has(edge.id);
      context.beginPath();
      cache.samples.forEach((point, index) => {
        const x = point[0] * cssWidth;
        const y = point[1] * cssHeight;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.lineWidth = edge.kind === "root" || edge.kind === "trunk" ? 1.4 : .9;
      context.strokeStyle = color;
      context.globalAlpha = inRoute ? edge.depth === "back" ? .58 : .82 : .07;
      context.stroke();

      if (inRoute) {
        const mid = sampleEdge(edge.id, .56);
        const direction = sampleEdge(edge.id, .59);
        drawArrow(mid, Math.atan2(
          (direction.y - mid.y) * cssHeight,
          (direction.x - mid.x) * cssWidth
        ), color);

        const sampleCount = Math.max(1, Math.floor(cache.length / 12));
        context.globalAlpha = .66;
        context.fillStyle = color;
        for (let index = 1; index < sampleCount; index += 1) {
          const sample = sampleEdge(edge.id, index / sampleCount);
          context.beginPath();
          context.arc(sample.x * cssWidth, sample.y * cssHeight, 1.15, 0, Math.PI * 2);
          context.fill();
        }
      }

      if (cssWidth > 720 && inRoute) {
        const mid = sampleEdge(edge.id, .56);
        context.globalAlpha = .76;
        context.fillStyle = color;
        context.fillText(edge.id, mid.x * cssWidth + 4, mid.y * cssHeight - 5);
      }
    });

    Object.entries(map.nodes).forEach(([id, point]) => {
      const [x, y] = mapPoint(point);
      const endpoint = id.startsWith("end");
      const sourceNode = sourceNodeIds().includes(id);
      context.globalAlpha = 1;
      context.fillStyle = endpoint ? "#ff8eb0" : sourceNode ? "#ffe08f" : "#d8f3fa";
      context.beginPath();
      context.arc(x, y, endpoint ? 3.2 : 2.3, 0, Math.PI * 2);
      context.fill();
      if (cssWidth > 720 && (endpoint || sourceNode || ["source", "flare", "t3", "t4", "t5", "crown", "ll", "lh", "lt0", "tr0", "rh", "rlh"].includes(id))) {
        context.fillText(id, x + 5, y + 5);
      }
    });

    const junctionIds = new Set([
      "t3", "llShoulder", "crown", "crownLeftShoulder", "crownCenterShoulder",
      "crownRightShoulder", "ll", "lsplit", "lh", "lt0", "rj", "rh",
      "rlh", "rm", "rl", "rlBend"
    ]);
    const angleBetween = (incoming, outgoing) => {
      const a = [
        (incoming[0]) * cssWidth,
        (incoming[1]) * cssHeight
      ];
      const b = [
        (outgoing[0]) * cssWidth,
        (outgoing[1]) * cssHeight
      ];
      const denominator = Math.max(.0001, Math.hypot(a[0], a[1]) * Math.hypot(b[0], b[1]));
      const cosine = Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / denominator));
      return Math.acos(cosine) * 180 / Math.PI;
    };

    junctionIds.forEach((nodeId) => {
      const node = map.nodes[nodeId];
      const incoming = map.edges.filter((edge) => edge.to === nodeId);
      const outgoing = map.edges.filter((edge) => edge.from === nodeId);
      if (!node || !incoming.length || !outgoing.length) return;
      const [nx, ny] = mapPoint(node);

      incoming.forEach((edge) => {
        const [hx, hy] = mapPoint(edge.c2);
        context.globalAlpha = .72;
        context.strokeStyle = "#55ddeb";
        context.lineWidth = .8;
        context.beginPath();
        context.moveTo(nx, ny);
        context.lineTo(hx, hy);
        context.stroke();
        context.fillStyle = "#55ddeb";
        context.beginPath();
        context.arc(hx, hy, 1.8, 0, Math.PI * 2);
        context.fill();

        const dx = nx - hx;
        const dy = ny - hy;
        const length = Math.max(.001, Math.hypot(dx, dy));
        context.globalAlpha = .9;
        context.strokeStyle = "#55ddeb";
        context.lineWidth = 1.25;
        context.beginPath();
        context.moveTo(nx - dx / length * 18, ny - dy / length * 18);
        context.lineTo(nx, ny);
        context.stroke();
      });

      outgoing.forEach((edge, index) => {
        const [hx, hy] = mapPoint(edge.c1);
        context.globalAlpha = .72;
        context.strokeStyle = "#ffd36e";
        context.lineWidth = .8;
        context.beginPath();
        context.moveTo(nx, ny);
        context.lineTo(hx, hy);
        context.stroke();
        context.fillStyle = "#ffd36e";
        context.beginPath();
        context.arc(hx, hy, 1.8, 0, Math.PI * 2);
        context.fill();

        const dx = hx - nx;
        const dy = hy - ny;
        const length = Math.max(.001, Math.hypot(dx, dy));
        context.globalAlpha = .9;
        context.strokeStyle = "#ffd36e";
        context.lineWidth = 1.25;
        context.beginPath();
        context.moveTo(nx, ny);
        context.lineTo(nx + dx / length * 18, ny + dy / length * 18);
        context.stroke();

        if (cssWidth > 720) {
          const reference = incoming[0];
          const tangentAngle = angleBetween(
            [node[0] - reference.c2[0], node[1] - reference.c2[1]],
            [edge.c1[0] - node[0], edge.c1[1] - node[1]]
          );
          const radiusIn = curveRadius(reference, true);
          const radiusOut = curveRadius(edge, false);
          const minimumRadius = Math.min(radiusIn, radiusOut);
          const radiusRatio = Math.max(radiusIn, radiusOut) / Math.max(.001, minimumRadius);
          const severe = tangentAngle >= 20 || minimumRadius < 24;
          const warning = tangentAngle >= 12 || radiusRatio > 3;
          context.globalAlpha = .88;
          context.fillStyle = severe ? "#ff6b74" : warning ? "#ffb36e" : "#b9f5df";
          const radiusLabel = `${Number.isFinite(radiusIn) ? Math.round(radiusIn) : "∞"}/${Number.isFinite(radiusOut) ? Math.round(radiusOut) : "∞"}`;
          context.fillText(`${Math.round(tangentAngle)}° R${radiusLabel}`, hx + 4, hy + 8 + index * 8);
          if (severe) {
            context.strokeStyle = "#ff6b74";
            context.lineWidth = 1.5;
            context.beginPath();
            context.arc(nx, ny, 5.5 + index * 2.4, 0, Math.PI * 2);
            context.stroke();
          }
        }
      });
    });
    context.restore();
  }

  function drawReducedFlash() {
    if (!reducedPending) return;
    const endpoints = ["endLFar", "endTopCenter", "endTopRight", "endRUpper", "endRLow"];
    endpoints.forEach((endpoint) => {
      const point = map.nodes[endpoint];
      if (!Array.isArray(point) || point.length < 2) return;
      const x = point[0] * cssWidth;
      const y = point[1] * cssHeight;
      const meta = bloomMeta[endpoint] || { rotation: 0 };
      context.save();
      context.translate(x, y);
      context.rotate(meta.rotation);
      const reducedScale = Math.max(.64, cssWidth / map.image.width);
      context.fillStyle = "rgba(255, 199, 214, .52)";
      for (let index = 0; index < 5; index += 1) {
        context.save();
        context.rotate((Math.PI * 2 * index) / 5);
        context.translate(0, -4.2 * reducedScale);
        context.beginPath();
        context.ellipse(0, 0, 1.9 * reducedScale, 4.2 * reducedScale, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      context.fillStyle = "rgba(255, 244, 214, .9)";
      context.beginPath();
      context.arc(0, 0, 1.8 * reducedScale, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
  }

  function drawFrame(now) {
    drawStoneNeural(now);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.save();
    context.transform(
      artTransform.scaleX,
      0,
      0,
      artTransform.scaleY,
      artTransform.offsetX,
      artTransform.offsetY
    );
    drawInternalSource(now);
    drawCoreFeeds(now);
    drawSynapses(now);

    if (!motionPaused()) {
      pulses.forEach((pulse) => drawPulse(pulse, now));
      blossoms.forEach((blossom) => drawBlossom(blossom, now));
      drawPointerRefinement();
    } else {
      drawReducedFlash();
    }

    if (debugMap) drawDebugMap();
    context.restore();
  }

  function render(now) {
    if (!pageVisible || motionPaused()) return;
    if (now - lastRenderedAt < frameInterval) {
      frame = requestAnimationFrame(render);
      return;
    }
    lastRenderedAt = now;
    recordPerformance(now);
    if (!editMap && !detailOpen && now >= nextStoneAt) scheduleStoneIdle(now);
    if (!editMap && !activationRunning && !detailOpen && now >= nextIdleAt) scheduleIdle(now);
    if (
      !editMap
      && !activationRunning
      && !detailOpen
      && now >= nextRelayAt
      && pulses.length < 5
      && nextIdleAt - now > signalTime(650)
    ) {
      scheduleRelay(now);
    }
    updateEffects(now);
    updateStoneEffects(now);
    drawFrame(now);

    if (activationRunning && activationOpenAt && now >= activationOpenAt) {
      completeActivation();
      return;
    }
    frame = requestAnimationFrame(render);
  }

  function resizeCanvas() {
    const rect = rig.getBoundingClientRect();
    const scaleX = Math.hypot(
      Number.parseFloat(getComputedStyle(rig).transform.split(",")[0]?.replace("matrix(", "")) || 1,
      Number.parseFloat(getComputedStyle(rig).transform.split(",")[1]) || 0
    );
    cssWidth = rig.clientWidth || rect.width / Math.max(.001, scaleX);
    cssHeight = rig.clientHeight || rect.height / Math.max(.001, scaleX);
    const requestedDpr = Math.min(
      window.devicePixelRatio || 1,
      coarsePointer.matches ? 1 : 2
    );
    const pixelBudgetDpr = Math.sqrt(8_000_000 / Math.max(1, cssWidth * cssHeight));
    dpr = Math.max(1, Math.min(requestedDpr, pixelBudgetDpr));
    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    syncArtTransform();
    resizeStoneCanvas();
    drawFrame(performance.now());
  }

  function resizeStoneCanvas() {
    if (!stoneCanvas || !stoneContext || !stoneMap) return;
    stoneCssWidth = Math.max(1, cssWidth * stoneMap.region.width);
    stoneCssHeight = Math.max(1, cssHeight * stoneMap.region.height);
    stoneCanvas.width = Math.max(1, Math.round(stoneCssWidth * dpr));
    stoneCanvas.height = Math.max(1, Math.round(stoneCssHeight * dpr));
    stoneCanvas.style.width = `${stoneCssWidth}px`;
    stoneCanvas.style.height = `${stoneCssHeight}px`;
    stoneContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    stoneScratch.width = Math.max(2, Math.round(stoneCssWidth));
    stoneScratch.height = Math.max(2, Math.round(stoneCssHeight));
    rebuildStoneAtlases();
  }

  function setInert(element, value) {
    if ("inert" in element) element.inert = value;
    if (value) element.setAttribute("aria-hidden", "true");
    else element.removeAttribute("aria-hidden");
  }

  function holdScroll(target) {
    window.scrollTo({ top: target, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo(0, target);
      requestAnimationFrame(() => window.scrollTo(0, target));
    });
  }

  function resetCta() {
    explore.classList.remove("is-charging");
    explore.removeAttribute("aria-busy");
    explore.setAttribute("aria-disabled", "false");
    explore.textContent = originalCtaLabel;
    activationLinks.forEach((link) => link.removeAttribute("aria-disabled"));
  }

  function setActivationExpanded(value) {
    explore.setAttribute("aria-expanded", String(value));
    activationLinks.forEach((link) => link.setAttribute("aria-expanded", String(value)));
  }

  function openDetail(scrollTarget = window.scrollY) {
    detailOpen = true;
    activationRunning = false;
    activationOpenAt = 0;
    resetCta();
    hero.classList.add("is-focused");
    setActivationExpanded(true);
    detail.setAttribute("aria-hidden", "false");
    setInert(intro, true);
    setInert(detail, false);
    holdScroll(scrollTarget);
    requestAnimationFrame(() => {
      back.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (document.activeElement !== back) back.focus({ preventScroll: true });
      });
    });
  }

  function closeDetail() {
    const target = window.scrollY;
    detailOpen = false;
    pulses = [];
    blossoms = [];
    coreFeeds = [];
    synapseFlashes = [];
    stonePulses = [];
    hero.classList.remove("is-focused");
    setActivationExpanded(false);
    detail.setAttribute("aria-hidden", "true");
    setInert(detail, true);
    setInert(intro, false);
    nextIdleAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(1450);
    nextRelayAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(4200);
    nextStoneAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + 420;
    holdScroll(target);
    requestAnimationFrame(() => {
      activationTrigger.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        if (document.activeElement !== activationTrigger) activationTrigger.focus({ preventScroll: true });
      });
    });
  }

  function cancelActivation(restoreFocus = true) {
    activationRunning = false;
    activationOpenAt = 0;
    reducedPending = false;
    window.clearTimeout(reducedTimer);
    pulses = [];
    blossoms = [];
    coreFeeds = [];
    synapseFlashes = [];
    stonePulses = [];
    resetCta();
    setActivationExpanded(false);
    nextIdleAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(1200);
    nextRelayAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(4400);
    nextStoneAt = motionPaused()
      ? Number.POSITIVE_INFINITY
      : performance.now() + 460;
    drawFrame(performance.now());
    holdScroll(activationScroll);
    if (restoreFocus) requestAnimationFrame(() => activationTrigger.focus({ preventScroll: true }));
  }

  function completeActivation() {
    if (!activationRunning) return;
    reducedPending = false;
    window.clearTimeout(reducedTimer);
    openDetail(activationScroll);
  }

  function activate(trigger = explore) {
    if (activationRunning || detailOpen || explore.getAttribute("aria-disabled") === "true") return;
    activationTrigger = trigger && typeof trigger.focus === "function" ? trigger : explore;
    activationRunning = true;
    activationStarted = performance.now();
    if (debugPerformance) {
      performancePrevious = 0;
      performanceSamples = [];
      delete document.documentElement.dataset.treeFps;
      delete document.documentElement.dataset.treeFrameP95;
    }
    activationScroll = window.scrollY;
    activationOpenAt = 0;
    pulses = [];
    blossoms = [];
    coreFeeds = [];
    synapseFlashes = [];
    stonePulses = [];
    explore.classList.add("is-charging");
    explore.setAttribute("aria-busy", "true");
    explore.setAttribute("aria-disabled", "true");
    activationLinks.forEach((link) => link.setAttribute("aria-disabled", "true"));
    explore.textContent = motionPaused() ? "Otwieramy…" : "Energia płynie…";

    if (motionPaused()) {
      reducedPending = true;
      drawFrame(activationStarted);
      reducedTimer = window.setTimeout(() => {
        if (document.hidden) return;
        completeActivation();
      }, 520);
      return;
    }

    activationOpenAt = scheduleActivation(activationStarted);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);
  }

  function syncMotionPreference() {
    cancelAnimationFrame(frame);
    if (motionPaused()) {
      nextIdleAt = Number.POSITIVE_INFINITY;
      pulses = [];
      blossoms = [];
      coreFeeds = [];
      synapseFlashes = [];
      stonePulses = [];
      nextStoneAt = Number.POSITIVE_INFINITY;
      pointerHighlight = null;
      rig.style.setProperty("--px", "0px");
      rig.style.setProperty("--py", "0px");
      stonePointerX = 0;
      stonePointerY = 0;
      if (activationRunning) completeActivation();
      else drawFrame(performance.now());
    } else if (pageVisible) {
      nextIdleAt = detailOpen
        ? Number.POSITIVE_INFINITY
        : performance.now() + signalTime(1100);
      nextRelayAt = detailOpen
        ? Number.POSITIVE_INFINITY
        : performance.now() + signalTime(3900);
      nextStoneAt = detailOpen
        ? Number.POSITIVE_INFINITY
        : performance.now() + 360;
      frame = requestAnimationFrame(render);
    }
  }

  explore.addEventListener("click", () => activate(explore));
  activationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      activate(link);
    });
  });
  back.addEventListener("click", closeDetail);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (activationRunning) cancelActivation(true);
    else if (detailOpen) closeDetail();
  });

  if (!coarsePointer.matches && !editMap) {
    window.addEventListener("pointermove", (event) => {
      if (motionPaused() || detailOpen) return;
      const x = (event.clientX / window.innerWidth - .5) * -4;
      const y = (event.clientY / window.innerHeight - .5) * -3;
      stonePointerX = (event.clientX / window.innerWidth - .5) * 2;
      stonePointerY = (event.clientY / window.innerHeight - .5) * 2;
      rig.style.setProperty("--px", `${x}px`);
      rig.style.setProperty("--py", `${y}px`);
      pointerHighlight = findPointerHighlight(event.clientX, event.clientY);
    }, { passive: true });

    document.documentElement.addEventListener("pointerleave", () => {
      rig.style.setProperty("--px", "0px");
      rig.style.setProperty("--py", "0px");
      stonePointerX = 0;
      stonePointerY = 0;
      pointerHighlight = null;
    });
  }

  document.addEventListener("visibilitychange", () => {
    const now = performance.now();
    if (document.hidden) {
      pageVisible = false;
      hiddenAt = now;
      cancelAnimationFrame(frame);
      return;
    }

    pageVisible = true;
    const pausedFor = Math.max(0, now - hiddenAt);
    pulses.forEach((pulse) => {
      pulse.start += pausedFor;
      pulse.end += pausedFor;
    });
    blossoms.forEach((blossom) => {
      blossom.start += pausedFor;
    });
    if (Number.isFinite(nextIdleAt)) nextIdleAt += pausedFor;
    if (Number.isFinite(nextRelayAt)) nextRelayAt += pausedFor;
    if (Number.isFinite(nextStoneAt)) nextStoneAt += pausedFor;
    if (activationOpenAt) activationOpenAt += pausedFor;
    activationStarted += activationRunning ? pausedFor : 0;
    coreFeeds.forEach((feed) => {
      feed.start += pausedFor;
      feed.end += pausedFor;
    });
    synapseFlashes.forEach((flash) => {
      flash.start += pausedFor;
    });
    stonePulses.forEach((pulse) => {
      pulse.start += pausedFor;
      pulse.end += pausedFor;
    });

    if (reducedPending) completeActivation();
    else if (!motionPaused()) frame = requestAnimationFrame(render);
    else drawFrame(now);
  });

  reducedMotion.addEventListener("change", syncMotionPreference);
  window.addEventListener("okagency:motionchange", syncMotionPreference);
  coarsePointer.addEventListener("change", resizeCanvas);
  sculpture.addEventListener("load", resizeCanvas);
  new ResizeObserver(resizeCanvas).observe(rig);

  if (editMap) {
    window.TREE_ENERGY_DEV = {
      rebuild() {
        pulses = [];
        blossoms = [];
        coreFeeds = [];
        synapseFlashes = [];
        stonePulses = [];
        rebuildEdgeCaches();
        nextIdleAt = Number.POSITIVE_INFINITY;
        nextStoneAt = Number.POSITIVE_INFINITY;
        drawFrame(performance.now());
      },
      preview(edgeIds, options = {}) {
        const validIds = edgeIds.filter((id) => edgeById.has(id));
        if (!validIds.length || motionPaused()) {
          drawFrame(performance.now());
          return false;
        }
        const now = performance.now();
        const path = buildPath(validIds);
        const baseDuration = path.durationSeconds * 1000;
        const targetDuration = Number.isFinite(options.targetDurationMs)
          ? Math.max(420, Math.min(1650, options.targetDurationMs))
          : null;
        const desiredDuration = targetDuration
          ? Math.min(targetDuration, Math.max(650, baseDuration * .72))
          : baseDuration * .72;
        pulses = [];
        blossoms = [];
        const pulse = addPulse(validIds, now + signalTime(70), {
          intensity: options.intensity || 1.18,
          durationScale: desiredDuration / Math.max(1, baseDuration),
          charge: options.charge !== false,
          terminal: options.terminal || null,
          bloomScale: options.bloomScale || 1.2
        });
        nextIdleAt = Number.POSITIVE_INFINITY;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
        return {
          started: true,
          duration: pulse.duration,
          arrivalAt: pulse.end,
          edgeIds: validIds
        };
      },
      stop() {
        pulses = [];
        blossoms = [];
        coreFeeds = [];
        synapseFlashes = [];
        stonePulses = [];
        drawFrame(performance.now());
      },
      resize: resizeCanvas
    };
  }

  setInert(detail, true);
  resizeCanvas();
  if (!motionPaused()) {
    nextIdleAt = editMap
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(1350);
    nextRelayAt = editMap
      ? Number.POSITIVE_INFINITY
      : performance.now() + signalTime(4200);
    nextStoneAt = editMap
      ? Number.POSITIVE_INFINITY
      : performance.now() + 360;
    frame = requestAnimationFrame(render);
  }
})();
