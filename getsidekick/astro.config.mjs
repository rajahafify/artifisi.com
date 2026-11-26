import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://getsidekick.artifisi.com",
  trailingSlash: "never",
  build: { format: "file" },
});
