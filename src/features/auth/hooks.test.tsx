import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './hooks';
import { authApi } from './api';
import React from 'react';

vi.mock('./api', () => ({
  authApi: {
    login: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('calls authApi.login and sets query data on success', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test', role: 'admin' };
    (authApi.login as any).mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'test@example.com', password: 'password123' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(queryClient.getQueryData(['me'])).toEqual(mockUser);
  });
});
