import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
const surf = p.locator('[data-glass]').first();
await surf.scrollIntoViewIfNeeded();
await p.waitForTimeout(1500);
const r = await surf.evaluate((el) => {
  const inner = Array.from(el.children).find(c => !c.hasAttribute('aria-hidden'));
  const rect = inner.getBoundingClientRect();
  const x = rect.left + 20, y = rect.top + rect.height/2;
  const stack = document.elementsFromPoint(x, y).slice(0, 6).map(e => ({
    tag: e.tagName,
    ariaHidden: e.getAttribute('aria-hidden'),
    z: getComputedStyle(e).zIndex,
    lensLayer: e.hasAttribute('data-lens-layer')
  }));
  return { stack };
});
console.log(JSON.stringify(r.stack, null, 2));
await b.close();
