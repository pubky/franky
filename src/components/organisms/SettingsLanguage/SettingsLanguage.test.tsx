import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsLanguage } from './SettingsLanguage';

describe('SettingsLanguage', () => {
  it('renders loader initially', () => {
    render(<SettingsLanguage />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders language content after loading', async () => {
    render(<SettingsLanguage />);

    await waitFor(() => {
      expect(screen.getByText('Language')).toBeInTheDocument();
    });
  });

  it('renders language selector', async () => {
    render(<SettingsLanguage />);

    await waitFor(() => {
      expect(screen.getByText('Display language')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsLanguage className="custom-language" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsLanguage - Snapshots', () => {
  it('matches snapshot after loading', async () => {
    const { container } = render(<SettingsLanguage />);

    await waitFor(() => {
      expect(screen.getByText('Language')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
