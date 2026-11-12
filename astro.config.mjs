import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL ?? "http://localhost:4321";
const base = process.env.PUBLIC_BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  output: "static",
  build: {
    format: "directory",
  },
});
