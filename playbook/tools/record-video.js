// Captures one clip per shot, then mux.py assembles them into the finished video.
//
// The shot list is the input. Nothing about the households sample is hardcoded here.
//
//   THREE=<unpacked three> node record-video.js <page folder> <shots.json> <vo dir> <out dir>
//
// Each shot gets its own browser context, and each shot is captured a frame at a time
// rather than recorded.
//
// A screencast cannot be trimmed accurately. The browser's clock and the film's clock
// drift apart, the tail of the recording is where the flush lands, and a clip cut from
// the end therefore begins after the shot has already started: measured on the CPI film,
// the first second of every chart's animation was missing and the last second was a
// frozen frame. Here every frame is asked for at the time it belongs, so the first
// frame of a clip is the first frame of the shot and the last frame is the last frame.
//
// The chart plays over the length of its voice line, not over the length of the shot,
// and the words decide when the parts of it appear. The page has no words and falls
// back to its own fractions, so the page and the film run the same code.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
const { route, LAUNCH, overlayCSS, cardHTML, frameContext, openShot } = require('./browser');

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
const FPS = shots.fps || 30;

// The recorded voice-over sets the shot lengths when it exists. Before it does, the shot
// list carries the plan.
let voDur = null;
const durFile = path.join(voDir, 'dur.json');
if (fs.existsSync(durFile)) voDur = JSON.parse(fs.readFileSync(durFile, 'utf8'));

// The words, if the voice has been timed. They are what tells a chart when to show the
// number the voice is saying.
let voWords = null;
const wordsFile = path.join(voDir, 'words.json');
if (fs.existsSync(wordsFile)) {
  try { voWords = JSON.parse(fs.readFileSync(wordsFile, 'utf8')).lines || null; } catch (e) { voWords = null; }
}

const items = shots.shots.map((s, i) => ({
  ...s,
  voice: voDur ? voDur[i] : null,
  length: (voDur ? voDur[i] : s.plan) + GAP,
  line: voWords && voWords[s.vo] ? voWords[s.vo] : null,
}));
// The end card is not a scene. It gets its own flag, because "is this the end" cannot be
// read off the shot list: the end card object has no scene of its own.
items.push({
  ...shots.endCard,
  endCard: true,
  voice: voDur ? voDur[voDur.length - 1] : null,
  length: (voDur ? voDur[voDur.length - 1] : shots.endCard.plan) + (shots.endCard.endHold || 1.5),
});

// The wall behind the end card: every chart the report drew, laid out as one surface
// and blurred, so the last frame is the whole report at once. The frames are captured
// on the way through the scenes, before the caption band goes on, so the wall carries
// the charts and not the film's furniture.
const wall = [];

