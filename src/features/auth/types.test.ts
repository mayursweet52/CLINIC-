import { describe, it, expect } from 'vitest';
import { LoginSchema } from './types';

describe('LoginSchema', () => {
  it('passes valid email and password', () => {
    const valid = { email: 'test@example.com', password: 'password123' };
    const result = LoginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('fails with invalid email', () => {
    const invalidEmail = { email: 'testexample.com', password: 'password123' };
    const result = LoginSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });

  it('fails with password less than 6 characters', () => {
    const invalidPassword = { email: 'test@example.com', password: 'pass' };
    const result = LoginSchema.safeParse(invalidPassword);
    expect(result.success).toBe(false);
  });

  it('fails with empty fields', () => {
    const empty = { email: '', password: '' };
    const result = LoginSchema.safeParse(empty);
    expect(result.success).toBe(false);
  });
});
