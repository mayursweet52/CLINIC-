import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'vikram.singh@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Admin@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Admin dashboard loads and quick links navigate', async ({ page }) => {
    await expect(page.locator('h1', { hasText: /Admin|Dashboard/i })).toBeVisible();
    
    // Quick Links (like Staff, Departments, etc.)
    const staffLink = page.locator('a:has-text("Staff"), a[href="/admin/staff"]').first();
    if (await staffLink.isVisible()) {
      await staffLink.click();
      await expect(page).toHaveURL(/\/staff/);
      await page.goBack();
    }
  });

  test('Reports page loads charts', async ({ page }) => {
    await page.click('a[href="/admin/reports"], a:has-text("Reports")');
    await expect(page).toHaveURL(/\/reports/);
    
    // Check if charts are rendered (recharts uses recharts-wrapper or svg)
    await expect(page.locator('.recharts-wrapper, svg').first()).toBeVisible({ timeout: 10000 });
  });

  test('Audit log shows entries', async ({ page }) => {
    // Usually audit log is a tab or a separate page
    const auditLink = page.locator('a[href="/admin/audit"], a:has-text("Audit")').first();
    if (await auditLink.isVisible()) {
      await auditLink.click();
      await expect(page).toHaveURL(/\/audit/);
    }
    
    // Verify some entries exist
    await expect(page.locator('table').or(page.locator('.grid'))).toBeVisible();
    await expect(page.locator('tbody tr, .audit-entry').first()).toBeVisible();
  });
});
