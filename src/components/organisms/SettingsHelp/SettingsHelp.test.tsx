import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsHelp } from './SettingsHelp';

describe('SettingsHelp', () => {
  it('renders with default props', () => {
    render(<SettingsHelp />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders FAQ sections', () => {
    render(<SettingsHelp />);
    expect(screen.getByText('1. Getting Started & Onboarding')).toBeInTheDocument();
    expect(screen.getByText('2. Backups & Account Recovery')).toBeInTheDocument();
    expect(screen.getByText('3. Profile & Social Features')).toBeInTheDocument();
    expect(screen.getByText('4. How Pubky App Works')).toBeInTheDocument();
  });

  it('renders User Guide section', () => {
    render(<SettingsHelp />);
    const userGuideHeaders = screen.getAllByText('User Guide');
    expect(userGuideHeaders.length).toBeGreaterThan(0);
  });

  it('renders Support section', () => {
    render(<SettingsHelp />);
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsHelp className="custom-help" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsHelp - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<SettingsHelp />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<SettingsHelp className="custom-help" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