function overlay(p, s, i, total) {
  return p.evaluate(({ cap, kick, num }) => {
    if (cap !== null) {
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
    // A shot with timed captions starts with an empty band and the phrases fill it as
    // the voice reaches them. The static line is not the first thing in the band, or
    // the band would show a sentence the voice is not saying for a frame.
  }, { cap: s.captions && s.captions.length ? '' : (s.caption || null), kick: shots.kicker || '', num: s.endCard ? '' : `${i + 1} / ${total}` });
}

// A card is a shot that is not a scene. It is a full-frame typographic plate, built here
// and not on the page, because the page is a report and a film needs frames the report
// does not have: an opening premise and a closing implication. The card carries its own
// kicker and its own text, so it gets the frame number and nothing else.
//
// The card's parts arrive when the voice says them. The card names a cue for each part,
// the page resolves the cue against the voice's own words, and the part is written with
// that moment as its delay.
async function card(p, s, i, total) {
  const times = await p.evaluate(({ cues, trailing }) => {
    const out = {};
    const T = window.__timeline;
    let last = 0;
    // The cues are read in the order the voice says them, so the parts land in that
    // order and never on top of each other.
    for (const part of Object.keys(cues || {})) {
      const t = T ? T.seconds(cues[part], null) : null;
      if (t == null) continue;
      out[part] = Math.max(t, last + 0.1);
      last = out[part];
    }
    // The parts the voice does not mention follow the last one it did.
    for (const part of trailing) {
      if (out[part] == null) { out[part] = last + 0.3; last = out[part]; }
    }
    return out;
  }, { cues: (s.card && s.card.cues) || {}, trailing: ['note'] });
  return p.evaluate(({ html, num, layout }) => {
    const el = document.createElement('div');
    el.className = 'vb-card' + (layout ? ' ' + layout : '');
    el.innerHTML = html;
    document.body.append(el);
    if (num) {
      const n = document.createElement('div');
      n.className = 'vb-num'; n.textContent = num;
      document.body.append(n);
    }
  }, { html: cardHTML(s.card, times), num: `${i + 1} / ${total}`, layout: s.card.layout || '' });
}

// One frame of the shot, asked for at the time it belongs.
//
// A scene is a function of t, so it is drawn at t and photographed. The card and the
// wall are CSS animations, so their animations are paused and moved to the frame's own
// time instead.
// A caption is a phrase, not a title. The band changes as the voice moves, so a muted
// viewer reads the argument and not a still of it. Each phrase names a cue, the page
// resolves the cue against the voice's own words, and the phrase is shown from that
// moment on.
async function captionTimes(p, s) {
  if (!s.captions || !s.captions.length) return null;
  const caps = await p.evaluate((list) => {
    const T = window.__timeline;
    let last = 0;
    return list.map((c) => {
      const t = T ? T.seconds(c.cue, null) : null;
      if (t == null) return null;
      const at = Math.max(t, last);
      last = at;
      return { t: at, text: c.text };
    }).filter(Boolean);
  }, s.captions);
  return caps && caps.length ? caps : null;
}

// The phrase the voice is on at this point in the shot.
function captionAt(caps, w) {
  if (!caps || !caps.length) return null;
  let cur = null;
  for (const c of caps) {
    if (w >= c.t) cur = c.text;
    else break;
  }
  return cur;
}

async function shoot(p, s, t, w) {
  await p.evaluate(({ name, t, w, cap }) => {
    if (name) {
      const st = window.__stages.find((x) => x.name === name);
      if (st) { st.seek(t); st.draw(); }
      // A scene that is not a stage (a whole-section scene) seeks through __seekExtra.
      else if (window.__seekExtra && window.__seekExtra[name]) window.__seekExtra[name](t);
    }
    if (cap != null) {
      const el = document.querySelector('.vb-cap');
      if (el) el.textContent = cap;
    }
    document.querySelectorAll('.vb-card, .vb-wall').forEach((el) => {
      el.getAnimations({ subtree: true }).forEach((a) => {
        a.pause();
        a.currentTime = w * 1000;
      });
    });
  }, { name: s.scene || null, t, w, cap: captionAt(s.caps, w) });
  // Wait for the browser to paint what was just drawn. A screenshot taken before the
  // paint catches the previous frame, and a frame from the previous frame is a frame
  // from the wrong time.
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  return p.screenshot({ type: 'jpeg', quality: 88 });
}

function openClip(out) {
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-s', `${W}x${H}`, '-an', out,
  ], { stdio: ['pipe', 'ignore', 'inherit'] });
  return ff;
}

