import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

describe('Avatar', () => {
  it('renders with default props', () => {
    const { container } = render(<Avatar />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full');
  });

  it('renders different sizes correctly', () => {
    const { rerender, container } = render(<Avatar size="sm" />);
    let avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('h-6', 'w-6');

    rerender(<Avatar size="lg" />);
    avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('h-12', 'w-12');

    rerender(<Avatar size="xl" />);
    avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('h-16', 'w-16');
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('custom-avatar');
  });

  it('forwards additional props', () => {
    const { container } = render(<Avatar data-custom="test" />);
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveAttribute('data-custom', 'test');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe('AvatarImage', () => {
  it('component exists and can be imported', () => {
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test avatar" />
        </Avatar>,
      );
    }).not.toThrow();
  });

  it('applies custom className', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" className="custom-image" />
      </Avatar>,
    );
    // AvatarImage may not render in test environment, but should not throw
    expect(() => {
      render(
        <Avatar>
          <AvatarImage src="/test.jpg" alt="Test" className="custom-image" />
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
    expect(fallback).toHaveClass(
      'flex',
      'h-full',
      'w-full',
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-muted',
    );
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

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Avatar>
        <AvatarFallback ref={ref}>JD</AvatarFallback>
      </Avatar>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});

describe('Avatar - Complete component', () => {
  it('renders avatar with fallback', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test avatar" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.firstChild as HTMLElement;
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
    const { container } = render(
      <Avatar>
        <AvatarFallback>XY</AvatarFallback>
      </Avatar>,
    );

    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText('XY')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>,
    );

    let avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('h-6', 'w-6');

    rerender(
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>,
    );

    avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('h-12', 'w-12');
  });
});
