const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // Mobile viewport for some screens, but let's do 1280x720 for others
  });
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';
  
  if (!fs.existsSync('ui-audit/batch2')) {
    fs.mkdirSync('ui-audit/batch2', { recursive: true });
  }

  try {
    console.log("Waiting for server...");
    // Just a small wait if we start it right now
    await page.waitForTimeout(2000);

    // 1. Landing Page
    console.log("Testing Landing Page...");
    await page.goto(`${baseUrl}/`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'ui-audit/batch2/01-landing-page.png' });

    // 2. Login Page
    console.log("Testing Login Page...");
    try { await page.goto(`${baseUrl}/login`); } catch(e){}
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ui-audit/batch2/02-login-before.png' });
    
    // 3. Book Page Flow
    console.log("Testing Book Page...");
    try { await page.goto(`${baseUrl}/book`); } catch(e){}
    await page.waitForTimeout(2000);
    
    // Step 1: Department
    await page.click('text=Cardiology').catch(()=>console.log('could not click cardiology'));
    await page.waitForTimeout(1000);

    // Step 2: Doctor
    await page.click('text=Dr. Sarah Smith').catch(()=>console.log('could not click dr smith'));
    await page.waitForTimeout(1000);

    // Step 3: Time
    await page.click('text=10:30').catch(()=>console.log('could not click time'));
    await page.waitForTimeout(1000);

    // Step 4: Form
    await page.fill('input[name="patientName"]', 'Test Patient').catch(()=>{});
    await page.fill('input[name="patientPhone"]', '+919876543210').catch(()=>{});
    await page.click('button:has-text("Confirm Booking")').catch(()=>{});
    await page.waitForTimeout(2000);

    // Step 5: Success
    await page.screenshot({ path: 'ui-audit/batch2/03-book-success.png' });

    // 4. Portal Login
    console.log("Testing Portal Login...");
    try { await page.goto(`${baseUrl}/portal/login`); } catch(e){}
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ui-audit/batch2/04-portal-login-phone.png' });
    
    await page.fill('input[id="phone"]', '+919876543210').catch(()=>{});
    await page.click('button:has-text("Send OTP")').catch(()=>{});
    await page.waitForTimeout(2000);
    
    // We should be on OTP step
    // Just fill the 6 boxes.
    const inputs = await page.$$('input[type="text"]');
    for (let i = 0; i < 6; i++) {
      if (inputs[i]) await inputs[i].fill('1').catch(()=>{});
    }
    
    await page.waitForTimeout(2000);
    
    // Portal Dashboard
    await page.screenshot({ path: 'ui-audit/batch2/05-portal-dashboard.png' });

    console.log("All screenshots captured successfully.");
  } catch (error) {
    console.error("Error during playwright tests:", error);
  } finally {
    await browser.close();
  }
})();
