import { chromium } from 'playwright-core';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3456/');
  await page.waitForTimeout(2000);

  const btn = await page.$('button[aria-label="Abrir menú"]');
  console.log('Button found:', !!btn);

  if (btn) {
    const box = await btn.boundingBox();
    console.log('Bounding box:', box);
    const styles = await btn.evaluate(el => {
      const s = getComputedStyle(el);
      return {
        display: s.display,
        visibility: s.visibility,
        opacity: s.opacity,
        position: s.position,
        top: s.top,
        right: s.right,
        zIndex: s.zIndex,
        backgroundColor: s.backgroundColor,
        width: s.width,
        height: s.height,
      };
    });
    console.log('Styles:', JSON.stringify(styles, null, 2));
  }

  await page.screenshot({ path: '/Users/gapfware/nextwrld/aion-landing/app/screenshot.png', fullPage: false });
  await browser.close();
})();
