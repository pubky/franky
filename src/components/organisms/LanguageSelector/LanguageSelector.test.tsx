import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock Next.js router
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// Mock @/core
const mockSetLanguage = vi.fn();
vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => ({
      setLanguage: mockSetLanguage,
    }),
  };
});

// Store original location
const originalLocation = window.location;

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cookies
    document.cookie = 'locale=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost:3000/settings/language',
        protocol: 'https:',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renders correctly', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('Display language')).toBeInTheDocument();
    expect(screen.getByText('US English')).toBeInTheDocument();
  });

  it('opens dropdown when clicking trigger', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Dropdown is open - should show language options
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
  });

  it('does not navigate when selecting the current language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // US English is the current language (from useLocale mock which returns 'en')
    const englishOptions = screen.getAllByText('US English');
    fireEvent.click(englishOptions[1]); // Click the one in dropdown

    // Should not call refresh since we're selecting the same language
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('sets cookie and refreshes when selecting a different language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Español (Spanish) is a different language
    const spanishOption = screen.getByText('Español');
    fireEvent.click(spanishOption);

    // Should set cookie and call refresh
    expect(document.cookie).toContain('locale=es');
    expect(mockSetLanguage).toHaveBeenCalledWith('es');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('syncs language store with server locale on mount', () => {
    render(<LanguageSelector />);

    // The useEffect should sync the language store with server locale
    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });
});

// Note: Radix UI generates incremental IDs (radix-«r0», radix-«r1», etc.) for aria-controls attributes.
// These IDs can vary between test runs depending on test execution order.
// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('LanguageSelector - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot - closed', () => {
    const { container } = render(<LanguageSelector />);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });

  it('matches snapshot - open', () => {
    const { container } = render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    const normalizedContainer = normaliseRadixIds(container);
    expect(normalizedContainer.firstChild).toMatchSnapshot();
  });
});
