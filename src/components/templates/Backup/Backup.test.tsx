import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Backup } from './Backup';

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  HomePageHeading: ({ title }: { title: string }) => <div data-testid="home-page-heading">{title}</div>,
  BackupMethodCard: () => <div data-testid="backup-method-card">Backup Method Card</div>,
  BackupNavigation: () => <div data-testid="backup-navigation">Backup Navigation</div>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  PageSubtitle: ({ title }: { title: string }) => <div data-testid="page-subtitle">{title}</div>,
}));

describe('Backup', () => {
  it('renders all main components', () => {
    render(<Backup />);

    expect(screen.getByTestId('page-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('home-page-heading')).toBeInTheDocument();
    expect(screen.getByTestId('page-subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('backup-method-card')).toBeInTheDocument();
    expect(screen.getByTestId('backup-navigation')).toBeInTheDocument();
  });

  it('renders heading with correct title', () => {
    render(<Backup />);

    expect(screen.getByText('Back up your pubky.')).toBeInTheDocument();
  });

  it('renders subtitle with correct text', () => {
    render(<Backup />);

    expect(screen.getByText('You need a backup to restore access to your account later.')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-wrapper');
    const children = Array.from(pageWrapper.children);

    expect(children).toHaveLength(4);
    expect(children[0]).toHaveAttribute('data-testid', 'home-page-heading');
    expect(children[1]).toHaveAttribute('data-testid', 'page-subtitle');
    expect(children[2]).toHaveAttribute('data-testid', 'backup-method-card');
    expect(children[3]).toHaveAttribute('data-testid', 'backup-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-wrapper');

    // All main components should be children of PageWrapper
    expect(pageWrapper).toContainElement(screen.getByTestId('home-page-heading'));
    expect(pageWrapper).toContainElement(screen.getByTestId('page-subtitle'));
    expect(pageWrapper).toContainElement(screen.getByTestId('backup-method-card'));
    expect(pageWrapper).toContainElement(screen.getByTestId('backup-navigation'));
  });

  it('renders without crashing', () => {
    const { container } = render(<Backup />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has correct component hierarchy', () => {
    render(<Backup />);

    // Verify the main wrapper exists
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();

    // Verify all expected child components exist
    const expectedComponents = ['home-page-heading', 'page-subtitle', 'backup-method-card', 'backup-navigation'];

    expectedComponents.forEach((componentTestId) => {
      expect(screen.getByTestId(componentTestId)).toBeInTheDocument();
    });
  });

  it('renders heading and subtitle before other components', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-wrapper');
    const heading = screen.getByTestId('home-page-heading');
    const subtitle = screen.getByTestId('page-subtitle');
    const methodCard = screen.getByTestId('backup-method-card');
    const navigation = screen.getByTestId('backup-navigation');

    const children = Array.from(pageWrapper.children);
    const headingIndex = children.indexOf(heading);
    const subtitleIndex = children.indexOf(subtitle);
    const methodCardIndex = children.indexOf(methodCard);
    const navigationIndex = children.indexOf(navigation);

    expect(headingIndex).toBeLessThan(subtitleIndex);
    expect(subtitleIndex).toBeLessThan(methodCardIndex);
    expect(methodCardIndex).toBeLessThan(navigationIndex);
  });
});
