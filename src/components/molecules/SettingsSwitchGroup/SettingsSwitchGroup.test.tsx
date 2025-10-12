import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsSwitchGroup } from './SettingsSwitchGroup';

describe('SettingsSwitchGroup', () => {
  it('renders with children', () => {
    render(
      <SettingsSwitchGroup>
        <div>Child 1</div>
        <div>Child 2</div>
      </SettingsSwitchGroup>,
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SettingsSwitchGroup className="custom-group">
        <div>Content</div>
      </SettingsSwitchGroup>,
    );
    expect(container.firstChild).toHaveClass('custom-group');
  });
});

describe('SettingsSwitchGroup - Snapshots', () => {
  it('matches snapshot with children', () => {
    const { container } = render(
      <SettingsSwitchGroup>
        <div>Child 1</div>
        <div>Child 2</div>
      </SettingsSwitchGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <SettingsSwitchGroup className="custom-group">
        <div>Content</div>
      </SettingsSwitchGroup>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
