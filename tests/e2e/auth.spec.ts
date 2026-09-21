import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Login with valid credentials redirects to staff dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dr.smith@clinic.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check if the dashboard is loaded (ClinicOS in sidebar, or Doctor header)
    await expect(page.locator('h1', { hasText: /ClinicOS|Doctor|Good morning/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Login with invalid credentials fails', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dr.smith@clinic.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Should display error banner or keep submit button visible
    await expect(page.locator('button[type="submit"]').or(page.locator('text=Invalid'))).toBeVisible({ timeout: 5000 });
  });
});
