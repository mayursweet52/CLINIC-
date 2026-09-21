import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Login with valid credentials redirects to staff dashboard', async ({ page }) => {
    await page.goto('/staff');
    await page.fill('input[type="email"]', 'dr.smith@clinic.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check if the dashboard queue is loaded (h1 should say Doctor Console or similar)
    await expect(page.locator('h1').first()).toContainText(/Console|Dashboard|Clinic/, { timeout: 10000 });
  });

  test('Login with invalid credentials fails', async ({ page }) => {
    // Handle the browser alert that pops up on invalid credentials
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Invalid credentials');
      dialog.accept();
    });

    await page.goto('/staff');
    await page.fill('input[type="email"]', 'dr.smith@clinic.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Should still be on login form (button visible)
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
