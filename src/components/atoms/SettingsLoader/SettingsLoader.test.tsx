import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SettingsLoader } from './SettingsLoader';

describe('SettingsLoader', () => {
  it('renders with default props', () => {
    const { container } = render(<SettingsLoader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsLoader className="custom-loader" />);
    expect(container.firstChild).toHaveClass('custom-loader');
  });

  it('renders skeleton elements', () => {
    const { container } = render(<SettingsLoader />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe('SettingsLoader - Snapshots', () => {
  it('matches snapshot with default props', () => {
    const { container } = render(<SettingsLoader />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<SettingsLoader className="custom-loader" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
