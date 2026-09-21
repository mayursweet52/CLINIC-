import { test, expect } from '@playwright/test';

test.describe('Dashboards', () => {
  test('Receptionist dashboard loads properly', async ({ page }) => {
    await page.goto('/reception');
    // Ensure the main header is present
    await expect(page.locator('h1')).toHaveText(/Front Desk/i);
    // It should either show 'No pending bills' or a list of patients
    const noBills = page.locator('text=No pending bills.');
    const collectBtn = page.locator('button', { hasText: 'Collect' }).first();
    
    await expect(noBills.or(collectBtn)).toBeVisible({ timeout: 10000 });
  });
});
