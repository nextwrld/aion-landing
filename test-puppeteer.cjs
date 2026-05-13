const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto('http://localhost:3456/');
  await new Promise(r => setTimeout(r, 2000));

  const btn = await page.$('button[aria-label="Abrir menú"]');
  console.log('Button found:', !!btn);

  if (btn) {
    const box = await btn.boundingBox();
    console.log('Bounding box:', box);
    const styles = await page.evaluate(el => {
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
    }, btn);
    console.log('Styles:', JSON.stringify(styles, null, 2));
  }

  await page.screenshot({ path: '/Users/gapfware/nextwrld/aion-landing/app/screenshot.png', fullPage: false });
  await browser.close();
})();
