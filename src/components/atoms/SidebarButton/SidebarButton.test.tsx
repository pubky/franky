import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarButton } from './SidebarButton';
import { FileText, LockKeyhole, Users } from 'lucide-react';

describe('SidebarButton', () => {
  it('renders with default props', () => {
    render(<SidebarButton icon={FileText}>Test Button</SidebarButton>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Button');
    expect(button).toHaveClass(
      'w-full',
      'flex',
      'items-center',
      'justify-center',
      'gap-2',
      'py-2',
      'px-4',
      'rounded-full',
      'border',
      'border-border',
      'bg-white/5',
      'hover:bg-white/10',
      'cursor-pointer',
      'transition-colors',
    );
  });

  it('renders with different icons', () => {
    const { rerender } = render(<SidebarButton icon={FileText}>File Button</SidebarButton>);
    let button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();

    rerender(<SidebarButton icon={LockKeyhole}>Lock Button</SidebarButton>);
    button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveTextContent('Lock Button');

    rerender(<SidebarButton icon={Users}>Users Button</SidebarButton>);
    button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
    expect(button).toHaveTextContent('Users Button');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(
      <SidebarButton icon={FileText} onClick={handleClick}>
        Click me
      </SidebarButton>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('SidebarButton - Snapshots', () => {
  it('matches snapshot with FileText icon', () => {
    const { container } = render(<SidebarButton icon={FileText}>Terms of service</SidebarButton>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with LockKeyhole icon', () => {
    const { container } = render(<SidebarButton icon={LockKeyhole}>Privacy policy</SidebarButton>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with Users icon', () => {
    const { container } = render(<SidebarButton icon={Users}>See all</SidebarButton>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <SidebarButton icon={FileText} className="custom-class">
        Custom Button
      </SidebarButton>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with complex children', () => {
    const { container } = render(
      <SidebarButton icon={FileText}>
        <span>Complex</span> <strong>Content</strong>
      </SidebarButton>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with additional props', () => {
    const { container } = render(
      <SidebarButton icon={FileText} data-testid="test" aria-label="Test button">
        Test Button
      </SidebarButton>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
