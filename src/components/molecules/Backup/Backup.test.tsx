import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BackupNavigation, BackupPageHeader } from './Backup';
import { ImageProps } from 'next/image';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock atoms
vi.mock('@/atoms', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="container" className={className}>
      {children}
    </div>
  ),
  Heading: ({
    children,
    level,
    size,
    className,
  }: {
    children: React.ReactNode;
    level?: number;
    size?: string;
    className?: string;
  }) => {
    const Tag = `h${level || 1}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-testid={`heading-${level || 1}`} data-size={size} className={className}>
        {children}
      </Tag>
    );
  },
  Typography: ({ children, size, className }: { children: React.ReactNode; size?: string; className?: string }) => (
    <p data-testid="typography" data-size={size} className={className}>
      {children}
    </p>
  ),
  PageHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
  PageSubtitle: ({ children }: { children: React.ReactNode }) => <div data-testid="page-subtitle">{children}</div>,
}));

  describe('BackupNavigation - Snapshots', () => {§
    it('matches snapshot for default BackupNavigation', () => {
      const { container } = render(<BackupNavigation />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('BackupPageHeader - Snapshots', () => {
    it('matches snapshot for default BackupPageHeader', () => {
      const { container } = render(<BackupPageHeader />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
