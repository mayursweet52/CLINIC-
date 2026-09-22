const { chromium } = require('@playwright/test');
const { SignJWT } = require('jose');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
    const doctorToken = await new SignJWT({ userId: 'doc-1', name: 'Dr. Ananya Sharma', role: 'DOCTOR', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    
    await context.addCookies([{ name: 'auth_token', value: doctorToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    
    await page.goto('http://localhost:3000/doctor', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'ui-audit/after/2-doctor.png' });
    console.log('Successfully captured ui-audit/after/2-doctor.png');
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
main();
