import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard } from './StatCard';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders label, value, and icon', () => {
    render(<StatCard label="Total Patients" value="1,234" icon={Users} />);
    
    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows positive trend arrow when provided', () => {
    render(<StatCard label="Patients" value="100" icon={Users} trend={{ value: '12%', isUp: true }} />);
    
    const trendText = screen.getByText((content) => content.includes('12%'));
    expect(trendText).toBeInTheDocument();
    expect(trendText.className).toContain('text-success');
  });

  it('shows negative trend arrow when provided', () => {
    render(<StatCard label="Patients" value="100" icon={Users} trend={{ value: '5%', isUp: false }} />);
    
    const trendText = screen.getByText((content) => content.includes('5%'));
    expect(trendText).toBeInTheDocument();
    expect(trendText.className).toContain('text-danger');
  });

  it('renders without trend', () => {
    render(<StatCard label="Patients" value="100" icon={Users} />);
    
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});
