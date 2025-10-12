import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsPrivacy } from './SettingsPrivacy';

describe('SettingsPrivacy', () => {
  it('renders privacy content', () => {
    render(<SettingsPrivacy />);
    expect(screen.getByText('Privacy and Safety')).toBeInTheDocument();
  });

  it('renders privacy switches', () => {
    render(<SettingsPrivacy />);
    expect(screen.getByText('Show confirmation before redirecting')).toBeInTheDocument();
    expect(screen.getByText('Blur censored posts or profile pictures')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsPrivacy className="custom-privacy" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsPrivacy - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingsPrivacy />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
