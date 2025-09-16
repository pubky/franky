/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img src={src} alt={alt} width={width} height={height} className={className} data-testid="logo-image" />,
}));

describe('Logo', () => {
  it('renders with default src', () => {
    render(<Logo />);

    const container = screen.getByTestId('logo-image').parentElement;
    const image = screen.getByTestId('logo-image');

    expect(container).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/pubky-logo.svg');
  });
});

describe('Logo - Snapshots', () => {
  it('matches snapshot for default Logo', () => {
    const { container } = render(<Logo />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Logo with custom dimensions', () => {
    const { container } = render(<Logo width={200} height={80} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for Logo with custom className', () => {
    const { container } = render(<Logo className="custom-logo-style" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
