import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://okagency.pl",
  output: "static",
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});
