import { test, expect } from '@playwright/test';

test.describe('Doctor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'ananya.sharma@aarogyaclinic.in');
    await page.fill('input[type="password"]', 'Aarogya@2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/doctor/);
  });

  test('Doctor dashboard loads and StatCards visible', async ({ page }) => {
    await expect(page.locator('h1', { hasText: /Dashboard|Welcome|Good/i }).first()).toBeVisible();
    
    // Check for some stat cards
    await expect(page.locator('text=/Patients/i').first()).toBeVisible();
    await expect(page.locator('text=/Consultations/i').first()).toBeVisible();
  });

  test('Schedule timeline shows appointments', async ({ page }) => {
    await expect(page.locator('text=/Schedule|Timeline|Appointments/i').first()).toBeVisible();
    // Verify there is at least one appointment in the timeline, or an empty state
    const timelineItems = page.locator('.timeline-item, .appointment-card, [class*="appointment"]');
    const emptyState = page.locator('text=/No appointments/i');
    
    await expect(timelineItems.first().or(emptyState)).toBeVisible();
  });

  test('LiveBadge shows "Live"', async ({ page }) => {
    // Some LiveBadge is rendered in the header or dashboard
    await expect(page.locator('text=/Live/i').first()).toBeVisible();
  });

  test('Click "Start Consultation" navigates', async ({ page }) => {
    // Check if there is a start consultation button
    const startBtn = page.getByRole('button', { name: /Start Consultation|Consult/i }).first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page).toHaveURL(/\/doctor\/consultation/);
    }
  });
});
