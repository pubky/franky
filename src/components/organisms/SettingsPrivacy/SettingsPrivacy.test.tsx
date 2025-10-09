import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsPrivacy } from './SettingsPrivacy';

describe('SettingsPrivacy', () => {
  it('renders loader initially', () => {
    render(<SettingsPrivacy />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders privacy content after loading', async () => {
    render(<SettingsPrivacy />);

    await waitFor(() => {
      expect(screen.getByText('Privacy and Safety')).toBeInTheDocument();
    });
  });

  it('renders privacy switches', async () => {
    render(<SettingsPrivacy />);

    await waitFor(() => {
      expect(screen.getByText('Show confirmation before redirecting')).toBeInTheDocument();
      expect(screen.getByText('Blur censored posts or profile pictures')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsPrivacy className="custom-privacy" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsPrivacy - Snapshots', () => {
  it('matches snapshot after loading', async () => {
    const { container } = render(<SettingsPrivacy />);

    await waitFor(() => {
      expect(screen.getByText('Privacy and Safety')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
