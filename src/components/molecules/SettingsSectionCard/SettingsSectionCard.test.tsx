import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { User } from 'lucide-react';

describe('SettingsSectionCard', () => {
  const defaultProps = {
    icon: User,
    title: 'Test Section',
    children: <div>Test content</div>,
  };

  it('renders with required props', () => {
    render(<SettingsSectionCard {...defaultProps} />);

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<SettingsSectionCard {...defaultProps} description="Test description" />);

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SettingsSectionCard {...defaultProps} className="custom-section" />);
    expect(container.firstChild).toHaveClass('custom-section');
  });

  it('renders title as h2 element', () => {
    render(<SettingsSectionCard {...defaultProps} />);
    const heading = screen.getByText('Test Section');
    expect(heading.tagName).toBe('H2');
  });

  it('renders description as p element', () => {
    render(<SettingsSectionCard {...defaultProps} description="Test description" />);
    const paragraph = screen.getByText('Test description');
    expect(paragraph.tagName).toBe('P');
  });
});

describe('SettingsSectionCard - Snapshots', () => {
  const defaultProps = {
    icon: User,
    title: 'Test Section',
    children: <div>Test content</div>,
  };

  it('matches snapshot with required props', () => {
    const { container } = render(<SettingsSectionCard {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with description', () => {
    const { container } = render(<SettingsSectionCard {...defaultProps} description="Test description" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(<SettingsSectionCard {...defaultProps} className="custom-section" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
