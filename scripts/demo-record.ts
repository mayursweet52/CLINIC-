import { chromium } from '@playwright/test';
import * as fs from 'fs';

async function main() {
  console.log('=== Starting ClinicOS Demo Recording Script ===');

  const screenshotsDir = 'demo-screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Launch browser for OBS capturing
  const browser = await chromium.launch({
    headless: false, // Visible for OBS
    slowMo: 300,     // Smooth for recording
    args: ['--window-size=1920,1080']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: 'demo-videos', size: { width: 1920, height: 1080 } }
  });

  const page = await context.newPage();

  try {
    // ==========================================
    // STEP 1 — Login as doctor
    // ==========================================
    console.log('=== STEP 1: Login ===');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    // Fill credentials (adapt selectors if needed)
    await page.fill('input[type="email"]', 'dr.smith@clinic.com').catch(() => {});
    await page.fill('input[type="password"]', 'password123').catch(() => {});
    await page.click('button[type="submit"], text="Login", text="Sign In"').catch(() => {});
    await page.waitForTimeout(2000);

    // ==========================================
    // STEP 2 — Show doctor dashboard
    // ==========================================
    console.log('=== STEP 2: Doctor Dashboard ===');
    await page.goto('http://localhost:3000/doctor');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screenshotsDir}/01-doctor-dashboard.png` });

    // ==========================================
    // STEP 3 — Patient booking (new context/page)
    // ==========================================
    console.log('=== STEP 3: Patient Booking ===');
    const patientContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const pubPage = await patientContext.newPage();
    
    await pubPage.goto('http://localhost:3000/book');
    await pubPage.waitForTimeout(1500);
    
    // Select Hospital/Doctor
    const hospitalBtn = await pubPage.$('text=City Care Hospital').catch(() => null) || await pubPage.$('button h3');
    if (hospitalBtn) await hospitalBtn.click();
    await pubPage.waitForTimeout(1000);
    
    const doctorBtn = await pubPage.$('text=Dr. Smith').catch(() => null) || await pubPage.$('text=Dr. Rajesh Sharma').catch(() => null) || await pubPage.$('button h3');
    if (doctorBtn) await doctorBtn.click();
    await pubPage.waitForTimeout(1000);

    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1); // tomorrow
    const dateStr = bookingDate.toISOString().split('T')[0];
    
    await pubPage.fill('input[type="text"]', 'Rajesh Kumar').catch(() => {});
    await pubPage.fill('input[type="tel"]', '9876543210').catch(() => {});
    await pubPage.fill('input[type="date"]', dateStr).catch(() => {});
    
    await pubPage.waitForTimeout(2000); // wait for slots to load
    await pubPage.screenshot({ path: `${screenshotsDir}/02-slots-loaded.png` });

    // Select first open slot
    const slots = await pubPage.$$eval('select option', opts => opts.filter(o => !o.disabled && o.value !== "").map(o => o.value));
    if (slots.length > 0) {
      await pubPage.selectOption('select', slots[0]);
    }
    
    await pubPage.click('button[type="submit"], text="Confirm Booking", text="Book"').catch(() => {});
    await pubPage.waitForTimeout(2000);
    await pubPage.screenshot({ path: `${screenshotsDir}/03-booking-success.png` });

    // ==========================================
    // STEP 4 — Show real-time update on doctor tab
    // ==========================================
    console.log('=== STEP 4: Doctor Live Update ===');
    await page.bringToFront();
    await page.waitForTimeout(3000); // let live update happen
    await page.screenshot({ path: `${screenshotsDir}/04-doctor-live-update.png` });
    await page.waitForTimeout(2000);

    // ==========================================
    // STEP 5 — Reception
    // ==========================================
    console.log('=== STEP 5: Reception Check-in ===');
    // Using a new context for Reception to simulate clean login
    const recContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const recPage = await recContext.newPage();
    
    await recPage.goto('http://localhost:3000/login');
    await recPage.fill('input[type="email"]', 'reception@clinic.com').catch(() => {});
    await recPage.fill('input[type="password"]', 'password123').catch(() => {});
    await recPage.click('button[type="submit"], text="Login"').catch(() => {});
    await recPage.waitForTimeout(1500);
    
    await recPage.goto('http://localhost:3000/reception');
    await recPage.waitForTimeout(2000);
    
    // Attempt to click Mark Arrived
    const arrivedBtn = await recPage.$('text="Mark Arrived"').catch(() => null) || await recPage.$('button:has-text("Arrived")');
    if (arrivedBtn) await arrivedBtn.click();
    await recPage.waitForTimeout(1500);
    await recPage.screenshot({ path: `${screenshotsDir}/05-reception-checkin.png` });

    // ==========================================
    // STEP 6 — Doctor consultation
    // ==========================================
    console.log('=== STEP 6: Doctor Consultation ===');
    await page.bringToFront();
    await page.waitForTimeout(1000);
    
    // Click on the patient (assuming row is clickable or has a 'Consult' button)
    const consultBtn = await page.$('text="Start Consult"').catch(() => null) || await page.$('button:has-text("Consult")');
    if (consultBtn) await consultBtn.click();
    await page.waitForTimeout(2000);
    
    // Fill diagnosis & medicine (adjust selectors as needed)
    const diagnosisInput = await page.$('textarea, input[placeholder*="Diagnosis"]').catch(() => null);
    if (diagnosisInput) await diagnosisInput.fill('Viral Fever');
    
    const medInput = await page.$('input[placeholder*="Medicine"]').catch(() => null);
    if (medInput) {
       await medInput.fill('Paracetamol 500mg, 1-0-1, 5 days');
       const addMed = await page.$('text="Add"').catch(() => null);
       if (addMed) await addMed.click();
       await page.waitForTimeout(500);
       await medInput.fill('Cetirizine 10mg, 0-0-1, 3 days');
       if (addMed) await addMed.click();
    }
    
    const saveBtn = await page.$('text="Save"').catch(() => null);
    if (saveBtn) await saveBtn.click();
    
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${screenshotsDir}/06-consultation.png` });

    // ==========================================
    // STEP 7 — Pharmacy
    // ==========================================
    console.log('=== STEP 7: Pharmacy Dispense ===');
    const pharmContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const pharmPage = await pharmContext.newPage();
    
    await pharmPage.goto('http://localhost:3000/login');
    await pharmPage.fill('input[type="email"]', 'pharmacy@clinic.com').catch(() => {});
    await pharmPage.fill('input[type="password"]', 'password123').catch(() => {});
    await pharmPage.click('button[type="submit"]').catch(() => {});
    await pharmPage.waitForTimeout(1000);
    
    await pharmPage.goto('http://localhost:3000/pharmacy');
    await pharmPage.waitForTimeout(2000);
    await pharmPage.screenshot({ path: `${screenshotsDir}/07-pharmacy-queue.png` });
    
    const dispenseBtn = await pharmPage.$('text="Dispense"').catch(() => null);
    if (dispenseBtn) await dispenseBtn.click();
    await pharmPage.waitForTimeout(1500);
    await pharmPage.screenshot({ path: `${screenshotsDir}/08-dispensed.png` });

    // ==========================================
    // STEP 8 — Billing
    // ==========================================
    console.log('=== STEP 8: Billing ===');
    await recPage.bringToFront();
    await recPage.goto('http://localhost:3000/reception/billing').catch(() => recPage.goto('http://localhost:3000/billing'));
    await recPage.waitForTimeout(1500);
    
    const payBtn = await recPage.$('text="Mark as Paid"').catch(() => null) || await recPage.$('text="Pay"');
    if (payBtn) await payBtn.click();
    await recPage.waitForTimeout(1500);
    await recPage.screenshot({ path: `${screenshotsDir}/09-billing.png` });

    // ==========================================
    // STEP 9 — Patient portal
    // ==========================================
    console.log('=== STEP 9: Patient Portal ===');
    const mobileContext = await browser.newContext({ 
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
    });
    const mobilePage = await mobileContext.newPage();
    
    await mobilePage.goto('http://localhost:3000/portal/login');
    await mobilePage.fill('input[type="tel"]', '9876543210').catch(() => {});
    await mobilePage.click('button:has-text("Send OTP")').catch(() => {});
    await mobilePage.waitForTimeout(1000);
    
    await mobilePage.fill('input[type="text"], input[placeholder*="OTP"]', '123456').catch(() => {});
    await mobilePage.click('button:has-text("Verify")').catch(() => {});
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: `${screenshotsDir}/10-portal-dashboard.png` });

    // ==========================================
    // STEP 10 — Analytics
    // ==========================================
    console.log('=== STEP 10: Analytics ===');
    const adminContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('http://localhost:3000/login');
    await adminPage.fill('input[type="email"]', 'admin@clinic.com').catch(() => {});
    await adminPage.fill('input[type="password"]', 'password123').catch(() => {});
    await adminPage.click('button[type="submit"]').catch(() => {});
    await adminPage.waitForTimeout(1000);
    
    await adminPage.goto('http://localhost:3000/admin/reports');
    await adminPage.waitForTimeout(3000);
    await adminPage.screenshot({ path: `${screenshotsDir}/11-analytics.png` });
    
    const rangeBtn = await adminPage.$('text="90d"').catch(() => null) || await adminPage.$('text="90 Days"');
    if (rangeBtn) await rangeBtn.click();
    await adminPage.waitForTimeout(2000);

    // ==========================================
    // STEP 11 — Schedule
    // ==========================================
    console.log('=== STEP 11: Schedule ===');
    await page.bringToFront(); // Doctor page
    await page.goto('http://localhost:3000/doctor/schedule');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/12-schedule.png` });

    console.log('=== Demo Recording Completed Successfully ===');
  } catch (error) {
    console.error('Error during demo script execution:', error);
  } finally {
    // Wait for the video to save before closing
    await browser.close();
  }
}

main();
