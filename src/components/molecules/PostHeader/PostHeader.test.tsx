import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostHeader } from './PostHeader';

vi.mock('@/atoms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/atoms')>();
  return {
    ...actual,
    Avatar: ({ src, alt }: { src?: string; alt?: string }) => (
      <div data-testid="avatar" data-src={src} aria-label={alt} />
    ),
  };
});

vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    Clock: ({ className }: { className?: string }) => <div data-testid="clock" className={className} />,
  };
});

describe('PostHeader', () => {
  it('renders name, label and time', () => {
    render(<PostHeader avatarSrc="/a.png" displayName="Satoshi" label="label" timeLabel="15m" />);
    expect(screen.getByText('Satoshi')).toBeInTheDocument();
    expect(screen.getByText(/label/i)).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('clock')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<PostHeader avatarSrc="/a.png" displayName="Satoshi" label="label" timeLabel="15m" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
