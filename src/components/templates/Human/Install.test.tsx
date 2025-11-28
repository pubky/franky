import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Human } from './Human';

// Mock molecules
vi.mock('@/molecules', async () => {
  const actual = await vi.importActual('@/molecules');
  return {
    ...actual,
    HumanHeader: () => <div data-testid="human-header">Human Header</div>,
    SmsVerificationCard: () => <div data-testid="sms-verification-card">SMS Verification Card</div>,
    InstallFooter: () => <div data-testid="install-footer">Install Footer</div>,
    InstallNavigation: () => <div data-testid="install-navigation">Install Navigation</div>,
  };
});

describe('Human template', () => {
  it('renders all main components', () => {
    render(<Human />);

    expect(screen.getByTestId('human-header')).toBeInTheDocument();
    expect(screen.getByTestId('sms-verification-card')).toBeInTheDocument();
    expect(screen.getByTestId('install-footer')).toBeInTheDocument();
    expect(screen.getByTestId('install-navigation')).toBeInTheDocument();
  });

  it('renders content with correct testId', () => {
    render(<Human />);

    expect(screen.getByTestId('install-content')).toBeInTheDocument();
  });

  it('renders navigation in correct container', () => {
    const { container } = render(<Human />);

    const navContainer = container.querySelector('.onboarding-nav');
    expect(navContainer).toBeInTheDocument();
    expect(navContainer).toContainElement(screen.getByTestId('install-navigation'));
  });
});

describe('Human template - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Human />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
