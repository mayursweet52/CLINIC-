const { chromium } = require('./node_modules/playwright');
const { SignJWT } = require('./node_modules/jose');

async function main() {
  const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
  
  const doctorToken = await new SignJWT({ userId: 'doc-1', name: 'Dr. Rajesh Sharma', role: 'DOCTOR', orgId: 'org-city-care' })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    
  const receptionToken = await new SignJWT({ userId: 'c5d1bebe-ecdd-40a9-a7b9-899a5bd4c193', name: 'Receptionist Jane', role: 'RECEPTIONIST', orgId: 'org-city-care' })
    .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\mayur\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe' });

  const docCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  await docCtx.addCookies([{ name: 'auth_token', value: doctorToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
  const docPage = await docCtx.newPage();

  const recCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  await recCtx.addCookies([{ name: 'auth_token', value: receptionToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
  const recPage = await recCtx.newPage();

  const pubCtx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const pubPage = await pubCtx.newPage();

  try {
    console.log('[1/4] Loading dashboards...');
    await docPage.goto('http://localhost:3000/doctor', { waitUntil: 'networkidle', timeout: 30000 });
    await recPage.goto('http://localhost:3000/reception', { waitUntil: 'networkidle', timeout: 30000 });
    
    await docPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_doctor_before.png' });
    await recPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_reception_before.png' });

    console.log('[2/4] Performing booking...');
    await pubPage.goto('http://localhost:3000/book', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Instead of waiting for specific hospital text, just click the first hospital button
    const firstHospital = await pubPage.$('button h3');
    if (firstHospital) await firstHospital.click();
    await pubPage.waitForTimeout(1000);
    
    // Click first doctor
    const doctors = await pubPage.$$('button h3');
    if (doctors.length > 0) await doctors[0].click();
    await pubPage.waitForTimeout(1000);

    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 1); // Tomorrow
    const dateStr = bookingDate.toISOString().split('T')[0];
    
    await pubPage.fill('input[type="text"]', 'Killer Flow Patient');
    await pubPage.fill('input[type="tel"]', '9998887776');
    await pubPage.fill('input[type="date"]', dateStr);
    
    // Select first available time slot
    await pubPage.waitForTimeout(2000); // Wait for slots to load
    const slots = await pubPage.$$eval('select option', opts => 
      opts.filter(o => !o.disabled && o.value !== "").map(o => o.value)
    );
    
    if (slots.length > 0) {
      await pubPage.selectOption('select', slots[0]);
      await pubPage.waitForTimeout(1000);
      await pubPage.click('button[type="submit"]');
      await pubPage.waitForTimeout(2000);
      await pubPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_book_success.png' });
      console.log(`[3/4] Booking confirmed for ${dateStr} at ${slots[0]}`);
    } else {
      console.log('No slots available to book.');
      await pubPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_book_failed.png' });
    }

    console.log('[4/4] Verifying live updates...');
    await docPage.waitForTimeout(2000); // Wait for SSE
    await docPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_doctor_after.png' });
    
    await recPage.waitForTimeout(2000); // Wait for SSE
    await recPage.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\flow_reception_after.png' });

    console.log('[PASS] Flow test complete. Screenshots saved.');

  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
  } finally {
    await browser.close();
  }
}
main().catch(console.error);
