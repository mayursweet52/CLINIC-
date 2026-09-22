const { chromium, devices } = require('@playwright/test');
const { SignJWT } = require('jose');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
    const doctorToken = await new SignJWT({ userId: 'doc-1', name: 'Dr. Ananya Sharma', role: 'DOCTOR', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    
    // Desktop
    console.log('Capturing Desktop...');
    const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await contextDesktop.addCookies([{ name: 'auth_token', value: doctorToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    const pageDesktop = await contextDesktop.newPage();
    await pageDesktop.goto('http://localhost:3000/doctor', { waitUntil: 'networkidle' });
    await pageDesktop.waitForTimeout(2000);
    await pageDesktop.screenshot({ path: 'ui-audit/after/doctor-refactored.png' });
    
    // Mobile
    console.log('Capturing Mobile...');
    const contextMobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await contextMobile.addCookies([{ name: 'auth_token', value: doctorToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto('http://localhost:3000/doctor', { waitUntil: 'networkidle' });
    await pageMobile.waitForTimeout(2000);
    await pageMobile.screenshot({ path: 'ui-audit/after/doctor-mobile.png' });
    
    console.log('Successfully captured ui-audit/after/doctor-refactored.png and ui-audit/after/doctor-mobile.png');
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}
main();
