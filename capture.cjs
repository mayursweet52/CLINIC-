const { chromium } = require('playwright');
const fs = require('fs');

async function loginAndCapture(page, email, password, url, filename) {
  console.log(`Testing ${email} on ${url}...`);
  await page.goto('http://localhost:3000/login');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for the redirect and network to settle
  await page.waitForURL('http://localhost:3000' + url, { timeout: 15000 });
  await page.waitForTimeout(2000); // give time for data to load
  
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`Saved screenshot: ${filename}`);
  
  // Clear cookies to log out
  await page.context().clearCookies();
}

async function loginPatient(page) {
  console.log('Testing Patient on /portal/login...');
  await page.goto('http://localhost:3000/portal/login');
  
  await page.fill('input[type="tel"]', '9876543210');
  await page.fill('input[type="password"]', 'Patient@123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('http://localhost:3000/portal', { timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'patient_portal.png', fullPage: true });
  console.log('Saved screenshot: patient_portal.png');
  
  await page.context().clearCookies();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    await loginPatient(page);
    await loginAndCapture(page, 'ananya.sharma@aarogyaclinic.in', 'Aarogya@2024', '/doctor', 'doctor_dashboard.png');
    await loginAndCapture(page, 'kavita.nair@aarogyaclinic.in', 'Front@2024', '/reception', 'reception_queue.png');
    await loginAndCapture(page, 'vikram.singh@aarogyaclinic.in', 'Admin@2024', '/admin', 'admin_stats.png');
    await loginAndCapture(page, 'suresh.patel@aarogyaclinic.in', 'Pharma@2024', '/pharmacy', 'pharmacy_inventory.png');
  } catch (error) {
    console.error("Error during playwright test:", error);
  } finally {
    await browser.close();
  }
}

main();
