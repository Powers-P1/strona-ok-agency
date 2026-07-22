import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://powers-p1.github.io",
  base: "/strona-ok-agency",
  output: "static",
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});
