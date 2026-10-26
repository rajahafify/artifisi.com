// Shared browser setup for the capture tools.
//
// The report folder is served from a fake origin so the page's own relative paths work
// without a server. three.js is served from a local unpacked build, because the CDN is not
// always reachable. Point THREE at it: npm pack three@0.180.0, unpack, then
// THREE=<unpacked>/package.
const path = require('path'), fs = require('fs');

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const LAUNCH = {
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
};

function typeFor(f) {
  return TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
}

// Serve dir from http://x/, and three from THREE. Everything else is blocked, so a run
// cannot quietly depend on the network.
function route(dir) {
  const root = path.resolve(dir);
  return async (r) => {
    const u = r.request().url();
    if (u.includes('/npm/three@')) {
      const rel = decodeURIComponent(u.split('/npm/')[1]).replace(/^three@[^/]+\//, '');
      const f = path.join(process.env.THREE || '', rel);
      if (process.env.THREE && fs.existsSync(f)) return r.fulfill({ path: f, contentType: 'text/javascript' });
      return r.abort();
    }
    if (u.startsWith('http://x/')) {
      const rel = decodeURIComponent(u.slice(9).split('?')[0].split('#')[0]) || 'index.html';
      const f = path.resolve(path.join(root, rel));
      const inside = f === root || f.startsWith(root + path.sep);
      const ok = inside && fs.existsSync(f) && fs.statSync(f).isFile();
      return r.fulfill({ path: ok ? f : path.join(root, 'index.html'), contentType: ok ? typeFor(f) : 'text/html' });
    }
    if (u.includes('fonts.g')) return r.continue();
    return r.abort();
  };
}

// The caption and kicker bands the page reserves for video. The page's own palette,
// so a frame looks like the report and not like a different product.
//
// These are frame units, not CSS pixels, because the capture viewport is the frame:
// a vw is a hundredth of the frame width and a vh a hundredth of the frame height.
// The numbers are the mock's, at 1080x1920. The kicker sits at 96px down and the rule
// at 1613px, which is exactly where the page's own 8vh and 16vh bands end.
const OVERLAY_CSS = `
  .vb-kick { position: fixed; left: 8.33vw; top: 5vh; z-index: 6;
    font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .22em;
    text-transform: uppercase; color: #6e665a; white-space: nowrap; }
  .vb-num { position: fixed; right: 8.33vw; top: 5vh; z-index: 6;
    font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .1em; color: #b6ab96; }
  .vb-rule { position: fixed; left: 8.33vw; right: 8.33vw; top: 84.01vh; z-index: 6;
    height: 1px; background: #dcd3c2; }
  .vb-cap { position: fixed; left: 8.33vw; right: 8.33vw; top: 87.6vh; z-index: 6;
    font: 600 2.78vw/1.35 "IBM Plex Sans", sans-serif; color: #332d26; text-align: left; }
  .vb-end { position: fixed; inset: 0; z-index: 9; background: #f6f2ea;
    display: flex; flex-direction: column; justify-content: center; padding: 8.33vw; }
  .vb-end .k { font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .22em;
    text-transform: uppercase; color: #6e665a; margin: 0 0 2.2vh; }
  .vb-end h2 { font: 800 6.3vw/1.06 Fraunces, Georgia, serif; letter-spacing: -.022em;
    color: #332d26; margin: 0 0 3.1vh; max-width: 14ch; }
  .vb-end .u { font: 500 2.41vw/1.3 "IBM Plex Mono", monospace; color: #1e5b49; margin: 0 0 3.7vh; }
  .vb-end .s { font: 400 1.67vw/1.5 "IBM Plex Sans", sans-serif; color: #6e665a; margin: 0; }
`;

// The capture context. The viewport is the frame itself, one CSS pixel to one frame
// pixel.
//
// Playwright records video from a screencast at the viewport size in CSS pixels, and it
// never scales that up. Ask for a 540 wide viewport and a 1080 wide video and the page
// lands in the top left corner of the frame with the rest left empty. So the viewport is
// the frame size and the device scale is one.
function frameContext(W, H) {
  return { viewport: { width: W, height: H }, deviceScaleFactor: 1 };
}

// Open a shot and wait until the scene is actually there and the fonts have landed.
//
// The page pulls its webfonts from Google, and a slow stylesheet is enough to time out a
// navigation. Waiting for "load" is therefore not an option. Commit as soon as the
// navigation starts, then wait for the scene, then wait for the fonts, each with its own
// budget, so a slow font delays the frame instead of failing the run.
async function openShot(p, url, settle = 1200) {
  await p.goto(url, { waitUntil: 'commit', timeout: 30000 });
  await p.waitForFunction(() => window.__stages && window.__stages.length > 0, null, { timeout: 60000 });
  await p.waitForTimeout(settle);
  try {
    await p.evaluate(() => Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 8000)),
    ]));
  } catch (e) {
    console.log('fonts did not settle, continuing without them');
  }
  await p.waitForTimeout(400);
}

module.exports = { route, LAUNCH, typeFor, OVERLAY_CSS, frameContext, openShot };
