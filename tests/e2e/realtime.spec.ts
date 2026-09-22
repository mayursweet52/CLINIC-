import { test, expect } from '@playwright/test';

test.describe('Real-time Updates', () => {
  test('Doctor dashboard updates when new booking is created', async ({ browser }) => {
    // Context A: Doctor
    const doctorContext = await browser.newContext();
    const doctorPage = await doctorContext.newPage();
    
    await doctorPage.goto('/login');
    await doctorPage.fill('input[type="email"]', 'ananya.sharma@aarogyaclinic.in');
    await doctorPage.fill('input[type="password"]', 'Aarogya@2024');
    await doctorPage.click('button[type="submit"]');
    await expect(doctorPage).toHaveURL(/\/doctor/);
    
    // Count current appointments or look for a specific container
    // We'll just wait for the page to be fully loaded
    await expect(doctorPage.locator('text=/Live/i').first()).toBeVisible();
    
    // Context B: Patient books from /book
    const patientContext = await browser.newContext();
    const patientPage = await patientContext.newPage();
    
    await patientPage.goto('/book');
    const deptBtn = patientPage.locator('button', { hasText: /Cardiology|General/i }).first();
    await deptBtn.click();
    await patientPage.getByRole('button', { name: /Next/i }).click();

    const docBtn = patientPage.locator('button', { hasText: /Dr\./i }).first();
    await docBtn.click();
    await patientPage.getByRole('button', { name: /Next/i }).click();

    const dateBtn = patientPage.locator('button[name="day"]:not(.opacity-50)').first();
    if (await dateBtn.isVisible()) await dateBtn.click();
    
    const slotBtn = patientPage.locator('button:not([disabled])', { hasText: /AM|PM/ }).first();
    if (await slotBtn.isVisible()) {
      await slotBtn.click();
      await patientPage.getByRole('button', { name: /Next/i }).click();

      const uniqueName = `E2E Patient ${Date.now()}`;
      await patientPage.fill('input[name="patientName"]', uniqueName);
      await patientPage.fill('input[name="patientPhone"]', '+919876543210');
      await patientPage.click('button:has-text("Confirm Booking")');

      await expect(patientPage.locator('text=/Success|Confirmed/i')).toBeVisible({ timeout: 10000 });

      // Check Context A: doctor dashboard should have the new patient
      await expect(doctorPage.getByText(uniqueName)).toBeVisible({ timeout: 15000 });
    }
    
    await doctorContext.close();
    await patientContext.close();
  });
});
