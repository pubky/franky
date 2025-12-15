import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfilePageLinks } from './ProfilePageLinks';
import * as Core from '@/core';
import { defaultPrivacyPreferences } from '@/core/stores/settings/settings.types';

// Mock organisms
vi.mock('@/organisms', () => ({
  DialogCheckLink: ({
    open,
    onOpenChangeAction,
    linkUrl,
  }: {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    linkUrl: string;
  }) => (
    <div data-testid="dialog-check-link" data-open={open} data-link-url={linkUrl}>
      <button data-testid="dialog-close" onClick={() => onOpenChangeAction(false)}>
        Close
      </button>
    </div>
  ),
}));

// Mock settings store
const mockUseSettingsStore = vi.fn();
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => mockUseSettingsStore(),
  };
});

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const defaultLinks: Core.NexusUserDetails['links'] = [
  { title: 'bitcoin.org', url: 'https://bitcoin.org' },
  { title: 'twitter.com/test', url: 'https://twitter.com/test' },
  { title: 'github.com/test', url: 'https://github.com/test' },
];

describe('ProfilePageLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: checkLink enabled (showConfirm: true)
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: true,
      },
    });
  });

  it('renders heading correctly', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    expect(screen.getByText('Links')).toBeInTheDocument();
  });

  it('renders all links', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks?.forEach((link) => {
      expect(screen.getByText(link.title)).toBeInTheDocument();
    });
  });

  it('renders links with correct href attributes', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    defaultLinks?.forEach((link) => {
      const linkElement = screen.getByText(link.title).closest('a');
      expect(linkElement).toHaveAttribute('href', link.url);
    });
  });

  it('renders with custom links', () => {
    const customLinks: Core.NexusUserDetails['links'] = [{ title: 'Example', url: 'https://example.com' }];
    render(<ProfilePageLinks links={customLinks} />);
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('Example').closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('has correct container structure', () => {
    const { container } = render(<ProfilePageLinks links={defaultLinks} />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement).toHaveClass('flex', 'flex-col');
  });

  it('applies correct link styling', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    const linkElement = screen.getByText('bitcoin.org').closest('a');
    expect(linkElement).toHaveClass('flex', 'items-center', 'gap-2.5', 'py-1', 'cursor-pointer');
  });

  it('renders no links message when links array is empty', () => {
    render(<ProfilePageLinks links={[]} />);
    expect(screen.getByText('No links added yet.')).toBeInTheDocument();
  });

  it('renders no links message when links is undefined', () => {
    render(<ProfilePageLinks />);
    expect(screen.getByText('No links added yet.')).toBeInTheDocument();
  });

  it('renders DialogCheckLink component', () => {
    render(<ProfilePageLinks links={defaultLinks} />);
    expect(screen.getByTestId('dialog-check-link')).toBeInTheDocument();
  });
});

describe('ProfilePageLinks - Link Click Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dialog when clicking link and checkLink is enabled (default)', () => {
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: true,
      },
    });
    render(<ProfilePageLinks links={defaultLinks} />);

    const linkElement = screen.getByText('bitcoin.org').closest('a');
    fireEvent.click(linkElement!);

    const dialog = screen.getByTestId('dialog-check-link');
    expect(dialog).toHaveAttribute('data-open', 'true');
    expect(dialog).toHaveAttribute('data-link-url', 'https://bitcoin.org');
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('opens link directly when checkLink is disabled', () => {
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: false,
      },
    });
    render(<ProfilePageLinks links={defaultLinks} />);

    const linkElement = screen.getByText('bitcoin.org').closest('a');
    fireEvent.click(linkElement!);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://bitcoin.org', '_blank', 'noopener,noreferrer');
    const dialog = screen.getByTestId('dialog-check-link');
    expect(dialog).toHaveAttribute('data-open', 'false');
  });

  it('opens mailto links directly without dialog', () => {
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: true, // checkLink enabled
      },
    });
    const linksWithEmail: Core.NexusUserDetails['links'] = [{ title: 'Email', url: 'mailto:test@example.com' }];
    render(<ProfilePageLinks links={linksWithEmail} />);

    const linkElement = screen.getByText('Email').closest('a');
    fireEvent.click(linkElement!);

    expect(mockWindowOpen).toHaveBeenCalledWith('mailto:test@example.com', '_blank', 'noopener,noreferrer');
    const dialog = screen.getByTestId('dialog-check-link');
    expect(dialog).toHaveAttribute('data-open', 'false');
  });

  it('opens tel links directly without dialog', () => {
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: true, // checkLink enabled
      },
    });
    const linksWithPhone: Core.NexusUserDetails['links'] = [{ title: 'Phone', url: 'tel:+1234567890' }];
    render(<ProfilePageLinks links={linksWithPhone} />);

    const linkElement = screen.getByText('Phone').closest('a');
    fireEvent.click(linkElement!);

    expect(mockWindowOpen).toHaveBeenCalledWith('tel:+1234567890', '_blank', 'noopener,noreferrer');
    const dialog = screen.getByTestId('dialog-check-link');
    expect(dialog).toHaveAttribute('data-open', 'false');
  });
});

describe('ProfilePageLinks - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettingsStore.mockReturnValue({
      privacy: {
        ...defaultPrivacyPreferences,
        showConfirm: true,
      },
    });
  });

  it('matches snapshot with links', () => {
    const { container } = render(<ProfilePageLinks links={defaultLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom links', () => {
    const customLinks: Core.NexusUserDetails['links'] = [{ title: 'Example', url: 'https://example.com' }];
    const { container } = render(<ProfilePageLinks links={customLinks} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with empty links', () => {
    const { container } = render(<ProfilePageLinks links={[]} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with mailto link', () => {
    const linksWithEmail: Core.NexusUserDetails['links'] = [{ title: 'Contact', url: 'mailto:hello@example.com' }];
    const { container } = render(<ProfilePageLinks links={linksWithEmail} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with tel link', () => {
    const linksWithPhone: Core.NexusUserDetails['links'] = [{ title: 'Call Us', url: 'tel:+1234567890' }];
    const { container } = render(<ProfilePageLinks links={linksWithPhone} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
