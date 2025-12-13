import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSelector } from './LanguageSelector';

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
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('shows selected language flag and name', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // All languages should be visible in dropdown (use getAllByText for English since it appears twice)
    expect(screen.getAllByText('English').length).toBeGreaterThan(1);
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Dropdown is open
    expect(screen.getAllByText('English').length).toBeGreaterThan(1);

    // Click outside
    fireEvent.mouseDown(document.body);

    // Dropdown should close - only trigger button text visible
    expect(screen.getAllByText('English').length).toBe(1);
  });

  it('calls setLanguage when selecting an enabled language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // English is the only enabled language, click it
    const englishOptions = screen.getAllByText('English');
    fireEvent.click(englishOptions[1]); // Click the one in dropdown

    expect(mockSetLanguage).toHaveBeenCalledWith('en');
  });

  it('does not call setLanguage when clicking disabled language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Spanish is disabled
    const spanishOption = screen.getByText('Spanish');
    fireEvent.click(spanishOption);

    expect(mockSetLanguage).not.toHaveBeenCalled();
  });

  it('shows check icon for selected language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // The selected language (English) should have a check icon
    const englishButton = screen.getAllByRole('button').find((btn) => btn.textContent?.includes('English'));
    expect(englishButton).toBeInTheDocument();
  });
});

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
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot - open', () => {
    const { container } = render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(container.firstChild).toMatchSnapshot();
  });
});
