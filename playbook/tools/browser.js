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
//
// A report picks its theme by name in shots.json, so the same tools render a second
// report without hardcoding its colours here.
const THEMES = {
  wages: {
    paper: '#f6f2ea', ink: '#332d26', muted: '#6e665a', rule: '#dcd3c2', ctx: '#b6ab96',
    accent: '#1e5b49', accent2: '#a6442a',
    display: '"Fraunces", Georgia, serif', displayWeight: 800,
    displayLetter: '-.022em',
  },
  cpi: {
    paper: '#0e1114', ink: '#e9edf2', muted: '#9aa5b2', rule: '#2b323b', ctx: '#78828e',
    accent: '#2e86de', accent2: '#e8452c',
    display: '"Space Grotesk", "Helvetica Neue", Arial, sans-serif', displayWeight: 700,
    displayLetter: '-.03em',
  },
};

function overlayCSS(theme) {
  const T = THEMES[theme] || THEMES.wages;
  return `
  .vb-kick { position: fixed; left: 8.33vw; top: 5vh; z-index: 6;
    font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .22em;
    text-transform: uppercase; color: ${T.muted}; white-space: nowrap; }
  .vb-num { position: fixed; right: 8.33vw; top: 5vh; z-index: 6;
    font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .1em; color: ${T.ctx}; }
  .vb-rule { position: fixed; left: 8.33vw; right: 8.33vw; top: 84.01vh; z-index: 6;
    height: 1px; background: ${T.rule}; }
  .vb-cap { position: fixed; left: 8.33vw; right: 8.33vw; top: 87.6vh; z-index: 6;
    font: 600 2.78vw/1.35 "IBM Plex Sans", sans-serif; color: ${T.ink}; text-align: left; }
  .vb-card { position: fixed; inset: 0; z-index: 5; background: ${T.paper};
    display: flex; flex-direction: column; justify-content: center; padding: 8.33vw;
    opacity: 0; animation: vbfade .7s cubic-bezier(.22,.61,.36,1) .2s forwards; }
  @keyframes vbfade { to { opacity: 1; } }
  @keyframes vbup { from { opacity: 0; transform: translateY(2.4vh); } to { opacity: 1; transform: none; } }
  .vb-card .k { font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .22em;
    text-transform: uppercase; color: ${T.muted}; margin: 0 0 3.2vh;
    opacity: 0; animation: vbup .8s cubic-bezier(.22,.61,.36,1) .3s forwards; }
  .vb-card .claim { font: ${T.displayWeight} 8.6vw/1.05 ${T.display}; letter-spacing: ${T.displayLetter};
    color: ${T.ink}; margin: 0 0 4.4vh; }
  .vb-card .claim span { display: block; opacity: 0;
    animation: vbup .85s cubic-bezier(.22,.61,.36,1) forwards; }
  .vb-card .claim span:nth-child(1) { animation-delay: .5s; }
  .vb-card .claim span:nth-child(2) { animation-delay: .85s; color: ${T.accent2}; }
  .vb-card .claim span:nth-child(3) { animation-delay: 1.2s; }
  .vb-card .figs { display: flex; gap: 6.4vw; border-top: 1px solid ${T.rule}; padding-top: 3vh; }
  .vb-card .fig { flex: 1 1 0; opacity: 0;
    animation: vbup .85s cubic-bezier(.22,.61,.36,1) forwards; }
  .vb-card .fig:nth-child(1) { animation-delay: 1.5s; }
  .vb-card .fig:nth-child(2) { animation-delay: 1.85s; }
  .vb-card .fig .n { display: block; font: ${T.displayWeight} 7.6vw/1 ${T.display};
    letter-spacing: ${T.displayLetter}; color: ${T.ink}; }
  .vb-card .fig .l { display: block; font: 500 1.67vw/1.45 "IBM Plex Mono", monospace;
    color: ${T.muted}; margin-top: 1.6vh; }
  .vb-card .fig.cool .n { color: ${T.accent}; }
  .vb-card .fig.warm .n { color: ${T.accent2}; }
  .vb-card .line { font: 400 2.41vw/1.5 "IBM Plex Sans", sans-serif; color: ${T.muted};
    margin: 3.6vh 0 0; max-width: 24ch; opacity: 0;
    animation: vbup .9s cubic-bezier(.22,.61,.36,1) 2.35s forwards; }
  .vb-card .note { font: 500 1.67vw/1.5 "IBM Plex Mono", monospace; color: ${T.ctx};
    margin: 2.4vh 0 0; opacity: 0;
    animation: vbup .9s cubic-bezier(.22,.61,.36,1) 2.7s forwards; }
  .vb-end { position: fixed; inset: 0; z-index: 10; background: ${T.paper};
    display: flex; flex-direction: column; justify-content: center; padding: 8.33vw; }
  .vb-end .k { font: 500 1.76vw/1.2 "IBM Plex Mono", monospace; letter-spacing: .22em;
    text-transform: uppercase; color: ${T.muted}; margin: 0 0 2.2vh; }
  .vb-end h2 { font: ${T.displayWeight} 6.3vw/1.06 ${T.display}; letter-spacing: ${T.displayLetter};
    color: ${T.ink}; margin: 0 0 3.1vh; max-width: 14ch; }
  .vb-end .u { font: 500 2.41vw/1.3 "IBM Plex Mono", monospace; color: ${T.accent}; margin: 0 0 3.7vh; }
  .vb-end .s { font: 400 1.67vw/1.5 "IBM Plex Sans", sans-serif; color: ${T.muted}; margin: 0; }
  .vb-end.onwall { background: transparent; }
  .vb-wall { position: fixed; inset: 0; z-index: 8; overflow: hidden; background: ${T.paper};
    filter: blur(11px) saturate(1.15) brightness(1.3);
    animation: vbwall 16s ease-in-out infinite alternate; }
  @keyframes vbwall {
    from { transform: scale(1.12) translate(-1.4%, 1.2%); }
    to { transform: scale(1.24) translate(1.4%, -1.2%); }
  }
  .vb-wall .g { position: absolute; inset: -6%; display: grid; gap: 8px;
    grid-template-columns: repeat(var(--wall-cols, 2), 1fr);
    grid-template-rows: repeat(var(--wall-rows, 3), 1fr); }
  .vb-wall img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .vb-scrim { position: fixed; inset: 0; z-index: 9;
    background: radial-gradient(118% 80% at 50% 44%, ${T.paper}44 0%, ${T.paper}e0 82%); }
`;
}

