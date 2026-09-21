import { test, expect } from '@playwright/test';
import { SignJWT } from 'jose';

test.describe('Dashboards', () => {
  test('Receptionist dashboard loads properly', async ({ page, context }) => {
    // Generate valid receptionist auth token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const token = await new SignJWT({ userId: 'rec-1', name: 'Receptionist User', role: 'receptionist', orgId: 'org-1' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(secret);

    await context.addCookies([{
      name: 'auth_token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    await page.goto('/reception');
    // Ensure the main header is present
    await expect(page.locator('h1', { hasText: /Front Desk/i })).toBeVisible({ timeout: 10000 });
    // It should either show 'Queue is clear' or 'Awaiting Payment'
    const queueClear = page.locator('text=Queue is clear');
    const awaitingPayment = page.locator('text=Awaiting Payment');
    
    await expect(queueClear.or(awaitingPayment)).toBeVisible({ timeout: 10000 });
  });
});
