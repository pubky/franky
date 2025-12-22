import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchInputBar } from './SearchInputBar';

vi.mock('@/atoms', () => ({
  Container: ({
    children,
    className,
    style,
    ...props
  }: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) => (
    <div className={className} style={style} {...props}>
      {children}
    </div>
  ),
  Input: ({
    type,
    placeholder,
    value,
    onChange,
    onKeyDown,
    onFocus,
    readOnly,
    className,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      readOnly={readOnly}
      className={className}
      {...props}
    />
  ),
}));

vi.mock('@/molecules', () => ({
  PostTag: ({ label, showClose, onClose }: { label: string; showClose?: boolean; onClose?: () => void }) => (
    <span data-testid={`active-tag-${label}`}>
      {label}
      {showClose && (
        <button data-testid={`remove-tag-${label}`} onClick={onClose}>
          x
        </button>
      )}
    </span>
  ),
}));

vi.mock('@/libs', () => ({
  cn: (...args: (string | undefined | false)[]) => args.filter(Boolean).join(' '),
  Search: ({ className, ...props }: { className?: string }) => (
    <svg data-testid="search-icon" className={className} {...props} />
  ),
}));

vi.mock('@/organisms/SearchInput/SearchInput.constants', () => ({
  SEARCH_EXPANDED_STYLE: {
    background: 'linear-gradient(180deg, #05050A 0%, rgba(5, 5, 10, 0.50) 100%)',
    backdropFilter: 'blur(12px)',
  },
}));

describe('SearchInputBar', () => {
  const defaultProps = {
    activeTags: [],
    inputValue: '',
    isFocused: false,
    isReadOnly: false,
    suggestionsId: undefined,
    onTagRemove: vi.fn(),
    onInputChange: vi.fn(),
    onKeyDown: vi.fn(),
    onFocus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the input bar container', () => {
      render(<SearchInputBar {...defaultProps} />);

      expect(screen.getByTestId('search-input-bar')).toBeInTheDocument();
    });

    it('renders the search icon', () => {
      render(<SearchInputBar {...defaultProps} />);

      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders input with Search placeholder when no active tags', () => {
      render(<SearchInputBar {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Search');
    });

    it('renders input with empty placeholder when active tags exist', () => {
      render(<SearchInputBar {...defaultProps} activeTags={['bitcoin']} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', '');
    });

    it('renders input with correct aria attributes', () => {
      render(<SearchInputBar {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Search input');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('renders input with aria-controls when suggestions visible', () => {
      render(<SearchInputBar {...defaultProps} suggestionsId="test-suggestions" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-controls', 'test-suggestions');
    });

    it('renders input without aria-controls when no suggestions', () => {
      render(<SearchInputBar {...defaultProps} suggestionsId={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-controls');
    });
  });

  describe('Active Tags', () => {
    it('renders active tags when present', () => {
      render(<SearchInputBar {...defaultProps} activeTags={['bitcoin', 'pubky']} />);

      expect(screen.getByTestId('active-tag-bitcoin')).toBeInTheDocument();
      expect(screen.getByTestId('active-tag-pubky')).toBeInTheDocument();
    });

    it('renders tags list with correct aria attributes', () => {
      render(<SearchInputBar {...defaultProps} activeTags={['bitcoin']} />);

      const tagsList = screen.getByRole('list');
      expect(tagsList).toHaveAttribute('aria-label', 'Active search tags');
    });

    it('does not render tags list when no active tags', () => {
      render(<SearchInputBar {...defaultProps} activeTags={[]} />);

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('calls onTagRemove when tag close button is clicked', () => {
      const onTagRemove = vi.fn();
      render(<SearchInputBar {...defaultProps} activeTags={['bitcoin']} onTagRemove={onTagRemove} />);

      fireEvent.click(screen.getByTestId('remove-tag-bitcoin'));

      expect(onTagRemove).toHaveBeenCalledWith('bitcoin');
    });
  });

  describe('Input Interactions', () => {
    it('calls onInputChange when input value changes', () => {
      const onInputChange = vi.fn();
      render(<SearchInputBar {...defaultProps} onInputChange={onInputChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onInputChange).toHaveBeenCalled();
    });

    it('calls onKeyDown when key is pressed', () => {
      const onKeyDown = vi.fn();
      render(<SearchInputBar {...defaultProps} onKeyDown={onKeyDown} />);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onKeyDown).toHaveBeenCalled();
    });

    it('calls onFocus when input receives focus', () => {
      const onFocus = vi.fn();
      render(<SearchInputBar {...defaultProps} onFocus={onFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });

    it('sets input to readOnly when isReadOnly is true', () => {
      render(<SearchInputBar {...defaultProps} isReadOnly />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readOnly');
    });

    it('displays current inputValue', () => {
      render(<SearchInputBar {...defaultProps} inputValue="search query" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('search query');
    });
  });

  describe('Focus State Styling', () => {
    it('applies rounded-full class when not focused', () => {
      render(<SearchInputBar {...defaultProps} isFocused={false} />);

      const container = screen.getByTestId('search-input-bar');
      expect(container).toHaveClass('rounded-full');
    });

    it('applies rounded-t-2xl class when focused', () => {
      render(<SearchInputBar {...defaultProps} isFocused />);

      const container = screen.getByTestId('search-input-bar');
      expect(container).toHaveClass('rounded-t-2xl');
    });

    it('applies expanded style when focused', () => {
      render(<SearchInputBar {...defaultProps} isFocused />);

      const container = screen.getByTestId('search-input-bar');
      expect(container).toHaveStyle({
        background: 'linear-gradient(180deg, rgb(5, 5, 10) 0%, rgba(5, 5, 10, 0.5) 100%)',
      });
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot - default state', () => {
      const { container } = render(<SearchInputBar {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot - with active tags', () => {
      const { container } = render(<SearchInputBar {...defaultProps} activeTags={['bitcoin', 'pubky']} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot - focused state', () => {
      const { container } = render(<SearchInputBar {...defaultProps} isFocused />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot - with input value', () => {
      const { container } = render(<SearchInputBar {...defaultProps} inputValue="test query" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
