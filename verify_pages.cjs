const { chromium } = require('./node_modules/playwright');
const { SignJWT } = require('./node_modules/jose');

async function main() {
  const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
  const token = await new SignJWT({ userId: 'test-admin-1', name: 'Admin User', role: 'ADMIN', orgId: 'org-test-001' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);

  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\mayur\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe' });
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: 'auth_token', value: token, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
  
  const page = await ctx.newPage();
  
  const urls = [
    '/portal',
    '/admin',
    '/staff/billing',
    '/pharmacy',
    '/admin/audit',
    '/doctor'
  ];

  let successCount = 0;
  for (const url of urls) {
    try {
      const response = await page.goto('http://localhost:3000' + url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (response && response.status() === 200) {
        console.log(`[PASS] ${url}`);
        successCount++;
      } else {
        console.error(`[FAIL] ${url} - Status: ${response ? response.status() : 'No response'}`);
      }
    } catch (e) {
      console.error(`[ERROR] ${url} - ${e.message}`);
    }
  }

  await browser.close();
  if (successCount === urls.length) {
    console.log("ALL_PAGES_PASSED");
    process.exit(0);
  } else {
    process.exit(1);
  }
}
main().catch(console.error);
