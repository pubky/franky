/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackupMethodCard } from './BackupMethodCard';

// Mock molecules and atoms
vi.mock('@/molecules', () => ({
  ContentCard: ({ children, image }: { children: React.ReactNode; image?: { src: string; alt: string } }) => (
    <div data-testid="content-card">
      {image && <img src={image.src} alt={image.alt} data-testid="card-image" />}
      {children}
    </div>
  ),
  PopoverPublicKey: () => <div data-testid="popover-public-key">PopoverPublicKey</div>,
}));

vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="typography" className={className}>
      {children}
    </p>
  ),
  Heading: ({ children, level, size }: { children: React.ReactNode; level?: number; size?: string }) => (
    <div data-testid={`heading-${level}`} data-size={size}>
      {children}
    </div>
  ),
}));

describe('BackupMethodCard', () => {
  it('should render without crashing', () => {
    render(<BackupMethodCard />);
    expect(screen.getByTestId('content-card')).toBeInTheDocument();
  });

  it('should display the correct heading', () => {
    render(<BackupMethodCard />);
    expect(screen.getByTestId('heading-3')).toHaveTextContent('Choose backup method');
  });

  it('should display the backup description text', () => {
    render(<BackupMethodCard />);
    expect(screen.getByTestId('typography')).toHaveTextContent(
      'Safely back up and store the secret seed for your pubky. Which backup method do you prefer? You can also choose to do this later.',
    );
  });

  it('should render the shield image with correct attributes', () => {
    render(<BackupMethodCard />);
    const image = screen.getByTestId('card-image');
    expect(image).toHaveAttribute('src', '/images/shield.png');
    expect(image).toHaveAttribute('alt', 'Shield');
  });

  it('should render the PopoverPublicKey component', () => {
    render(<BackupMethodCard />);
    expect(screen.getByTestId('popover-public-key')).toBeInTheDocument();
  });

  it('should render containers with correct structure', () => {
    render(<BackupMethodCard />);
    const containers = screen.getAllByTestId('container');
    expect(containers).toHaveLength(2);
    expect(containers[0]).toHaveClass('items-center gap-1 flex-row');
    expect(containers[1]).toHaveClass('flex-col gap-3');
  });
});
