import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    render(<Avatar data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('relative', 'flex', 'size-8', 'shrink-0', 'overflow-hidden', 'rounded-full');
    expect(avatar).toHaveAttribute('data-slot', 'avatar');
  });

  it('applies custom className', () => {
    render(<Avatar className="custom-avatar" data-testid="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('custom-avatar');
  });

  it('forwards additional props', () => {
    render(<Avatar data-testid="avatar" data-custom="test" />);
    const avatar = screen.getByTestId('avatar');
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
      <Avatar data-testid="avatar">
        <AvatarImage src="/test.jpg" alt="Test avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    const avatar = screen.getByTestId('avatar');
    const fallback = screen.getByText('JD');

    expect(avatar).toBeInTheDocument();
    expect(fallback).toBeInTheDocument();
  });

  it('shows fallback when image fails to load', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarImage src="/invalid.jpg" alt="Invalid" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>,
    );

    // The fallback should be rendered
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('renders without errors when only fallback is provided', () => {
    render(
      <Avatar data-testid="avatar">
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByText('XY')).toBeInTheDocument();
  });
});
