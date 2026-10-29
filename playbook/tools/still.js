// The whole report as one tall PNG: reduced motion puts every chart at its finished frame,
// then each 3D chart moves beside its own text.
const { chromium } = require('playwright');
// Usage: node still.js <report url> <out.png> [scale, default 2]
const [,, url, out, scale] = process.argv;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: parseFloat(scale || '2'), reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 600) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(80); }
  await p.evaluate(() => scrollTo(0, 0));
  await p.addStyleTag({ content: `
    .pinned { display: block; padding: 0 var(--m); }
    .pinned .field, .seg, .range, .block details, .bar .button { display: none !important; }
    .pinned-head { padding: 120px 0 64px; margin: 0; }
    .reading { padding: 0 0 120px; }
    .block { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 64px; align-content: center; min-height: 0; margin: 0 0 96px; max-width: none; }
    .block > .fig { grid-column: 1; grid-row: 1 / 4; position: relative; inset: auto; opacity: 1; visibility: visible; aspect-ratio: 1 / 1; margin: 0; transition: none; }
    .block > :not(.fig) { grid-column: 2; max-width: 44ch; }
    .block > h3 { align-self: end; }
    .foot { position: static; }
    .chip { display: none !important; }
  `});
  await p.evaluate(() => {
    document.querySelectorAll('.figs .fig').forEach(f => {
      const blk = document.querySelector('.block[data-for="' + f.dataset.scene + '"]');
      f.classList.add('on'); blk.prepend(f);
    });
    if (window.__stages) window.__stages.forEach(s => s.resize());
    if (window.__seek) window.__seek(1);
  });
  await p.waitForTimeout(1500);
  await p.evaluate(() => { if (window.__seek) window.__seek(1); });
  await p.waitForTimeout(500);
  console.log('height', await p.evaluate(() => document.documentElement.scrollHeight));
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
