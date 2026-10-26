// Renders the storyboard for a report: one PNG per shot, taken from the real page, plus a
// contact sheet for review.
//
// The frames come from the page's own shot mode, so the storyboard is the thing the reader
// will actually see. A hand drawn mock is a second renderer for the same story, and the two
// drift.
//
//   THREE=<unpacked three> node storyboard.js <page folder> <shots.json> <vo dir> <out dir>
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { route, LAUNCH, OVERLAY_CSS, frameContext, openShot } = require('./browser');

const [,, dirArg, shotsFile, voDirArg, outDirArg] = process.argv;
if (!dirArg || !shotsFile || !voDirArg || !outDirArg) {
  console.error('usage: node storyboard.js <page folder> <shots.json> <vo dir> <out dir>');
  process.exit(1);
}
const dir = path.resolve(dirArg);
const outDir = path.resolve(outDirArg);
const shots = JSON.parse(fs.readFileSync(shotsFile, 'utf8'));
const [W, H] = shots.size || [1080, 1920];

// The voice lines live in script.txt, not here. One copy of the words.
const voText = {};
if (fs.existsSync(path.join(voDirArg, 'script.txt'))) {
  for (const raw of fs.readFileSync(path.join(voDirArg, 'script.txt'), 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const i = line.indexOf('|');
    if (i > 0) voText[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

function dataUri(file) {
  return 'data:image/png;base64,' + fs.readFileSync(file).toString('base64');
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(LAUNCH);
  // The frame is the viewport, one to one, so the storyboard and the recorded video are
  // the same pixels.
  const ctx = await b.newContext(frameContext(W, H));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.route('**/*', route(dir));

  const total = shots.shots.length;
  for (const [i, s] of shots.shots.entries()) {
    await openShot(p, `http://x/index.html?shot=${s.scene}&t=${s.t}`);
    await p.addStyleTag({ content: OVERLAY_CSS });
    await p.evaluate(({ cap, kick, num }) => {
      if (cap) {
        const c = document.createElement('div');
        c.className = 'vb-cap'; c.textContent = cap;
        const r = document.createElement('div');
        r.className = 'vb-rule';
        document.body.append(r, c);
      }
      if (kick) {
        const k = document.createElement('div');
        k.className = 'vb-kick'; k.textContent = kick;
        document.body.append(k);
      }
      if (num) {
        const n = document.createElement('div');
        n.className = 'vb-num'; n.textContent = num;
        document.body.append(n);
      }
    }, { cap: s.caption, kick: shots.kicker || '', num: `${i + 1} / ${total}` });
    await p.waitForTimeout(300);
    const file = path.join(outDir, `${s.id}.png`);
    await p.screenshot({ path: file });
    console.log('frame', s.id, s.scene);
  }
  await ctx.close();
  await b.close();

  // Contact sheet: every shot, its claim, its caption and its voice line.
  const rows = shots.shots.map((s, i) => `
    <div class="row">
      <img src="${dataUri(path.join(outDir, s.id + '.png'))}">
      <div class="meta">
        <div class="id">${i + 1} / ${total} &middot; ${s.id} &middot; ${s.scene} &middot; ${s.plan}s</div>
        <div class="claim">${s.claim}</div>
        <div class="cap">${s.caption}</div>
        <div class="vo">${s.vo} &middot; ${voText[s.vo] || ''}</div>
      </div>
    </div>`).join('');
  const sheet = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#f6f2ea;color:#332d26;font:400 16px/1.5 "IBM Plex Sans",sans-serif;padding:48px}
    h1{font:800 44px/1.1 Fraunces,Georgia,serif;margin:0 0 8px}
    .sub{font:500 14px/1.2 "IBM Plex Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:#6e665a;margin:0 0 48px}
    .row{display:grid;grid-template-columns:270px 1fr;gap:40px;padding:32px 0;border-top:1px solid #dcd3c2}
    img{width:270px;height:480px;object-fit:cover;border:1px solid #dcd3c2;display:block}
    .id{font:500 13px/1.2 "IBM Plex Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#6e665a;margin-bottom:14px}
    .claim{font:800 34px/1.2 Fraunces,Georgia,serif;margin-bottom:16px}
    .cap{font:500 22px/1.4 "IBM Plex Sans",sans-serif;color:#332d26;margin-bottom:12px}
    .vo{font:400 16px/1.5 "IBM Plex Sans",sans-serif;color:#6e665a}
  </style>
  <h1>${shots.title || 'Storyboard'}</h1>
  <p class="sub">${shots.shots.length} shots &middot; ${W}x${H} &middot; portrait</p>
  ${rows}`;

  const b2 = await chromium.launch(LAUNCH);
  const ctx2 = await b2.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  const p2 = await ctx2.newPage();
  await p2.setContent(sheet, { waitUntil: 'load' });
  await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(outDir, 'storyboard.png'), fullPage: true });
  await ctx2.close();
  await b2.close();
  console.log('contact sheet', path.join(outDir, 'storyboard.png'));
})();
