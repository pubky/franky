import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MutedUsers } from './MutedUsers';

describe('MutedUsers', () => {
  it('renders with default props', () => {
    render(<MutedUsers />);
    expect(screen.getByText('Muted users')).toBeInTheDocument();
  });

  it('renders empty state when no muted users', () => {
    render(<MutedUsers />);
    expect(screen.getByText('No muted users yet')).toBeInTheDocument();
  });
});

describe('MutedUsers - Snapshots', () => {
  it('matches snapshot with no muted users', () => {
    const { container } = render(<MutedUsers />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
