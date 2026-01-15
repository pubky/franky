import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormInfoBox } from './FormInfoBox';

describe('FormInfoBox', () => {
  it('renders children', () => {
    render(<FormInfoBox>Test content</FormInfoBox>);

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders with correct styling classes', () => {
    const { container } = render(<FormInfoBox>Content</FormInfoBox>);
    const box = container.firstChild as HTMLElement;

    expect(box).toHaveClass('rounded-lg');
    expect(box).toHaveClass('bg-muted');
    expect(box).toHaveClass('p-4');
  });
});

describe('FormInfoBox - Snapshots', () => {
  it('matches snapshot for default state', () => {
    const { container } = render(<FormInfoBox>Test info content</FormInfoBox>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
