import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './logo';

describe('Logo', () => {
  it('should render the logo with default styling', () => {
    render(<Logo />);

    const logoLink = screen.getByRole('link', { name: 'Franky' });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
    expect(logoLink).toHaveClass('font-bold', 'text-2xl', 'text-foreground');
  });

  it('should render with white text color', () => {
    render(<Logo textColor="white" />);

    const logoLink = screen.getByRole('link', { name: 'Franky' });
    expect(logoLink).toHaveClass('text-white');
    expect(logoLink).not.toHaveClass('text-foreground');
  });

  it('should apply custom className', () => {
    render(<Logo className="custom-class" />);

    const logoLink = screen.getByRole('link', { name: 'Franky' });
    expect(logoLink).toHaveClass('custom-class');
  });

  it('should have hover effect', () => {
    render(<Logo />);

    const logoLink = screen.getByRole('link', { name: 'Franky' });
    expect(logoLink).toHaveClass('hover:text-green-400', 'transition-colors');
  });

  it('should combine textColor and className props', () => {
    render(<Logo textColor="white" className="cursor-pointer" />);

    const logoLink = screen.getByRole('link', { name: 'Franky' });
    expect(logoLink).toHaveClass('text-white', 'cursor-pointer');
  });
});
