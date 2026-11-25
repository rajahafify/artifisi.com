import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://sidekick-pitch-deck.artifisi.com",
  trailingSlash: "never",
  build: { format: "file" },
});
