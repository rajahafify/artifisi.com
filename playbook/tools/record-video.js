// Captures one clip per shot, then mux.py assembles them into the finished video.
//
// The shot list is the input. Nothing about the households sample is hardcoded here.
//
//   THREE=<unpacked three> node record-video.js <page folder> <shots.json> <vo dir> <out dir>
//
// Each shot gets its own browser context, so each clip is exactly one shot and ffmpeg can
// cut them to length from the end. A single long recording cannot be trimmed accurately,
// because the browser clock and the audio clock drift apart.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { route, LAUNCH, overlayCSS, frameContext, openShot } = require('./browser');

const [,, dirArg, shotsFile, voDirArg, outDirArg] = process.argv;
if (!dirArg || !shotsFile || !voDirArg || !outDirArg) {
  console.error('usage: node record-video.js <page folder> <shots.json> <vo dir> <out dir>');
  process.exit(1);
}
const dir = path.resolve(dirArg);
const voDir = path.resolve(voDirArg);
const outDir = path.resolve(outDirArg);
const clipDir = path.join(outDir, 'clips');
const shots = JSON.parse(fs.readFileSync(shotsFile, 'utf8'));
const [W, H] = shots.size || [1080, 1920];
// The report picks its palette and fonts by name, so these tools are not tied to one report.
const OVERLAY_CSS = overlayCSS(shots.theme || 'wages');
const GAP = shots.gap === undefined ? 0.4 : shots.gap;

// The recorded voice-over sets the shot lengths when it exists. Before it does, the shot
// list carries the plan.
let voDur = null;
const durFile = path.join(voDir, 'dur.json');
if (fs.existsSync(durFile)) voDur = JSON.parse(fs.readFileSync(durFile, 'utf8'));

const items = shots.shots.map((s, i) => ({
  ...s,
  voice: voDur ? voDur[i] : null,
  length: (voDur ? voDur[i] : s.plan) + GAP,
}));
// The end card is not a scene. It gets its own flag, because "is this the end" cannot be
// read off the shot list: the end card object has no scene of its own.
items.push({
  ...shots.endCard,
  endCard: true,
  voice: voDur ? voDur[voDur.length - 1] : null,
  length: (voDur ? voDur[voDur.length - 1] : shots.endCard.plan) + (shots.endCard.endHold || 1.5),
});

function overlay(p, s, i, total) {
  return p.evaluate(({ cap, kick, num }) => {
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
  }, { cap: s.caption, kick: shots.kicker || '', num: s.endCard ? '' : `${i + 1} / ${total}` });
}

(async () => {
  fs.mkdirSync(clipDir, { recursive: true });
  const b = await chromium.launch(LAUNCH);
  const total = shots.shots.length;

  for (const [i, s] of items.entries()) {
    const isEnd = !!s.endCard;
    const ctx = await b.newContext({
      ...frameContext(W, H),
      recordVideo: { dir: clipDir, size: { width: W, height: H } },
    });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.route('**/*', route(dir));

    if (isEnd) {
      await openShot(p, 'http://x/index.html', 800);
      await p.addStyleTag({ content: OVERLAY_CSS });
      await p.evaluate(({ kicker, title, url, source }) => {
        const el = document.createElement('div');
        el.className = 'vb-end';
        el.innerHTML = `<p class="k">${kicker}</p><h2>${title}</h2><p class="u">${url}</p><p class="s">${source}</p>`;
        document.body.append(el);
      }, s);
    } else {
      // t=0 puts the scene in its starting state before the animation runs, so trimming
      // the clip never shows a flash of the finished frame.
      await openShot(p, `http://x/index.html?shot=${s.scene}&t=0&dur=${Math.round(s.length * 1000)}`, 600);
      await p.addStyleTag({ content: OVERLAY_CSS });
      await overlay(p, s, i, total);
      await p.evaluate((name) => {
        const st = window.__stages.find((x) => x.name === name);
        if (st) { st.seek(0); st.play(); }
      }, s.scene);
    }

    await p.waitForTimeout(Math.round(s.length * 1000));
    const video = p.video();
    await ctx.close();
    const src = await video.path();
    fs.renameSync(src, path.join(clipDir, `${s.id}.webm`));
    console.log('clip', s.id, s.length.toFixed(2) + 's');
  }
  await b.close();

  fs.writeFileSync(path.join(outDir, 'clips.json'), JSON.stringify(items.map((s) => ({ id: s.id, length: s.length, voice: s.voice })), null, 1));
  console.log('clips in', clipDir);
})();
