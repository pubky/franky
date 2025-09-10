import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DialogBackup } from './DialogBackup';

// Mock atoms
vi.mock('@/atoms', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="dialog-header" className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  Button: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <button data-testid="button" data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

// Mock Next.js Image
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
  }) => <img data-testid="image" src={src} alt={alt} width={width} height={height} className={className} />,
}));

describe('DialogBackup', () => {
  it('renders with correct structure', () => {
    render(<DialogBackup />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
  });

  it('renders trigger button with correct text', () => {
    render(<DialogBackup />);

    const triggerButton = screen.getByText('Backup');
    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton.tagName).toBe('BUTTON');
  });

  it('applies correct styling to trigger button', () => {
    render(<DialogBackup />);

    const triggerButton = screen.getByText('Backup');
    expect(triggerButton).toHaveClass('text-primary-foreground', 'hover:text-primary-foreground');
  });

  it('renders dialog title correctly', () => {
    render(<DialogBackup />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Back up your pubky');
    expect(title.tagName).toBe('H2');
  });

  it('renders description text', () => {
    render(<DialogBackup />);

    const description = screen.getByText(/Safely back up and store the secret seed/);
    expect(description).toBeInTheDocument();
  });

  it('renders three backup method cards', () => {
    render(<DialogBackup />);

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('renders recovery phrase card with correct content', () => {
    render(<DialogBackup />);

    expect(screen.getByText('Recovery phrase')).toBeInTheDocument();
    expect(screen.getAllByText('Continue')).toHaveLength(3);

    const noteImage = screen.getByAltText('Note');
    expect(noteImage).toHaveAttribute('src', '/images/note.png');
  });

  it('renders download encrypted file card with correct content', () => {
    render(<DialogBackup />);

    expect(screen.getByText('Download encrypted file')).toBeInTheDocument();

    const folderImage = screen.getByAltText('Folder');
    expect(folderImage).toHaveAttribute('src', '/images/folder.png');
  });

  it('renders export to Pubky Ring card with correct content', () => {
    render(<DialogBackup />);

    expect(screen.getByText('Export to Pubky Ring')).toBeInTheDocument();

    const keyringImage = screen.getByAltText('Keys');
    expect(keyringImage).toHaveAttribute('src', '/images/keyring.png');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogBackup />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl', 'gap-0');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogBackup />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('applies correct styling to cards', () => {
    render(<DialogBackup />);

    const cards = screen.getAllByTestId('card');
    cards.forEach((card) => {
      expect(card).toHaveClass('w-full', 'p-6', 'bg-card', 'rounded-lg', 'flex', 'flex-col', 'gap-6');
    });
  });

  it('applies correct styling to card titles', () => {
    render(<DialogBackup />);

    const cardTitles = screen.getAllByText(/Recovery phrase|Download encrypted file|Export to Pubky Ring/);
    cardTitles.forEach((title) => {
      expect(title).toHaveClass('text-base', 'font-bold', 'text-card-foreground', 'leading-none');
    });
  });

  it('applies correct styling to images', () => {
    render(<DialogBackup />);

    const images = screen.getAllByTestId('image');
    images.forEach((image) => {
      expect(image).toHaveClass('w-28', 'h-28');
    });
  });

  it('renders all required elements', () => {
    render(<DialogBackup />);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getAllByTestId('card')).toHaveLength(3);
    expect(screen.getAllByTestId('image')).toHaveLength(3);
    expect(screen.getAllByText('Continue')).toHaveLength(3);
  });
});
