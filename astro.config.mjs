import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.artifisi.com",
  trailingSlash: "never",
  build: { format: "file" },
});
