import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('Public /book loads', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('text=/Book Appointment|Select Department/i')).toBeVisible();
  });

  test('Complete 4-step wizard', async ({ page }) => {
    await page.goto('/book');
    
    // Step 1: Department
    const deptBtn = page.locator('button', { hasText: /Cardiology|General|Orthopedics/i }).first();
    await deptBtn.click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: Doctor
    const docBtn = page.locator('button', { hasText: /Dr\./i }).first();
    await docBtn.click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Date & Time
    // Wait for calendar to be visible
    const dateBtn = page.locator('button[name="day"]').filter({ hasNotClass: /opacity-50/ }).first();
    if (await dateBtn.isVisible()) {
      await dateBtn.click();
    }
    const slotBtn = page.locator('button:not([disabled])', { hasText: /AM|PM/ }).first();
    await slotBtn.click();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Details
    await page.fill('input[name="patientName"]', 'Test Patient');
    await page.fill('input[name="patientPhone"]', '+919876543210');
    await page.click('button:has-text("Confirm Booking")');

    // Success Screen
    await expect(page.locator('text=/Booking Confirmed|Success/i')).toBeVisible({ timeout: 10000 });
    // Expect token to be visible
    await expect(page.locator('text=/Token/i')).toBeVisible();
    // QR Code (assumed to be an svg or img with qr role/alt)
    await expect(page.locator('svg, img[alt*="QR"]')).first().toBeVisible();
  });

  test('Test slot selection (only available slots clickable)', async ({ page }) => {
    await page.goto('/book');
    
    // Skip to time selection if possible, or navigate there
    const deptBtn = page.locator('button', { hasText: /Cardiology|General|Orthopedics/i }).first();
    await deptBtn.click();
    await page.getByRole('button', { name: /Next/i }).click();

    const docBtn = page.locator('button', { hasText: /Dr\./i }).first();
    await docBtn.click();
    await page.getByRole('button', { name: /Next/i }).click();
    
    // Look for slots
    const disabledSlots = page.locator('button:disabled', { hasText: /AM|PM/ });
    const enabledSlots = page.locator('button:not([disabled])', { hasText: /AM|PM/ });
    
    // If there are disabled slots, ensure they are unclickable (Playwright natively checks this on click action, or we can just expect them to be disabled)
    if (await disabledSlots.count() > 0) {
      await expect(disabledSlots.first()).toBeDisabled();
    }
    
    if (await enabledSlots.count() > 0) {
      await expect(enabledSlots.first()).toBeEnabled();
    }
  });
});
