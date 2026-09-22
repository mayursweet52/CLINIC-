const { chromium } = require('./node_modules/playwright');
const { SignJWT } = require('./node_modules/jose');

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Users\\mayur\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe' });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  const page = await ctx.newPage();
  
  try {
    await page.goto('http://localhost:3000/book', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); 
    
    // Select first hospital
    const firstHospital = await page.$('text=City Care Hospital');
    if (firstHospital) await firstHospital.click();
    await page.waitForTimeout(1000);

    // Select first doctor
    const firstDoctor = await page.$('text=Dr. Priya Sharma');
    if (firstDoctor) await firstDoctor.click();
    await page.waitForTimeout(1000);

    // Enter a date to load slots
    await page.fill('input[type="date"]', new Date().toISOString().split('T')[0]);
    await page.waitForTimeout(2000);
    
    // Open time slot select to show options
    await page.click('select');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'C:\\Users\\mayur\\.gemini\\antigravity\\brain\\ff7bf1b3-ef5b-46c9-a1e3-c3bcf564f05d\\book_slots.png', fullPage: true });
    
    console.log('[PASS] Screenshot saved to artifacts');
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);
  }

  await browser.close();
}
main().catch(console.error);
