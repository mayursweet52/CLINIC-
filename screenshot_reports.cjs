const { chromium } = require('./node_modules/playwright');
const { SignJWT } = require('./node_modules/jose');

async function main() {
  const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
  const token = await new SignJWT({ userId: 'test-admin-1', name: 'Admin User', role: 'ADMIN', orgId: 'org-test-001' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\mayur\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: 'auth_token', value: token, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
  
  const page = await ctx.newPage();
  
  try {
    await page.goto('http://localhost:3000/admin/reports', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for charts to animate
    await page.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\admin_reports.png', fullPage: true });
    console.log('[PASS] Screenshot saved to artifacts');
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
  }

  await browser.close();
}
main().catch(console.error);
