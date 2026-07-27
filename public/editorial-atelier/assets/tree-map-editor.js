(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  if (params.get("debugMap") !== "1" || params.get("editMap") !== "1") return;

  const map = window.TREE_LIGHT_MAP;
  const dev = window.TREE_ENERGY_DEV;
  const rig = document.getElementById("image-rig");
  if (!map || !dev || !rig) return;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const sourceMap = clone(map);
  const storageKey = "ok-agency:wire-tree-map:working-v1";
  const protectedNodes = new Set(["source"]);
  const style = document.createElement("style");
  style.textContent = `
    html.map-editor-active .image-rig {
      transform: var(--map-editor-transform, translate3d(0, 0, 0) scale(1)) !important;
      transform-origin: 0 0 !important;
      transition: none !important;
    }
    html.map-editor-active .copy {
      pointer-events: none !important;
    }
    .map-editor-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 50;
      pointer-events: auto;
      touch-action: none;
      cursor: crosshair;
    }
    .map-editor-canvas.is-pan-ready { cursor: grab; }
    .map-editor-canvas.is-panning { cursor: grabbing; }
    .map-editor-canvas.is-connecting { cursor: copy; }
    .map-editor-panel {
      position: fixed;
      z-index: 1000;
      top: 10px;
      right: 10px;
      width: min(330px, calc(100vw - 20px));
      max-height: calc(100vh - 20px);
      overflow: auto;
      padding: 13px;
      color: #f7e8da;
      background: rgba(7, 20, 34, .92);
      border: 1px solid rgba(255, 92, 141, .55);
      box-shadow: 0 18px 54px rgba(0, 0, 0, .42);
      backdrop-filter: blur(16px);
      font: 12px/1.35 ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    .map-editor-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .map-editor-panel h2 {
      margin: 0 0 8px;
      color: #fff0df;
      font: 700 13px/1.2 Arial, sans-serif;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .map-editor-panel-header button {
      min-height: 25px;
      width: 29px;
      padding: 2px;
      margin-bottom: 7px;
    }
    .map-editor-panel.is-collapsed {
      width: auto;
      overflow: hidden;
    }
    .map-editor-panel.is-collapsed > :not(.map-editor-panel-header) { display: none; }
    .map-editor-toolbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin: 8px 0;
    }
    .map-editor-viewbar {
      display: grid;
      grid-template-columns: 40px 1fr 40px 1.1fr 1fr;
      align-items: stretch;
      gap: 6px;
      margin: 8px 0;
    }
    .map-editor-zoom {
      display: grid;
      place-items: center;
      min-height: 31px;
      color: #b9f5df;
      border: 1px solid rgba(185, 245, 223, .24);
      background: rgba(185, 245, 223, .055);
    }
    .map-editor-panel button {
      min-height: 31px;
      padding: 5px 7px;
      color: #f7e8da;
      background: rgba(255, 255, 255, .055);
      border: 1px solid rgba(255, 255, 255, .18);
      font: inherit;
      cursor: pointer;
    }
    .map-editor-panel button:hover,
    .map-editor-panel button:focus-visible {
      border-color: #ff5c8d;
      outline: none;
      background: rgba(255, 92, 141, .12);
    }
    .map-editor-panel button.is-active {
      color: #071522;
      border-color: #ffd36e;
      background: #ffd36e;
    }
    .map-editor-selection,
    .map-editor-status,
    .map-editor-diagnostics,
    .map-editor-help {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, .12);
    }
    .map-editor-status { color: #b9f5df; min-height: 1.4em; }
    .map-editor-diagnostics { color: #c8d6df; }
    .map-editor-diagnostics .warning { color: #ffb36e; }
    .map-editor-audit {
      display: none;
      margin-top: 8px;
      padding: 8px;
      color: #d8f3fa;
      background: rgba(126, 200, 221, .055);
      border: 1px solid rgba(126, 200, 221, .22);
    }
    .map-editor-audit.is-visible { display: block; }
    .map-editor-audit-summary {
      margin-bottom: 6px;
      color: #fff0df;
      font-weight: 700;
    }
    .map-editor-audit-list {
      display: grid;
      gap: 3px;
      max-height: 144px;
      overflow: auto;
    }
    .map-editor-audit-row {
      display: grid;
      grid-template-columns: 14px minmax(0, 1fr) auto;
      align-items: center;
      gap: 5px;
      padding: 2px 3px;
      border-radius: 3px;
    }
    .map-editor-audit-row[data-status="running"] { background: rgba(255, 211, 110, .13); }
    .map-editor-audit-row[data-status="passed"] { color: #b9f5df; }
    .map-editor-audit-row[data-status="failed"] { color: #ff9c9c; }
    .map-editor-audit-mark { text-align: center; }
    .map-editor-audit-id {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .map-editor-audit-note { color: rgba(216, 243, 250, .7); font-size: 10px; }
    .map-editor-output {
      display: none;
      width: 100%;
      min-height: 150px;
      margin-top: 8px;
      resize: vertical;
      box-sizing: border-box;
      color: #d8f3fa;
      background: #071522;
      border: 1px solid rgba(126, 200, 221, .4);
      font: 10px/1.35 ui-monospace, monospace;
    }
    .map-editor-output.is-visible { display: block; }
    .map-editor-oncanvas-help {
      position: absolute;
      z-index: 51;
      left: max(12px, calc((100% - 1440px) / 2 + 12px));
      bottom: 10px;
      max-width: min(720px, calc(100% - 24px));
      padding: 6px 9px;
      color: #d8f3fa;
      background: rgba(7, 20, 34, .78);
      border: 1px solid rgba(126, 200, 221, .3);
      pointer-events: none;
      font: 10px/1.3 ui-monospace, monospace;
    }
    @media (max-width: 720px) {
      .map-editor-panel {
        top: auto;
        bottom: 8px;
        right: 8px;
        max-height: 42vh;
        width: min(360px, calc(100vw - 16px));
      }
      .map-editor-oncanvas-help {
        top: 8px;
        bottom: auto;
        font-size: 9px;
      }
    }
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add("map-editor-active");

  const overlay = document.createElement("canvas");
  overlay.className = "map-editor-canvas";
  overlay.setAttribute("aria-label", "Edytor mapy przewodów");
  rig.appendChild(overlay);
  const context = overlay.getContext("2d");

  const help = document.createElement("div");
  help.className = "map-editor-oncanvas-help";
  help.textContent = "Klik: node/edge · drag: node/uchwyt · Shift: precyzyjnie · S: split · P: test · Del: usuń · Ctrl/Cmd+Z/Y";
  rig.appendChild(help);
  help.textContent = "Kółko: zoom · Ręka (H): przesuń · C: nowa krzywa · S: dodaj node · Shift: precyzyjnie · 0: dopasuj";

  const panel = document.createElement("aside");
  panel.className = "map-editor-panel";
  panel.setAttribute("aria-label", "Narzędzia edytora mapy");
  panel.innerHTML = `
    <div class="map-editor-panel-header">
      <h2>Wire map editor</h2>
      <button type="button" data-action="collapse" aria-label="Zwiń panel" aria-expanded="true">−</button>
    </div>
    <div class="map-editor-selection" data-editor-selection>Brak zaznaczenia</div>
    <div class="map-editor-toolbar">
      <button type="button" data-action="undo">Undo</button>
      <button type="button" data-action="redo">Redo</button>
      <button type="button" data-action="reset">Reset</button>
      <button type="button" data-action="split">Dodaj node (S)</button>
      <button type="button" data-action="connect">Nowa krzywa (C)</button>
      <button type="button" data-action="delete">Delete: wybierz</button>
      <button type="button" data-action="pulse">Test (P)</button>
      <button type="button" data-action="audit">Audyt końcówek</button>
      <button type="button" data-action="export">Export</button>
      <button type="button" data-action="copy">Copy JSON</button>
      <button type="button" data-action="download">Download</button>
    </div>
    <div class="map-editor-viewbar" aria-label="Sterowanie widokiem">
      <button type="button" data-action="zoom-out" aria-label="Oddal">−</button>
      <span class="map-editor-zoom" data-editor-zoom>100%</span>
      <button type="button" data-action="zoom-in" aria-label="Przybliż">+</button>
      <button type="button" data-action="pan">Ręka (H)</button>
      <button type="button" data-action="fit">Dopasuj</button>
    </div>
    <div class="map-editor-status" data-editor-status>Tryb roboczy zapisuje się lokalnie.</div>
    <div class="map-editor-diagnostics" data-editor-diagnostics></div>
    <div class="map-editor-audit" data-editor-audit aria-live="polite"></div>
    <div class="map-editor-help">
      Żółty: C1 · turkus: C2 · pomarańczowy: ostrzeżenie stycznej.<br>
      <strong>Dodaj node:</strong> kliknij istniejącą krzywą w miejscu nowego punktu.<br>
      <strong>Nowa krzywa:</strong> wybierz node startowy, potem node docelowy lub puste miejsce.<br>
      <strong>Delete:</strong> zaznacz węzeł/krzywą i kliknij Delete. Chroniony jest tylko techniczny node source; aktywne źródła korzeni są edytowalne.<br>
      <strong>Audyt końcówek:</strong> testuje co 2 s każdy node połączony tylko z jedną krzywą.
    </div>
    <textarea class="map-editor-output" data-editor-output readonly spellcheck="false"></textarea>
  `;
  document.body.appendChild(panel);

  const selectionLabel = panel.querySelector("[data-editor-selection]");
  const statusLabel = panel.querySelector("[data-editor-status]");
  const diagnosticsLabel = panel.querySelector("[data-editor-diagnostics]");
  const auditLabel = panel.querySelector("[data-editor-audit]");
  const output = panel.querySelector("[data-editor-output]");
  const splitButton = panel.querySelector('[data-action="split"]');
  const connectButton = panel.querySelector('[data-action="connect"]');
  const deleteButton = panel.querySelector('[data-action="delete"]');
  const zoomLabel = panel.querySelector("[data-editor-zoom]");
  const panButton = panel.querySelector('[data-action="pan"]');
  const auditButton = panel.querySelector('[data-action="audit"]');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let selection = null;
  let splitMode = false;
  let connectMode = false;
  let connectFrom = "";
  let connectPointer = null;
  let drag = null;
  let autosaveTimer = 0;
  let drawRequest = 0;
  let history = [];
  let historyIndex = -1;
  let spaceHeld = false;
  let panMode = false;
  const view = { scale: 1, x: 0, y: 0 };
  const minZoom = .75;
  const maxZoom = 8;
  const endpointAudit = {
    running: false,
    entries: [],
    index: 0,
    timer: 0,
    arrivalTimers: [],
    current: "",
    currentStatus: ""
  };

  function validMap(value) {
    return value && value.image && value.nodes && Array.isArray(value.edges)
      && Array.isArray(value.roots) && Array.isArray(value.groups);
  }

  function replaceMap(snapshot) {
    Object.keys(map).forEach((key) => delete map[key]);
    Object.assign(map, clone(snapshot));
    dev.rebuild();
    queueDraw();
  }

  function serializedMap() {
    return JSON.stringify(map);
  }

  function autosave() {
    window.clearTimeout(autosaveTimer);
    autosaveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, serializedMap());
        statusLabel.textContent = "Zapisano kopię roboczą lokalnie.";
      } catch {
        statusLabel.textContent = "Nie udało się zapisać localStorage.";
      }
    }, 180);
  }

  function commit(label) {
    if (endpointAudit.running) stopEndpointAudit("Audyt przerwany: mapa została zmieniona.");
    const state = serializedMap();
    if (history[historyIndex] === state) {
      autosave();
      return;
    }
    history = history.slice(0, historyIndex + 1);
    history.push(state);
    historyIndex = history.length - 1;
    autosave();
    statusLabel.textContent = label;
    updatePanel();
  }

  function restoreHistory(nextIndex) {
    if (nextIndex < 0 || nextIndex >= history.length) return;
    historyIndex = nextIndex;
    replaceMap(JSON.parse(history[historyIndex]));
    autosave();
    statusLabel.textContent = nextIndex < history.length - 1 ? "Przywrócono wcześniejszy stan." : "Przywrócono nowszy stan.";
    updatePanel();
  }

  function pointToCanvas(point) {
    return [point[0] * width, point[1] * height];
  }

  function pointerPoint(event) {
    const rect = overlay.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / Math.max(1, rect.width),
      y: (event.clientY - rect.top) / Math.max(1, rect.height),
      cssX: event.clientX - rect.left,
      cssY: event.clientY - rect.top
    };
  }

  function applyView(label = "") {
    rig.style.setProperty(
      "--map-editor-transform",
      `translate3d(${view.x.toFixed(2)}px, ${view.y.toFixed(2)}px, 0) scale(${view.scale.toFixed(4)})`
    );
    zoomLabel.textContent = `${Math.round(view.scale * 100)}%`;
    if (label) statusLabel.textContent = label;
    queueDraw();
  }

  function zoomAt(clientX, clientY, requestedScale) {
    const nextScale = Math.max(minZoom, Math.min(maxZoom, requestedScale));
    if (Math.abs(nextScale - view.scale) < .0001) return;
    const rect = rig.getBoundingClientRect();
    const ratio = nextScale / view.scale;
    view.x += (clientX - rect.left) * (1 - ratio);
    view.y += (clientY - rect.top) * (1 - ratio);
    view.scale = nextScale;
    applyView(`Widok: ${Math.round(view.scale * 100)}%.`);
  }

  function zoomFromCenter(factor) {
    const rect = rig.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, view.scale * factor);
  }

  function resetView() {
    view.scale = 1;
    view.x = 0;
    view.y = 0;
    applyView("Widok dopasowany do hero.");
  }

  function setPanMode(nextValue) {
    panMode = nextValue;
    if (panMode) {
      splitMode = false;
      splitButton.classList.remove("is-active");
      splitButton.textContent = "Dodaj node (S)";
      connectMode = false;
      connectFrom = "";
      connectPointer = null;
      connectButton.classList.remove("is-active");
      connectButton.textContent = "Nowa krzywa (C)";
      overlay.classList.remove("is-connecting");
    }
    panButton.classList.toggle("is-active", panMode);
    overlay.classList.toggle("is-pan-ready", panMode || spaceHeld);
    statusLabel.textContent = panMode
      ? "Tryb ręki: przeciągnij drzewo lewym przyciskiem."
      : "Tryb ręki wyłączony.";
  }

  function setSplitMode(nextValue) {
    splitMode = nextValue;
    if (splitMode) {
      panMode = false;
      panButton.classList.remove("is-active");
      overlay.classList.toggle("is-pan-ready", spaceHeld);
      connectMode = false;
      connectFrom = "";
      connectPointer = null;
      connectButton.classList.remove("is-active");
      connectButton.textContent = "Nowa krzywa (C)";
      overlay.classList.remove("is-connecting");
    }
    splitButton.classList.toggle("is-active", splitMode);
    splitButton.textContent = splitMode ? "Kliknij krzywą…" : "Dodaj node (S)";
    statusLabel.textContent = splitMode
      ? "Dodaj node: kliknij istniejącą krzywą dokładnie w miejscu nowego punktu."
      : "Tryb dodawania noda wyłączony.";
    queueDraw();
  }

  function setConnectMode(nextValue) {
    connectMode = nextValue;
    connectPointer = null;
    if (connectMode) {
      panMode = false;
      panButton.classList.remove("is-active");
      overlay.classList.toggle("is-pan-ready", spaceHeld);
      splitMode = false;
      splitButton.classList.remove("is-active");
      splitButton.textContent = "Dodaj node (S)";
      connectFrom = selection?.type === "node" ? selection.id : "";
    } else {
      connectFrom = "";
    }
    connectButton.classList.toggle("is-active", connectMode);
    connectButton.textContent = connectMode
      ? connectFrom ? "Kliknij cel…" : "Kliknij start…"
      : "Nowa krzywa (C)";
    overlay.classList.toggle("is-connecting", connectMode);
    statusLabel.textContent = connectMode
      ? connectFrom
        ? `Nowa krzywa od ${connectFrom}: kliknij node docelowy albo puste miejsce.`
        : "Nowa krzywa: kliknij node początkowy."
      : "Tryb tworzenia krzywej wyłączony.";
    queueDraw();
  }

  function cubic(edge, t) {
    const p0 = map.nodes[edge.from];
    const p1 = edge.c1;
    const p2 = edge.c2;
    const p3 = map.nodes[edge.to];
    const mt = 1 - t;
    return [
      mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
      mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1]
    ];
  }

  function edgeById(id) {
    return map.edges.find((edge) => edge.id === id);
  }

  function closestOnEdge(edge, point) {
    let best = { distance: Number.POSITIVE_INFINITY, t: 0, point: map.nodes[edge.from] };
    for (let index = 0; index <= 120; index += 1) {
      const t = index / 120;
      const sample = cubic(edge, t);
      const distance = Math.hypot((sample[0] - point.x) * width, (sample[1] - point.y) * height);
      if (distance < best.distance) best = { distance, t, point: sample };
    }
    return best;
  }

  function hitTest(point) {
    const bestNode = hitNode(point);
    if (bestNode) return bestNode;

    const candidateEdges = selection?.type === "edge"
      ? [edgeById(selection.id)].filter(Boolean)
      : selection?.type === "node"
        ? map.edges.filter((edge) => edge.from === selection.id || edge.to === selection.id)
        : [];
    for (const edge of candidateEdges) {
      for (const handle of ["c1", "c2"]) {
        const control = edge[handle];
        const distance = Math.hypot((control[0] - point.x) * width, (control[1] - point.y) * height);
        if (distance <= 11) return { type: "handle", id: edge.id, handle, distance };
      }
    }

    return hitEdge(point);
  }

  function hitNode(point, maximumDistance = 10) {
    let bestNode = null;
    Object.entries(map.nodes).forEach(([id, node]) => {
      const distance = Math.hypot((node[0] - point.x) * width, (node[1] - point.y) * height);
      if (distance <= maximumDistance && (!bestNode || distance < bestNode.distance)) {
        bestNode = { type: "node", id, distance };
      }
    });
    return bestNode;
  }

  function hitEdge(point, maximumDistance = 12) {
    let bestEdge = null;
    map.edges.forEach((edge) => {
      const candidate = closestOnEdge(edge, point);
      if (candidate.distance <= maximumDistance && (!bestEdge || candidate.distance < bestEdge.distance)) {
        bestEdge = { type: "edge", id: edge.id, distance: candidate.distance, t: candidate.t };
      }
    });
    return bestEdge;
  }

  function selectedEdges() {
    if (selection?.type === "edge" || selection?.type === "handle") {
      const edge = edgeById(selection.id);
      return edge ? [edge] : [];
    }
    if (selection?.type === "node") {
      return map.edges.filter((edge) => edge.from === selection.id || edge.to === selection.id);
    }
    return [];
  }

  function vectorAngle(a, b) {
    const av = [a[0] * map.image.width, a[1] * map.image.height];
    const bv = [b[0] * map.image.width, b[1] * map.image.height];
    const denominator = Math.max(.00001, Math.hypot(...av) * Math.hypot(...bv));
    const cosine = Math.max(-1, Math.min(1, (av[0] * bv[0] + av[1] * bv[1]) / denominator));
    return Math.acos(cosine) * 180 / Math.PI;
  }

  function curveRadius(edge, atEnd) {
    const pixel = (point) => [point[0] * map.image.width, point[1] * map.image.height];
    const [p0, p1, p2, p3] = [
      map.nodes[edge.from], edge.c1, edge.c2, map.nodes[edge.to]
    ].map(pixel);
    const first = atEnd
      ? [3 * (p3[0] - p2[0]), 3 * (p3[1] - p2[1])]
      : [3 * (p1[0] - p0[0]), 3 * (p1[1] - p0[1])];
    const second = atEnd
      ? [6 * (p3[0] - 2 * p2[0] + p1[0]), 6 * (p3[1] - 2 * p2[1] + p1[1])]
      : [6 * (p0[0] - 2 * p1[0] + p2[0]), 6 * (p0[1] - 2 * p1[1] + p2[1])];
    const cross = Math.abs(first[0] * second[1] - first[1] * second[0]);
    if (cross < .0001) return Number.POSITIVE_INFINITY;
    return Math.pow(Math.hypot(...first), 3) / cross;
  }

  function diagnostics() {
    const pairs = new Map();
    const paths = [];
    map.roots.forEach((root) => paths.push([...root, "flare_t1"]));
    map.groups.forEach((group) => group.terminals.forEach((terminal) => paths.push([...group.prefix, ...terminal.edges])));
    paths.forEach((path) => {
      for (let index = 0; index < path.length - 1; index += 1) {
        const incoming = edgeById(path[index]);
        const outgoing = edgeById(path[index + 1]);
        if (!incoming || !outgoing || incoming.to !== outgoing.from) continue;
        const node = map.nodes[incoming.to];
        const incomingVector = [node[0] - incoming.c2[0], node[1] - incoming.c2[1]];
        const outgoingVector = [outgoing.c1[0] - node[0], outgoing.c1[1] - node[1]];
        const angle = vectorAngle(incomingVector, outgoingVector);
        const incomingLength = Math.hypot(incomingVector[0] * map.image.width, incomingVector[1] * map.image.height);
        const outgoingLength = Math.hypot(outgoingVector[0] * map.image.width, outgoingVector[1] * map.image.height);
        const handleRatio = Math.max(incomingLength, outgoingLength) / Math.max(1, Math.min(incomingLength, outgoingLength));
        const radiusIn = curveRadius(incoming, true);
        const radiusOut = curveRadius(outgoing, false);
        const minimumRadius = Math.min(radiusIn, radiusOut);
        const radiusRatio = Math.max(radiusIn, radiusOut) / Math.max(.001, minimumRadius);
        const key = `${incoming.id}>${outgoing.id}`;
        pairs.set(key, {
          incoming, outgoing, node: incoming.to, angle, handleRatio,
          radiusIn, radiusOut, minimumRadius, radiusRatio
        });
      }
    });
    return [...pairs.values()].sort((a, b) => {
      const severity = (item) => Math.max(
        item.angle,
        item.minimumRadius < 24 ? 38 - item.minimumRadius : 0,
        Number.isFinite(item.radiusRatio) ? (item.radiusRatio - 1) * 9 : 0,
        (item.handleRatio - 1) * 5
      );
      return severity(b) - severity(a);
    });
  }

  function queueDraw() {
    cancelAnimationFrame(drawRequest);
    drawRequest = requestAnimationFrame(draw);
  }

  function drawEdge(edge, color, lineWidth = 1, alpha = .7) {
    context.beginPath();
    for (let index = 0; index <= 56; index += 1) {
      const point = pointToCanvas(cubic(edge, index / 56));
      if (index === 0) context.moveTo(point[0], point[1]);
      else context.lineTo(point[0], point[1]);
    }
    context.globalAlpha = alpha;
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
  }

  function drawHandle(edge, handle) {
    const node = handle === "c1" ? map.nodes[edge.from] : map.nodes[edge.to];
    const control = edge[handle];
    const [nx, ny] = pointToCanvas(node);
    const [hx, hy] = pointToCanvas(control);
    const color = handle === "c1" ? "#ffd36e" : "#55ddeb";
    context.globalAlpha = .94;
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(nx, ny);
    context.lineTo(hx, hy);
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.arc(hx, hy, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#071522";
    context.font = "8px ui-monospace, monospace";
    context.fillText(handle.toUpperCase(), hx + 6, hy - 5);
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const warnings = diagnostics();
    const warnedNodes = new Set(warnings.filter((item) => (
      item.angle >= 12 || item.minimumRadius < 24 || item.radiusRatio > 3
    )).map((item) => item.node));

    map.edges.forEach((edge) => drawEdge(edge, "#8fd2dd", .7, .18));
    selectedEdges().forEach((edge) => {
      drawEdge(edge, "#ff5c8d", 2, .94);
      drawHandle(edge, "c1");
      drawHandle(edge, "c2");
      const middle = pointToCanvas(cubic(edge, .5));
      context.globalAlpha = 1;
      context.fillStyle = "#fff0df";
      context.font = "10px ui-monospace, monospace";
      context.fillText(edge.id, middle[0] + 7, middle[1] - 7);
    });

    Object.entries(map.nodes).forEach(([id, point]) => {
      const [x, y] = pointToCanvas(point);
      const isSelected = selection?.type === "node" && selection.id === id;
      context.globalAlpha = 1;
      context.fillStyle = isSelected ? "#fff0df" : warnedNodes.has(id) ? "#ffb36e" : "#7ec8dd";
      context.beginPath();
      context.arc(x, y, isSelected ? 6 : 3.4, 0, Math.PI * 2);
      context.fill();
      if (isSelected || warnedNodes.has(id)) {
        context.font = "9px ui-monospace, monospace";
        context.fillText(id, x + 7, y + 10);
      }
    });

    if (endpointAudit.current && map.nodes[endpointAudit.current]) {
      const [x, y] = pointToCanvas(map.nodes[endpointAudit.current]);
      const color = endpointAudit.currentStatus === "passed"
        ? "#83f0bc"
        : endpointAudit.currentStatus === "failed"
          ? "#ff7f8f"
          : "#ffd36e";
      context.globalAlpha = 1;
      context.strokeStyle = color;
      context.lineWidth = 2.2;
      context.beginPath();
      context.arc(x, y, 11, 0, Math.PI * 2);
      context.stroke();
      context.globalAlpha = .2;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, 16, 0, Math.PI * 2);
      context.fill();
    }

    if (connectMode) {
      context.globalAlpha = 1;
      context.fillStyle = "#b9f5df";
      context.font = "11px ui-monospace, monospace";
      context.fillText(
        connectFrom
          ? `NOWA KRZYWA: ${connectFrom} → kliknij node lub puste miejsce`
          : "NOWA KRZYWA: kliknij node początkowy",
        18,
        30
      );
      const from = map.nodes[connectFrom];
      if (from) {
        const [fromX, fromY] = pointToCanvas(from);
        context.strokeStyle = "#b9f5df";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(fromX, fromY, 8, 0, Math.PI * 2);
        context.stroke();
        if (connectPointer) {
          const [toX, toY] = pointToCanvas([connectPointer.x, connectPointer.y]);
          context.setLineDash([7, 6]);
          context.beginPath();
          context.moveTo(fromX, fromY);
          context.lineTo(toX, toY);
          context.stroke();
          context.setLineDash([]);
        }
      }
    }

    if (splitMode) {
      context.globalAlpha = 1;
      context.fillStyle = "#ffd36e";
      context.font = "11px ui-monospace, monospace";
      context.fillText("SPLIT: kliknij dowolną krzywą dokładnie w miejscu podziału", 18, 30);
    }
  }

  function resize() {
    width = rig.clientWidth;
    height = rig.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    overlay.width = Math.max(1, Math.round(width * dpr));
    overlay.height = Math.max(1, Math.round(height * dpr));
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    queueDraw();
  }

  function uniqueId(base, source) {
    let id = base.replace(/[^a-zA-Z0-9_-]/g, "_");
    let suffix = 2;
    while (source.has(id)) {
      id = `${base}_${suffix}`;
      suffix += 1;
    }
    return id;
  }

  function lerp(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  function pathEndNode(edgeIds) {
    let endNode = "";
    edgeIds.forEach((edgeId) => {
      const edge = edgeById(edgeId);
      if (edge) endNode = edge.to;
    });
    return endNode;
  }

  function attachConnectionToTerminal(edge) {
    let attached = false;
    map.groups.forEach((group) => {
      group.terminals.forEach((terminal) => {
        if (attached || terminal.endpoint !== edge.to) return;
        const route = [...group.prefix, ...terminal.edges];
        if (pathEndNode(route) !== edge.from) return;
        terminal.edges.push(edge.id);
        attached = true;
      });
    });
    return attached;
  }

  function createConnection(fromId, targetId, point) {
    const from = map.nodes[fromId];
    if (!from) {
      statusLabel.textContent = "Nie znaleziono noda początkowego.";
      return false;
    }

    let createdNode = false;
    if (!targetId) {
      const nodeIds = new Set(Object.keys(map.nodes));
      targetId = uniqueId(`${fromId}_node`, nodeIds);
      map.nodes[targetId] = [
        Math.max(0, Math.min(1, point.x)),
        Math.max(0, Math.min(1, point.y))
      ];
      createdNode = true;
    }
    if (targetId === fromId) {
      statusLabel.textContent = "Node początkowy i docelowy muszą być różne.";
      return false;
    }
    if (map.edges.some((edge) => edge.from === fromId && edge.to === targetId)) {
      statusLabel.textContent = "Taka krzywa już istnieje.";
      return false;
    }

    const to = map.nodes[targetId];
    if (!to) return false;
    const edgeIds = new Set(map.edges.map((edge) => edge.id));
    const edgeId = uniqueId(`${fromId}_${targetId}`, edgeIds);
    const incident = map.edges.filter((edge) => edge.from === fromId || edge.to === fromId);
    const kind = protectedNodes.has(fromId) || incident.some((edge) => edge.kind === "branch")
      ? "branch"
      : "twig";
    const edge = {
      id: edgeId,
      from: fromId,
      to: targetId,
      c1: lerp(from, to, .32),
      c2: lerp(from, to, .68),
      kind,
      depth: "front",
      intensity: .82
    };
    map.edges.push(edge);
    const attached = attachConnectionToTerminal(edge);
    selection = { type: "edge", id: edgeId };
    setConnectMode(false);
    dev.rebuild();
    commit(
      `${createdNode ? `Utworzono ${targetId} i ` : ""}połączono ${fromId} → ${targetId}`
      + `${attached ? " oraz przywrócono trasę terminala" : ""}.`
    );
    queueDraw();
    return true;
  }

  function insertAfterReference(existingId, newId) {
    const insert = (path) => {
      for (let index = path.length - 1; index >= 0; index -= 1) {
        if (path[index] === existingId) path.splice(index + 1, 0, newId);
      }
    };
    map.roots.forEach(insert);
    map.groups.forEach((group) => {
      insert(group.prefix);
      group.terminals.forEach((terminal) => insert(terminal.edges));
    });
  }

  function removeReferences(edgeId) {
    const remove = (path) => {
      for (let index = path.length - 1; index >= 0; index -= 1) {
        if (path[index] === edgeId) path.splice(index, 1);
      }
    };
    map.roots.forEach(remove);
    map.groups.forEach((group) => {
      remove(group.prefix);
      group.terminals.forEach((terminal) => remove(terminal.edges));
    });
  }

  function splitSelected(point, edgeId = selection?.type === "edge" ? selection.id : "") {
    const edge = edgeById(edgeId);
    if (!edge) {
      statusLabel.textContent = "Nie trafiono w krzywą. Przybliż widok i kliknij ponownie.";
      return false;
    }
    if (!edge) return;
    const nearest = closestOnEdge(edge, point);
    const t = Math.max(.08, Math.min(.92, nearest.t));
    const p0 = map.nodes[edge.from];
    const p1 = edge.c1;
    const p2 = edge.c2;
    const p3 = map.nodes[edge.to];
    const q0 = lerp(p0, p1, t);
    const q1 = lerp(p1, p2, t);
    const q2 = lerp(p2, p3, t);
    const r0 = lerp(q0, q1, t);
    const r1 = lerp(q1, q2, t);
    const splitPoint = lerp(r0, r1, t);
    const nodeIds = new Set(Object.keys(map.nodes));
    const edgeIds = new Set(map.edges.map((item) => item.id));
    const nodeId = uniqueId(`${edge.id}_node`, nodeIds);
    const newEdgeId = uniqueId(`${edge.id}_part2`, edgeIds);
    const oldTarget = edge.to;
    const newEdge = {
      ...clone(edge),
      id: newEdgeId,
      from: nodeId,
      to: oldTarget,
      c1: r1,
      c2: q2
    };
    map.nodes[nodeId] = splitPoint;
    edge.to = nodeId;
    edge.c1 = q0;
    edge.c2 = r0;
    const edgeIndex = map.edges.indexOf(edge);
    map.edges.splice(edgeIndex + 1, 0, newEdge);
    insertAfterReference(edge.id, newEdgeId);
    selection = { type: "node", id: nodeId };
    splitMode = false;
    splitButton.classList.remove("is-active");
    splitButton.textContent = "Dodaj node (S)";
    dev.rebuild();
    commit(`Podzielono ${edge.id} w t=${t.toFixed(2)}.`);
    queueDraw();
    return true;
  }

  function deleteSelection() {
    if (!selection) {
      statusLabel.textContent = "Najpierw kliknij węzeł lub krzywą, potem użyj Delete.";
      return false;
    }
    if (selection.type === "edge" || selection.type === "handle") {
      const edge = edgeById(selection.id);
      if (!edge) return;
      removeReferences(edge.id);
      map.edges.splice(map.edges.indexOf(edge), 1);
      selection = null;
      dev.rebuild();
      commit(`Usunięto krawędź ${edge.id}.`);
      queueDraw();
      return true;
    }

    if (selection.type === "node") {
      const nodeId = selection.id;
      const incoming = map.edges.filter((edge) => edge.to === nodeId);
      const outgoing = map.edges.filter((edge) => edge.from === nodeId);
      const incident = [...incoming, ...outgoing];
      if (protectedNodes.has(nodeId)) {
        statusLabel.textContent = "Node source jest chroniony.";
        return false;
      }
      if (incoming.length > 1 || outgoing.length > 1) {
        statusLabel.textContent = "Węzeł rozgałęzienia: usuń najpierw zbędne gałęzie.";
        return false;
      }
      if (incoming.length === 1 && outgoing.length === 1) {
        const before = incoming[0];
        const after = outgoing[0];
        before.to = after.to;
        before.c2 = clone(after.c2);
        removeReferences(after.id);
        map.edges.splice(map.edges.indexOf(after), 1);
      } else {
        incident.forEach((edge) => {
          removeReferences(edge.id);
          map.edges.splice(map.edges.indexOf(edge), 1);
        });
      }
      delete map.nodes[nodeId];
      selection = null;
      dev.rebuild();
      commit(`Usunięto węzeł ${nodeId}.`);
      queueDraw();
      return true;
    }
    return false;
  }

  function pathToNode(target) {
    const sources = sourceNodeIds();
    const start = sources[Math.floor(Math.random() * sources.length)];
    const queue = [{ node: start, path: [] }];
    const visited = new Set([start]);
    while (queue.length) {
      const current = queue.shift();
      if (current.node === target) return current.path;
      map.edges.filter((edge) => edge.from === current.node).forEach((edge) => {
        if (visited.has(edge.to)) return;
        visited.add(edge.to);
        queue.push({ node: edge.to, path: [...current.path, edge.id] });
      });
    }
    return [];
  }

  function sourceNodeIds() {
    const ids = map.roots
      .filter((route) => route.length > 0 && route.every((edgeId) => edgeById(edgeId)))
      .map((route) => edgeById(route[0])?.from)
      .filter((id) => id && map.nodes[id]);
    return [...new Set(ids.length ? ids : ["source"])];
  }

  function endpointNodes() {
    const degree = new Map(Object.keys(map.nodes).map((id) => [id, 0]));
    map.edges.forEach((edge) => {
      degree.set(edge.from, (degree.get(edge.from) || 0) + 1);
      degree.set(edge.to, (degree.get(edge.to) || 0) + 1);
    });
    return [...degree.entries()]
      .filter(([, count]) => count === 1)
      .map(([id]) => ({
        id,
        point: map.nodes[id],
        route: pathToNode(id),
        source: "",
        status: "pending",
        note: ""
      }))
      .map((entry) => ({
        ...entry,
        source: edgeById(entry.route[0])?.from || ""
      }))
      .sort((a, b) => a.point[0] - b.point[0] || a.point[1] - b.point[1]);
  }

  function routeReaches(route, target) {
    const first = edgeById(route[0]);
    let node = first?.from || "";
    if (!sourceNodeIds().includes(node)) return false;
    for (const edgeId of route) {
      const edge = edgeById(edgeId);
      if (!edge || edge.from !== node) return false;
      node = edge.to;
    }
    return route.length > 0 && node === target;
  }

  function renderEndpointAudit() {
    if (!endpointAudit.entries.length) {
      auditLabel.classList.add("is-visible");
      auditLabel.dataset.total = "0";
      auditLabel.dataset.passed = "0";
      auditLabel.dataset.failed = "0";
      auditLabel.innerHTML = '<div class="map-editor-audit-summary">Brak nodów z dokładnie jedną krzywą.</div>';
      return;
    }
    const passed = endpointAudit.entries.filter((entry) => entry.status === "passed").length;
    const failed = endpointAudit.entries.filter((entry) => entry.status === "failed").length;
    const tested = passed + failed;
    auditLabel.classList.add("is-visible");
    auditLabel.dataset.total = String(endpointAudit.entries.length);
    auditLabel.dataset.tested = String(tested);
    auditLabel.dataset.passed = String(passed);
    auditLabel.dataset.failed = String(failed);
    auditLabel.dataset.running = String(endpointAudit.running);
    const marks = { pending: "○", running: "▶", passed: "✓", failed: "×" };
    auditLabel.innerHTML = `
      <div class="map-editor-audit-summary">
        Końcówki: ${endpointAudit.entries.length} · sprawdzone ${tested} · OK ${passed} · brak trasy ${failed}<br>
        Źródła: ${sourceNodeIds().join(", ")}
      </div>
      <div class="map-editor-audit-list">
        ${endpointAudit.entries.map((entry) => `
          <div class="map-editor-audit-row" data-endpoint="${entry.id}" data-status="${entry.status}">
            <span class="map-editor-audit-mark">${marks[entry.status]}</span>
            <span class="map-editor-audit-id" title="${entry.id}">${entry.id}</span>
            <span class="map-editor-audit-note">${entry.note || `${entry.source || "—"} · ${entry.route.length} odc.`}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function stopEndpointAudit(message = "Audyt zatrzymany.") {
    window.clearTimeout(endpointAudit.timer);
    endpointAudit.arrivalTimers.forEach((timer) => window.clearTimeout(timer));
    endpointAudit.arrivalTimers = [];
    endpointAudit.running = false;
    endpointAudit.currentStatus = "";
    dev.stop();
    auditButton.classList.remove("is-active");
    auditButton.textContent = endpointAudit.entries.length ? "Powtórz audyt" : "Audyt końcówek";
    statusLabel.textContent = message;
    renderEndpointAudit();
    queueDraw();
  }

  function finishEndpointAudit() {
    window.clearTimeout(endpointAudit.timer);
    endpointAudit.running = false;
    endpointAudit.currentStatus = endpointAudit.entries.at(-1)?.status || "";
    auditButton.classList.remove("is-active");
    auditButton.textContent = "Powtórz audyt";
    const passed = endpointAudit.entries.filter((entry) => entry.status === "passed").length;
    const failed = endpointAudit.entries.filter((entry) => entry.status === "failed").length;
    statusLabel.textContent = `Audyt zakończony: ${passed}/${endpointAudit.entries.length} końcówek osiągniętych${failed ? `, ${failed} bez trasy.` : "."}`;
    renderEndpointAudit();
    queueDraw();
  }

  function runNextEndpoint() {
    if (!endpointAudit.running) return;
    if (endpointAudit.index >= endpointAudit.entries.length) {
      finishEndpointAudit();
      return;
    }
    const entry = endpointAudit.entries[endpointAudit.index];
    endpointAudit.index += 1;
    endpointAudit.current = entry.id;
    const reachable = routeReaches(entry.route, entry.id);

    if (!reachable) {
      entry.status = "failed";
      entry.note = "brak trasy";
      endpointAudit.currentStatus = "failed";
      statusLabel.textContent = `Audyt ${endpointAudit.index}/${endpointAudit.entries.length}: ${entry.id} — brak kierunkowej trasy od źródeł.`;
      renderEndpointAudit();
      queueDraw();
      endpointAudit.timer = window.setTimeout(runNextEndpoint, 2000);
      return;
    }

    entry.status = "running";
    entry.note = `${entry.source} →`;
    endpointAudit.currentStatus = "running";
    statusLabel.textContent = `Audyt ${endpointAudit.index}/${endpointAudit.entries.length}: sygnał ${entry.source} → ${entry.id}.`;
    renderEndpointAudit();
    queueDraw();
    const pulse = dev.preview(entry.route, {
      targetDurationMs: 1350,
      terminal: entry.id,
      intensity: 1.36,
      bloomScale: 1.45,
      charge: true
    });
    if (!pulse || pulse.started === false) {
      entry.status = "failed";
      entry.note = "brak impulsu";
      endpointAudit.currentStatus = "failed";
      renderEndpointAudit();
      queueDraw();
    } else {
      const arrivalTimer = window.setTimeout(() => {
        if (!endpointAudit.running) return;
        entry.status = "passed";
        entry.note = `${entry.source} · doszedł`;
        endpointAudit.currentStatus = "passed";
        renderEndpointAudit();
        queueDraw();
      }, Math.min(1700, (pulse.duration || 1350) + 140));
      endpointAudit.arrivalTimers.push(arrivalTimer);
    }
    endpointAudit.timer = window.setTimeout(runNextEndpoint, 2000);
  }

  function startEndpointAudit() {
    setPanMode(false);
    setSplitMode(false);
    setConnectMode(false);
    dev.stop();
    endpointAudit.entries = endpointNodes();
    endpointAudit.index = 0;
    endpointAudit.current = "";
    endpointAudit.currentStatus = "";
    endpointAudit.running = true;
    auditButton.classList.add("is-active");
    auditButton.textContent = "Zatrzymaj audyt";
    renderEndpointAudit();
    if (!endpointAudit.entries.length) {
      stopEndpointAudit("Brak nodów połączonych dokładnie z jedną krzywą.");
      return;
    }
    statusLabel.textContent = `Znaleziono ${endpointAudit.entries.length} końcówek i ${sourceNodeIds().length} źródeł. Start audytu co 2 sekundy.`;
    runNextEndpoint();
  }

  function previewSelection() {
    let route = [];
    if (selection?.type === "edge" || selection?.type === "handle") {
      const edge = edgeById(selection.id);
      if (edge) route = [...pathToNode(edge.from), edge.id];
    } else if (selection?.type === "node") {
      route = pathToNode(selection.id);
    }
    if (!route.length) {
      const group = map.groups[0];
      route = [...map.roots[2], ...group.prefix, ...group.terminals[0].edges];
    }
    const started = dev.preview(route);
    statusLabel.textContent = started ? `Test: ${route.join(" → ")}` : "Test pulse niedostępny w reduced-motion.";
  }

  function exportJson(show = true) {
    const json = JSON.stringify(map, null, 2);
    output.value = json;
    if (show) output.classList.toggle("is-visible");
    return json;
  }

  async function copyJson() {
    const json = exportJson(false);
    try {
      await navigator.clipboard.writeText(json);
      statusLabel.textContent = "Skopiowano pełny JSON mapy.";
    } catch {
      output.classList.add("is-visible");
      output.focus();
      output.select();
      document.execCommand("copy");
      statusLabel.textContent = "Skopiowano JSON przez pole eksportu.";
    }
  }

  function downloadJson() {
    const blob = new Blob([exportJson(false)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "tree-light-map-working.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(anchor.href), 0);
    statusLabel.textContent = "Pobrano tree-light-map-working.json.";
  }

  function updatePanel() {
    if (!selection) selectionLabel.textContent = "Brak zaznaczenia";
    else if (selection.type === "node") {
      const point = map.nodes[selection.id];
      selectionLabel.textContent = `NODE ${selection.id} · [${point?.map((value) => value.toFixed(4)).join(", ")}]`;
    } else {
      const edge = edgeById(selection.id);
      selectionLabel.textContent = `${selection.type.toUpperCase()} ${selection.id}${selection.handle ? ` · ${selection.handle}` : ""} · ${edge?.kind || ""}`;
    }
    let deletionProtected = false;
    if (selection?.type === "node") {
      const incident = map.edges.filter((edge) => edge.from === selection.id || edge.to === selection.id);
      deletionProtected = protectedNodes.has(selection.id);
    } else if (selection?.type === "edge" || selection?.type === "handle") {
      deletionProtected = false;
    }
    deleteButton.textContent = !selection
      ? "Delete: wybierz"
      : deletionProtected
        ? "Delete: chronione"
        : "Delete zaznaczone";
    deleteButton.title = !selection
      ? "Najpierw kliknij węzeł lub krzywą."
      : deletionProtected
        ? "Chroniony jest wyłącznie node source."
        : "Usuń aktualnie zaznaczony element.";
    const allDiagnostics = diagnostics();
    const rootDiagnostics = allDiagnostics.filter((item) => item.incoming.kind === "root" || item.outgoing.kind === "root");
    const issues = allDiagnostics
      .filter((item) => item.incoming.kind !== "root" && item.outgoing.kind !== "root")
      .filter((item) => item.angle >= 12 || item.minimumRadius < 24 || item.radiusRatio > 3)
      .slice(0, 6);
    const rootPeak = rootDiagnostics.reduce((peak, item) => Math.max(peak, item.angle), 0);
    diagnosticsLabel.innerHTML = issues.length
      ? `<strong>Trunk / crown / branches:</strong><br>${issues.map((item) => {
          const warning = item.angle >= 20 || item.minimumRadius < 24;
          const rin = Number.isFinite(item.radiusIn) ? item.radiusIn.toFixed(0) : "∞";
          const rout = Number.isFinite(item.radiusOut) ? item.radiusOut.toFixed(0) : "∞";
          const ratio = Number.isFinite(item.radiusRatio) ? item.radiusRatio.toFixed(1) : "∞";
          return `<span class="${warning ? "warning" : ""}">${item.node}: ${item.angle.toFixed(1)}° · R ${rin}/${rout} · ×${ratio}</span>`;
        }).join("<br>")}<br><span>Root merge: max ${rootPeak.toFixed(1)}°</span>`
      : `Styczne gałęzi: bez istotnych ostrzeżeń.<br><span>Root merge: max ${rootPeak.toFixed(1)}°</span>`;
  }

  overlay.addEventListener("pointerdown", (event) => {
    const point = pointerPoint(event);
    if (connectMode && !spaceHeld && event.button === 0) {
      const nodeHit = hitNode(point, 14);
      if (!connectFrom) {
        if (!nodeHit) {
          statusLabel.textContent = "Najpierw kliknij istniejący node początkowy.";
        } else {
          connectFrom = nodeHit.id;
          selection = { type: "node", id: connectFrom };
          connectButton.textContent = "Kliknij cel…";
          statusLabel.textContent = `Start: ${connectFrom}. Kliknij node docelowy albo puste miejsce.`;
        }
      } else {
        createConnection(connectFrom, nodeHit?.id || "", point);
      }
      updatePanel();
      queueDraw();
      event.preventDefault();
      return;
    }
    if (splitMode && !spaceHeld && event.button === 0) {
      const edgeHit = hitEdge(point, 18);
      if (edgeHit) {
        selection = { type: "edge", id: edgeHit.id };
        splitSelected(point, edgeHit.id);
      } else {
        statusLabel.textContent = "Nie trafiono w krzywą. Przybliż widok i kliknij dokładniej.";
      }
      updatePanel();
      queueDraw();
      event.preventDefault();
      return;
    }
    const wantsPan = panMode || spaceHeld || event.button === 1;
    if (wantsPan) {
      drag = {
        mode: "pan",
        pointerId: event.pointerId,
        lastClientX: event.clientX,
        lastClientY: event.clientY,
        moved: false
      };
      overlay.setPointerCapture(event.pointerId);
      overlay.classList.add("is-panning");
      event.preventDefault();
      return;
    }
    const hit = hitTest(point);
    selection = hit ? { type: hit.type, id: hit.id, handle: hit.handle } : null;
    updatePanel();
    queueDraw();

    if (hit?.type === "node" && protectedNodes.has(hit.id)) {
      statusLabel.textContent = "Node source jest chroniony; jego krzywe i uchwyty pozostają edytowalne.";
    } else if (hit?.type === "node" || hit?.type === "handle") {
      drag = {
        mode: "edit",
        pointerId: event.pointerId,
        startState: serializedMap(),
        lastX: point.x,
        lastY: point.y,
        moved: false
      };
      overlay.setPointerCapture(event.pointerId);
      overlay.style.cursor = "grabbing";
    }
    event.preventDefault();
  });

  overlay.addEventListener("pointermove", (event) => {
    if (connectMode) {
      connectPointer = pointerPoint(event);
      queueDraw();
    }
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.mode === "pan") {
      const dx = event.clientX - drag.lastClientX;
      const dy = event.clientY - drag.lastClientY;
      drag.lastClientX = event.clientX;
      drag.lastClientY = event.clientY;
      if (!dx && !dy) return;
      drag.moved = true;
      view.x += dx;
      view.y += dy;
      applyView();
      event.preventDefault();
      return;
    }
    if (!selection) return;
    const point = pointerPoint(event);
    const precision = event.shiftKey ? .2 : 1;
    const dx = (point.x - drag.lastX) * precision;
    const dy = (point.y - drag.lastY) * precision;
    drag.lastX = point.x;
    drag.lastY = point.y;
    if (!dx && !dy) return;
    drag.moved = true;

    if (selection.type === "node") {
      const node = map.nodes[selection.id];
      if (!node) return;
      node[0] = Math.max(0, Math.min(1, node[0] + dx));
      node[1] = Math.max(0, Math.min(1, node[1] + dy));
      map.edges.forEach((edge) => {
        if (edge.from === selection.id) {
          edge.c1[0] += dx;
          edge.c1[1] += dy;
        }
        if (edge.to === selection.id) {
          edge.c2[0] += dx;
          edge.c2[1] += dy;
        }
      });
    } else if (selection.type === "handle") {
      const edge = edgeById(selection.id);
      if (!edge) return;
      edge[selection.handle][0] = Math.max(0, Math.min(1, edge[selection.handle][0] + dx));
      edge[selection.handle][1] = Math.max(0, Math.min(1, edge[selection.handle][1] + dy));
    }
    dev.rebuild();
    autosave();
    updatePanel();
    queueDraw();
    event.preventDefault();
  });

  function endDrag(event) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (overlay.hasPointerCapture(event.pointerId)) overlay.releasePointerCapture(event.pointerId);
    overlay.classList.remove("is-panning");
    overlay.classList.toggle("is-pan-ready", panMode || spaceHeld);
    if (drag.mode === "edit" && drag.moved && drag.startState !== serializedMap()) {
      commit("Zapisano korektę geometrii.");
    }
    drag = null;
    event.preventDefault();
  }

  overlay.addEventListener("pointerup", endDrag);
  overlay.addEventListener("pointercancel", endDrag);
  overlay.addEventListener("wheel", (event) => {
    const factor = Math.exp(-event.deltaY * .00135);
    zoomAt(event.clientX, event.clientY, view.scale * factor);
    event.preventDefault();
  }, { passive: false });
  overlay.addEventListener("auxclick", (event) => {
    if (event.button === 1) event.preventDefault();
  });

  panel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "undo") restoreHistory(historyIndex - 1);
    if (action === "redo") restoreHistory(historyIndex + 1);
    if (action === "reset") {
      replaceMap(sourceMap);
      selection = null;
      commit("Przywrócono mapę źródłową.");
    }
    if (action === "split") setSplitMode(!splitMode);
    if (action === "connect") setConnectMode(!connectMode);
    if (action === "delete") {
      if (panMode) setPanMode(false);
      if (splitMode) setSplitMode(false);
      if (connectMode) setConnectMode(false);
      deleteSelection();
    }
    if (action === "pulse") {
      if (endpointAudit.running) stopEndpointAudit("Audyt zatrzymany na rzecz pojedynczego testu.");
      previewSelection();
    }
    if (action === "audit") {
      if (endpointAudit.running) stopEndpointAudit();
      else startEndpointAudit();
    }
    if (action === "export") exportJson(true);
    if (action === "copy") copyJson();
    if (action === "download") downloadJson();
    if (action === "zoom-out") zoomFromCenter(1 / 1.25);
    if (action === "zoom-in") zoomFromCenter(1.25);
    if (action === "pan") setPanMode(!panMode);
    if (action === "fit") resetView();
    if (action === "collapse") {
      const collapsed = panel.classList.toggle("is-collapsed");
      button.textContent = collapsed ? "+" : "−";
      button.setAttribute("aria-expanded", String(!collapsed));
      button.setAttribute("aria-label", collapsed ? "Rozwiń panel" : "Zwiń panel");
    }
    updatePanel();
    queueDraw();
  });

  window.addEventListener("keydown", (event) => {
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === "z") {
      restoreHistory(event.shiftKey ? historyIndex + 1 : historyIndex - 1);
      event.preventDefault();
      return;
    }
    if (modifier && event.key.toLowerCase() === "y") {
      restoreHistory(historyIndex + 1);
      event.preventDefault();
      return;
    }
    if (event.target === output) return;
    if (event.code === "Space") {
      spaceHeld = true;
      overlay.classList.add("is-pan-ready");
      event.preventDefault();
      return;
    }
    if (event.key === "0") {
      resetView();
      event.preventDefault();
      return;
    }
    if (event.key.toLowerCase() === "h") {
      setPanMode(!panMode);
      event.preventDefault();
      return;
    }
    if (event.key.toLowerCase() === "c") {
      setConnectMode(!connectMode);
      event.preventDefault();
      return;
    }
    if (event.key === "+" || event.key === "=") {
      zoomFromCenter(1.25);
      event.preventDefault();
      return;
    }
    if (event.key === "-") {
      zoomFromCenter(1 / 1.25);
      event.preventDefault();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      if (connectMode) {
        setConnectMode(false);
        event.preventDefault();
        return;
      }
      deleteSelection();
      event.preventDefault();
    }
    if (event.key.toLowerCase() === "s") {
      setSplitMode(!splitMode);
      event.preventDefault();
    }
    if (event.key.toLowerCase() === "p") {
      previewSelection();
      event.preventDefault();
    }
    if (event.key === "Escape") {
      if (endpointAudit.running) stopEndpointAudit("Audyt zatrzymany.");
      setSplitMode(false);
      setConnectMode(false);
      setPanMode(false);
      dev.stop();
      statusLabel.textContent = "Anulowano narzędzie/test.";
      queueDraw();
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.code !== "Space") return;
    spaceHeld = false;
    if (drag?.mode !== "pan" && !panMode) overlay.classList.remove("is-pan-ready");
    event.preventDefault();
  });
  window.addEventListener("blur", () => {
    spaceHeld = false;
    if (drag?.mode !== "pan" && !panMode) overlay.classList.remove("is-pan-ready");
  });

  let restored = false;
  try {
    const working = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (validMap(working)) {
      replaceMap(working);
      restored = true;
    }
  } catch {
    localStorage.removeItem(storageKey);
  }

  history = [serializedMap()];
  historyIndex = 0;
  new ResizeObserver(resize).observe(rig);
  applyView();
  resize();
  updatePanel();
  statusLabel.textContent = restored ? "Wczytano lokalną kopię roboczą." : "Edytujesz mapę źródłową; zmiany zapisują się lokalnie.";
})();
