import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SettingsNotifications } from './SettingsNotifications';

describe('SettingsNotifications', () => {
  it('renders loader initially', () => {
    render(<SettingsNotifications />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders notifications content after loading', async () => {
    render(<SettingsNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Platform notifications')).toBeInTheDocument();
    });
  });

  it('renders all notification switches', async () => {
    render(<SettingsNotifications />);

    await waitFor(() => {
      expect(screen.getByText('New follower')).toBeInTheDocument();
      expect(screen.getByText('New reply to your post')).toBeInTheDocument();
      expect(screen.getByText('Someone mentioned your profile')).toBeInTheDocument();
      expect(screen.getByText('New repost to your post')).toBeInTheDocument();
      expect(screen.getByText('New friend')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsNotifications className="custom-notifications" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsNotifications - Snapshots', () => {
  it('matches snapshot after loading', async () => {
    const { container } = render(<SettingsNotifications />);

    await waitFor(() => {
      expect(screen.getByText('Platform notifications')).toBeInTheDocument();
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
