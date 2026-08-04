import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
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
const missingOnly = process.argv.includes("--missing");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1512, height: 982 } });
const generated = new Set();

try {
  for (const route of ROUTES) {
    const page = await context.newPage();
    await page.goto(`${BASE_URL}${route}?audit=build-placement-mask`, {
      waitUntil: "domcontentloaded",
    });
    const artwork = await page.evaluate(sceneSelector => (
      [...document.querySelectorAll(sceneSelector)].flatMap(scene => {
        const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
        if (!art?.dataset.placementMask) {
          return [];
        }
        return [{
          source: art.getAttribute("src"),
          mask: art.dataset.placementMask,
          hasAuthoredEnergy: art.dataset.placementEnergy !== "none",
          width: Number(art.getAttribute("width")),
          height: Number(art.getAttribute("height")),
        }];
      })
    ), SCENE_SELECTOR);

    for (const item of artwork) {
      if (generated.has(item.mask)) continue;
      const outputPath = resolve(process.cwd(), item.mask);
      if (missingOnly && existsSync(outputPath)) continue;
      const dataUrl = await page.evaluate(async ({ sourcePath, hasAuthoredEnergy, width, height }) => {
        const image = new Image();
        image.decoding = "async";
        image.src = new URL(sourcePath, location.href).href;
        await image.decode();

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context2d = canvas.getContext("2d", { willReadFrequently: true });
        context2d.drawImage(image, 0, 0, width, height);
        const source = context2d.getImageData(0, 0, width, height);
        const pixels = source.data;
        const count = width * height;
        const luminance = new Float32Array(count);
        const integral = new Float64Array((width + 1) * (height + 1));
        const baseMask = new Uint8Array(count);
        const radius = 10;

        const hsv = (r, g, b) => {
          const red = r / 255;
          const green = g / 255;
          const blue = b / 255;
          const maximum = Math.max(red, green, blue);
          const minimum = Math.min(red, green, blue);
          const delta = maximum - minimum;
          let hue = 0;
          if (delta) {
            if (maximum === red) hue = 60 * (((green - blue) / delta) % 6);
            else if (maximum === green) hue = 60 * ((blue - red) / delta + 2);
            else hue = 60 * ((red - green) / delta + 4);
          }
          if (hue < 0) hue += 360;
          return {
            hue,
            saturation: maximum ? delta / maximum : 0,
            value: maximum,
          };
        };

        for (let y = 0; y < height; y += 1) {
          let rowSum = 0;
          for (let x = 0; x < width; x += 1) {
            const index = y * width + x;
            const offset = index * 4;
            const value = 0.2126 * pixels[offset]
              + 0.7152 * pixels[offset + 1]
              + 0.0722 * pixels[offset + 2];
            luminance[index] = value;
            rowSum += value;
            integral[(y + 1) * (width + 1) + x + 1]
              = integral[y * (width + 1) + x + 1] + rowSum;
          }
        }

        const localAverage = (x, y) => {
          const left = Math.max(0, x - radius);
          const top = Math.max(0, y - radius);
          const right = Math.min(width - 1, x + radius);
          const bottom = Math.min(height - 1, y + radius);
          const stride = width + 1;
          const sum = integral[(bottom + 1) * stride + right + 1]
            - integral[top * stride + right + 1]
            - integral[(bottom + 1) * stride + left]
            + integral[top * stride + left];
          return sum / ((right - left + 1) * (bottom - top + 1));
        };

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const index = y * width + x;
            const offset = index * 4;
            const r = pixels[offset];
            const g = pixels[offset + 1];
            const b = pixels[offset + 2];
            const color = hsv(r, g, b);
            const light = luminance[index];
            const contrast = light - localAverage(x, y);
            const absoluteContrast = Math.abs(contrast);
            const warmness = r - b;
            const energy = hasAuthoredEnergy
              && color.value >= 0.92
              && color.saturation <= 0.34
              && r >= 235
              && light >= 220
              && warmness >= 6
              && contrast >= 24;
            const highlight = !energy
              && color.hue >= 5
              && color.hue <= 62
              && color.saturation >= 0.16
              && r >= 155
              && light >= 118
              && warmness >= 12
              && contrast >= 10;
            const structure = !energy
              && !highlight
              && color.hue >= 2
              && color.hue <= 68
              && color.saturation >= 0.24
              && color.value >= 0.2
              && warmness >= 15
              && absoluteContrast >= 12;
            baseMask[index] = energy ? 255 : highlight ? 128 : structure ? 64 : 0;
          }
        }

        // Validate the authored energy core before any dilation. Expanding
        // first allowed adjacent white metal glints to merge with the real
        // stroke and promoted most of a branch to the highest tier.
        const visitedEnergy = new Uint8Array(count);
        const energyStack = new Int32Array(count);
        for (let start = 0; start < count; start += 1) {
          if (baseMask[start] !== 255 || visitedEnergy[start]) continue;
          let stackSize = 1;
          let componentSize = 0;
          let minimumX = width;
          let maximumX = 0;
          let minimumY = height;
          let maximumY = 0;
          const component = [];
          energyStack[0] = start;
          visitedEnergy[start] = 1;
          while (stackSize) {
            const current = energyStack[--stackSize];
            component.push(current);
            componentSize += 1;
            const x = current % width;
            const y = Math.floor(current / width);
            minimumX = Math.min(minimumX, x);
            maximumX = Math.max(maximumX, x);
            minimumY = Math.min(minimumY, y);
            maximumY = Math.max(maximumY, y);
            for (let dy = -1; dy <= 1; dy += 1) {
              for (let dx = -1; dx <= 1; dx += 1) {
                if (!dx && !dy) continue;
                const nextX = x + dx;
                const nextY = y + dy;
                if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
                const next = nextY * width + nextX;
                if (baseMask[next] !== 255 || visitedEnergy[next]) continue;
                visitedEnergy[next] = 1;
                energyStack[stackSize++] = next;
              }
            }
          }
          const componentWidth = maximumX - minimumX + 1;
          const componentHeight = maximumY - minimumY + 1;
          const extent = Math.max(componentWidth, componentHeight);
          const averageThickness = componentSize / Math.max(1, extent);
          const authoredStroke = componentSize >= 22
            && extent >= 28
            && averageThickness <= 14;
          if (!authoredStroke) component.forEach(index => { baseMask[index] = 128; });
        }

        const spreadTier = (minimumValue, radius) => {
          const horizontal = new Uint8Array(count);
          const output = new Uint8Array(count);
          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              let present = 0;
              for (let dx = -radius; dx <= radius; dx += 1) {
                const sampleX = Math.min(width - 1, Math.max(0, x + dx));
                if (baseMask[y * width + sampleX] >= minimumValue) {
                  present = 1;
                  break;
                }
              }
              horizontal[y * width + x] = present;
            }
          }
          for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
              for (let dy = -radius; dy <= radius; dy += 1) {
                const sampleY = Math.min(height - 1, Math.max(0, y + dy));
                if (horizontal[sampleY * width + x]) {
                  output[y * width + x] = 1;
                  break;
                }
              }
            }
          }
          return output;
        };

        // Energy gets only a one-pixel antialiasing allowance. The lower
        // fallback tiers can be slightly broader because they describe the
        // physical object, not a future animated stroke.
        const energySpread = spreadTier(255, 1);
        const highlightSpread = spreadTier(128, 2);
        const structureSpread = spreadTier(1, 2);
        const expanded = new Uint8Array(count);
        for (let index = 0; index < count; index += 1) {
          expanded[index] = energySpread[index]
            ? 255
            : highlightSpread[index]
              ? 128
              : structureSpread[index]
                ? 64
                : 0;
        }

        // Reject isolated texture/reflection noise. Real wires, roots and
        // flowers form connected regions; single bright background grains do not.
        const minimumComponentSize = 140;
        const visited = new Uint8Array(count);
        const stack = new Int32Array(count);
        for (let start = 0; start < count; start += 1) {
          if (!expanded[start] || visited[start]) continue;
          let stackSize = 1;
          let componentSize = 0;
          const smallComponent = [];
          stack[0] = start;
          visited[start] = 1;
          while (stackSize) {
            const current = stack[--stackSize];
            componentSize += 1;
            if (componentSize <= minimumComponentSize) smallComponent.push(current);
            const x = current % width;
            const y = Math.floor(current / width);
            for (let dy = -1; dy <= 1; dy += 1) {
              for (let dx = -1; dx <= 1; dx += 1) {
                if (!dx && !dy) continue;
                const nextX = x + dx;
                const nextY = y + dy;
                if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
                const next = nextY * width + nextX;
                if (!expanded[next] || visited[next]) continue;
                visited[next] = 1;
                stack[stackSize++] = next;
              }
            }
          }
          if (componentSize < minimumComponentSize) {
            smallComponent.forEach(index => { expanded[index] = 0; });
          }
        }

        const output = context2d.createImageData(width, height);
        for (let index = 0; index < count; index += 1) {
          const value = expanded[index];
          const offset = index * 4;
          output.data[offset] = value;
          output.data[offset + 1] = value;
          output.data[offset + 2] = value;
          output.data[offset + 3] = 255;
        }
        context2d.putImageData(output, 0, 0);
        return canvas.toDataURL("image/png");
      }, {
        sourcePath: item.source,
        hasAuthoredEnergy: item.hasAuthoredEnergy,
        width: item.width,
        height: item.height,
      });

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, Buffer.from(dataUrl.split(",")[1], "base64"));
      generated.add(item.mask);
      console.log(`Generated ${item.mask} (${item.width}x${item.height}).`);
    }
    await page.close();
  }
} finally {
  await context.close();
  await browser.close();
}

console.log(`Generated ${generated.size} annotation placement masks.`);
