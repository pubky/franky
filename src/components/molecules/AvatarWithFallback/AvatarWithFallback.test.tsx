import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AvatarWithFallback } from './AvatarWithFallback';

// Mock Atoms components
vi.mock('@/atoms', () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({
    src,
    alt,
    onError,
  }: {
    src: string;
    alt: string;
    onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  }) => <img data-testid="avatar-image" src={src} alt={alt} onError={onError} />,
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

// Mock libs - use real extractInitials
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
  };
});

describe('AvatarWithFallback', () => {
  const mockProps = {
    name: 'John Doe',
  };

  it('renders avatar image when avatarUrl is provided', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/avatar.jpg" />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatarImage).toHaveAttribute('alt', 'John Doe');
  });

  it('renders avatar fallback when avatarUrl is not provided', () => {
    render(<AvatarWithFallback {...mockProps} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
  });

  it('uses custom alt text when provided', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/avatar.jpg" alt="Custom alt text" />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('alt', 'Custom alt text');
  });

  it('uses name as alt text when alt is not provided', () => {
    render(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/avatar.jpg" />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toHaveAttribute('alt', 'John Doe');
  });

  it('applies className to avatar', () => {
    render(<AvatarWithFallback {...mockProps} className="custom-class" />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('custom-class');
  });

  it('applies fallbackClassName to fallback', () => {
    render(<AvatarWithFallback {...mockProps} fallbackClassName="fallback-class" />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveClass('fallback-class');
  });

  it('uses extractInitials for fallback when no avatarUrl', () => {
    render(<AvatarWithFallback {...mockProps} name="Alice Bob" />);

    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders with both className and fallbackClassName', () => {
    render(<AvatarWithFallback {...mockProps} className="avatar-class" fallbackClassName="fallback-class" />);

    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByTestId('avatar-fallback');

    expect(avatar).toHaveClass('avatar-class');
    expect(fallback).toHaveClass('fallback-class');
  });

  describe('Image Error Handling', () => {
    it('falls back to initials when image fails to load', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/broken-image.jpg" />);

      // Initially should show the image
      const avatarImage = screen.getByTestId('avatar-image');
      expect(avatarImage).toBeInTheDocument();

      // Simulate image load error
      fireEvent.error(avatarImage);

      // Should now show fallback with initials
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles error with custom fallbackClassName', () => {
      render(
        <AvatarWithFallback
          {...mockProps}
          avatarUrl="https://example.com/broken-image.jpg"
          fallbackClassName="error-fallback"
        />,
      );

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      const fallback = screen.getByTestId('avatar-fallback');
      expect(fallback).toHaveClass('error-fallback');
    });

    it('uses extractInitials correctly after image error', () => {
      render(<AvatarWithFallback name="Alice Bob Charlie" avatarUrl="https://example.com/broken-image.jpg" />);

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('does not show image when avatarUrl is empty string', () => {
      render(<AvatarWithFallback {...mockProps} avatarUrl="" />);

      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('maintains error state after rerender', () => {
      const { rerender } = render(
        <AvatarWithFallback {...mockProps} avatarUrl="https://example.com/broken-image.jpg" />,
      );

      const avatarImage = screen.getByTestId('avatar-image');
      fireEvent.error(avatarImage);

      // Rerender with same props
      rerender(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/broken-image.jpg" />);

      // Should still show fallback
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    });

    it('resets error state when avatarUrl changes', () => {
      const { rerender } = render(
        <AvatarWithFallback {...mockProps} avatarUrl="https://example.com/broken-image.jpg" />,
      );

      const firstImage = screen.getByTestId('avatar-image');
      fireEvent.error(firstImage);

      // Should show fallback
      expect(screen.queryByTestId('avatar-image')).not.toBeInTheDocument();
      expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();

      // Rerender with new avatarUrl
      rerender(<AvatarWithFallback {...mockProps} avatarUrl="https://example.com/new-image.jpg" />);

      // Should try new image
      expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
      expect(screen.queryByTestId('avatar-fallback')).not.toBeInTheDocument();
    });
  });
});

describe('AvatarWithFallback - Snapshots', () => {
  it('matches snapshot when avatarUrl is provided', () => {
    const { container } = render(
      <AvatarWithFallback name="John Doe" avatarUrl="https://example.com/avatar.jpg" className="size-16" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when avatarUrl is not provided', () => {
    const { container } = render(
      <AvatarWithFallback name="Jane Smith" className="size-16" fallbackClassName="text-2xl" />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom alt text', () => {
    const { container } = render(
      <AvatarWithFallback
        name="John Doe"
        avatarUrl="https://example.com/avatar.jpg"
        alt="Custom alt"
        className="size-16"
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
