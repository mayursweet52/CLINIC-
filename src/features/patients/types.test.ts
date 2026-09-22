import { describe, it, expect } from 'vitest';
import { PatientSchema } from './types';

describe('PatientSchema', () => {
  const validData = {
    name: 'Jane Doe',
    phone: '+919876543210',
    age: 30,
    gender: 'FEMALE' as const,
  };

  it('passes with valid patient data', () => {
    const result = PatientSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails with short name', () => {
    const invalid = { ...validData, name: 'A' };
    const result = PatientSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails with invalid age', () => {
    const invalid = { ...validData, age: -1 };
    const result = PatientSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
  
  it('fails with invalid gender', () => {
    const invalid = { ...validData, gender: 'UNKNOWN' };
    const result = PatientSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
