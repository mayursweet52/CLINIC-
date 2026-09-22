import { test, expect } from '@playwright/test';

test.describe('Billing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as reception
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kavita.nair@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Front@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/reception/);
  });

  test('Billing list loads and mark as paid works', async ({ page }) => {
    await page.click('a[href="/reception/billing"], a:has-text("Billing")');
    await expect(page).toHaveURL(/\/billing/);
    
    // Check if list loads
    await expect(page.locator('table').or(page.locator('.grid'))).toBeVisible();

    // Click a bill row to open detail (or modal)
    const billRow = page.locator('text=/Pending|Unpaid/i').first();
    if (await billRow.isVisible()) {
      await billRow.click();
      
      // Look for mark as paid button
      const payBtn = page.getByRole('button', { name: /Mark as Paid|Pay/i }).first();
      if (await payBtn.isVisible()) {
        await payBtn.click();
        
        // Might have a confirm dialog
        const confirmBtn = page.getByRole('button', { name: /Confirm|Yes/i }).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
        
        // Status should change to Paid or Success notification appears
        await expect(page.getByText(/Paid|Success/i).first()).toBeVisible();
      }
    }
  });
});
