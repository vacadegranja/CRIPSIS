import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://vacadegranja.github.io",
  base: "/CRIPSIS",
  output: "static",
  build: {
    format: "directory",
  },
});
