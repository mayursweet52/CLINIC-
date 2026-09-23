const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const CREDS = {
  doctor: { email: 'ananya.sharma@aarogyaclinic.in', password: 'Aarogya@2024' },
  reception: { email: 'kavita.nair@aarogyaclinic.in', password: 'Front@2024' },
  admin: { email: 'vikram.singh@aarogyaclinic.in', password: 'Admin@2024' },
  pharmacy: { email: 'suresh.patel@aarogyaclinic.in', password: 'Pharma@2024' },
};

async function login(page, creds) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  console.log(`   Logged in as ${creds.email} → ${page.url()}`);
}

async function testButton(page, selector, label) {
  try {
    const count = await page.locator(selector).count();
    if (count === 0) {
      console.log(`   ⚠️ "${label}" → NOT FOUND`);
      return;
    }
    
    const urlBefore = page.url();
    const dialogsBefore = await page.locator('[role="dialog"]').count();
    
    await page.locator(selector).first().click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    
    const urlAfter = page.url();
    const dialogsAfter = await page.locator('[role="dialog"]').count();
    const toastsAfter = await page.locator('.toast, [data-sonner-toast]').count();
    
    if (urlAfter !== urlBefore) {
      console.log(`   ✅ "${label}" → navigated to ${urlAfter.replace(BASE, '')}`);
    } else if (dialogsAfter > dialogsBefore) {
      console.log(`   ✅ "${label}" → dialog opened`);
    } else if (toastsAfter > 0) {
      console.log(`   ✅ "${label}" → toast appeared`);
    } else {
      console.log(`   ⚠️ "${label}" → NOTHING HAPPENED (dead button?)`);
    }
  } catch (e) {
    console.log(`   ❌ "${label}" → ${e.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true, // running headless for AI agent execution
    executablePath: 'C:/Users/mayur/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',
  });

  // DOCTOR
  console.log('\n=== DOCTOR DASHBOARD ===');
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let page = await ctx.newPage();
  await login(page, CREDS.doctor);
  await page.goto(`${BASE}/doctor`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await testButton(page, 'button:has-text("Start Consultation"), a:has-text("Start")', 'Start Consultation');
  await testButton(page, 'button:has-text("Continue")', 'Continue');
  await testButton(page, 'button:has-text("View Details")', 'View Details');
  await ctx.close();

  // RECEPTION
  console.log('\n=== RECEPTION ===');
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await login(page, CREDS.reception);
  await page.goto(`${BASE}/reception`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await testButton(page, 'button:has-text("New Appointment"), a:has-text("New Appointment")', 'New Appointment');
  await testButton(page, 'button:has-text("Check In")', 'Check In');
  await testButton(page, 'button[aria-haspopup="menu"]', 'Row actions menu');
  await ctx.close();

  // ADMIN
  console.log('\n=== ADMIN ===');
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await login(page, CREDS.admin);
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await page.goto(`${BASE}/admin/staff`, { waitUntil: 'networkidle' });
  await testButton(page, 'button:has-text("Add Staff")', 'Add Staff');
  
  await page.goto(`${BASE}/admin/reports`, { waitUntil: 'networkidle' });
  await testButton(page, 'button:has-text("Export")', 'Export CSV');
  await testButton(page, 'button:has-text("7d")', 'Range 7d');
  await testButton(page, 'button:has-text("90d")', 'Range 90d');
  
  await page.goto(`${BASE}/admin/settings`, { waitUntil: 'networkidle' });
  await testButton(page, 'button:has-text("Save")', 'Save Settings');
  await ctx.close();

  // PHARMACY
  console.log('\n=== PHARMACY ===');
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await login(page, CREDS.pharmacy);
  await page.goto(`${BASE}/pharmacy`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await testButton(page, 'button:has-text("Dispense")', 'Dispense');
  await testButton(page, '[role="tab"]:has-text("Inventory")', 'Inventory tab');
  await ctx.close();

  // DOCTOR SCHEDULE
  console.log('\n=== DOCTOR SCHEDULE ===');
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await login(page, CREDS.doctor);
  await page.goto(`${BASE}/doctor/schedule`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await testButton(page, 'button:has-text("Add Slot")', 'Add Slot');
  await testButton(page, 'button:has-text("Time Off"), [role="tab"]:has-text("Time Off")', 'Time Off tab');
  await testButton(page, 'button:has-text("Mark Leave")', 'Mark Leave');
  await ctx.close();

  // BOOKING
  console.log('\n=== PUBLIC BOOKING ===');
  ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await ctx.newPage();
  await page.goto(`${BASE}/book`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await testButton(page, 'button:has-text("Book")', 'Book CTA');
  await ctx.close();

  await browser.close();
  console.log('\n=== BUTTON TEST COMPLETE ===');
}

main().catch(console.error);
