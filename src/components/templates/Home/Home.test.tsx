import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

// Mock atoms
vi.mock('@/atoms', () => ({
  ImageBackground: ({ className, image, mobileImage }: { className?: string; image: string; mobileImage?: string }) => (
    <div data-testid="image-background" className={className} data-image={image} data-mobile-image={mobileImage}>
      Image Background
    </div>
  ),
  Container: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="container" className={`container ${size || ''} ${className || ''}`}>
      {children}
    </div>
  ),
}));

// Mock molecules
vi.mock('@/molecules', () => ({
  PageContainer: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <div data-testid="page-container" className={`page-container ${size || ''} ${className || ''}`}>
      {children}
    </div>
  ),
  HomePageHeading: () => <div data-testid="home-page-heading">Home Page Heading</div>,
  HomeSectionTitle: () => <div data-testid="home-section-title">Section Title</div>,
  HomeActions: () => <div data-testid="home-actions">Actions</div>,
  HomeFooter: () => <div data-testid="home-footer">Footer</div>,
}));

describe('Home', () => {
  it('renders all main components', () => {
    render(<Home />);

    expect(screen.getByTestId('image-background')).toBeInTheDocument();
    expect(screen.getByTestId('container')).toBeInTheDocument();
    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('home-page-heading')).toBeInTheDocument();
    expect(screen.getByTestId('home-section-title')).toBeInTheDocument();
    expect(screen.getByTestId('home-actions')).toBeInTheDocument();
    expect(screen.getByTestId('home-footer')).toBeInTheDocument();
  });

  it('renders image background with correct props', () => {
    render(<Home />);

    const imageBackground = screen.getByTestId('image-background');
    expect(imageBackground).toHaveAttribute('data-image', '/images/bg-home.svg');
    expect(imageBackground).toHaveAttribute('data-mobile-image', '/images/bg-home-mobile.svg');
  });

  it('renders container with correct props', () => {
    render(<Home />);

    const container = screen.getByTestId('container');
    expect(container).toHaveClass('container container px-6');
  });

  it('renders page container with correct props', () => {
    render(<Home />);

    const pageContainer = screen.getByTestId('page-container');
    expect(pageContainer).toHaveClass('page-container narrow items-start mx-0 flex flex-col gap-6');
  });

  it('renders components in correct order within page container', () => {
    render(<Home />);

    const pageContainer = screen.getByTestId('page-container');
    const children = Array.from(pageContainer.children);

    expect(children).toHaveLength(4);
    expect(children[0]).toHaveAttribute('data-testid', 'home-page-heading');
    expect(children[1]).toHaveAttribute('data-testid', 'home-section-title');
    expect(children[2]).toHaveAttribute('data-testid', 'home-actions');
    expect(children[3]).toHaveAttribute('data-testid', 'home-footer');
  });

  it('renders image background outside of page container', () => {
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

describe('Home - Snapshots', () => {
  it('matches snapshot for default Home', () => {
    const { container } = render(<Home />);
    expect(container).toMatchSnapshot();
  });
});
