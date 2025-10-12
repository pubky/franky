import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsNotifications } from './SettingsNotifications';

describe('SettingsNotifications', () => {
  it('renders notifications content', () => {
    render(<SettingsNotifications />);
    expect(screen.getByText('Platform notifications')).toBeInTheDocument();
  });

  it('renders all notification switches', () => {
    render(<SettingsNotifications />);
    expect(screen.getByText('New follower')).toBeInTheDocument();
    expect(screen.getByText('New reply to your post')).toBeInTheDocument();
    expect(screen.getByText('Someone mentioned your profile')).toBeInTheDocument();
    expect(screen.getByText('New repost to your post')).toBeInTheDocument();
    expect(screen.getByText('New friend')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsNotifications className="custom-notifications" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsNotifications - Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<SettingsNotifications />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