// A card is a shot that is not a scene: a full-frame typographic plate, built here and
// not on the page, because the page is a report and a film needs frames the report does
// not have. An opening premise and a closing implication.
function cardHTML(c) {
  let html = `<p class="k">${c.kicker || ''}</p>`;
  if (c.claim) {
    html += '<div class="claim">' + c.claim.map((l) => `<span>${l}</span>`).join('') + '</div>';
  }
  if (c.figs && c.figs.length) {
    html += '<div class="figs">' + c.figs.map((f) =>
      `<div class="fig ${f.tone || ''}"><span class="n">${f.n}</span><span class="l">${f.l}</span></div>`
    ).join('') + '</div>';
  }
  if (c.line) html += `<p class="line">${c.line}</p>`;
  if (c.note) html += `<p class="note">${c.note}</p>`;
  return html;
}

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
  // The page builds all six scenes and then marks the one in the shot as the only one
  // on. A frame taken in between carries the other scenes' geometry and their labels,
  // so wait for the page to have settled on exactly one section before anything is
  // captured.
  if (/[?&]shot=/.test(url)) {
    try {
      await p.waitForFunction(() => {
        if (!document.body.classList.contains("shot-mode")) return false;
        return document.querySelectorAll("main > section.on").length === 1;
      }, null, { timeout: 20000 });
    } catch (e) {
      console.log("shot mode did not settle, continuing");
    }
  }
  await p.waitForTimeout(settle);
  try {
    await p.evaluate(() => Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 8000)),
    ]));
  } catch (e) {
    console.log('fonts did not settle, continuing without them');
  }
  // A page with several canvases can lose a WebGL context when the browser drops
  // the oldest one. A frame captured before the context comes back is blank, so
  // wait for it and force a redraw.
  try {
    await p.waitForFunction(() => {
      const s = window.__stages && window.__stages[0];
      return !!(s && !s.renderer.getContext().isContextLost());
    }, null, { timeout: 20000 });
  } catch (e) {
    console.log('webgl context still lost, continuing');
  }
  await p.evaluate(() => {
    if (window.__stages) window.__stages.forEach((s) => { s.resize(); s.draw(); });
  });
  await p.waitForTimeout(500);
}

module.exports = { route, LAUNCH, typeFor, THEMES, overlayCSS, cardHTML, frameContext, openShot };
