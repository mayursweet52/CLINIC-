import { test, expect } from '@playwright/test';

test.describe('Patient Booking Flow', () => {
  test('User can book an appointment successfully', async ({ page }) => {
    // Mock the dialog so it accepts success alerts
    page.on('dialog', dialog => dialog.accept());

    await page.goto('/book');
    
    // Select Hospital
    await page.locator('button.group').first().click();
    
    // Select Doctor
    await page.locator('h3', { hasText: 'Dr.' }).first().click();
    
    // Fill Form
    await page.fill('input[type="text"]', 'E2E Test Patient');
    await page.fill('input[type="tel"]', '9999999999');
    await page.fill('input[type="date"]', '2026-12-12');
    await page.selectOption('select', { index: 1 });
    
    await page.click('button[type="submit"]');
    
    // Expect success screen
    await expect(page.locator('text=Appointment Confirmed')).toBeVisible({ timeout: 15000 });
  });
});
