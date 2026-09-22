const { chromium } = require('@playwright/test');
const fs = require('fs');

async function main() {
  console.log('=== Starting UI Audit Script ===');

  const screenshotsDir = 'ui-audit/before';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('[1/9] Capturing /login');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/1-login.png` });

    console.log('[2/9] Capturing /doctor');
    const { SignJWT } = require('jose');
    const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
    const doctorToken = await new SignJWT({ userId: 'doc-1', name: 'Dr. Ananya Sharma', role: 'DOCTOR', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    
    await context.addCookies([{ name: 'auth_token', value: doctorToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    
    await page.goto(`${baseUrl}/doctor`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/2-doctor.png` });

    // Computed Styles Extraction
    const computedStyles = await page.evaluate(function() {
      var h1 = document.querySelector('h1');
      var btn = document.querySelector('button');
      var card = document.querySelector('.rounded-xl, .bg-card, .border');
      
      function getStyles(el) {
        if (!el) return null;
        var styles = window.getComputedStyle(el);
        return {
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          border: styles.border
        };
      }

      return {
        h1: getStyles(h1),
        button: getStyles(btn),
        card: getStyles(card)
      };
    });
    fs.writeFileSync('ui-audit/style-report.json', JSON.stringify(computedStyles, null, 2));

    console.log('[3/9] Capturing /doctor/schedule');
    await page.goto(`${baseUrl}/doctor/schedule`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/3-doctor-schedule.png` });

    console.log('[4/9] Capturing /reception');
    const receptionToken = await new SignJWT({ userId: 'rec-1', name: 'Kavita Nair', role: 'RECEPTIONIST', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    await context.addCookies([{ name: 'auth_token', value: receptionToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    await page.goto(`${baseUrl}/reception`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/4-reception.png` });
    
    console.log('[5/9] Capturing /billing');
    await page.goto(`${baseUrl}/billing`, { waitUntil: 'networkidle' }).catch(() => page.goto(`${baseUrl}/reception/billing`, { waitUntil: 'networkidle' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/5-billing.png` });

    console.log('[6/9] Capturing /admin');
    const adminToken = await new SignJWT({ userId: 'admin-1', name: 'Vikram Singh', role: 'ADMIN', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    await context.addCookies([{ name: 'auth_token', value: adminToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/6-admin.png` });

    console.log('[7/9] Capturing /admin/reports');
    await page.goto(`${baseUrl}/admin/reports`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/7-admin-reports.png` });

    console.log('[8/9] Capturing /pharmacy');
    const pharmaToken = await new SignJWT({ userId: 'pharm-1', name: 'Suresh Patel', role: 'PHARMACIST', orgId: 'org-city-care' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
    await context.addCookies([{ name: 'auth_token', value: pharmaToken, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    await page.goto(`${baseUrl}/pharmacy`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/8-pharmacy.png` });

    console.log('[9/9] Capturing /portal');
    await context.clearCookies();
    await page.goto(`${baseUrl}/portal`, { waitUntil: 'networkidle' }).catch(() => page.goto(`${baseUrl}/portal/login`, { waitUntil: 'networkidle' }));
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/9-portal.png` });

    console.log('=== Audit Completed ===');
  } catch (error) {
    console.error('Error during audit:', error);
  } finally {
    await browser.close();
  }
}

main();
