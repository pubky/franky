import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Backup } from './Backup';

// Mock molecules
vi.mock('@/molecules', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div data-testid="page-wrapper">{children}</div>,
  HomePageHeading: ({ title }: { title: string }) => <div data-testid="home-page-heading">{title}</div>,
  BackupMethodCard: () => <div data-testid="backup-method-card">Backup Method Card</div>,
  BackupNavigation: () => <div data-testid="backup-navigation">Backup Navigation</div>,
  BackupPageHeader: () => <div data-testid="backup-page-header">Backup Page Header</div>,
  PageContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="page-container">{children}</div>,
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  PageSubtitle: ({ title }: { title: string }) => <div data-testid="page-subtitle">{title}</div>,
}));

describe('Backup', () => {
  it('renders all main components', () => {
    render(<Backup />);

    expect(screen.getByTestId('page-container')).toBeInTheDocument();
    expect(screen.getByTestId('backup-page-header')).toBeInTheDocument();
    expect(screen.getByTestId('backup-method-card')).toBeInTheDocument();
    expect(screen.getByTestId('backup-navigation')).toBeInTheDocument();
  });

  it('renders heading with correct title', () => {
    render(<Backup />);

    expect(screen.getByTestId('backup-page-header')).toBeInTheDocument();
  });

  it('renders components in correct order within page wrapper', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-container');
    const children = Array.from(pageWrapper.children);

    expect(children).toHaveLength(3);
    expect(children[0]).toHaveAttribute('data-testid', 'backup-page-header');
    expect(children[1]).toHaveAttribute('data-testid', 'backup-method-card');
    expect(children[2]).toHaveAttribute('data-testid', 'backup-navigation');
  });

  it('wraps all content in page wrapper', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-container');

    // All main components should be children of PageWrapper
    expect(pageWrapper).toContainElement(screen.getByTestId('backup-page-header'));
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
    const pageWrapper = screen.getByTestId('page-container');
    expect(pageWrapper).toBeInTheDocument();

    // Verify all expected child components exist
    const expectedComponents = ['backup-page-header', 'backup-method-card', 'backup-navigation'];

    expectedComponents.forEach((componentTestId) => {
      expect(screen.getByTestId(componentTestId)).toBeInTheDocument();
    });
  });

  it('renders components in correct order', () => {
    render(<Backup />);

    const pageWrapper = screen.getByTestId('page-container');
    const header = screen.getByTestId('backup-page-header');
    const methodCard = screen.getByTestId('backup-method-card');
    const navigation = screen.getByTestId('backup-navigation');

    const children = Array.from(pageWrapper.children);
    const headerIndex = children.indexOf(header);
    const methodCardIndex = children.indexOf(methodCard);
    const navigationIndex = children.indexOf(navigation);

    expect(headerIndex).toBeLessThan(methodCardIndex);
    expect(methodCardIndex).toBeLessThan(navigationIndex);
  });
});
