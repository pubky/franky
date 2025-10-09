import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsMutedUsers } from './SettingsMutedUsers';

describe('SettingsMutedUsers', () => {
  it('renders with default props', () => {
    render(<SettingsMutedUsers />);
    expect(screen.getByText('Muted users')).toBeInTheDocument();
  });

  it('renders empty state when no muted users', () => {
    render(<SettingsMutedUsers />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsMutedUsers className="custom-muted" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('SettingsMutedUsers - Snapshots', () => {
  it('matches snapshot with no muted users', () => {
    const { container } = render(<SettingsMutedUsers />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<SettingsMutedUsers className="custom-muted" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
