const { chromium } = require('@playwright/test');
const { SignJWT } = require('jose');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  const secret = new TextEncoder().encode('super-secret-key-for-businessos-health-12345');
  
  const generateToken = async (role) => {
    return await new SignJWT({ userId: `mock-${role}`, name: `Test ${role}`, role: role, orgId: 'org-1' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(secret);
  };

  const pages = [
    { name: '1-home', url: '/', role: null },
    { name: '2-login', url: '/login', role: null },
    { name: '3-book', url: '/book', role: null },
    { name: '4-portal', url: '/portal', role: null },
    { name: '5-doctor', url: '/doctor', role: 'DOCTOR' },
    { name: '6-admin', url: '/admin', role: 'ADMIN' },
    { name: '7-admin-reports', url: '/admin/reports', role: 'ADMIN' },
    { name: '8-billing', url: '/billing', role: 'ADMIN' },
    { name: '9-reception', url: '/reception', role: 'RECEPTIONIST' },
    { name: '10-pharmacy', url: '/pharmacy', role: 'PHARMACIST' }
  ];

  for (const p of pages) {
    try {
      console.log(`Visiting ${p.name}...`);
      const page = await context.newPage();
      
      if (p.role) {
        const token = await generateToken(p.role);
        await context.addCookies([{ name: 'auth_token', value: token, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
      } else {
        await context.clearCookies();
      }
      
      await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `ui-audit/final/${p.name}.png` });
      await page.close();
      console.log(`Captured ${p.name}`);
    } catch (e) {
      console.error(`Failed on ${p.name}:`, e.message);
    }
  }

  await browser.close();
}
main();
