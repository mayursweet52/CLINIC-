import { test, expect } from '@playwright/test';

test.describe('API Route Authorization', () => {
  test('Unauthenticated request to /api/patients should return 401', async ({ request }) => {
    // Making a request without x-org-id or auth cookie
    const response = await request.get('/api/patients');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('Public routes should return 200', async ({ request }) => {
    const response = await request.get('/api/public/hospitals');
    expect(response.status()).toBe(200);
  });
});
