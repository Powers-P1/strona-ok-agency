import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(resolve(root, "assets/services/about/script.js"), "utf8");

const makeClassList = initial => {
  const values = new Set(initial);
  return {
    contains: value => values.has(value),
    remove: value => values.delete(value),
    toggle: (value, force) => force ? values.add(value) : values.delete(value),
  };
};

const makeElement = ({ id = "", go, theme = "light", top = 0 } = {}) => {
  const listeners = new Map();
  const attributes = new Map();
  const element = {
    id,
    dataset: { theme, ...(go === undefined ? {} : { go: String(go) }) },
    classList: makeClassList([]),
    listeners,
    attributes,
    scrolled: 0,
    getBoundingClientRect() { return { top, bottom: top + 1000 }; },
    addEventListener(type, listener) { listeners.set(type, listener); },
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    scrollIntoView() { this.scrolled += 1; },
  };
  return element;
};

const scenes = [
  makeElement({ id: "about-responsibility", theme: "light", top: 0 }),
  makeElement({ id: "about-oliwia", theme: "light", top: 1000 }),
  makeElement({ id: "about-model", theme: "dark", top: 2000 }),
  makeElement({ id: "about-credibility", theme: "light", top: 3000 }),
];
const ctaButtons = [1, 2, 3].map(go => makeElement({ go }));
const sceneButtons = [...ctaButtons];
const themeColor = { content: "" };
let currentHash = "";

const document = {
  body: { dataset: {} },
  activeElement: null,
  querySelector: selector => selector === 'meta[name="theme-color"]' ? themeColor : null,
  querySelectorAll: selector => {
    if (selector === ".scene") return scenes;
    if (selector === "[data-go]") return sceneButtons;
    return [];
  },
  addEventListener() {},
};
const window = {
  innerHeight: 1000,
  location: { hash: "" },
  matchMedia: () => ({ matches: false }),
  addEventListener() {},
};
const history = {
  replaceState(_state, _title, hash) {
    currentHash = hash;
    window.location.hash = hash;
  },
};

vm.runInNewContext(source, {
  document,
  window,
  history,
  requestAnimationFrame: callback => callback(),
});

for (const button of sceneButtons) {
  const target = Number(button.dataset.go);
  const before = scenes[target].scrolled;
  button.listeners.get("click")?.();
  if (scenes[target].scrolled !== before + 1) {
    throw new Error(`data-go="${target}" nie przewinął właściwej sceny`);
  }
  if (currentHash !== `#${scenes[target].id}`) {
    throw new Error(`data-go="${target}" ustawił błędny hash ${currentHash}`);
  }
}

console.log(`OK: ${sceneButtons.length} przyciski data-go prowadzą do właściwych scen i hashy.`);
