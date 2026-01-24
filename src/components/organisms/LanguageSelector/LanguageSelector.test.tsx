import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';
import { normaliseRadixIds } from '@/libs/utils/utils';

// Mock settings store
const mockSetLanguage = vi.fn();
const mockUseSettingsStore = vi.fn();

vi.mock('@/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core')>();
  return {
    ...actual,
    useSettingsStore: () => mockUseSettingsStore(),
  };
});

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettingsStore.mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage,
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

  it('calls setLanguage when selecting an enabled language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // US English is the only enabled language, click it
    const englishOptions = screen.getAllByText('US English');
    fireEvent.click(englishOptions[1]); // Click the one in dropdown

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('calls setLanguage when clicking any enabled language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Espanol (Spanish) is enabled
    const spanishOption = screen.getByText('Espanol');
    fireEvent.click(spanishOption);

    expect(mockSetLanguage).toHaveBeenCalledWith('es');
  });
});

// Note: Radix UI generates incremental IDs (radix-«r0», radix-«r1», etc.) for aria-controls attributes.
// These IDs can vary between test runs depending on test execution order.
// Use normaliseRadixIds to ensure the snapshots are consistent.
describe('LanguageSelector - Snapshots', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettingsStore.mockReturnValue({
      language: 'en',
      setLanguage: mockSetLanguage,
    });
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
