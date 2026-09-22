const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  const targetPage = process.argv[2] || 'reception';
  const mode = process.argv[3] || 'before'; // before, after-desktop, after-mobile
  let username = process.argv[4] || 'reception@clinic.com';
  let password = process.argv[5] || 'password123';

  // The login page handles role in dropdown, but for simplicity we just type email/password and submit.
  console.log(`Logging in to get screenshot for ${targetPage} in ${mode} mode...`);

  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[type="email"]', username);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect or navigation
  await page.waitForTimeout(3000);
  
  // Navigate explicitly if it didn't redirect to target page
  if (!page.url().includes(targetPage)) {
    await page.goto(`http://localhost:3000/${targetPage}`);
    await page.waitForTimeout(2000);
  }

  if (mode === 'after-mobile') {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
  }

  const filename = mode === 'before' 
    ? `ui-audit/before/${targetPage}.png` 
    : `ui-audit/after/${targetPage}-${mode.replace('after-', '')}.png`;

  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Saved screenshot to ${filename}`);

  await browser.close();
})();
