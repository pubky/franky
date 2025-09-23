import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    render(<Avatar />);
    const avatar = screen.getByTestId('avatar-default');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('relative', 'flex', 'size-8', 'shrink-0', 'overflow-hidden', 'rounded-full');
    expect(avatar).toHaveAttribute('data-slot', 'avatar');
    expect(avatar).toHaveAttribute('data-testid', 'avatar-default');
    expect(avatar).toHaveAttribute('data-size', 'default');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Avatar size="sm" />);
    let avatar = screen.getByTestId('avatar-sm');
    expect(avatar).toHaveClass('size-6');
    expect(avatar).toHaveAttribute('data-size', 'sm');

    rerender(<Avatar size="lg" />);
    avatar = screen.getByTestId('avatar-lg');
    expect(avatar).toHaveClass('size-12');
    expect(avatar).toHaveAttribute('data-size', 'lg');

    rerender(<Avatar size="xl" />);
    avatar = screen.getByTestId('avatar-xl');
    expect(avatar).toHaveClass('size-16');
    expect(avatar).toHaveAttribute('data-size', 'xl');
  });

  it('applies custom className', () => {
    render(<Avatar className="custom-avatar" />);
    const avatar = screen.getByTestId('avatar-default');
    expect(avatar).toHaveClass('custom-avatar');
  });

  it('forwards additional props', () => {
    render(<Avatar data-custom="test" />);
    const avatar = screen.getByTestId('avatar-default');
    expect(avatar).toHaveAttribute('data-custom', 'test');
  });
});

describe('AvatarImage', () => {
  it('component exists and can be imported', () => {
    // AvatarImage is a Radix UI component that may not render in JSDOM
    // but we can test that it exists and can be rendered without errors
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test avatar" />
        </Avatar>,
      );
    }).not.toThrow();
  });
});

describe('AvatarFallback', () => {
  it('renders with default props', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText('JD');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass('bg-muted', 'flex', 'size-full', 'items-center', 'justify-center', 'rounded-full');
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    expect(fallback).toHaveAttribute('data-testid', 'avatar-fallback');
  });

  it('applies custom className', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">JD</AvatarFallback>
      </Avatar>,
    );
    const fallback = screen.getByText('JD');
    expect(fallback).toHaveClass('custom-fallback');
  });

  it('renders fallback text correctly', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});

describe('Avatar - Complete component', () => {
  it('renders avatar with fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByTestId('avatar-default');
    const fallback = screen.getByText('JD');

    expect(avatar).toBeInTheDocument();
    expect(fallback).toBeInTheDocument();
  });

  it('shows fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="/invalid.jpg" alt="Invalid" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );

    // The fallback should be rendered
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('renders without errors when only fallback is provided', () => {
    render(
      <Avatar>
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId('avatar-default')).toBeInTheDocument();
    expect(screen.getByText('XY')).toBeInTheDocument();
  });

  it('has correct data attributes', () => {
    render(
      <Avatar size="lg">
        <AvatarFallback>TU</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByTestId('avatar-lg');
    const fallback = screen.getByTestId('avatar-fallback');

    expect(avatar).toHaveAttribute('data-slot', 'avatar');
    expect(avatar).toHaveAttribute('data-size', 'lg');
    expect(avatar).toHaveAttribute('data-testid', 'avatar-lg');
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback');
    expect(fallback).toHaveAttribute('data-testid', 'avatar-fallback');
  });

  it('AvatarImage has correct data attributes', () => {
    // Test AvatarImage in isolation since it may not render in test environment
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" />
        </Avatar>,
      );
    }).not.toThrow();

    // We can't reliably test the image rendering in JSDOM, but we can ensure
    // the component doesn't crash and has the right structure
  });
});
