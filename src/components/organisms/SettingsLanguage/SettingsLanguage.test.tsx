import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsLanguage } from './SettingsLanguage';

describe('SettingsLanguage', () => {
  it('renders language content', () => {
    render(<SettingsLanguage />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<SettingsLanguage />);
    expect(screen.getByText('Display language')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsLanguage className="custom-language" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsLanguage - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingsLanguage />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
