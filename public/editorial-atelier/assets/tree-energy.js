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
  const originalCtaLabel = explore.textContent.trim();
  const edgeById = new Map(map.edges.map((edge) => [edge.id, edge]));
  const sampledEdges = new Map();
  const signalTimeScale = .5;
  const signalTime = (milliseconds) => milliseconds * signalTimeScale;
  const speedByKind = { root: 250, trunk: 285, branch: 360, twig: 430 };
  const widthByKind = { root: 5.2, trunk: 4.5, branch: 3.2, twig: 2.15 };
  const depthAlpha = { front: 1, mid: .79, back: .56 };
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
     ×½¶ÖÚ$z{-®éÜj×6öçFW‡Bç7G&ö¶R‚“°¢Ð¢Ð¢Ò“°¢Ò“°¢6öçFW‡Bç&W7F÷&R‚“°¢Ð ¢gVæ7F–öâG&u&VGV6VDfÆ6‚‚’°¢–b‚&VGV6VEVæF–ær’&WGW&ã°¢6öç7BVæGö–çG2Ò²&VæDÄf""Â&VæEF÷6VçFW""Â&VæEF÷&–v‡B"Â&VæE%WW""Â&VæE$Æ÷r%Ó°¢VæGö–çG2æf÷$V6‚‚†VæGö–çB’Óâ°¢6öç7Bö–çBÒÖææöFW5¶VæGö–çEÓ°¢–b‚'&’æ—4'&’‡ö–çB’ÇÂö–çBæÆVæwF‚Â"’&WGW&ã°¢6öç7B‚Òö–çE³Ò¢775v–GFƒ°¢6öç7B’Òö–çE³Ò¢774†V–v‡C°¢6öç7BÖWFÒ&ÆööÔÖWF¶VæGö–çEÒÇÂ²&÷FF–öã¢Ó°¢6öçFW‡Bç6fR‚“°¢6öçFW‡BçG&ç6ÆFR‡‚Â’“°¢6öçFW‡Bç&÷FFR†ÖWFç&÷FF–öâ“°¢6öç7B&VGV6VE66ÆRÒÖF‚æÖ‚‚ãcBÂ775v–GF‚òÖæ–ÖvRçv–GF‚“°¢6öçFW‡Bæf–ÆÅ7G–ÆRÒ'&v&ƒ#SRÂ“’Â#BÂãS"’#°¢f÷"†ÆWB–æFW‚Ò²–æFW‚ÂS²–æFW‚³Ò’°¢6öçFW‡Bç6fR‚“°¢6öçFW‡Bç&÷FFR‚„ÖF‚å’¢"¢–æFW‚’òR“°¢6öçFW‡BçG&ç6ÆFRƒÂÓBã"¢&VGV6VE66ÆR“°¢6öçFW‡Bæ&Vv–åF‚‚“°¢6öçFW‡BæVÆÆ—6RƒÂÂã’¢&VGV6VE66ÆRÂBã"¢&VGV6VE66ÆRÂÂÂÖF‚å’¢"“°¢6öçFW‡Bæf–ÆÂ‚“°¢6öçFW‡Bç&W7F÷&R‚“°¢Ð¢6öçFW‡Bæf–ÆÅ7G–ÆRÒ'&v&ƒ#SRÂ#CBÂ#BÂã’’#°¢6öçFW‡Bæ&Vv–åF‚‚“°¢6öçFW‡Bæ&2ƒÂÂã‚¢&VGV6VE66ÆRÂÂÖF‚å’¢"“°¢6öçFW‡Bæf–ÆÂ‚“°¢6öçFW‡Bç&W7F÷&R‚“°¢Ò“°¢Ð ¢gVæ7F–öâG&tg&ÖR†æ÷r’°¢G&u7FöæTæWW&Â†æ÷r“°¢6öçFW‡Bæ6ÆV%&V7BƒÂÂ775v–GF‚Â774†V–v‡B“°¢G&t–çFW&æÅ6÷W&6R†æ÷r“°¢G&t6÷&TfVVG2†æ÷r“°¢G&u7–æ6W2†æ÷r“° ¢–b‚&VGV6VDÖ÷F–öâæÖF6†W2’°¢VÇ6W2æf÷$V6‚‚‡VÇ6R’ÓâG&uVÇ6R‡VÇ6RÂæ÷r’“°¢&Æ÷76ö×2æf÷$V6‚‚†&Æ÷76öÒ’ÓâG&t&Æ÷76öÒ†&Æ÷76öÒÂæ÷r’“°¢G&uö–çFW%&Vf–æVÖVçB‚“°¢ÒVÇ6R°¢G&u&VGV6VDfÆ6‚‚“°¢Ð ¢–b†FV'VtÖ’G&tFV'VtÖ‚“°¢Ð ¢gVæ7F–öâ&VæFW"†æ÷r’°¢–b‚vUf—6–&ÆRÇÂ&VGV6VDÖ÷F–öâæÖF6†W2’&WGW&ã°¢&V6÷&EW&f÷&Öæ6R†æ÷r“°¢–b‚VF—DÖbbFWF–Ä÷Vâbbæ÷rãÒæW‡E7FöæTB’66†VGVÆU7FöæT–FÆR†æ÷r“°¢–b‚VF—DÖbb7F—fF–öå'Vææ–ærbbFWF–Ä÷Vâbbæ÷rãÒæW‡D–FÆTB’66†VGVÆT–FÆR†æ÷r“°¢–b€¢VF—DÖ ¢bb7F—fF–öå'Vææ–æp¢bbFWF–Ä÷Và¢bbæ÷rãÒæW‡E&VÆ”@¢bbVÇ6W2æÆVæwF‚ÂP¢bbæW‡D–FÆTBÒæ÷râ6–væÅF–ÖRƒcS¢’°¢66†VGVÆU&VÆ’†æ÷r“°¢Ð¢WFFTVffV7G2†æ÷r“°¢WFFU7FöæTVffV7G2†æ÷r“°¢G&tg&ÖR†æ÷r“° ¢–b†7F—fF–öå'Vææ–ærbb7F—fF–öä÷VäBbbæ÷rãÒ7F—fF–öä÷VäB’°¢6ö×ÆWFT7F—fF–öâ‚“°¢&WGW&ã°¢Ð¢g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢Ð ¢gVæ7F–öâ&W6—¦T6çf2‚’°¢6öç7B&V7BÒ&–rævWD&÷VæF–æt6Æ–VçE&V7B‚“°¢6öç7B66ÆU‚ÒÖF‚æ‡—÷B€¢çVÖ&W"ç'6TfÆöB†vWD6ö×WFVE7G–ÆR‡&–r’çG&ç6f÷&Òç7Æ—B‚"Â"•³Óòç&WÆ6R‚&ÖG&—‚‚"Â""’’ÇÂÀ¢çVÖ&W"ç'6TfÆöB†vWD6ö×WFVE7G–ÆR‡&–r’çG&ç6f÷&Òç7Æ—B‚"Â"•³Ò’ÇÂ ¢“°¢775v–GF‚Ò&–ræ6Æ–VçEv–GF‚ÇÂ&V7Bçv–GF‚òÖF‚æÖ‚‚ãÂ66ÆU‚“°¢774†V–v‡BÒ&–ræ6Æ–VçD†V–v‡BÇÂ&V7Bæ†V–v‡BòÖF‚æÖ‚‚ãÂ66ÆU‚“°¢G"ÒÖF‚æÖ–â‡v–æF÷ræFWf–6U—†VÅ&F–òÇÂÂ6ö'6Uö–çFW"æÖF6†W2òã"¢ãR“°¢6çf2çv–GF‚ÒÖF‚æÖ‚ƒÂÖF‚ç&÷VæB†775v–GF‚¢G"’“°¢6çf2æ†V–v‡BÒÖF‚æÖ‚ƒÂÖF‚ç&÷VæB†774†V–v‡B¢G"’“°¢6çf2ç7G–ÆRçv–GF‚ÒG¶775v–GF‡×†°¢6çf2ç7G–ÆRæ†V–v‡BÒG¶774†V–v‡G×†°¢6öçFW‡Bç6WEG&ç6f÷&Ò†G"ÂÂÂG"ÂÂ“°¢&W6—¦U7FöæT6çf2‚“°¢G&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢Ð ¢gVæ7F–öâ&W6—¦U7FöæT6çf2‚’°¢–b‚7FöæT6çf2ÇÂ7FöæT6öçFW‡BÇÂ7FöæTÖ’&WGW&ã°¢7FöæT775v–GF‚ÒÖF‚æÖ‚ƒÂ775v–GF‚¢7FöæTÖç&Vv–öâçv–GF‚“°¢7FöæT774†V–v‡BÒÖF‚æÖ‚ƒÂ774†V–v‡B¢7FöæTÖç&Vv–öâæ†V–v‡B“°¢7FöæT6çf2çv–GF‚ÒÖF‚æÖ‚ƒÂÖF‚ç&÷VæB‡7FöæT775v–GF‚¢G"’“°¢7FöæT6çf2æ†V–v‡BÒÖF‚æÖ‚ƒÂÖF‚ç&÷VæB‡7FöæT774†V–v‡B¢G"’“°¢7FöæT6çf2ç7G–ÆRçv–GF‚ÒG·7FöæT775v–GF‡×†°¢7FöæT6çf2ç7G–ÆRæ†V–v‡BÒG·7FöæT774†V–v‡G×†°¢7FöæT6öçFW‡Bç6WEG&ç6f÷&Ò†G"ÂÂÂG"ÂÂ“°¢7FöæU67&F6‚çv–GF‚ÒÖF‚æÖ‚ƒ"ÂÖF‚ç&÷VæB‡7FöæT775v–GF‚’“°¢7FöæU67&F6‚æ†V–v‡BÒÖF‚æÖ‚ƒ"ÂÖF‚ç&÷VæB‡7FöæT774†V–v‡B’“°¢&V'V–ÆE7FöæTFÆ6W2‚“°¢Ð ¢gVæ7F–öâ6WD–æW'B†VÆVÖVçBÂfÇVR’°¢–b‚&–æW'B"–âVÆVÖVçB’VÆVÖVçBæ–æW'BÒfÇVS°¢–b‡fÇVR’VÆVÖVçBç6WDGG&–'WFR‚&&–Ö†–FFVâ"Â'G'VR"“°¢VÇ6RVÆVÖVçBç&VÖ÷fTGG&–'WFR‚&&–Ö†–FFVâ"“°¢Ð ¢gVæ7F–öâ†öÆE67&öÆÂ‡F&vWB’°¢v–æF÷rç67&öÆÅFò‡²F÷¢F&vWBÂÆVgC¢Â&V†f–÷#¢&WFò"Ò“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢v–æF÷rç67&öÆÅFòƒÂF&vWB“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâv–æF÷rç67&öÆÅFòƒÂF&vWB’“°¢Ò“°¢Ð ¢gVæ7F–öâ&W6WD7F‚’°¢W‡Æ÷&Ræ6Æ74Æ—7Bç&VÖ÷fR‚&—2Ö6†&v–ær"“°¢W‡Æ÷&Rç&VÖ÷fTGG&–'WFR‚&&–Ö'W7’"“°¢W‡Æ÷&Rç6WDGG&–'WFR‚&&–ÖF—6&ÆVB"Â&fÇ6R"“°¢W‡Æ÷&RçFW‡D6öçFVçBÒ÷&–v–æÄ7FÆ&VÃ°¢7F—fF–öäÆ–æ·2æf÷$V6‚‚†Æ–æ²’ÓâÆ–æ²ç&VÖ÷fTGG&–'WFR‚&&–ÖF—6&ÆVB"’“°¢Ð ¢gVæ7F–öâ6WD7F—fF–öäW‡æFVB‡fÇVR’°¢W‡Æ÷&Rç6WDGG&–'WFR‚&&–ÖW‡æFVB"Â7G&–ær‡fÇVR’“°¢7F—fF–öäÆ–æ·2æf÷$V6‚‚†Æ–æ²’ÓâÆ–æ²ç6WDGG&–'WFR‚&&–ÖW‡æFVB"Â7G&–ær‡fÇVR’’“°¢Ð ¢gVæ7F–öâ÷VäFWF–Â‡67&öÆÅF&vWBÒv–æF÷rç67&öÆÅ’’°¢FWF–Ä÷VâÒG'VS°¢7F—fF–öå'Vææ–ærÒfÇ6S°¢7F—fF–öä÷VäBÒ°¢&W6WD7F‚“°¢†W&òæ6Æ74Æ—7BæFB‚&—2Öfö7W6VB"“°¢6WD7F—fF–öäW‡æFVB‡G'VR“°¢FWF–Âç6WDGG&–'WFR‚&&–Ö†–FFVâ"Â&fÇ6R"“°¢6WD–æW'B†–çG&òÂG'VR“°¢6WD–æW'B†FWF–ÂÂfÇ6R“°¢†öÆE67&öÆÂ‡67&öÆÅF&vWB“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢&6²æfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢–b†Fö7VÖVçBæ7F—fTVÆVÖVçBÓÒ&6²’&6²æfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢Ò“°¢Ò“°¢Ð ¢gVæ7F–öâ6Æ÷6TFWF–Â‚’°¢6öç7BF&vWBÒv–æF÷rç67&öÆÅ“°¢FWF–Ä÷VâÒfÇ6S°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢†W&òæ6Æ74Æ—7Bç&VÖ÷fR‚&—2Öfö7W6VB"“°¢6WD7F—fF–öäW‡æFVB†fÇ6R“°¢FWF–Âç6WDGG&–'WFR‚&&–Ö†–FFVâ"Â'G'VR"“°¢6WD–æW'B†FWF–ÂÂG'VR“°¢6WD–æW'B†–çG&òÂfÇ6R“°¢æW‡D–FÆTBÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒCS“°¢æW‡E&VÆ”BÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒC#“°¢æW‡E7FöæTBÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²C#°¢†öÆE67&öÆÂ‡F&vWB“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢7F—fF–öåG&–vvW"æfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ°¢–b†Fö7VÖVçBæ7F—fTVÆVÖVçBÓÒ7F—fF–öåG&–vvW"’7F—fF–öåG&–vvW"æfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ“°¢Ò“°¢Ò“°¢Ð ¢gVæ7F–öâ6æ6VÄ7F—fF–öâ‡&W7F÷&Tfö7W2ÒG'VR’°¢7F—fF–öå'Vææ–ærÒfÇ6S°¢7F—fF–öä÷VäBÒ°¢&VGV6VEVæF–ærÒfÇ6S°¢v–æF÷ræ6ÆV%F–ÖV÷WB‡&VGV6VEF–ÖW"“°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢&W6WD7F‚“°¢6WD7F—fF–öäW‡æFVB†fÇ6R“°¢æW‡D–FÆTBÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒ#“°¢æW‡E&VÆ”BÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒCC“°¢æW‡E7FöæTBÒ&VGV6VDÖ÷F–öâæÖF6†W0¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²Cc°¢G&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢†öÆE67&öÆÂ†7F—fF–öå67&öÆÂ“°¢–b‡&W7F÷&Tfö7W2’&WVW7Dæ–ÖF–öäg&ÖR‚‚’Óâ7F—fF–öåG&–vvW"æfö7W2‡²&WfVçE67&öÆÃ¢G'VRÒ’“°¢Ð ¢gVæ7F–öâ6ö×ÆWFT7F—fF–öâ‚’°¢–b‚7F—fF–öå'Vææ–ær’&WGW&ã°¢&VGV6VEVæF–ærÒfÇ6S°¢v–æF÷ræ6ÆV%F–ÖV÷WB‡&VGV6VEF–ÖW"“°¢÷VäFWF–Â†7F—fF–öå67&öÆÂ“°¢Ð ¢gVæ7F–öâ7F—fFR‡G&–vvW"ÒW‡Æ÷&R’°¢–b†7F—fF–öå'Vææ–ærÇÂFWF–Ä÷VâÇÂW‡Æ÷&RævWDGG&–'WFR‚&&–ÖF—6&ÆVB"’ÓÓÒ'G'VR"’&WGW&ã°¢7F—fF–öåG&–vvW"ÒG&–vvW"bbG—VöbG&–vvW"æfö7W2ÓÓÒ&gVæ7F–öâ"òG&–vvW"¢W‡Æ÷&S°¢7F—fF–öå'Vææ–ærÒG'VS°¢7F—fF–öå7F'FVBÒW&f÷&Öæ6Rææ÷r‚“°¢–b†FV'VuW&f÷&Öæ6R’°¢W&f÷&Öæ6U&Wf–÷W2Ò°¢W&f÷&Öæ6U6×ÆW2ÒµÓ°¢FVÆWFRFö7VÖVçBæFö7VÖVçDVÆVÖVçBæFF6WBçG&VTg3°¢FVÆWFRFö7VÖVçBæFö7VÖVçDVÆVÖVçBæFF6WBçG&VTg&ÖU“S°¢Ð¢7F—fF–öå67&öÆÂÒv–æF÷rç67&öÆÅ“°¢7F—fF–öä÷VäBÒ°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢W‡Æ÷&Ræ6Æ74Æ—7BæFB‚&—2Ö6†&v–ær"“°¢W‡Æ÷&Rç6WDGG&–'WFR‚&&–Ö'W7’"Â'G'VR"“°¢W‡Æ÷&Rç6WDGG&–'WFR‚&&–ÖF—6&ÆVB"Â'G'VR"“°¢7F—fF–öäÆ–æ·2æf÷$V6‚‚†Æ–æ²’ÓâÆ–æ²ç6WDGG&–'WFR‚&&–ÖF—6&ÆVB"Â'G'VR"’“°¢W‡Æ÷&RçFW‡D6öçFVçBÒ&VGV6VDÖ÷F–öâæÖF6†W2ò$÷Gv–W&×ž(
b"¢$VæW&v–X'–æ–^(
b#° ¢–b‡&VGV6VDÖ÷F–öâæÖF6†W2’°¢&VGV6VEVæF–ærÒG'VS°¢G&tg&ÖR†7F—fF–öå7F'FVB“°¢&VGV6VEF–ÖW"Òv–æF÷rç6WEF–ÖV÷WB‚‚’Óâ°¢–b†Fö7VÖVçBæ†–FFVâ’&WGW&ã°¢6ö×ÆWFT7F—fF–öâ‚“°¢ÒÂS#“°¢&WGW&ã°¢Ð ¢7F—fF–öä÷VäBÒ66†VGVÆT7F—fF–öâ†7F—fF–öå7F'FVB“°¢6æ6VÄæ–ÖF–öäg&ÖR†g&ÖR“°¢g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢Ð ¢gVæ7F–öâ7–æ4Ö÷F–öå&VfW&Væ6R‚’°¢6æ6VÄæ–ÖF–öäg&ÖR†g&ÖR“°¢–b‡&VGV6VDÖ÷F–öâæÖF6†W2’°¢æW‡D–FÆTBÒçVÖ&W"åõ4•D•dUô”äd”ä•E“°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢æW‡E7FöæTBÒçVÖ&W"åõ4•D•dUô”äd”ä•E“°¢ö–çFW$†–v†Æ–v‡BÒçVÆÃ°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×‚"Â#‚"“°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×’"Â#‚"“°¢7FöæUö–çFW%‚Ò°¢7FöæUö–çFW%’Ò°¢–b†7F—fF–öå'Vææ–ær’6ö×ÆWFT7F—fF–öâ‚“°¢VÇ6RG&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢ÒVÇ6R–b‡vUf—6–&ÆR’°¢æW‡D–FÆTBÒFWF–Ä÷Và¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒ“°¢æW‡E&VÆ”BÒFWF–Ä÷Và¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒ3““°¢æW‡E7FöæTBÒFWF–Ä÷Và¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²3c°¢g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢Ð¢Ð ¢W‡Æ÷&RæFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â‚’Óâ7F—fFR†W‡Æ÷&R’“°¢7F—fF–öäÆ–æ·2æf÷$V6‚‚†Æ–æ²’Óâ°¢Æ–æ²æFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â†WfVçB’Óâ°¢WfVçBç&WfVçDFVfVÇB‚“°¢7F—fFR†Æ–æ²“°¢Ò“°¢Ò“°¢&6²æFDWfVçDÆ—7FVæW"‚&6Æ–6²"Â6Æ÷6TFWF–Â“° ¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚&¶W–F÷vâ"Â†WfVçB’Óâ°¢–b†WfVçBæ¶W’ÓÒ$W66R"’&WGW&ã°¢–b†7F—fF–öå'Vææ–ær’6æ6VÄ7F—fF–öâ‡G'VR“°¢VÇ6R–b†FWF–Ä÷Vâ’6Æ÷6TFWF–Â‚“°¢Ò“° ¢–b‚6ö'6Uö–çFW"æÖF6†W2bbVF—DÖ’°¢v–æF÷ræFDWfVçDÆ—7FVæW"‚'ö–çFW&Ö÷fR"Â†WfVçB’Óâ°¢–b‡&VGV6VDÖ÷F–öâæÖF6†W2ÇÂFWF–Ä÷Vâ’&WGW&ã°¢6öç7B‚Ò†WfVçBæ6Æ–VçE‚òv–æF÷ræ–ææW%v–GF‚ÒãR’¢ÓC°¢6öç7B’Ò†WfVçBæ6Æ–VçE’òv–æF÷ræ–ææW$†V–v‡BÒãR’¢Ó3°¢7FöæUö–çFW%‚Ò†WfVçBæ6Æ–VçE‚òv–æF÷ræ–ææW%v–GF‚ÒãR’¢#°¢7FöæUö–çFW%’Ò†WfVçBæ6Æ–VçE’òv–æF÷ræ–ææW$†V–v‡BÒãR’¢#°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×‚"ÂG·‡×†“°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×’"ÂG·—×†“°¢ö–çFW$†–v†Æ–v‡BÒf–æEö–çFW$†–v†Æ–v‡B†WfVçBæ6Æ–VçE‚ÂWfVçBæ6Æ–VçE’“°¢ÒÂ²76—fS¢G'VRÒ“° ¢Fö7VÖVçBæFö7VÖVçDVÆVÖVçBæFDWfVçDÆ—7FVæW"‚'ö–çFW&ÆVfR"Â‚’Óâ°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×‚"Â#‚"“°¢&–rç7G–ÆRç6WE&÷W'G’‚"Ò×’"Â#‚"“°¢7FöæUö–çFW%‚Ò°¢7FöæUö–çFW%’Ò°¢ö–çFW$†–v†Æ–v‡BÒçVÆÃ°¢Ò“°¢Ð ¢Fö7VÖVçBæFDWfVçDÆ—7FVæW"‚'f—6–&–Æ—G–6†ævR"Â‚’Óâ°¢6öç7Bæ÷rÒW&f÷&Öæ6Rææ÷r‚“°¢–b†Fö7VÖVçBæ†–FFVâ’°¢vUf—6–&ÆRÒfÇ6S°¢†–FFVäBÒæ÷s°¢6æ6VÄæ–ÖF–öäg&ÖR†g&ÖR“°¢&WGW&ã°¢Ð ¢vUf—6–&ÆRÒG'VS°¢6öç7BW6VDf÷"ÒÖF‚æÖ‚ƒÂæ÷rÒ†–FFVäB“°¢VÇ6W2æf÷$V6‚‚‡VÇ6R’Óâ°¢VÇ6Rç7F'B³ÒW6VDf÷#°¢VÇ6RæVæB³ÒW6VDf÷#°¢Ò“°¢&Æ÷76ö×2æf÷$V6‚‚†&Æ÷76öÒ’Óâ°¢&Æ÷76öÒç7F'B³ÒW6VDf÷#°¢Ò“°¢–b„çVÖ&W"æ—4f–æ—FR†æW‡D–FÆTB’’æW‡D–FÆTB³ÒW6VDf÷#°¢–b„çVÖ&W"æ—4f–æ—FR†æW‡E&VÆ”B’’æW‡E&VÆ”B³ÒW6VDf÷#°¢–b„çVÖ&W"æ—4f–æ—FR†æW‡E7FöæTB’’æW‡E7FöæTB³ÒW6VDf÷#°¢–b†7F—fF–öä÷VäB’7F—fF–öä÷VäB³ÒW6VDf÷#°¢7F—fF–öå7F'FVB³Ò7F—fF–öå'Vææ–æròW6VDf÷"¢°¢6÷&TfVVG2æf÷$V6‚‚†fVVB’Óâ°¢fVVBç7F'B³ÒW6VDf÷#°¢fVVBæVæB³ÒW6VDf÷#°¢Ò“°¢7–æ6TfÆ6†W2æf÷$V6‚‚†fÆ6‚’Óâ°¢fÆ6‚ç7F'B³ÒW6VDf÷#°¢Ò“°¢7FöæUVÇ6W2æf÷$V6‚‚‡VÇ6R’Óâ°¢VÇ6Rç7F'B³ÒW6VDf÷#°¢VÇ6RæVæB³ÒW6VDf÷#°¢Ò“° ¢–b‡&VGV6VEVæF–ær’6ö×ÆWFT7F—fF–öâ‚“°¢VÇ6R–b‚&VGV6VDÖ÷F–öâæÖF6†W2’g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢VÇ6RG&tg&ÖR†æ÷r“°¢Ò“° ¢&VGV6VDÖ÷F–öâæFDWfVçDÆ—7FVæW"‚&6†ævR"Â7–æ4Ö÷F–öå&VfW&Væ6R“°¢6ö'6Uö–çFW"æFDWfVçDÆ—7FVæW"‚&6†ævR"Â&W6—¦T6çf2“°¢æWr&W6—¦Tö'6W'fW"‡&W6—¦T6çf2’æö'6W'fR‡&–r“° ¢–b†VF—DÖ’°¢v–æF÷råE$TUôTäU$u•ôDUbÒ°¢&V'V–ÆB‚’°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢&V'V–ÆDVFvT66†W2‚“°¢æW‡D–FÆTBÒçVÖ&W"åõ4•D•dUô”äd”ä•E“°¢æW‡E7FöæTBÒçVÖ&W"åõ4•D•dUô”äd”ä•E“°¢G&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢ÒÀ¢&Wf–Wr†VFvT–G2Â÷F–öç2Ò·Ò’°¢6öç7BfÆ–D–G2ÒVFvT–G2æf–ÇFW"‚†–B’ÓâVFvT'”–Bæ†2†–B’“°¢–b‚fÆ–D–G2æÆVæwF‚ÇÂ&VGV6VDÖ÷F–öâæÖF6†W2’°¢G&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢&WGW&âfÇ6S°¢Ð¢6öç7Bæ÷rÒW&f÷&Öæ6Rææ÷r‚“°¢6öç7BF‚Ò'V–ÆEF‚‡fÆ–D–G2“°¢6öç7B&6TGW&F–öâÒF‚æGW&F–öå6V6öæG2¢°¢6öç7BF&vWDGW&F–öâÒçVÖ&W"æ—4f–æ—FR†÷F–öç2çF&vWDGW&F–öä×2¢òÖF‚æÖ‚ƒC#ÂÖF‚æÖ–âƒcSÂ÷F–öç2çF&vWDGW&F–öä×2’¢¢çVÆÃ°¢6öç7BFW6—&VDGW&F–öâÒF&vWDGW&F–öà¢òÖF‚æÖ–â‡F&vWDGW&F–öâÂÖF‚æÖ‚ƒcSÂ&6TGW&F–öâ¢ãs"’¢¢&6TGW&F–öâ¢ãs#°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6öç7BVÇ6RÒFEVÇ6R‡fÆ–D–G2Âæ÷r²6–væÅF–ÖRƒs’Â°¢–çFVç6—G“¢÷F–öç2æ–çFVç6—G’ÇÂã‚À¢GW&F–öå66ÆS¢FW6—&VDGW&F–öâòÖF‚æÖ‚ƒÂ&6TGW&F–öâ’À¢6†&vS¢÷F–öç2æ6†&vRÓÒfÇ6RÀ¢FW&Ö–æÃ¢÷F–öç2çFW&Ö–æÂÇÂçVÆÂÀ¢&ÆööÕ66ÆS¢÷F–öç2æ&ÆööÕ66ÆRÇÂã ¢Ò“°¢æW‡D–FÆTBÒçVÖ&W"åõ4•D•dUô”äd”ä•E“°¢6æ6VÄæ–ÖF–öäg&ÖR†g&ÖR“°¢g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢&WGW&â°¢7F'FVC¢G'VRÀ¢GW&F–öã¢VÇ6RæGW&F–öâÀ¢'&—fÄC¢VÇ6RæVæBÀ¢VFvT–G3¢fÆ–D–G0¢Ó°¢ÒÀ¢7F÷‚’°¢VÇ6W2ÒµÓ°¢&Æ÷76ö×2ÒµÓ°¢6÷&TfVVG2ÒµÓ°¢7–æ6TfÆ6†W2ÒµÓ°¢7FöæUVÇ6W2ÒµÓ°¢G&tg&ÖR‡W&f÷&Öæ6Rææ÷r‚’“°¢ÒÀ¢&W6—¦S¢&W6—¦T6çf0¢Ó°¢Ð ¢6WD–æW'B†FWF–ÂÂG'VR“°¢&W6—¦T6çf2‚“°¢–b‚&VGV6VDÖ÷F–öâæÖF6†W2’°¢æW‡D–FÆTBÒVF—DÖ ¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒ3S“°¢æW‡E&VÆ”BÒVF—DÖ ¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²6–væÅF–ÖRƒC#“°¢æW‡E7FöæTBÒVF—DÖ ¢òçVÖ&W"åõ4•D•dUô”äd”ä•E¢¢W&f÷&Öæ6Rææ÷r‚’²3c°¢g&ÖRÒ&WVW7Dæ–ÖF–öäg&ÖR‡&VæFW"“°¢Ð§Ò’‚“°