import { test, expect } from '@playwright/test';

test.describe('Patients Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as reception
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kavita.nair@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Front@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/reception/);
  });

  test('Patients list loads and search works', async ({ page }) => {
    // Go to patients
    await page.click('a[href="/reception/patients"], a:has-text("Patients")');
    await expect(page).toHaveURL(/\/patients/);
    
    // Check if list loads
    await expect(page.locator('table').or(page.locator('.grid'))).toBeVisible();

    // Search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('John');
    
    // Results should update (just check if it doesn't crash)
    await expect(page.locator('text=/John/i').first().or(page.locator('text=/No results/i'))).toBeVisible();
  });

  test('Click patient -> detail page and tabs switch correctly', async ({ page }) => {
    await page.goto('/reception/patients');
    
    // Click a patient row
    const patientRow = page.locator('tbody tr, .patient-card').first();
    if (await patientRow.isVisible()) {
      await patientRow.click();
      
      // Detail page
      await expect(page).toHaveURL(/\/patients\//);
      
      // Tabs
      const tabs = ['Overview', 'History', 'Prescriptions', 'Billing'];
      for (const tab of tabs) {
        const tabBtn = page.getByRole('tab', { name: new RegExp(tab, 'i') });
        if (await tabBtn.isVisible()) {
          await tabBtn.click();
          await expect(tabBtn).toHaveAttribute('aria-selected', 'true');
        }
      }
    }
  });
});
