const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const outDir = 'ui-audit/batch4';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Starting playwright...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  const baseUrl = 'http://localhost:3000';

  const takeScreenshot = async (path, name) => {
    console.log(`Navigating to ${path}...`);
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.error(e));
    await page.waitForTimeout(1000); // Wait for animations
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
    console.log(`Saved ${name}.png`);
  };

  // Login as admin
  await takeScreenshot('/admin', '01-admin-dashboard');
  
  // Billing
  await takeScreenshot('/billing', '02-billing-list');
  await takeScreenshot('/billing/INV-1001', '03-billing-detail');
  
  // Pharmacy
  await takeScreenshot('/pharmacy', '04-pharmacy-pending');
  // Click inventory tab
  try {
    await page.click('button[value="inventory"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/05-pharmacy-inventory.png`, fullPage: true });
    console.log(`Saved 05-pharmacy-inventory.png`);
  } catch(e) { console.error("Could not click inventory tab") }

  // Reports
  await takeScreenshot('/admin/reports', '06-admin-reports');
  
  // Schedule
  await takeScreenshot('/doctor/schedule', '07-doctor-schedule-weekly');
  try {
    await page.click('button[value="timeoff"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/08-doctor-schedule-timeoff.png`, fullPage: true });
    console.log(`Saved 08-doctor-schedule-timeoff.png`);
  } catch(e) { console.error("Could not click timeoff tab") }

  // Rest
  await takeScreenshot('/admin/notifications', '09-admin-notifications');
  await takeScreenshot('/admin/audit', '10-admin-audit');
  await takeScreenshot('/admin/settings', '11-admin-settings');
  await takeScreenshot('/admin/staff', '12-admin-staff');

  await browser.close();
  console.log("All screenshots saved!");
})();
