const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  const failed = [];
  page.on('response', res => { if(res.status() >= 400) failed.push(res.status() + ' ' + res.url()); });

  await page.goto('https://zwnfkko.github.io/vibe-test/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot-deploy.png', fullPage: false });

  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  const hasNav = await page.$('.navbar') !== null;
  const hasHero = await page.$('.hero, .hero-section, [class*="hero"]') !== null;

  console.log('Title:', title);
  console.log('Navbar:', hasNav);
  console.log('Hero:', hasHero);
  console.log('Body text preview:', bodyText.replace(/\n+/g, ' ').slice(0, 200));
  if(failed.length) console.log('Failed:', failed.join('\n'));
  else console.log('All resources loaded OK!');
  await browser.close();
})();
