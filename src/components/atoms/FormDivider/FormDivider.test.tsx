import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FormDivider } from './FormDivider';

describe('FormDivider', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<FormDivider />);
    const divider = container.firstChild as HTMLElement;

    expect(divider).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with correct styling classes', () => {
    const { container } = render(<FormDivider />);
    const divider = container.firstChild as HTMLElement;

    expect(divider).toHaveClass('my-3');
    expect(divider).toHaveClass('h-px');
    expect(divider).toHaveClass('w-full');
    expect(divider).toHaveClass('bg-border');
  });
});

describe('FormDivider - Snapshots', () => {
  it('matches snapshot for default state', () => {
    const { container } = render(<FormDivider />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