(async () => {
  fs.mkdirSync(clipDir, { recursive: true });
  const b = await chromium.launch(LAUNCH);
  const total = shots.shots.length;

  for (const [i, s] of items.entries()) {
    const isEnd = !!s.endCard;
    const isCard = !!s.card;
    const ctx = await b.newContext(frameContext(W, H, shots.scale));
    const p = await ctx.newPage();
    p.on('pageerror', (e) => console.log('ERR', e.message));
    await p.route('**/*', route(dir));

    // The words go in the address, because the page has to know them before it builds
    // the chart: the chart's timings are decided while it is built.
    const query = s.line
      ? '?words=' + encodeURIComponent(JSON.stringify({ dur: s.voice, words: s.line.words }))
      : '';

    if (isEnd) {
      await openShot(p, 'http://x/index.html' + query, 800);
      await p.addStyleTag({ content: OVERLAY_CSS });
      if (wall.length) {
        // Two columns for anything from three frames up. One frame is one frame, and
        // two is a pair, but four or six want a grid and not a stack.
        const cols = wall.length <= 2 ? wall.length : 2;
        const rows = Math.ceil(wall.length / cols);
        await p.evaluate(({ imgs, cols, rows }) => {
          const w = document.createElement('div');
          w.className = 'vb-wall';
          const g = document.createElement('div');
          g.className = 'g';
          g.style.setProperty('--wall-cols', cols);
          g.style.setProperty('--wall-rows', rows);
          imgs.forEach((src) => {
            const im = document.createElement('img');
            im.src = src;
            g.appendChild(im);
          });
          w.appendChild(g);
          const scrim = document.createElement('div');
          scrim.className = 'vb-scrim';
          document.body.append(w, scrim);
        }, { imgs: wall, cols, rows });
        await p.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 })
          .catch(() => {});
      }
      await p.evaluate(({ kicker, title, url, source }) => {
        const el = document.createElement('div');
        el.className = 'vb-end' + (document.querySelector('.vb-wall') ? ' onwall' : '');
        el.innerHTML = `<p class="k">${kicker}</p><h2>${title}</h2><p class="u">${url}</p><p class="s">${source}</p>`;
        document.body.append(el);
      }, s);
    } else if (isCard) {
      await openShot(p, 'http://x/index.html' + query, 800);
      await p.addStyleTag({ content: OVERLAY_CSS });
      await card(p, s, i, total);
    } else {
      // The chart is built and framed before anything is captured, and the wall wants a
      // clean frame of the finished chart, taken before the caption band goes on.
      await openShot(p, `http://x/index.html${query}${query ? "&" : "?"}shot=${s.scene}&t=0`, 600);
      // The captions are timed against the voice, so they are resolved before the
      // frames are taken.
      s.caps = await captionTimes(p, s);
      await p.evaluate((name) => {
        const st = window.__stages.find((x) => x.name === name);
        if (st) { st.seek(1); st.draw(); }
        else if (window.__seekExtra && window.__seekExtra[name]) window.__seekExtra[name](1);
      }, s.scene);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const buf = await p.screenshot({ type: 'jpeg', quality: 78 });
      wall.push('data:image/jpeg;base64,' + buf.toString('base64'));
      await p.addStyleTag({ content: OVERLAY_CSS });
      await overlay(p, s, i, total);
    }

    const out = path.join(clipDir, `${s.id}.mp4`);
    const ff = openClip(out);
    const frames = Math.max(1, Math.round(s.length * FPS));
    for (let f = 0; f < frames; f++) {
      const w = f / FPS;
      // The chart plays over the voice line, and holds for the gap after it.
      const t = s.voice ? Math.min(1, w / s.voice) : Math.min(1, w / s.length);
      const shot = await shoot(p, s, t, w);
      ff.stdin.write(shot);
    }
    ff.stdin.end();
    await new Promise((res, rej) => {
      ff.on('close', (code) => (code === 0 ? res() : rej(new Error('ffmpeg failed: ' + out))));
      ff.on('error', rej);
    });
    await p.close();
    await ctx.close();
    console.log('clip', s.id, s.length.toFixed(2) + 's', frames + ' frames');
  }
  await b.close();

  // The file is tracked, so it ends with a newline and keeps the line endings the repo
  // stores. Otherwise every re-record shows up as a change to a file whose numbers did
  // not move.
  const clips = JSON.stringify(items.map((s) => ({ id: s.id, length: s.length, voice: s.voice })), null, 1).replace(/\r?\n/g, "\r\n") + "\r\n";
  fs.writeFileSync(path.join(outDir, 'clips.json'), clips, 'utf8');
  console.log('clips in', clipDir);
})();
