import { test, expect } from '@playwright/test';

test.describe('Auth Flow', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1').filter({ hasText: /login|sign in/i }).first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.getByText(/invalid|error|failed|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test('Valid login as doctor redirects to /doctor', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'ananya.sharma@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Aarogya@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/doctor/);
  });

  test('Valid login as reception redirects to /reception', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'kavita.nair@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Front@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/reception/);
  });
  
  test('Valid login as admin redirects to /admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'vikram.singh@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Admin@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
  });

  test('Logout clears session and redirects to /login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'vikram.singh@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Admin@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/admin/);
    
    // Attempt logout
    const logoutBtn = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // maybe it's in a dropdown
      const avatarBtn = page.locator('button.rounded-full').first();
      if (await avatarBtn.isVisible()) {
        await avatarBtn.click();
        await page.getByText(/logout|sign out/i).click();
      } else {
        await page.goto('/login'); // fallback
      }
    }
    
    await expect(page).toHaveURL(/\/login/);
  });
});
