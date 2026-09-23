const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const CREDS = {
  doctor: { email: 'dr.smith@clinic.com', password: 'password' },
  reception: { email: 'reception@clinic.com', password: 'password' },
  admin: { email: 'admin@clinic.com', password: 'password' },
  pharmacy: { email: 'pharmacy@clinic.com', password: 'password' },
};

async function login(page, { email, password }) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

async function checkPage(page, url, label) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    // Check for 404
    const has404 = await page.locator('text=This page could not be found').count();
    if (has404 > 0) {
      console.log(`❌ ${label} (${url}) → 404`);
      return;
    }
    
    // Check for visible buttons and links
    const buttons = await page.locator('button').count();
    const links = await page.locator('a').count();
    
    // Check for "0 items" or empty state
    const empty = await page.locator('text=/no .*(appointments|data|records|bills|patients|found)/i').count();
    
    console.log(`✅ ${label} (${url})`);
    console.log(`   Buttons: ${buttons} | Links: ${links} | Empty states: ${empty}`);
    
    if (errors.length > 0) {
      console.log(`   ⚠️ Console errors: ${errors.slice(0, 3).join(' | ')}`);
    }
  } catch (e) {
    console.log(`❌ ${label} (${url}) → ${e.message}`);
  }
}

async function main() {
  const browser = await chromium.launch({ 
    headless: true, // changed to true for agent execution
    executablePath: 'C:/Users/mayur/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe' 
  });

  // PUBLIC
  console.log('\n=== PUBLIC PAGES ===');
  const pubCtx = await browser.newContext();
  const pubPage = await pubCtx.newPage();
  await checkPage(pubPage, `${BASE}/`, 'Landing');
  await checkPage(pubPage, `${BASE}/login`, 'Login');
  await checkPage(pubPage, `${BASE}/book`, 'Booking');
  await checkPage(pubPage, `${BASE}/portal`, 'Portal');
  await pubCtx.close();

  // DOCTOR
  console.log('\n=== DOCTOR ===');
  const docCtx = await browser.newContext();
  const docPage = await docCtx.newPage();
  await login(docPage, CREDS.doctor);
  await checkPage(docPage, `${BASE}/doctor`, 'Doctor Dashboard');
  await checkPage(docPage, `${BASE}/doctor/schedule`, 'Doctor Schedule');
  await checkPage(docPage, `${BASE}/patients`, 'Patients List');
  await docCtx.close();

  // RECEPTION
  console.log('\n=== RECEPTION ===');
  const recCtx = await browser.newContext();
  const recPage = await recCtx.newPage();
  await login(recPage, CREDS.reception);
  await checkPage(recPage, `${BASE}/reception`, 'Reception');
  await checkPage(recPage, `${BASE}/billing`, 'Billing');
  await recCtx.close();

  // ADMIN
  console.log('\n=== ADMIN ===');
  const admCtx = await browser.newContext();
  const admPage = await admCtx.newPage();
  await login(admPage, CREDS.admin);
  await checkPage(admPage, `${BASE}/admin`, 'Admin Dashboard');
  await checkPage(admPage, `${BASE}/admin/reports`, 'Reports');
  await checkPage(admPage, `${BASE}/admin/staff`, 'Staff');
  await checkPage(admPage, `${BASE}/admin/notifications`, 'Notifications');
  await checkPage(admPage, `${BASE}/admin/audit`, 'Audit Log');
  await checkPage(admPage, `${BASE}/admin/settings`, 'Settings');
  await admCtx.close();

  // PHARMACY
  console.log('\n=== PHARMACY ===');
  const phCtx = await browser.newContext();
  const phPage = await phCtx.newPage();
  await login(phPage, CREDS.pharmacy);
  await checkPage(phPage, `${BASE}/pharmacy`, 'Pharmacy');
  await phCtx.close();

  await browser.close();
  console.log('\n=== AUDIT COMPLETE ===');
}

main().catch(console.error);
