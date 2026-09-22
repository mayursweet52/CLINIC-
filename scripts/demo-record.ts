import { chromium } from 'playwright';
import * as fs from 'fs';

async function main() {
  const screenshotsDir = 'ui-audit/demo';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  try {
    // SCENE 1: Login as doctor → dashboard
    console.log('=== SCENE 1: Doctor Dashboard ===');
    const doctorContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const doctorPage = await doctorContext.newPage();
    
    await doctorPage.goto('http://localhost:3000/login');
    await doctorPage.fill('input[type="email"]', 'ananya.sharma@aarogyaclinic.in');
    await doctorPage.fill('input[type="password"]', 'Aarogya@2024');
    await doctorPage.click('button[type="submit"]');
    await doctorPage.waitForTimeout(2000);
    await doctorPage.screenshot({ path: `${screenshotsDir}/scene1-doctor.png` });

    // SCENE 2: Patient books from /book
    console.log('=== SCENE 2: Patient Booking ===');
    const pubContext = await browser.newContext({ viewport: { width: 414, height: 896 } });
    const pubPage = await pubContext.newPage();
    
    await pubPage.goto('http://localhost:3000/book');
    await pubPage.waitForTimeout(1000);
    await pubPage.screenshot({ path: `${screenshotsDir}/scene2-booking-step1.png` });
    
    const deptBtn = await pubPage.$('button:has-text("Cardiology"), button:has-text("General")').catch(() => null);
    if (deptBtn) { await deptBtn.click(); await pubPage.click('button:has-text("Next")').catch(() => {}); }
    
    await pubPage.waitForTimeout(1000);
    const docBtn = await pubPage.$('button:has-text("Dr.")').catch(() => null);
    if (docBtn) { await docBtn.click(); await pubPage.click('button:has-text("Next")').catch(() => {}); }
    
    await pubPage.waitForTimeout(1000);
    const dateBtn = await pubPage.$('button[name="day"]:not(.opacity-50)').catch(() => null);
    if (dateBtn) await dateBtn.click();
    
    const slotBtn = await pubPage.$('button:has-text("AM"), button:has-text("PM"):not([disabled])').catch(() => null);
    if (slotBtn) { await slotBtn.click(); await pubPage.click('button:has-text("Next")').catch(() => {}); }

    await pubPage.fill('input[name="patientName"]', 'Rahul Kumar').catch(() => {});
    await pubPage.fill('input[name="patientPhone"]', '+919876543210').catch(() => {});
    
    await pubPage.waitForTimeout(500);
    await pubPage.screenshot({ path: `${screenshotsDir}/scene2-booking-step4.png` });
    await pubPage.click('button:has-text("Confirm Booking")').catch(() => {});
    await pubPage.waitForTimeout(2000);
    await pubPage.screenshot({ path: `${screenshotsDir}/scene2-booking-success.png` });

    // SCENE 3: Real-time update (wait on doctor tab)
    console.log('=== SCENE 3: Real-time Update ===');
    await doctorPage.bringToFront();
    await doctorPage.waitForTimeout(3000); // 3000ms to allow SSE update
    await doctorPage.screenshot({ path: `${screenshotsDir}/scene3-realtime.png` });

    // SCENE 4: Reception check-in
    console.log('=== SCENE 4: Reception Check-in ===');
    const recContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const recPage = await recContext.newPage();
    
    await recPage.goto('http://localhost:3000/login');
    await recPage.fill('input[type="email"]', 'kavita.nair@aarogyaclinic.in');
    await recPage.fill('input[type="password"]', 'Front@2024');
    await recPage.click('button[type="submit"]');
    await recPage.waitForTimeout(2000);
    
    const arrivedBtn = await recPage.$('button:has-text("Mark Arrived"), button:has-text("Check-in")').catch(() => null);
    if (arrivedBtn) await arrivedBtn.click();
    await recPage.waitForTimeout(1000);
    await recPage.screenshot({ path: `${screenshotsDir}/scene4-reception.png` });

    // SCENE 5: Doctor consultation
    console.log('=== SCENE 5: Consultation ===');
    await doctorPage.bringToFront();
    await doctorPage.waitForTimeout(1000);
    
    const consultBtn = await doctorPage.$('button:has-text("Start Consult"), button:has-text("Consult")').catch(() => null);
    if (consultBtn) await consultBtn.click();
    await doctorPage.waitForTimeout(2000);
    
    await doctorPage.fill('textarea, input[placeholder*="Diagnosis"]', 'Viral Fever').catch(() => {});
    await doctorPage.fill('input[placeholder*="Medicine"]', 'Paracetamol 500mg, 1-0-1').catch(() => {});
    const addMedBtn = await doctorPage.$('button:has-text("Add")').catch(() => null);
    if (addMedBtn) await addMedBtn.click();
    
    await doctorPage.waitForTimeout(500);
    await doctorPage.screenshot({ path: `${screenshotsDir}/scene5-consultation.png` });

    // SCENE 6: Pharmacy
    console.log('=== SCENE 6: Pharmacy ===');
    const pharmContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const pharmPage = await pharmContext.newPage();
    
    await pharmPage.goto('http://localhost:3000/login');
    await pharmPage.fill('input[type="email"]', 'suresh.patel@aarogyaclinic.in');
    await pharmPage.fill('input[type="password"]', 'Pharma@2024');
    await pharmPage.click('button[type="submit"]');
    await pharmPage.waitForTimeout(2000);
    
    const dispenseBtn = await pharmPage.$('button:has-text("Dispense")').catch(() => null);
    if (dispenseBtn) await dispenseBtn.click();
    await pharmPage.waitForTimeout(1000);
    await pharmPage.screenshot({ path: `${screenshotsDir}/scene6-pharmacy.png` });

    // SCENE 7: Billing
    console.log('=== SCENE 7: Billing ===');
    await recPage.bringToFront();
    await recPage.goto('http://localhost:3000/reception/billing').catch(() => recPage.goto('http://localhost:3000/billing'));
    await recPage.waitForTimeout(2000);
    
    const payBtn = await recPage.$('button:has-text("Mark as Paid"), button:has-text("Pay")').catch(() => null);
    if (payBtn) await payBtn.click();
    await recPage.waitForTimeout(1000);
    await recPage.screenshot({ path: `${screenshotsDir}/scene7-billing.png` });

    // SCENE 8: Analytics
    console.log('=== SCENE 8: Analytics ===');
    const adminContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const adminPage = await adminContext.newPage();
    
    await adminPage.goto('http://localhost:3000/login');
    await adminPage.fill('input[type="email"]', 'vikram.singh@aarogyaclinic.in');
    await adminPage.fill('input[type="password"]', 'Admin@2024');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(2000);
    
    await adminPage.goto('http://localhost:3000/admin/reports');
    await adminPage.waitForTimeout(3000);
    await adminPage.screenshot({ path: `${screenshotsDir}/scene8-analytics.png` });

    console.log('=== Demo Recording Complete ===');
  } catch (error) {
    console.error('Error during demo script:', error);
  } finally {
    await browser.close();
  }
}

main();
