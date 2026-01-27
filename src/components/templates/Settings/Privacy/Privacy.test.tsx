import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Privacy } from './Privacy';

describe('Privacy', () => {
  it('renders privacy content', () => {
    render(<Privacy />);
    expect(screen.getByText('Privacy & Safety')).toBeInTheDocument();
  });

  it('renders privacy switches', () => {
    render(<Privacy />);
    expect(screen.getByText('Show confirmation before redirecting')).toBeInTheDocument();
    expect(screen.getByText('Blur censored posts or profile pictures')).toBeInTheDocument();
  });
});

describe('Privacy - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Privacy />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
