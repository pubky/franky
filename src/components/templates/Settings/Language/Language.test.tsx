import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Language } from './Language';
import { normaliseRadixIds } from '@/libs/utils/utils';

describe('Language', () => {
  it('renders language content', () => {
    render(<Language />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<Language />);
    expect(screen.getByText('Display language')).toBeInTheDocument();
    expect(screen.getByText('US English')).toBeInTheDocument();
  });
});

// Note: Radix UI generates incremental IDs (radix-«r0», radix-«r1», etc.) for aria-controls attributes.
// These IDs can vary between test runs depending on test execution order.
// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('Language - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Language />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
