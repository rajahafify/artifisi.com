const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [,, dir, outDir, vo] = process.argv;
const T = process.env.THREE;
const lines = fs.readFileSync(vo + '/script.txt', 'utf8').trim().split('\n').map(l => l.split('|')[1]);
const dur = JSON.parse(fs.readFileSync(vo + '/dur.json', 'utf8'));
// One shot per voice line: [section, view, page]. Line 1 switches view halfway.
const SHOTS = [[0,0,'viz'],[0,0,'text'],[2,0,'viz'],[2,1,'viz'],[3,0,'viz'],[4,0,'viz'],[5,0,'viz'],[null]];
const GAP = 0.35;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, recordVideo: { dir: outDir, size: { width: 1080, height: 1920 } } });
  const p = await ctx.newPage();
  const t0 = Date.now();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('three.module.min.js')) return r.fulfill({ path: T + '/three.module.min.js', contentType: 'text/javascript' });
    if (u.includes('three.core.min.js')) return r.fulfill({ path: T + '/three.core.min.js', contentType: 'text/javascript' });
    if (u.startsWith('http://x/')) { const f = path.join(dir, u.slice(9) || 'index.html'); return r.fulfill({ path: fs.existsSync(f) && fs.statSync(f).isFile() ? f : path.join(dir, 'index.html') }); }
    if (u.includes('fonts.g')) return r.continue();
    return r.abort();
  });
  await p.addInitScript(() => { try { localStorage.setItem('soh-taught', '1'); } catch {} });
  await p.goto('http://x/index.html');
  await p.addStyleTag({ content: `
    .chip, .finger { display: none !important; }
    #cap { position: fixed; left: 24px; right: 24px; bottom: 70px; z-index: 5; text-align: center; font: 600 22px/1.3 "IBM Plex Sans", sans-serif; color: #fff; text-shadow: 0 2px 8px #000, 0 0 3px #000; }
    #end { position: fixed; inset: 0; z-index: 6; background: #0f1522; display: none; flex-direction: column; justify-content: center; padding: 40px; }
    #end p { font: 500 13px "IBM Plex Mono", monospace; letter-spacing: .2em; text-transform: uppercase; color: #9ba3b4; margin: 0 0 18px; }
    #end h2 { font: 800 40px/1.1 Fraunces, Georgia, serif; color: #eef0ec; margin: 0 0 26px; }
    #end b { font: 600 20px "IBM Plex Sans", sans-serif; color: #36b3a0; }
    #end small { display: block; margin-top: 40px; font: 400 14px "IBM Plex Sans", sans-serif; color: #9ba3b4; }` });
  await p.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<div id="cap"></div><div id="end"><p>The State of Households 2026</p><h2>Every chart and every source, on one page.</h2><b>artifisi.com/samples/households</b><small>Data: Khazanah Research Institute, CC BY 3.0. Unofficial sample, not made by or for KRI.</small></div>');
  });
  await p.waitForTimeout(2500);
  const log = [];
  for (let i = 0; i < SHOTS.length; i++) {
    const [k, v, page] = SHOTS[i];
    log.push((Date.now() - t0) / 1000);
    await p.evaluate(([k, v, page, text]) => {
      document.getElementById('cap').textContent = k === null ? '' : text;
      if (k === null) { document.getElementById('end').style.display = 'flex'; return; }
      const s = document.querySelectorAll('[data-scene]')[k];
      const target = page === 'viz' ? s.querySelector('.vizpage') : s.querySelector('.wrap');
      const bar = document.querySelector('.bar').offsetHeight;
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - bar, behavior: 'instant' });
      const b = s.querySelector(`button[data-view="${v}"]`); if (b) b.click();
      document.getElementById('cap').style.display = page === 'text' ? 'none' : '';
    }, [k, v, page, lines[i]]);
    if (i === 0) {
      await p.waitForTimeout(dur[0] * 520);
      await p.evaluate(() => document.querySelector('[data-scene] button[data-view="1"]').click());
      await p.waitForTimeout(dur[0] * 480 + GAP * 1000);
    } else {
      await p.waitForTimeout((dur[i] + (i === SHOTS.length - 1 ? 1.5 : GAP)) * 1000);
    }
  }
  log.push((Date.now() - t0) / 1000);
  await p.close(); await ctx.close(); await b.close();
  fs.writeFileSync(path.join(outDir, 'log.json'), JSON.stringify(log));
  console.log(log);
})();
