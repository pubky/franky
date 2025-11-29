import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PostHashtags } from './PostHashtags';

// Mock @/libs
vi.mock('@/libs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/libs')>();
  return {
    ...actual,
    cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  };
});

// Mock @/libs/icons
vi.mock('@/libs/icons', () => ({
  Synonym: ({ size }: { size?: number }) => (
    <svg data-testid="icon-synonym" data-size={size}>
      Synonym
    </svg>
  ),
  Tether: ({ size }: { size?: number }) => (
    <svg data-testid="icon-tether" data-size={size}>
      Tether
    </svg>
  ),
  PubkyIcon: ({ size }: { size?: number }) => (
    <svg data-testid="icon-pubky" data-size={size}>
      Pubky
    </svg>
  ),
  Bitkit: ({ size }: { size?: number }) => (
    <svg data-testid="icon-bitkit" data-size={size}>
      Bitkit
    </svg>
  ),
  Blocktank: ({ size }: { size?: number }) => (
    <svg data-testid="icon-blocktank" data-size={size}>
      Blocktank
    </svg>
  ),
  BTCIcon: ({ size }: { size?: number }) => (
    <svg data-testid="icon-bitcoin" data-size={size}>
      Bitcoin
    </svg>
  ),
}));

// Mock @/atoms
vi.mock('@/atoms', () => ({
  Link: ({
    children,
    href,
    className,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a data-testid="link" href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

describe('PostHashtags', () => {
  describe('Basic rendering', () => {
    it('renders hashtag text correctly', () => {
      render(<PostHashtags href="/search?tags=test">#test</PostHashtags>);

      expect(screen.getByText('#test')).toBeInTheDocument();
    });

    it('renders as a link with correct href', () => {
      render(<PostHashtags href="/search?tags=bitcoin">#bitcoin</PostHashtags>);

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('href', '/search?tags=bitcoin');
    });

    it('applies custom className', () => {
      render(
        <PostHashtags href="/search?tags=test" className="custom-class">
          #test
        </PostHashtags>,
      );

      const link = screen.getByTestId('link');
      expect(link.className).toContain('custom-class');
    });

    it('applies default inline-flex styling', () => {
      render(<PostHashtags href="/search?tags=test">#test</PostHashtags>);

      const link = screen.getByTestId('link');
      expect(link.className).toContain('inline-flex');
      expect(link.className).toContain('items-center');
      expect(link.className).toContain('gap-x-1');
      expect(link.className).toContain('text-base');
    });
  });

  describe('Click behavior', () => {
    it('stops event propagation on click', () => {
      const parentClickHandler = vi.fn();

      render(
        <div onClick={parentClickHandler}>
          <PostHashtags href="/search?tags=test">#test</PostHashtags>
        </div>,
      );

      const link = screen.getByTestId('link');
      fireEvent.click(link);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Icon rendering for special hashtags', () => {
    it('renders Synonym icon for #synonym', () => {
      render(<PostHashtags href="/search?tags=synonym">#synonym</PostHashtags>);

      expect(screen.getByTestId('icon-synonym')).toBeInTheDocument();
    });

    it('renders Tether icon for #tether', () => {
      render(<PostHashtags href="/search?tags=tether">#tether</PostHashtags>);

      expect(screen.getByTestId('icon-tether')).toBeInTheDocument();
    });

    it('renders Pubky icon for #pubky', () => {
      render(<PostHashtags href="/search?tags=pubky">#pubky</PostHashtags>);

      expect(screen.getByTestId('icon-pubky')).toBeInTheDocument();
    });

    it('renders Bitkit icon for #bitkit', () => {
      render(<PostHashtags href="/search?tags=bitkit">#bitkit</PostHashtags>);

      expect(screen.getByTestId('icon-bitkit')).toBeInTheDocument();
    });

    it('renders Blocktank icon for #blocktank', () => {
      render(<PostHashtags href="/search?tags=blocktank">#blocktank</PostHashtags>);

      expect(screen.getByTestId('icon-blocktank')).toBeInTheDocument();
    });

    it('renders Bitcoin icon for #bitcoin', () => {
      render(<PostHashtags href="/search?tags=bitcoin">#bitcoin</PostHashtags>);

      expect(screen.getByTestId('icon-bitcoin')).toBeInTheDocument();
    });

    it('renders icon case-insensitively for #BITCOIN', () => {
      render(<PostHashtags href="/search?tags=bitcoin">#BITCOIN</PostHashtags>);

      expect(screen.getByTestId('icon-bitcoin')).toBeInTheDocument();
    });

    it('renders icon case-insensitively for #Bitcoin', () => {
      render(<PostHashtags href="/search?tags=bitcoin">#Bitcoin</PostHashtags>);

      expect(screen.getByTestId('icon-bitcoin')).toBeInTheDocument();
    });

    it('does not render icon for unknown hashtag', () => {
      render(<PostHashtags href="/search?tags=unknown">#unknown</PostHashtags>);

      expect(screen.queryByTestId('icon-synonym')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-tether')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-pubky')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-bitkit')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-blocktank')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-bitcoin')).not.toBeInTheDocument();
    });
  });

  describe('Props forwarding', () => {
    it('forwards additional props to the Link component', () => {
      render(
        <PostHashtags href="/search?tags=test" data-custom="value">
          #test
        </PostHashtags>,
      );

      const link = screen.getByTestId('link');
      expect(link).toHaveAttribute('data-custom', 'value');
    });

    it('does not forward node and ref props', () => {
      // These props should be destructured and not forwarded
      const { container } = render(
        <PostHashtags href="/search?tags=test" data-type="hashtag">
          #test
        </PostHashtags>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

describe('PostHashtags - Snapshots', () => {
  it('matches snapshot for basic hashtag without icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=javascript">#javascript</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #bitcoin with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=bitcoin">#bitcoin</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #synonym with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=synonym">#synonym</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #tether with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=tether">#tether</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #pubky with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=pubky">#pubky</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #bitkit with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=bitkit">#bitkit</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for #blocktank with icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=blocktank">#blocktank</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with custom className', () => {
    const { container } = render(
      <PostHashtags href="/search?tags=test" className="custom-styling">
        #test
      </PostHashtags>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with uppercase hashtag having icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=bitcoin">#BITCOIN</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with mixed case hashtag having icon', () => {
    const { container } = render(<PostHashtags href="/search?tags=pubky">#PuBkY</PostHashtags>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
