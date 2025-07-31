import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResponsiveSection } from './ResponsiveSection';

describe('ResponsiveSection', () => {
  it('renders with default props', () => {
    render(<ResponsiveSection />);

    // Should render a div even without content
    const container = document.querySelector('div');
    expect(container).toBeInTheDocument();
  });

  it('renders desktop content when provided', () => {
    render(<ResponsiveSection desktop={<div>Desktop content</div>} />);

    const desktopContent = screen.getByText('Desktop content');
    expect(desktopContent).toBeInTheDocument();
    expect(desktopContent.parentElement).toHaveClass('hidden', 'md:flex', 'flex-col', 'gap-6');
  });

  it('renders mobile content when provided', () => {
    render(<ResponsiveSection mobile={<div>Mobile content</div>} />);

    const mobileContent = screen.getByText('Mobile content');
    expect(mobileContent).toBeInTheDocument();
    expect(mobileContent.parentElement).toHaveClass('flex', 'md:hidden', 'flex-col', 'gap-6');
  });

  it('renders both desktop and mobile content', () => {
    render(<ResponsiveSection desktop={<div>Desktop content</div>} mobile={<div>Mobile content</div>} />);

    expect(screen.getByText('Desktop content')).toBeInTheDocument();
    expect(screen.getByText('Mobile content')).toBeInTheDocument();
  });

  it('applies custom className to root container', () => {
    render(<ResponsiveSection className="custom-responsive" desktop={<div>Content</div>} />);

    const container = screen.getByText('Content').parentElement?.parentElement;
    expect(container).toHaveClass('custom-responsive');
  });

  it('applies custom desktop className', () => {
    render(<ResponsiveSection desktop={<div>Desktop content</div>} desktopClassName="custom-desktop" />);

    const desktopContent = screen.getByText('Desktop content');
    expect(desktopContent.parentElement).toHaveClass('custom-desktop');
  });

  it('applies custom mobile className', () => {
    render(<ResponsiveSection mobile={<div>Mobile content</div>} mobileClassName="custom-mobile" />);

    const mobileContent = screen.getByText('Mobile content');
    expect(mobileContent.parentElement).toHaveClass('custom-mobile');
  });
});
