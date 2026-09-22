import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders correctly with given status', () => {
    render(<StatusBadge status="completed" />);
    const badge = screen.getByText('completed');
    expect(badge).toBeInTheDocument();
  });

  it('renders aria-label correctly', () => {
    render(<StatusBadge status="cancelled" />);
    const badge = screen.getByLabelText('Status: cancelled');
    expect(badge).toBeInTheDocument();
  });

  it('renders dot by default', () => {
    render(<StatusBadge status="scheduled" />);
    // The dot is a span before the text
    const badge = screen.getByText('scheduled');
    expect(badge.querySelector('span')).toBeInTheDocument();
  });

  it('does not render dot when showDot is false', () => {
    render(<StatusBadge status="scheduled" showDot={false} />);
    const badge = screen.getByText('scheduled');
    expect(badge.querySelector('span')).not.toBeInTheDocument();
  });
  
  it('replaces dashes with spaces in text', () => {
    render(<StatusBadge status="in-progress" />);
    expect(screen.getByText('in progress')).toBeInTheDocument();
  });
});
