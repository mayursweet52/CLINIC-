import { describe, it, expect } from 'vitest';
import { BookingSchema } from './types';

describe('BookingSchema', () => {
  const validData = {
    departmentId: 'dept_1',
    doctorId: 'doc_1',
    date: '2024-01-01',
    timeSlot: '10:00 AM',
    patientName: 'John Doe',
    patientPhone: '+919876543210',
    reason: 'Fever'
  };

  it('passes with valid booking data', () => {
    const result = BookingSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('fails with empty name', () => {
    const invalid = { ...validData, patientName: '' };
    const result = BookingSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('fails with invalid phone number', () => {
    const invalid = { ...validData, patientPhone: '123' };
    const result = BookingSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
  
  it('fails with missing required fields', () => {
    const invalid = { patientName: 'John Doe' };
    const result = BookingSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
