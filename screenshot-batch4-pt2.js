const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const outDir = 'ui-audit/batch4';
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';

  const takeScreenshot = async (path, name) => {
    console.log(`Navigating to ${path}...`);
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.error(e));
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log(`Saved ${name}.png`);
  };

  await takeScreenshot('/pharmacy', '05-pharmacy-inventory'); // Just reload or same page
  await takeScreenshot('/admin/reports', '06-admin-reports');
  await takeScreenshot('/doctor/schedule', '07-doctor-schedule-weekly');
  await takeScreenshot('/admin/notifications', '09-admin-notifications');
  await takeScreenshot('/admin/audit', '10-admin-audit');
  await takeScreenshot('/admin/settings', '11-admin-settings');
  await takeScreenshot('/admin/staff', '12-admin-staff');

  await browser.close();
  console.log("All screenshots saved!");
})();
