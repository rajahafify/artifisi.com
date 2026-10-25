const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [,, dir, out, mode] = process.argv;
const T = process.env.THREE;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const phone = mode === 'phone';
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', e => console.log('ERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('three.module.min.js')) return r.fulfill({ path: T + '/three.module.min.js', contentType: 'text/javascript' });
    if (u.includes('three.core.min.js')) return r.fulfill({ path: T + '/three.core.min.js', contentType: 'text/javascript' });
    if (u.startsWith('http://x/')) { const f = path.join(dir, u.slice(9) || 'index.html'); return r.fulfill({ path: fs.existsSync(f) && fs.statSync(f).isFile() ? f : path.join(dir, 'index.html') }); }
    if (u.includes('fonts.g')) return r.continue();
    return r.abort();
  });
  await p.goto('http://x/index.html');
  await p.waitForTimeout(1500);
  const secs = await p.$$eval('[data-scene]', s => s.map(e => e.dataset.scene));
  const views = { house: 2, districts: 2, squeeze: 2, plate: 2, ageing: 2 };
  for (let k = 0; k < secs.length; k++) {
    const n = views[secs[k]] || 1;
    for (let v = 0; v < n; v++) {
      await p.evaluate(([k, v, phone]) => {
        const s = document.querySelectorAll('[data-scene]')[k];
        const target = phone ? (s.querySelector('.vizpage') || s) : s;
        window.scrollTo(0, target.getBoundingClientRect().top + scrollY - (phone ? 53 : 0));
        const b = s.querySelector(`button[data-view="${v}"]`); if (b) b.click();
      }, [k, v, phone]);
      await p.waitForTimeout(2600);
      await p.screenshot({ path: `${out}-${k}-${secs[k]}-${v}.png` });
    }
  }
  await b.close();
})();
