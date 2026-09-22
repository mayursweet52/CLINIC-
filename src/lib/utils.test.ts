import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatPhone, truncate, initials } from './utils';
import { addDays, subDays } from 'date-fns';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'm-4')).toBe('p-4 m-4');
      expect(cn('p-4', { 'm-4': true, 'hidden': false })).toBe('p-4 m-4');
      expect(cn('px-2 py-1', 'p-4')).toBe('p-4'); // twMerge resolves conflicts
    });
  });

  describe('formatCurrency', () => {
    it('formats 0 correctly', () => {
      expect(formatCurrency(0).replace(/\s/g, ' ')).toMatch(/₹\s?0/);
    });
    
    it('formats 1000 correctly', () => {
      expect(formatCurrency(1000).replace(/\s/g, ' ')).toMatch(/₹\s?1,000/);
    });

    it('formats 100000 correctly', () => {
      expect(formatCurrency(100000).replace(/\s/g, ' ')).toMatch(/₹\s?1,00,000/);
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1000).replace(/\s/g, ' ')).toMatch(/-₹\s?1,000/);
    });
  });

  describe('formatDate', () => {
    it('formats today correctly', () => {
      const today = new Date();
      // just check it doesn't throw and returns a string
      expect(typeof formatDate(today)).toBe('string');
      expect(formatDate(today)).toMatch(/\d{2} [A-Z][a-z]{2} \d{4}/);
    });

    it('formats past date correctly', () => {
      const past = new Date('2024-01-01');
      expect(formatDate(past)).toBe('01 Jan 2024');
    });
  });

  describe('formatPhone', () => {
    it('formats 10 digit number with +91', () => {
      expect(formatPhone('9876543210')).toBe('+91 98765 43210');
    });

    it('returns original if length is not 10', () => {
      expect(formatPhone('987')).toBe('987');
      expect(formatPhone('98765432101')).toBe('98765432101');
    });

    it('cleans non-digits before formatting', () => {
      expect(formatPhone('98-76-543-210')).toBe('+91 98765 43210');
    });
  });

  describe('truncate', () => {
    it('returns original string if short enough', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates and adds ellipsis if too long', () => {
      expect(truncate('hello world', 5)).toBe('hello...');
    });
    
    it('handles exact boundary', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });
  });

  describe('initials', () => {
    it('returns single letter for single word', () => {
      expect(initials('John')).toBe('J');
    });

    it('returns two letters for two words', () => {
      expect(initials('John Doe')).toBe('JD');
    });

    it('returns two letters for more than two words', () => {
      expect(initials('John Doe Smith')).toBe('JD');
    });
    
    it('handles lowercase input correctly', () => {
      expect(initials('john doe')).toBe('JD');
    });
  });
});
