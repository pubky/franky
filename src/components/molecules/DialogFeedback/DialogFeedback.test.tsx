import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DialogFeedback } from './DialogFeedback';

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
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    <img data-testid="avatar-image" src={src || undefined} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div data-testid="avatar-fallback">{children}</div>,
}));

describe('DialogFeedback', () => {
  it('renders with default props', () => {
    render(<DialogFeedback />);

    const dialog = screen.getByTestId('dialog');
    const trigger = screen.getByTestId('dialog-trigger');
    const content = screen.getByTestId('dialog-content');
    const header = screen.getByTestId('dialog-header');
    const title = screen.getByTestId('dialog-title');

    expect(dialog).toBeInTheDocument();
    expect(trigger).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('displays trigger content correctly', () => {
    render(<DialogFeedback />);

    const trigger = screen.getByText('What do you think about Pubky?');
    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe('P');
  });

  it('applies correct styling to trigger container', () => {
    render(<DialogFeedback />);

    const triggerContainer = screen.getAllByTestId('container')[0];
    expect(triggerContainer).toHaveClass('cursor-pointer');
    expect(triggerContainer).toHaveClass('flex');
    expect(triggerContainer).toHaveClass('flex-col');
    expect(triggerContainer).toHaveClass('gap-4');
    expect(triggerContainer).toHaveClass('p-6');
    expect(triggerContainer).toHaveClass('rounded-lg');
    expect(triggerContainer).toHaveClass('border');
    expect(triggerContainer).toHaveClass('border-dashed');
  });

  it('renders dialog title correctly', () => {
    render(<DialogFeedback />);

    const title = screen.getByTestId('dialog-title');
    expect(title).toHaveTextContent('Provide Feedback');
    expect(title.tagName).toBe('H2');
  });

  it('applies correct styling to dialog content', () => {
    render(<DialogFeedback />);

    const content = screen.getByTestId('dialog-content');
    expect(content).toHaveClass('sm:max-w-xl');
  });

  it('applies correct styling to dialog header', () => {
    render(<DialogFeedback />);

    const header = screen.getByTestId('dialog-header');
    expect(header).toHaveClass('pr-6');
  });

  it('renders avatar with correct styling', () => {
    render(<DialogFeedback />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('size-12');
  });

  it('renders avatar fallback with correct initials', () => {
    render(<DialogFeedback />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('JD');
  });

  it('renders avatar image with correct alt text', () => {
    render(<DialogFeedback />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('alt', 'John Doe');
    // When src is empty string, it becomes null in the DOM
    expect(avatarImage.getAttribute('src')).toBe(null);
  });

  it('applies correct styling to trigger typography', () => {
    render(<DialogFeedback />);

    const triggerTypography = screen.getByText('What do you think about Pubky?');
    expect(triggerTypography).toHaveAttribute('data-size', 'sm');
    expect(triggerTypography).toHaveClass('text-base');
    expect(triggerTypography).toHaveClass('text-muted-foreground');
    expect(triggerTypography).toHaveClass('font-medium');
  });

  it('trigger uses asChild prop correctly', () => {
    render(<DialogFeedback />);

    const trigger = screen.getByTestId('dialog-trigger');
    expect(trigger).toHaveAttribute('data-as-child', 'true');
  });

  it('maintains proper content structure', () => {
    render(<DialogFeedback />);

    const trigger = screen.getByText('What do you think about Pubky?');
    fireEvent.click(trigger);

    // Check that dialog content is rendered
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Provide Feedback');
    expect(screen.getByText('Input Feedback')).toBeInTheDocument();
  });

  it('renders feedback content sections', () => {
    render(<DialogFeedback />);

    // Check for content related to feedback
    expect(screen.getByText('Input Feedback')).toBeInTheDocument();
  });

  it('applies correct styling to content containers', () => {
    render(<DialogFeedback />);

    const contentContainers = screen.getAllByTestId('container');

    // First container (trigger) should have the trigger styling
    expect(contentContainers[0]).toHaveClass('cursor-pointer');

    // Find the container with h-full class (content container)
    const contentContainer = contentContainers.find((container) => container.className.includes('h-full'));
    expect(contentContainer).toHaveClass('h-full');
    expect(contentContainer).toHaveClass('pr-4');
    expect(contentContainer).toHaveClass('overflow-y-auto');
  });

  it('renders all required elements', () => {
    render(<DialogFeedback />);

    // Check all main elements are present
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getAllByTestId('typography')).toHaveLength(2);
  });
});
