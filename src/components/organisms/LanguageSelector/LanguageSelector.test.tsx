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
    expect(screen.getByText('US English')).toBeInTheDocument();
  });

  it('closes dropdown when clicking outside', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Dropdown is open
    expect(screen.getAllByText('US English').length).toBeGreaterThan(1);

    // Click outside
    fireEvent.mouseDown(document.body);

    // Dropdown should close - only trigger button text visible
    expect(screen.getAllByText('US English').length).toBe(1);
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

  it('does not call setLanguage when clicking disabled language', () => {
    render(<LanguageSelector />);
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Spanish is disabled
    const spanishOption = screen.getByText('Spanish');
    fireEvent.click(spanishOption);

    expect(mockSetLanguage).not.toHaveBeenCalled();
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
