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
  overlay.setAttribute("aria-label", "Edytor mapy przewodÃ³w");
  rig.appendChild(overlay);
  const context = overlay.getContext("2d");

  const help = document.createElement("div");
  help.className = "map-editor-oncanvas-help";
  help.textContent = "Klik: node/edge Â· drag: node/uchwyt Â· Shift: precyzyjnie Â· S: split Â· P: test Â· Del: usuÅ„ Â· Ctrl/Cmd+Z/Y";
  rig.appendChild(help);
  help.textContent = "KÃ³Å‚ko: zoom Â· RÄ™ka (H): przesuÅ„ Â· C: nowa krzywa Â· S: dodaj node Â· Shift: precyzyjnie Â· 0: dopasuj";

  const panel = document.createElement("aside");
  panel.className = "map-editor-panel";
  panel.setAttribute("aria-label", "NarzÄ™dzia edytora mapy");
  panel.innerHTML = `
    <div class="map-editor-panel-header">
      <h2>Wire map editor</h2>
      <button type="button" data-action="collapse" aria-label="ZwiÅ„ panel" aria-expanded="true">âˆ’</button>
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
      <button type="button" data-action="audit">Audyt koÅ„cÃ³wek</button>
      <button type="button" data-action="export">Export</button>
      <button type="button" data-action="copy">Copy JSON</button>
      <button type="button" data-action="download">Download</button>
    </div>
    <div class="map-editor-viewbar" aria-label="Sterowanie widokiem">
      <button type="button" data-action="zoom-out" aria-label="Oddal">âˆ’</button>
      <span class="map-editor-zoom" data-editor-zoom>100%</span>
      <button type="button" data-action="zoom-in" aria-label="PrzybliÅ¼">+</button>
      <button type="button" data-action="pan">RÄ™ka (H)</button>
      <button type="button" data-action="fit">Dopasuj</button>
    </div>
    <div class="map-editor-status" data-editor-status>Tryb roboczy zapisuje siÄ™ lokalnie.</div>
    <div class="map-editor-diagnostics" data-editor-diagnostics></div>
    <div class="map-editor-audit" data-editor-audit aria-live="polite"></div>
    <div class="map-editor-help">
      Å»Ã³Å‚ty: C1 Â· turkus: C2 Â· pomaraÅ„czowy: ostrzeÅ¼enie stycznej.<br>
      <strong>Dodaj node:</strong> kliknij istniejÄ…cÄ… krzywÄ… w miejscu nowego punktu.<br>
      <strong>Nowa krzywa:</strong> wybierz node startowy, potem node docelowy lub puste miejsce.<br>
      <strong>Delete:</strong> zaznacz wÄ™zeÅ‚/krzywÄ… i kliknij Delete. Chroniony jest tylko techniczny node source; aktywne ÅºrÃ³dÅ‚a korzeni sÄ… edytowalne.<br>
      <strong>Audyt koÅ„cÃ³wek:</strong> testuje co 2 s kaÅ¼dy node poÅ‚Ä…czony tylko z jednÄ… krzywÄ….
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
        statusLabel.textContent = "Zapisano kopiÄ™ roboczÄ… lokalnie.";
      } catch {
        statusLabel.textContent = "Nie udaÅ‚o siÄ™ zapisaÄ‡ localStorage.";
      }
    }, 180);
  }

  function commit(label) {
    if (endpointAudit.running) stopEndpointAudit("Audyt przerwany: mapa zostaÅ‚a zmieniona.");
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
    statusLabel.textContent = nextIndex < history.length - 1 ? "PrzywrÃ³cono wczeÅ›niejszy stan." : "PrzywrÃ³cono nowszy stan.";
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
      ? "Tryb rÄ™ki: przeciÄ…gnij drzewo lewym przyciskiem."
      : "Tryb rÄ™ki wyÅ‚Ä…czony.";
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
      connectButton.textContent =óŸx¶‰žËkºwµçu•½ÕÐ  ¤€ôøì(€€€€€€€¥˜€ …•¹‘Á½¥¹ÑÕ‘¥Ð¹ÉÕ¹¹¥¹œ¤É•ÑÕÉ¸ì(€€€€€€€•¹ÑÉä¹ÍÑ…ÑÕÌ€ô€‰Á…ÍÍ•ˆì(€€€€€€€•¹ÑÉä¹¹½Ñ”€ô€‘í•¹ÑÉä¹Í½ÕÉ•ôƒ
Ü‘½Íé•“	€ì(€€€€€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹ÕÉÉ•¹ÑMÑ…ÑÕÌ€ô€‰Á…ÍÍ•ˆì(€€€€€€€É•¹‘•É¹‘Á½¥¹ÑÕ‘¥Ð ¤ì(€€€€€€€ÅÕ•Õ•É…Ü ¤ì(€€€€€ô°5…Ñ ¹µ¥¸ ÄÜÀÀ°€¡ÁÕ±Í”¹‘ÕÉ…Ñ¥½¸ñð€ÄÌÔÀ¤€¬€ÄÐÀ¤¤ì(€€€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹…ÉÉ¥Ù…±Q¥µ•ÉÌ¹ÁÕÍ ¡…ÉÉ¥Ù…±Q¥µ•È¤ì(€€€ô(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹Ñ¥µ•È€ôÝ¥¹‘½Ü¹Í•ÑQ¥µ•½ÕÐ¡ÉÕ¹9•áÑ¹‘Á½¥¹Ð°€ÈÀÀÀ¤ì(€ô((€™Õ¹Ñ¥½¸ÍÑ…ÉÑ¹‘Á½¥¹ÑÕ‘¥Ð ¤ì(€€€Í•ÑA…¹5½‘”¡™…±Í”¤ì(€€€Í•ÑMÁ±¥Ñ5½‘”¡™…±Í”¤ì(€€€Í•Ñ½¹¹•Ñ5½‘”¡™…±Í”¤ì(€€€‘•Ø¹ÍÑ½À ¤ì(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹•¹ÑÉ¥•Ì€ô•¹‘Á½¥¹Ñ9½‘•Ì ¤ì(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹¥¹‘•à€ô€Àì(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹ÕÉÉ•¹Ð€ô€ˆˆì(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹ÕÉÉ•¹ÑMÑ…ÑÕÌ€ô€ˆˆì(€€€•¹‘Á½¥¹ÑÕ‘¥Ð¹ÉÕ¹¹¥¹œ€ôÑÉÕ”ì(€€€…Õ‘¥Ñ	ÕÑÑ½¸¹±…ÍÍ1¥ÍÐ¹…‘ ‰¥Ìµ…Ñ¥Ù”ˆ¤ì(€€€…Õ‘¥Ñ	ÕÑÑ½¸¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰i…ÑÉéåµ…¨…Õ‘åÐˆì(€€€É•¹‘•É¹‘Á½¥¹ÑÕ‘¥Ð ¤ì(€€€¥˜€ …•¹‘Á½¥¹ÑÕ‘¥Ð¹•¹ÑÉ¥•Ì¹±•¹Ñ ¤ì(€€€€€ÍÑ½Á¹‘Á½¥¹ÑÕ‘¥Ð ‰	É…¬¹½“ÍÜÁ¿é½¹å ‘½¯	…‘¹¥”è©•‘»­Ééåß¸ˆ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ôi¹…±•é¥½¹¼€‘í•¹‘Á½¥¹ÑÕ‘¥Ð¹•¹ÑÉ¥•Ì¹±•¹Ñ¡ô­¿ÍÝ•¬¤€‘íÍ½ÕÉ•9½‘•%‘Ì ¤¹±•¹Ñ¡ôƒéËÍ‘—¸MÑ…ÉÐ…Õ‘åÑÔ¼€ÈÍ•­Õ¹‘ä¹€ì(€€€ÉÕ¹9•áÑ¹‘Á½¥¹Ð ¤ì(€ô((€™Õ¹Ñ¥½¸ÁÉ•Ù¥•ÝM•±•Ñ¥½¸ ¤ì(€€€±•ÐÉ½ÕÑ”€ômtì(€€€¥˜€¡Í•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰•‘”ˆñðÍ•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰¡…¹‘±”ˆ¤ì(€€€€€½¹ÍÐ•‘”€ô•‘•	å%¡Í•±•Ñ¥½¸¹¥¤ì(€€€€€¥˜€¡•‘”¤É½ÕÑ”€ôl¸¸¹Á…Ñ¡Q½9½‘”¡•‘”¹™É½´¤°•‘”¹¥‘tì(€€€ô•±Í”¥˜€¡Í•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰¹½‘”ˆ¤ì(€€€€€É½ÕÑ”€ôÁ…Ñ¡Q½9½‘”¡Í•±•Ñ¥½¸¹¥¤ì(€€€ô(€€€¥˜€ …É½ÕÑ”¹±•¹Ñ ¤ì(€€€€€½¹ÍÐÉ½ÕÀ€ôµ…À¹É½ÕÁÍlÁtì(€€€€€É½ÕÑ”€ôl¸¸¹µ…À¹É½½ÑÍlÉt°€¸¸¹É½ÕÀ¹ÁÉ•™¥à°€¸¸¹É½ÕÀ¹Ñ•Éµ¥¹…±ÍlÁt¹•‘•Ítì(€€€ô(€€€½¹ÍÐÍÑ…ÉÑ•€ô‘•Ø¹ÁÉ•Ù¥•Ü¡É½ÕÑ”¤ì(€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ôÍÑ…ÉÑ•€üQ•ÍÐè€‘íÉ½ÕÑ”¹©½¥¸ ˆƒŠH€ˆ¥õ€€è€‰Q•ÍÐÁÕ±Í”¹¥•‘½ÍÓeÁ¹äÜÉ•‘Õ•µµ½Ñ¥½¸¸ˆì(€ô((€™Õ¹Ñ¥½¸•áÁ½ÉÑ)Í½¸¡Í¡½Ü€ôÑÉÕ”¤ì(€€€½¹ÍÐ©Í½¸€ô)M=8¹ÍÑÉ¥¹¥™ä¡µ…À°¹Õ±°°€È¤ì(€€€½ÕÑÁÕÐ¹Ù…±Õ”€ô©Í½¸ì(€€€¥˜€¡Í¡½Ü¤½ÕÑÁÕÐ¹±…ÍÍ1¥ÍÐ¹Ñ½±” ‰¥ÌµÙ¥Í¥‰±”ˆ¤ì(€€€É•ÑÕÉ¸©Í½¸ì(€ô((€…Íå¹Œ™Õ¹Ñ¥½¸½Áå)Í½¸ ¤ì(€€€½¹ÍÐ©Í½¸€ô•áÁ½ÉÑ)Í½¸¡™…±Í”¤ì(€€€ÑÉäì(€€€€€…Ý…¥Ð¹…Ù¥…Ñ½È¹±¥Á‰½…É¹ÝÉ¥Ñ•Q•áÐ¡©Í½¸¤ì(€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰M­½Á¥½Ý…¹¼Á—	¹ä)M=8µ…Áä¸ˆì(€€€ô…Ñ ì(€€€€€½ÕÑÁÕÐ¹±…ÍÍ1¥ÍÐ¹…‘ ‰¥ÌµÙ¥Í¥‰±”ˆ¤ì(€€€€€½ÕÑÁÕÐ¹™½ÕÌ ¤ì(€€€€€½ÕÑÁÕÐ¹Í•±•Ð ¤ì(€€€€€‘½Õµ•¹Ð¹•á•½µµ…¹ ‰½Áäˆ¤ì(€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰M­½Á¥½Ý…¹¼)M=8ÁÉé•èÁ½±”•­ÍÁ½ÉÑÔ¸ˆì(€€€ô(€ô((€™Õ¹Ñ¥½¸‘½Ý¹±½…‘)Í½¸ ¤ì(€€€½¹ÍÐ‰±½ˆ€ô¹•Ü	±½ˆ¡m•áÁ½ÉÑ)Í½¸¡™…±Í”¥t°ìÑåÁ”è€‰…ÁÁ±¥…Ñ¥½¸½©Í½¸ˆô¤ì(€€€½¹ÍÐ…¹¡½È€ô‘½Õµ•¹Ð¹É•…Ñ•±•µ•¹Ð ‰„ˆ¤ì(€€€…¹¡½È¹¡É•˜€ôUI0¹É•…Ñ•=‰©•ÑUI0¡‰±½ˆ¤ì(€€€…¹¡½È¹‘½Ý¹±½…€ô€‰ÑÉ•”µ±¥¡Ðµµ…ÀµÝ½É­¥¹œ¹©Í½¸ˆì(€€€…¹¡½È¹±¥¬ ¤ì(€€€Ý¥¹‘½Ü¹Í•ÑQ¥µ•½ÕÐ  ¤€ôøUI0¹É•Ù½­•=‰©•ÑUI0¡…¹¡½È¹¡É•˜¤°€À¤ì(€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰A½‰É…¹¼ÑÉ•”µ±¥¡Ðµµ…ÀµÝ½É­¥¹œ¹©Í½¸¸ˆì(€ô((€™Õ¹Ñ¥½¸ÕÁ‘…Ñ•A…¹•° ¤ì(€€€¥˜€ …Í•±•Ñ¥½¸¤Í•±•Ñ¥½¹1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰	É…¬é…é¹…é•¹¥„ˆì(€€€•±Í”¥˜€¡Í•±•Ñ¥½¸¹ÑåÁ”€ôôô€‰¹½‘”ˆ¤ì(€€€€€½¹ÍÐÁ½¥¹Ð€ôµ…À¹¹½‘•ÍmÍ•±•Ñ¥½¸¹¥‘tì(€€€€€Í•±•Ñ¥½¹1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô9=€‘íÍ•±•Ñ¥½¸¹¥‘ôƒ
Ül‘íÁ½¥¹Ðü¹µ…À ¡Ù…±Õ”¤€ôøÙ…±Õ”¹Ñ½¥á• Ð¤¤¹©½¥¸ ˆ°€ˆ¥õu€ì(€€€ô•±Í”ì(€€€€€½¹ÍÐ•‘”€ô•‘•	å%¡Í•±•Ñ¥½¸¹¥¤ì(€€€€€Í•±•Ñ¥½¹1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‘íÍ•±•Ñ¥½¸¹ÑåÁ”¹Ñ½UÁÁ•É…Í” ¥ô€‘íÍ•±•Ñ¥½¸¹¥‘ô‘íÍ•±•Ñ¥½¸¹¡…¹‘±”€ü€ƒ
Ü€‘íÍ•±•Ñ¥½¸¹¡…¹‘±•õ€€è€ˆ‰ôƒ
Ü€‘í•‘”ü¹­¥¹ñð€ˆ‰õ€ì(€€€ô(€€€±•Ð‘•±•Ñ¥½¹AÉ½Ñ•Ñ•€ô™…±Í”ì(€€€¥˜€¡Í•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰¹½‘”ˆ¤ì(€€€€€½¹ÍÐ¥¹¥‘•¹Ð€ôµ…À¹•‘•Ì¹™¥±Ñ•È ¡•‘”¤€ôø•‘”¹™É½´€ôôôÍ•±•Ñ¥½¸¹¥ñð•‘”¹Ñ¼€ôôôÍ•±•Ñ¥½¸¹¥¤ì(€€€€€‘•±•Ñ¥½¹AÉ½Ñ•Ñ•€ôÁÉ½Ñ•Ñ•‘9½‘•Ì¹¡…Ì¡Í•±•Ñ¥½¸¹¥¤ì(€€€ô•±Í”¥˜€¡Í•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰•‘”ˆñðÍ•±•Ñ¥½¸ü¹ÑåÁ”€ôôô€‰¡…¹‘±”ˆ¤ì(€€€€€‘•±•Ñ¥½¹AÉ½Ñ•Ñ•€ô™…±Í”ì(€€€ô(€€€‘•±•Ñ•	ÕÑÑ½¸¹Ñ•áÑ½¹Ñ•¹Ð€ô€…Í•±•Ñ¥½¸(€€€€€€ü€‰•±•Ñ”èÝå‰¥•Éèˆ(€€€€€€è‘•±•Ñ¥½¹AÉ½Ñ•Ñ•(€€€€€€€€ü€‰•±•Ñ”è¡É½¹¥½¹”ˆ(€€€€€€€€è€‰•±•Ñ”é…é¹…é½¹”ˆì(€€€‘•±•Ñ•	ÕÑÑ½¸¹Ñ¥Ñ±”€ô€…Í•±•Ñ¥½¸(€€€€€€ü€‰9…©Á¥•ÉÜ­±¥­¹¥¨ßeé—±Õˆ­Ééåß¸ˆ(€€€€€€è‘•±•Ñ¥½¹AÉ½Ñ•Ñ•(€€€€€€€€ü€‰¡É½¹¥½¹ä©•ÍÐÝçé¹¥”¹½‘”Í½ÕÉ”¸ˆ(€€€€€€€€è€‰UÍ×…­ÑÕ…±¹¥”é…é¹…é½¹ä•±•µ•¹Ð¸ˆì(€€€½¹ÍÐ…±±¥…¹½ÍÑ¥Ì€ô‘¥…¹½ÍÑ¥Ì ¤ì(€€€½¹ÍÐÉ½½Ñ¥…¹½ÍÑ¥Ì€ô…±±¥…¹½ÍÑ¥Ì¹™¥±Ñ•È ¡¥Ñ•´¤€ôø¥Ñ•´¹¥¹½µ¥¹œ¹­¥¹€ôôô€‰É½½Ðˆñð¥Ñ•´¹½ÕÑ½¥¹œ¹­¥¹€ôôô€‰É½½Ðˆ¤ì(€€€½¹ÍÐ¥ÍÍÕ•Ì€ô…±±¥…¹½ÍÑ¥Ì(€€€€€€¹™¥±Ñ•È ¡¥Ñ•´¤€ôø¥Ñ•´¹¥¹½µ¥¹œ¹­¥¹€„ôô€‰É½½Ðˆ€˜˜¥Ñ•´¹½ÕÑ½¥¹œ¹­¥¹€„ôô€‰É½½Ðˆ¤(€€€€€€¹™¥±Ñ•È ¡¥Ñ•´¤€ôø¥Ñ•´¹…¹±”€øô€ÄÈñð¥Ñ•´¹µ¥¹¥µÕµI…‘¥ÕÌ€ð€ÈÐñð¥Ñ•´¹É…‘¥ÕÍI…Ñ¥¼€ø€Ì¤(€€€€€€¹Í±¥” À°€Ø¤ì(€€€½¹ÍÐÉ½½ÑA•…¬€ôÉ½½Ñ¥…¹½ÍÑ¥Ì¹É•‘Õ” ¡Á•…¬°¥Ñ•´¤€ôø5…Ñ ¹µ…à¡Á•…¬°¥Ñ•´¹…¹±”¤°€À¤ì(€€€‘¥…¹½ÍÑ¥Í1…‰•°¹¥¹¹•É!Q50€ô¥ÍÍÕ•Ì¹±•¹Ñ (€€€€€€ü€ñÍÑÉ½¹œùQÉÕ¹¬€¼É½Ý¸€¼‰É…¹¡•Ìèð½ÍÑÉ½¹œøñ‰Èø‘í¥ÍÍÕ•Ì¹µ…À ¡¥Ñ•´¤€ôøì(€€€€€€€€€½¹ÍÐÝ…É¹¥¹œ€ô¥Ñ•´¹…¹±”€øô€ÈÀñð¥Ñ•´¹µ¥¹¥µÕµI…‘¥ÕÌ€ð€ÈÐì(€€€€€€€€€½¹ÍÐÉ¥¸€ô9Õµ‰•È¹¥Í¥¹¥Ñ”¡¥Ñ•´¹É…‘¥ÕÍ%¸¤€ü¥Ñ•´¹É…‘¥ÕÍ%¸¹Ñ½¥á• À¤€è€‹Š"xˆì(€€€€€€€€€½¹ÍÐÉ½ÕÐ€ô9Õµ‰•È¹¥Í¥¹¥Ñ”¡¥Ñ•´¹É…‘¥ÕÍ=ÕÐ¤€ü¥Ñ•´¹É…‘¥ÕÍ=ÕÐ¹Ñ½¥á• À¤€è€‹Š"xˆì(€€€€€€€€€½¹ÍÐÉ…Ñ¥¼€ô9Õµ‰•È¹¥Í¥¹¥Ñ”¡¥Ñ•´¹É…‘¥ÕÍI…Ñ¥¼¤€ü¥Ñ•´¹É…‘¥ÕÍI…Ñ¥¼¹Ñ½¥á• Ä¤€è€‹Š"xˆì(€€€€€€€€€É•ÑÕÉ¸€ñÍÁ…¸±…ÍÌôˆ‘íÝ…É¹¥¹œ€ü€‰Ý…É¹¥¹œˆ€è€ˆ‰ôˆø‘í¥Ñ•´¹¹½‘•ôè€‘í¥Ñ•´¹…¹±”¹Ñ½¥á• Ä¥÷
Àƒ
ÜH€‘íÉ¥¹ô¼‘íÉ½ÕÑôƒ
Üƒ\‘íÉ…Ñ¥½ôð½ÍÁ…¸ù€ì(€€€€€€€ô¤¹©½¥¸ ˆñ‰Èøˆ¥ôñ‰ÈøñÍÁ…¸ùI½½Ðµ•É”èµ…à€‘íÉ½½ÑA•…¬¹Ñ½¥á• Ä¥÷
Àð½ÍÁ…¸ù€(€€€€€€èMÑåé¹”‡eé¤è‰•è¥ÍÑ½Ñ¹å ½ÍÑÉé—ñ—¸ñ‰ÈøñÍÁ…¸ùI½½Ðµ•É”èµ…à€‘íÉ½½ÑA•…¬¹Ñ½¥á• Ä¥÷
Àð½ÍÁ…¸ù€ì(€ô((€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•É‘½Ý¸ˆ°€¡•Ù•¹Ð¤€ôøì(€€€½¹ÍÐÁ½¥¹Ð€ôÁ½¥¹Ñ•ÉA½¥¹Ð¡•Ù•¹Ð¤ì(€€€¥˜€¡½¹¹•Ñ5½‘”€˜˜€…ÍÁ…•!•±€˜˜•Ù•¹Ð¹‰ÕÑÑ½¸€ôôô€À¤ì(€€€€€½¹ÍÐ¹½‘•!¥Ð€ô¡¥Ñ9½‘”¡Á½¥¹Ð°€ÄÐ¤ì(€€€€€¥˜€ …½¹¹•ÑÉ½´¤ì(€€€€€€€¥˜€ …¹½‘•!¥Ð¤ì(€€€€€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰9…©Á¥•ÉÜ­±¥­¹¥¨¥ÍÑ¹¥•«ä¹½‘”Á½ëÑ­½Ýä¸ˆì(€€€€€€€ô•±Í”ì(€€€€€€€€€½¹¹•ÑÉ½´€ô¹½‘•!¥Ð¹¥ì(€€€€€€€€€Í•±•Ñ¥½¸€ôìÑåÁ”è€‰¹½‘”ˆ°¥è½¹¹•ÑÉ½´ôì(€€€€€€€€€½¹¹•Ñ	ÕÑÑ½¸¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰-±¥­¹¥¨•³Š˜ˆì(€€€€€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ôMÑ…ÉÐè€‘í½¹¹•ÑÉ½µô¸-±¥­¹¥¨¹½‘”‘½•±½Ýä…±‰¼ÁÕÍÑ”µ¥•©Í”¹€ì(€€€€€€€ô(€€€€€ô•±Í”ì(€€€€€€€É•…Ñ•½¹¹•Ñ¥½¸¡½¹¹•ÑÉ½´°¹½‘•!¥Ðü¹¥ñð€ˆˆ°Á½¥¹Ð¤ì(€€€€€ô(€€€€€ÕÁ‘…Ñ•A…¹•° ¤ì(€€€€€ÅÕ•Õ•É…Ü ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡ÍÁ±¥Ñ5½‘”€˜˜€…ÍÁ…•!•±€˜˜•Ù•¹Ð¹‰ÕÑÑ½¸€ôôô€À¤ì(€€€€€½¹ÍÐ•‘•!¥Ð€ô¡¥Ñ‘”¡Á½¥¹Ð°€Äà¤ì(€€€€€¥˜€¡•‘•!¥Ð¤ì(€€€€€€€Í•±•Ñ¥½¸€ôìÑåÁ”è€‰•‘”ˆ°¥è•‘•!¥Ð¹¥ôì(€€€€€€€ÍÁ±¥ÑM•±•Ñ•¡Á½¥¹Ð°•‘•!¥Ð¹¥¤ì(€€€€€ô•±Í”ì(€€€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰9¥”ÑÉ…™¥½¹¼Ü­Ééåß¸AÉéå‰±§ðÝ¥‘½¬¤­±¥­¹¥¨‘½¯	…‘¹¥•¨¸ˆì(€€€€€ô(€€€€€ÕÁ‘…Ñ•A…¹•° ¤ì(€€€€€ÅÕ•Õ•É…Ü ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€½¹ÍÐÝ…¹ÑÍA…¸€ôÁ…¹5½‘”ñðÍÁ…•!•±ñð•Ù•¹Ð¹‰ÕÑÑ½¸€ôôô€Äì(€€€¥˜€¡Ý…¹ÑÍA…¸¤ì(€€€€€‘É…œ€ôì(€€€€€€€µ½‘”è€‰Á…¸ˆ°(€€€€€€€Á½¥¹Ñ•É%è•Ù•¹Ð¹Á½¥¹Ñ•É%°(€€€€€€€±…ÍÑ±¥•¹Ñ`è•Ù•¹Ð¹±¥•¹Ñ`°(€€€€€€€±…ÍÑ±¥•¹Ñdè•Ù•¹Ð¹±¥•¹Ñd°(€€€€€€€µ½Ù•è™…±Í”(€€€€€ôì(€€€€€½Ù•É±…ä¹Í•ÑA½¥¹Ñ•É…ÁÑÕÉ”¡•Ù•¹Ð¹Á½¥¹Ñ•É%¤ì(€€€€€½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹…‘ ‰¥ÌµÁ…¹¹¥¹œˆ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€½¹ÍÐ¡¥Ð€ô¡¥ÑQ•ÍÐ¡Á½¥¹Ð¤ì(€€€Í•±•Ñ¥½¸€ô¡¥Ð€üìÑåÁ”è¡¥Ð¹ÑåÁ”°¥è¡¥Ð¹¥°¡…¹‘±”è¡¥Ð¹¡…¹‘±”ô€è¹Õ±°ì(€€€ÕÁ‘…Ñ•A…¹•° ¤ì(€€€ÅÕ•Õ•É…Ü ¤ì((€€€¥˜€¡¡¥Ðü¹ÑåÁ”€ôôô€‰¹½‘”ˆ€˜˜ÁÉ½Ñ•Ñ•‘9½‘•Ì¹¡…Ì¡¡¥Ð¹¥¤¤ì(€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰9½‘”Í½ÕÉ”©•ÍÐ¡É½¹¥½¹äì©•¼­ÉéåÝ”¤Õ¡ÝåÑäÁ½é½ÍÑ…«•‘åÑ½Ý…±¹”¸ˆì(€€€ô•±Í”¥˜€¡¡¥Ðü¹ÑåÁ”€ôôô€‰¹½‘”ˆñð¡¥Ðü¹ÑåÁ”€ôôô€‰¡…¹‘±”ˆ¤ì(€€€€€‘É…œ€ôì(€€€€€€€µ½‘”è€‰•‘¥Ðˆ°(€€€€€€€Á½¥¹Ñ•É%è•Ù•¹Ð¹Á½¥¹Ñ•É%°(€€€€€€€ÍÑ…ÉÑMÑ…Ñ”èÍ•É¥…±¥é•‘5…À ¤°(€€€€€€€±…ÍÑ`èÁ½¥¹Ð¹à°(€€€€€€€±…ÍÑdèÁ½¥¹Ð¹ä°(€€€€€€€µ½Ù•è™…±Í”(€€€€€ôì(€€€€€½Ù•É±…ä¹Í•ÑA½¥¹Ñ•É…ÁÑÕÉ”¡•Ù•¹Ð¹Á½¥¹Ñ•É%¤ì(€€€€€½Ù•É±…ä¹ÍÑå±”¹ÕÉÍ½È€ô€‰É…‰‰¥¹œˆì(€€€ô(€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô¤ì((€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•Éµ½Ù”ˆ°€¡•Ù•¹Ð¤€ôøì(€€€¥˜€¡½¹¹•Ñ5½‘”¤ì(€€€€€½¹¹•ÑA½¥¹Ñ•È€ôÁ½¥¹Ñ•ÉA½¥¹Ð¡•Ù•¹Ð¤ì(€€€€€ÅÕ•Õ•É…Ü ¤ì(€€€ô(€€€¥˜€ …‘É…œñð‘É…œ¹Á½¥¹Ñ•É%€„ôô•Ù•¹Ð¹Á½¥¹Ñ•É%¤É•ÑÕÉ¸ì(€€€¥˜€¡‘É…œ¹µ½‘”€ôôô€‰Á…¸ˆ¤ì(€€€€€½¹ÍÐ‘à€ô•Ù•¹Ð¹±¥•¹Ñ`€´‘É…œ¹±…ÍÑ±¥•¹Ñ`ì(€€€€€½¹ÍÐ‘ä€ô•Ù•¹Ð¹±¥•¹Ñd€´‘É…œ¹±…ÍÑ±¥•¹Ñdì(€€€€€‘É…œ¹±…ÍÑ±¥•¹Ñ`€ô•Ù•¹Ð¹±¥•¹Ñ`ì(€€€€€‘É…œ¹±…ÍÑ±¥•¹Ñd€ô•Ù•¹Ð¹±¥•¹Ñdì(€€€€€¥˜€ …‘à€˜˜€…‘ä¤É•ÑÕÉ¸ì(€€€€€‘É…œ¹µ½Ù•€ôÑÉÕ”ì(€€€€€Ù¥•Ü¹à€¬ô‘àì(€€€€€Ù¥•Ü¹ä€¬ô‘äì(€€€€€…ÁÁ±åY¥•Ü ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€ …Í•±•Ñ¥½¸¤É•ÑÕÉ¸ì(€€€½¹ÍÐÁ½¥¹Ð€ôÁ½¥¹Ñ•ÉA½¥¹Ð¡•Ù•¹Ð¤ì(€€€½¹ÍÐÁÉ•¥Í¥½¸€ô•Ù•¹Ð¹Í¡¥™Ñ-•ä€ü€¸È€è€Äì(€€€½¹ÍÐ‘à€ô€¡Á½¥¹Ð¹à€´‘É…œ¹±…ÍÑ`¤€¨ÁÉ•¥Í¥½¸ì(€€€½¹ÍÐ‘ä€ô€¡Á½¥¹Ð¹ä€´‘É…œ¹±…ÍÑd¤€¨ÁÉ•¥Í¥½¸ì(€€€‘É…œ¹±…ÍÑ`€ôÁ½¥¹Ð¹àì(€€€‘É…œ¹±…ÍÑd€ôÁ½¥¹Ð¹äì(€€€¥˜€ …‘à€˜˜€…‘ä¤É•ÑÕÉ¸ì(€€€‘É…œ¹µ½Ù•€ôÑÉÕ”ì((€€€¥˜€¡Í•±•Ñ¥½¸¹ÑåÁ”€ôôô€‰¹½‘”ˆ¤ì(€€€€€½¹ÍÐ¹½‘”€ôµ…À¹¹½‘•ÍmÍ•±•Ñ¥½¸¹¥‘tì(€€€€€¥˜€ …¹½‘”¤É•ÑÕÉ¸ì(€€€€€¹½‘•lÁt€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸ Ä°¹½‘•lÁt€¬‘à¤¤ì(€€€€€¹½‘•lÅt€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸ Ä°¹½‘•lÅt€¬‘ä¤¤ì(€€€€€µ…À¹•‘•Ì¹™½É…  ¡•‘”¤€ôøì(€€€€€€€¥˜€¡•‘”¹™É½´€ôôôÍ•±•Ñ¥½¸¹¥¤ì(€€€€€€€€€•‘”¹ŒÅlÁt€¬ô‘àì(€€€€€€€€€•‘”¹ŒÅlÅt€¬ô‘äì(€€€€€€€ô(€€€€€€€¥˜€¡•‘”¹Ñ¼€ôôôÍ•±•Ñ¥½¸¹¥¤ì(€€€€€€€€€•‘”¹ŒÉlÁt€¬ô‘àì(€€€€€€€€€•‘”¹ŒÉlÅt€¬ô‘äì(€€€€€€€ô(€€€€€ô¤ì(€€€ô•±Í”¥˜€¡Í•±•Ñ¥½¸¹ÑåÁ”€ôôô€‰¡…¹‘±”ˆ¤ì(€€€€€½¹ÍÐ•‘”€ô•‘•	å%¡Í•±•Ñ¥½¸¹¥¤ì(€€€€€¥˜€ …•‘”¤É•ÑÕÉ¸ì(€€€€€•‘•mÍ•±•Ñ¥½¸¹¡…¹‘±•ulÁt€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸ Ä°•‘•mÍ•±•Ñ¥½¸¹¡…¹‘±•ulÁt€¬‘à¤¤ì(€€€€€•‘•mÍ•±•Ñ¥½¸¹¡…¹‘±•ulÅt€ô5…Ñ ¹µ…à À°5…Ñ ¹µ¥¸ Ä°•‘•mÍ•±•Ñ¥½¸¹¡…¹‘±•ulÅt€¬‘ä¤¤ì(€€€ô(€€€‘•Ø¹É•‰Õ¥± ¤ì(€€€…ÕÑ½Í…Ù” ¤ì(€€€ÕÁ‘…Ñ•A…¹•° ¤ì(€€€ÅÕ•Õ•É…Ü ¤ì(€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô¤ì((€™Õ¹Ñ¥½¸•¹‘É…œ¡•Ù•¹Ð¤ì(€€€¥˜€ …‘É…œñð‘É…œ¹Á½¥¹Ñ•É%€„ôô•Ù•¹Ð¹Á½¥¹Ñ•É%¤É•ÑÕÉ¸ì(€€€¥˜€¡½Ù•É±…ä¹¡…ÍA½¥¹Ñ•É…ÁÑÕÉ”¡•Ù•¹Ð¹Á½¥¹Ñ•É%¤¤½Ù•É±…ä¹É•±•…Í•A½¥¹Ñ•É…ÁÑÕÉ”¡•Ù•¹Ð¹Á½¥¹Ñ•É%¤ì(€€€½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹É•µ½Ù” ‰¥ÌµÁ…¹¹¥¹œˆ¤ì(€€€½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹Ñ½±” ‰¥ÌµÁ…¸µÉ•…‘äˆ°Á…¹5½‘”ñðÍÁ…•!•±¤ì(€€€¥˜€¡‘É…œ¹µ½‘”€ôôô€‰•‘¥Ðˆ€˜˜‘É…œ¹µ½Ù•€˜˜‘É…œ¹ÍÑ…ÉÑMÑ…Ñ”€„ôôÍ•É¥…±¥é•‘5…À ¤¤ì(€€€€€½µµ¥Ð ‰i…Á¥Í…¹¼­½É•­Ód•½µ•ÑÉ¥¤¸ˆ¤ì(€€€ô(€€€‘É…œ€ô¹Õ±°ì(€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô((€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•ÉÕÀˆ°•¹‘É…œ¤ì(€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Á½¥¹Ñ•É…¹•°ˆ°•¹‘É…œ¤ì(€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰Ý¡••°ˆ°€¡•Ù•¹Ð¤€ôøì(€€€½¹ÍÐ™…Ñ½È€ô5…Ñ ¹•áÀ µ•Ù•¹Ð¹‘•±Ñ…d€¨€¸ÀÀÄÌÔ¤ì(€€€é½½µÐ¡•Ù•¹Ð¹±¥•¹Ñ`°•Ù•¹Ð¹±¥•¹Ñd°Ù¥•Ü¹Í…±”€¨™…Ñ½È¤ì(€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô°ìÁ…ÍÍ¥Ù”è™…±Í”ô¤ì(€½Ù•É±…ä¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰…Õá±¥¬ˆ°€¡•Ù•¹Ð¤€ôøì(€€€¥˜€¡•Ù•¹Ð¹‰ÕÑÑ½¸€ôôô€Ä¤•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô¤ì((€Á…¹•°¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰±¥¬ˆ°€¡•Ù•¹Ð¤€ôøì(€€€½¹ÍÐ‰ÕÑÑ½¸€ô•Ù•¹Ð¹Ñ…É•Ð¹±½Í•ÍÐ ‰m‘…Ñ„µ…Ñ¥½¹tˆ¤ì(€€€¥˜€ …‰ÕÑÑ½¸¤É•ÑÕÉ¸ì(€€€½¹ÍÐ…Ñ¥½¸€ô‰ÕÑÑ½¸¹‘…Ñ…Í•Ð¹…Ñ¥½¸ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰Õ¹‘¼ˆ¤É•ÍÑ½É•!¥ÍÑ½Éä¡¡¥ÍÑ½Éå%¹‘•à€´€Ä¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰É•‘¼ˆ¤É•ÍÑ½É•!¥ÍÑ½Éä¡¡¥ÍÑ½Éå%¹‘•à€¬€Ä¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰É•Í•Ðˆ¤ì(€€€€€É•Á±…•5…À¡Í½ÕÉ•5…À¤ì(€€€€€Í•±•Ñ¥½¸€ô¹Õ±°ì(€€€€€½µµ¥Ð ‰AÉéåÝËÍ½¹¼µ…ÃdƒéËÍ“	½ß¸ˆ¤ì(€€€ô(€€€¥˜€¡…Ñ¥½¸€ôôô€‰ÍÁ±¥Ðˆ¤Í•ÑMÁ±¥Ñ5½‘” …ÍÁ±¥Ñ5½‘”¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰½¹¹•Ðˆ¤Í•Ñ½¹¹•Ñ5½‘” …½¹¹•Ñ5½‘”¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰‘•±•Ñ”ˆ¤ì(€€€€€¥˜€¡Á…¹5½‘”¤Í•ÑA…¹5½‘”¡™…±Í”¤ì(€€€€€¥˜€¡ÍÁ±¥Ñ5½‘”¤Í•ÑMÁ±¥Ñ5½‘”¡™…±Í”¤ì(€€€€€¥˜€¡½¹¹•Ñ5½‘”¤Í•Ñ½¹¹•Ñ5½‘”¡™…±Í”¤ì(€€€€€‘•±•Ñ•M•±•Ñ¥½¸ ¤ì(€€€ô(€€€¥˜€¡…Ñ¥½¸€ôôô€‰ÁÕ±Í”ˆ¤ì(€€€€€¥˜€¡•¹‘Á½¥¹ÑÕ‘¥Ð¹ÉÕ¹¹¥¹œ¤ÍÑ½Á¹‘Á½¥¹ÑÕ‘¥Ð ‰Õ‘åÐé…ÑÉéåµ…¹ä¹„Éé•èÁ½©•‘å¹é•¼Ñ•ÍÑÔ¸ˆ¤ì(€€€€€ÁÉ•Ù¥•ÝM•±•Ñ¥½¸ ¤ì(€€€ô(€€€¥˜€¡…Ñ¥½¸€ôôô€‰…Õ‘¥Ðˆ¤ì(€€€€€¥˜€¡•¹‘Á½¥¹ÑÕ‘¥Ð¹ÉÕ¹¹¥¹œ¤ÍÑ½Á¹‘Á½¥¹ÑÕ‘¥Ð ¤ì(€€€€€•±Í”ÍÑ…ÉÑ¹‘Á½¥¹ÑÕ‘¥Ð ¤ì(€€€ô(€€€¥˜€¡…Ñ¥½¸€ôôô€‰•áÁ½ÉÐˆ¤•áÁ½ÉÑ)Í½¸¡ÑÉÕ”¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰½Áäˆ¤½Áå)Í½¸ ¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰‘½Ý¹±½…ˆ¤‘½Ý¹±½…‘)Í½¸ ¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰é½½´µ½ÕÐˆ¤é½½µÉ½µ•¹Ñ•È Ä€¼€Ä¸ÈÔ¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰é½½´µ¥¸ˆ¤é½½µÉ½µ•¹Ñ•È Ä¸ÈÔ¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰Á…¸ˆ¤Í•ÑA…¹5½‘” …Á…¹5½‘”¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰™¥Ðˆ¤É•Í•ÑY¥•Ü ¤ì(€€€¥˜€¡…Ñ¥½¸€ôôô€‰½±±…ÁÍ”ˆ¤ì(€€€€€½¹ÍÐ½±±…ÁÍ•€ôÁ…¹•°¹±…ÍÍ1¥ÍÐ¹Ñ½±” ‰¥Ìµ½±±…ÁÍ•ˆ¤ì(€€€€€‰ÕÑÑ½¸¹Ñ•áÑ½¹Ñ•¹Ð€ô½±±…ÁÍ•€ü€ˆ¬ˆ€è€‹Š"Hˆì(€€€€€‰ÕÑÑ½¸¹Í•ÑÑÑÉ¥‰ÕÑ” ‰…É¥„µ•áÁ…¹‘•ˆ°MÑÉ¥¹œ …½±±…ÁÍ•¤¤ì(€€€€€‰ÕÑÑ½¸¹Í•ÑÑÑÉ¥‰ÕÑ” ‰…É¥„µ±…‰•°ˆ°½±±…ÁÍ•€ü€‰I½éÝ§Á…¹•°ˆ€è€‰iÝ§Á…¹•°ˆ¤ì(€€€ô(€€€ÕÁ‘…Ñ•A…¹•° ¤ì(€€€ÅÕ•Õ•É…Ü ¤ì(€ô¤ì((€Ý¥¹‘½Ü¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰­•å‘½Ý¸ˆ°€¡•Ù•¹Ð¤€ôøì(€€€½¹ÍÐµ½‘¥™¥•È€ô•Ù•¹Ð¹ÑÉ±-•äñð•Ù•¹Ð¹µ•Ñ…-•äì(€€€¥˜€¡µ½‘¥™¥•È€˜˜•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰èˆ¤ì(€€€€€É•ÍÑ½É•!¥ÍÑ½Éä¡•Ù•¹Ð¹Í¡¥™Ñ-•ä€ü¡¥ÍÑ½Éå%¹‘•à€¬€Ä€è¡¥ÍÑ½Éå%¹‘•à€´€Ä¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡µ½‘¥™¥•È€˜˜•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰äˆ¤ì(€€€€€É•ÍÑ½É•!¥ÍÑ½Éä¡¡¥ÍÑ½Éå%¹‘•à€¬€Ä¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹Ñ…É•Ð€ôôô½ÕÑÁÕÐ¤É•ÑÕÉ¸ì(€€€¥˜€¡•Ù•¹Ð¹½‘”€ôôô€‰MÁ…”ˆ¤ì(€€€€€ÍÁ…•!•±€ôÑÉÕ”ì(€€€€€½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹…‘ ‰¥ÌµÁ…¸µÉ•…‘äˆ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä€ôôô€ˆÀˆ¤ì(€€€€€É•Í•ÑY¥•Ü ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰ ˆ¤ì(€€€€€Í•ÑA…¹5½‘” …Á…¹5½‘”¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰Œˆ¤ì(€€€€€Í•Ñ½¹¹•Ñ5½‘” …½¹¹•Ñ5½‘”¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä€ôôô€ˆ¬ˆñð•Ù•¹Ð¹­•ä€ôôô€ˆôˆ¤ì(€€€€€é½½µÉ½µ•¹Ñ•È Ä¸ÈÔ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä€ôôô€ˆ´ˆ¤ì(€€€€€é½½µÉ½µ•¹Ñ•È Ä€¼€Ä¸ÈÔ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€É•ÑÕÉ¸ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä€ôôô€‰•±•Ñ”ˆñð•Ù•¹Ð¹­•ä€ôôô€‰	…­ÍÁ…”ˆ¤ì(€€€€€¥˜€¡½¹¹•Ñ5½‘”¤ì(€€€€€€€Í•Ñ½¹¹•Ñ5½‘”¡™…±Í”¤ì(€€€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€€€€€É•ÑÕÉ¸ì(€€€€€ô(€€€€€‘•±•Ñ•M•±•Ñ¥½¸ ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰Ìˆ¤ì(€€€€€Í•ÑMÁ±¥Ñ5½‘” …ÍÁ±¥Ñ5½‘”¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä¹Ñ½1½Ý•É…Í” ¤€ôôô€‰Àˆ¤ì(€€€€€ÁÉ•Ù¥•ÝM•±•Ñ¥½¸ ¤ì(€€€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€€€ô(€€€¥˜€¡•Ù•¹Ð¹­•ä€ôôô€‰Í…Á”ˆ¤ì(€€€€€¥˜€¡•¹‘Á½¥¹ÑÕ‘¥Ð¹ÉÕ¹¹¥¹œ¤ÍÑ½Á¹‘Á½¥¹ÑÕ‘¥Ð ‰Õ‘åÐé…ÑÉéåµ…¹ä¸ˆ¤ì(€€€€€Í•ÑMÁ±¥Ñ5½‘”¡™…±Í”¤ì(€€€€€Í•Ñ½¹¹•Ñ5½‘”¡™…±Í”¤ì(€€€€€Í•ÑA…¹5½‘”¡™…±Í”¤ì(€€€€€‘•Ø¹ÍÑ½À ¤ì(€€€€€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ô€‰¹Õ±½Ý…¹¼¹…Éëe‘é¥”½Ñ•ÍÐ¸ˆì(€€€€€ÅÕ•Õ•É…Ü ¤ì(€€€ô(€ô¤ì((€Ý¥¹‘½Ü¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰­•åÕÀˆ°€¡•Ù•¹Ð¤€ôøì(€€€¥˜€¡•Ù•¹Ð¹½‘”€„ôô€‰MÁ…”ˆ¤É•ÑÕÉ¸ì(€€€ÍÁ…•!•±€ô™…±Í”ì(€€€¥˜€¡‘É…œü¹µ½‘”€„ôô€‰Á…¸ˆ€˜˜€…Á…¹5½‘”¤½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹É•µ½Ù” ‰¥ÌµÁ…¸µÉ•…‘äˆ¤ì(€€€•Ù•¹Ð¹ÁÉ•Ù•¹Ñ•™…Õ±Ð ¤ì(€ô¤ì(€Ý¥¹‘½Ü¹…‘‘Ù•¹Ñ1¥ÍÑ•¹•È ‰‰±ÕÈˆ°€ ¤€ôøì(€€€ÍÁ…•!•±€ô™…±Í”ì(€€€¥˜€¡‘É…œü¹µ½‘”€„ôô€‰Á…¸ˆ€˜˜€…Á…¹5½‘”¤½Ù•É±…ä¹±…ÍÍ1¥ÍÐ¹É•µ½Ù” ‰¥ÌµÁ…¸µÉ•…‘äˆ¤ì(€ô¤ì((€±•ÐÉ•ÍÑ½É•€ô™…±Í”ì(€ÑÉäì(€€€½¹ÍÐÝ½É­¥¹œ€ô)M=8¹Á…ÉÍ”¡±½…±MÑ½É…”¹•Ñ%Ñ•´¡ÍÑ½É…•-•ä¤ñð€‰¹Õ±°ˆ¤ì(€€€¥˜€¡Ù…±¥‘5…À¡Ý½É­¥¹œ¤¤ì(€€€€€É•Á±…•5…À¡Ý½É­¥¹œ¤ì(€€€€€É•ÍÑ½É•€ôÑÉÕ”ì(€€€ô(€ô…Ñ ì(€€€±½…±MÑ½É…”¹É•µ½Ù•%Ñ•´¡ÍÑ½É…•-•ä¤ì(€ô((€¡¥ÍÑ½Éä€ômÍ•É¥…±¥é•‘5…À ¥tì(€¡¥ÍÑ½Éå%¹‘•à€ô€Àì(€¹•ÜI•Í¥é•=‰Í•ÉÙ•È¡É•Í¥é”¤¹½‰Í•ÉÙ”¡É¥œ¤ì(€…ÁÁ±åY¥•Ü ¤ì(€É•Í¥é” ¤ì(€ÕÁ‘…Ñ•A…¹•° ¤ì(€ÍÑ…ÑÕÍ1…‰•°¹Ñ•áÑ½¹Ñ•¹Ð€ôÉ•ÍÑ½É•€ü€‰]éåÑ…¹¼±½­…±»­½Á§dÉ½‰½ë¸ˆ€è€‰‘åÑÕ©•Íèµ…ÃdƒéËÍ“	½ßìéµ¥…¹äé…Á¥ÍÕ«Í§d±½­…±¹¥”¸ˆì)ô¤ ¤ì(