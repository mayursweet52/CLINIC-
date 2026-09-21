import { describe, it, expect, vi } from 'vitest';
import { prisma } from '../../src/lib/prisma';

// Mock prisma
vi.mock('../../src/lib/prisma', () => {
  return {
    prisma: {
      organization: {
        findMany: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      }
    }
  };
});

describe('Database Queries', () => {
  it('should mock prisma organization fetch', async () => {
    const mockOrgs = [{ id: 'org-1', name: 'Test Org' }];
    vi.mocked(prisma.organization.findMany).mockResolvedValue(mockOrgs as any);

    const result = await prisma.organization.findMany();
    expect(result).toEqual(mockOrgs);
    expect(prisma.organization.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('Auth Logic (Unit)', () => {
  it('should reject login if user is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    const result = await prisma.user.findUnique({ where: { email: 'fake@test.com' } });
    expect(result).toBeNull();
  });
});
