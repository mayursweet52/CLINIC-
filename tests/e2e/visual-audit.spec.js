const { test, expect } = require('@playwright/test');
const fs = require('fs');

const viewports = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'Desktop', width: 1440, height: 900 }
];

const pages = [
  { path: '/login', name: 'login' },
  { path: '/doctor', name: 'doctor' },
  { path: '/admin/reports', name: 'reports' }
];

const themes = ['light', 'dark'];

test.describe('Visual Audit', () => {
  for (const pageInfo of pages) {
    for (const vp of viewports) {
      for (const theme of themes) {
        test(`Screenshot ${pageInfo.name} - ${vp.name} - ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(pageInfo.path);
          await page.waitForLoadState('networkidle');
          
          if (theme === 'dark') {
            await page.evaluate(() => document.documentElement.classList.add('dark'));
          } else {
            await page.evaluate(() => document.documentElement.classList.remove('dark'));
          }
          
          await page.waitForTimeout(500); // wait for transitions
          
          const dir = `ui-audit/batch5/${vp.name.toLowerCase()}`;
          fs.mkdirSync(dir, { recursive: true });
          await page.screenshot({ path: `${dir}/${pageInfo.name}-${theme}.png`, fullPage: true });
        });
      }
    }
  }
});
