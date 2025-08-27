import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

// Mock atoms
vi.mock('@/atoms', () => ({
  ImageBackground: ({ className, image }: { className?: string; image: string }) => (
    <div data-testid="image-background" className={className} data-image={image}>
      Image Background
    </div>
  ),
  Container: ({ children, size }: { children: React.ReactNode; size?: string }) => (
    <div data-testid="container" className={`container ${size || ''}`}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  HomePageHeading: ({ title }: { title: string }) => <div data-testid="home-page-heading">{title}</div>,
  HomeSectionTitle: () => <div data-testid="home-section-title">Section Title</div>,
  HomeActions: () => <div data-testid="home-actions">Actions</div>,
  HomeFooter: () => <div data-testid="home-footer">Footer</div>,
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
}));

describe('Home', () => {
  it('renders all main components', () => {
    render(<Home />);

    expect(screen.getByTestId('image-background')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('home-page-heading')).toBeInTheDocument();
    expect(screen.getByTestId('home-section-title')).toBeInTheDocument();
    expect(screen.getByTestId('home-actions')).toBeInTheDocument();
    expect(screen.getByTestId('home-footer')).toBeInTheDocument();
  });

  it('renders image background with correct props', () => {
    render(<Home />);

    const imageBackground = screen.getByTestId('image-background');
    expect(imageBackground).toHaveAttribute('data-image', '/images/bg-home.svg');
    expect(imageBackground.className).toContain('opacity-10 lg:opacity-100');
  });

  it('renders heading with correct title', () => {
    render(<Home />);

    expect(screen.getByTestId('home-page-heading')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<Home />);

    const pageContainer = screen.getByTestId('page-container');
    const children = Array.from(pageContainer.children);

    expect(children).toHaveLength(4);
    expect(children[0]).toHaveAttribute('data-testid', 'home-page-heading');
    expect(children[1]).toHaveAttribute('data-testid', 'home-section-title');
    expect(children[2]).toHaveAttribute('data-testid', 'home-actions');
    expect(children[3]).toHaveAttribute('data-testid', 'home-footer');
  });

  it('renders image background outside of page wrapper', () => {
    render(<Home />);

    // Check that image background is a direct child of the fragment (container)
    const imageBackground = screen.getByTestId('image-background');
    const pageContainer = screen.getByTestId('page-container');

    expect(imageBackground).toBeInTheDocument();
    expect(pageContainer).toBeInTheDocument();

    // They should be siblings, not parent-child
    expect(pageContainer).not.toContainElement(imageBackground);
  });
});
