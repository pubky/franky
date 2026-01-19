import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterCounter } from './CharacterCounter';

describe('CharacterCounter', () => {
  describe('Basic Rendering', () => {
    it('renders count and max correctly', () => {
      render(<CharacterCounter count={500} max={2000} />);
      expect(screen.getByText('500/2,000')).toBeInTheDocument();
    });

    it('renders with label when provided', () => {
      render(<CharacterCounter count={100} max={1000} label="Title" />);
      expect(screen.getByText('Title:')).toBeInTheDocument();
      expect(screen.getByText('100/1,000')).toBeInTheDocument();
    });

    it('formats large numbers with locale separators', () => {
      render(<CharacterCounter count={45000} max={50000} />);
      expect(screen.getByText('45,000/50,000')).toBeInTheDocument();
    });
  });

  describe('Warning States', () => {
    it('shows normal state below 80%', () => {
      const { container } = render(<CharacterCounter count={1500} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-muted-foreground');
      expect(counter).not.toHaveClass('text-yellow-500');
      expect(counter).not.toHaveClass('text-destructive');
    });

    it('shows warning state at 80%+', () => {
      const { container } = render(<CharacterCounter count={1600} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-yellow-500');
      expect(counter).not.toHaveClass('text-destructive');
    });

    it('shows danger state at 95%+', () => {
      const { container } = render(<CharacterCounter count={1900} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-destructive');
      expect(counter).toHaveClass('font-bold');
    });

    it('shows remaining characters when in danger state', () => {
      render(<CharacterCounter count={1950} max={2000} />);
      expect(screen.getByText('(50 left)')).toBeInTheDocument();
    });

    it('shows over limit message when count exceeds max', () => {
      render(<CharacterCounter count={2100} max={2000} />);
      expect(screen.getByText('(over limit!)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero count', () => {
      render(<CharacterCounter count={0} max={2000} />);
      expect(screen.getByText('0/2,000')).toBeInTheDocument();
    });

    it('handles exactly at max', () => {
      const { container } = render(<CharacterCounter count={2000} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-destructive');
      // At exactly max, remaining is 0, so should show "(0 left)"
      expect(screen.getByText('(0 left)')).toBeInTheDocument();
    });

    it('handles exactly at 80% threshold', () => {
      const { container } = render(<CharacterCounter count={1600} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-yellow-500');
    });

    it('handles exactly at 95% threshold', () => {
      const { container } = render(<CharacterCounter count={1900} max={2000} />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-destructive');
    });
  });

  describe('Article-specific scenarios', () => {
    // Article title max is 100 chars
    const TITLE_MAX = 100;
    // Article body max varies based on title length (50000 - 22 - titleLength)
    const TOTAL_MAX = 50000;
    const JSON_OVERHEAD = 22;

    it('handles article title at various lengths', () => {
      // Short title
      render(<CharacterCounter count={10} max={TITLE_MAX} label="Title" />);
      expect(screen.getByText('10/100')).toBeInTheDocument();
    });

    it('shows warning when article title approaches limit', () => {
      const { container } = render(<CharacterCounter count={85} max={TITLE_MAX} label="Title" />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-yellow-500');
    });

    it('shows danger when article title is near max', () => {
      const { container } = render(<CharacterCounter count={96} max={TITLE_MAX} label="Title" />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-destructive');
    });

    it('handles article body with dynamic max (short title)', () => {
      const titleLength = 10;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49968
      render(<CharacterCounter count={40000} max={bodyMax} label="Body" />);
      expect(screen.getByText('40,000/49,968')).toBeInTheDocument();
    });

    it('handles article body with dynamic max (long title)', () => {
      const titleLength = 100;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49878
      render(<CharacterCounter count={40000} max={bodyMax} label="Body" />);
      expect(screen.getByText('40,000/49,878')).toBeInTheDocument();
    });

    it('shows warning when article body approaches dynamic limit', () => {
      const titleLength = 50;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49928
      const bodyCount = Math.floor(bodyMax * 0.85); // 85%
      const { container } = render(<CharacterCounter count={bodyCount} max={bodyMax} label="Body" />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-yellow-500');
    });

    it('shows danger when article body is near dynamic limit', () => {
      const titleLength = 50;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49928
      const bodyCount = Math.floor(bodyMax * 0.96); // 96%
      const { container } = render(<CharacterCounter count={bodyCount} max={bodyMax} label="Body" />);
      const counter = container.querySelector('[data-cy="character-counter-value"]');
      expect(counter).toHaveClass('text-destructive');
    });

    it('shows over limit when body exceeds dynamic max', () => {
      const titleLength = 50;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49928
      const bodyCount = bodyMax + 500; // 500 over
      render(<CharacterCounter count={bodyCount} max={bodyMax} label="Body" />);
      expect(screen.getByText('(over limit!)')).toBeInTheDocument();
    });

    it('handles maximum possible body (when title is empty)', () => {
      const titleLength = 0;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49978
      render(<CharacterCounter count={49978} max={bodyMax} label="Body" />);
      expect(screen.getByText('49,978/49,978')).toBeInTheDocument();
      expect(screen.getByText('(0 left)')).toBeInTheDocument();
    });

    it('handles minimum possible body max (when title is at max)', () => {
      const titleLength = 100;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleLength; // 49878
      render(<CharacterCounter count={49878} max={bodyMax} label="Body" />);
      expect(screen.getByText('49,878/49,878')).toBeInTheDocument();
    });
  });
});

describe('CharacterCounter - Snapshots', () => {
  it('matches snapshot with normal state', () => {
    const { container } = render(<CharacterCounter count={500} max={2000} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with label', () => {
    const { container } = render(<CharacterCounter count={50} max={100} label="Title" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with warning state', () => {
    const { container } = render(<CharacterCounter count={1700} max={2000} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with danger state', () => {
    const { container } = render(<CharacterCounter count={1950} max={2000} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when over limit', () => {
    const { container } = render(<CharacterCounter count={2100} max={2000} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with large numbers (article body)', () => {
    const { container } = render(<CharacterCounter count={45000} max={50000} label="Body" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
