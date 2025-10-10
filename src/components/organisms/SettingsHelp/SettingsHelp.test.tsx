import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsHelp } from './SettingsHelp';

describe('SettingsHelp', () => {
  it('renders with default props', () => {
    render(<SettingsHelp />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(<SettingsHelp />);
    expect(screen.getByText('How can I update my profile information?')).toBeInTheDocument();
    expect(screen.getByText('How can I delete my posts?')).toBeInTheDocument();
    expect(screen.getByText('How can I mute someone?')).toBeInTheDocument();
    expect(screen.getByText('How can I restore my account?')).toBeInTheDocument();
    expect(screen.getByText('How is Pubky different from other social platforms?')).toBeInTheDocument();
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
