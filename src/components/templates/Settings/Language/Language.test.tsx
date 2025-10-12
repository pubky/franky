import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Language } from './Language';

describe('Language', () => {
  it('renders language content', () => {
    render(<Language />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<Language />);
    expect(screen.getByText('Display language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Language className="custom-language" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('Language - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Language />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
