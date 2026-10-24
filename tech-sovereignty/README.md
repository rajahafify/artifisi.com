# tech-sovereignty.artifisi.com

One static page, no build step. Every number, table row, data ledger entry, method note and source is plain HTML text, so search engines read all of it. `scene.js` draws a three.js field of cubes behind the text that re-forms into each section's chart as you scroll, with HTML labels pinned to the 3D shapes. Each section has two or three views (buttons, or click the chart). The data for every view lives in `views` in `scene.js`. Without JavaScript the page falls back to CSS charts and shows every view caption.

three.js 0.180.0 loads from jsDelivr through an import map.

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a second project named `tech-sovereignty`.
2. Production branch `main`. Build command `exit 0`. Build output directory `tech-sovereignty`.
3. Settings, Builds, Build watch paths: include `tech-sovereignty/*` so this project only rebuilds when this folder changes. In the `artifisi-com` project, add `tech-sovereignty/*` to its exclude list.
4. Custom domains, add `tech-sovereignty.artifisi.com`.
5. In DNSimple add a CNAME: name `tech-sovereignty`, content `tech-sovereignty.pages.dev`.

## Editing

Change the text in `index.html`. If a number changes, change the matching shape in `scene.js` too (look for the comment above each shape). `og.png` is the share image; retake it if the headline changes.
