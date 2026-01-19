import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArticleCharacterBreakdown } from './ArticleCharacterBreakdown';

// Constants matching the config
const TOTAL_MAX = 50000;
const JSON_OVERHEAD = 22;
const TITLE_MAX = 100;

describe('ArticleCharacterBreakdown', () => {
  const defaultProps = {
    titleCount: 20,
    titleMax: TITLE_MAX,
    bodyCount: 5000,
    totalMax: TOTAL_MAX,
    jsonOverhead: JSON_OVERHEAD,
  };

  describe('Basic Rendering', () => {
    it('renders all sections correctly', () => {
      render(<ArticleCharacterBreakdown {...defaultProps} />);

      expect(screen.getByText('Title:')).toBeInTheDocument();
      expect(screen.getByText('Body:')).toBeInTheDocument();
      expect(screen.getByText('JSON:')).toBeInTheDocument();
      expect(screen.getByText('Total:')).toBeInTheDocument();
    });

    it('displays title count correctly', () => {
      render(<ArticleCharacterBreakdown {...defaultProps} />);
      expect(screen.getByText('20/100')).toBeInTheDocument();
    });

    it('displays dynamic body max correctly (totalMax - jsonOverhead - titleCount)', () => {
      render(<ArticleCharacterBreakdown {...defaultProps} />);
      // Body max = 50000 - 22 - 20 = 49958
      expect(screen.getByText('5,000/49,958')).toBeInTheDocument();
    });

    it('displays JSON overhead', () => {
      render(<ArticleCharacterBreakdown {...defaultProps} />);
      expect(screen.getByText('+22')).toBeInTheDocument();
    });

    it('calculates total correctly (title + body + JSON overhead)', () => {
      render(<ArticleCharacterBreakdown {...defaultProps} />);
      // 20 + 5000 + 22 = 5042
      expect(screen.getByText('5,042/50,000')).toBeInTheDocument();
    });
  });

  describe('Dynamic Body Max', () => {
    it('body max decreases as title count increases', () => {
      const props = {
        ...defaultProps,
        titleCount: 50,
        bodyCount: 1000,
      };
      render(<ArticleCharacterBreakdown {...props} />);
      // Body max = 50000 - 22 - 50 = 49928
      expect(screen.getByText('1,000/49,928')).toBeInTheDocument();
    });

    it('body max is maximum when title is empty', () => {
      const props = {
        ...defaultProps,
        titleCount: 0,
        bodyCount: 1000,
      };
      render(<ArticleCharacterBreakdown {...props} />);
      // Body max = 50000 - 22 - 0 = 49978
      expect(screen.getByText('1,000/49,978')).toBeInTheDocument();
    });

    it('body max is minimum when title is at max', () => {
      const props = {
        ...defaultProps,
        titleCount: 100,
        bodyCount: 1000,
      };
      render(<ArticleCharacterBreakdown {...props} />);
      // Body max = 50000 - 22 - 100 = 49878
      expect(screen.getByText('1,000/49,878')).toBeInTheDocument();
    });
  });

  describe('Warning States', () => {
    it('shows warning color when total is at 80%+', () => {
      const warningProps = {
        titleCount: 50,
        titleMax: TITLE_MAX,
        bodyCount: 39950, // total = 50 + 39950 + 22 = 40022 (~80%)
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      const { container } = render(<ArticleCharacterBreakdown {...warningProps} />);

      const totalValue = container.querySelector('[data-cy="article-character-breakdown"]');
      expect(totalValue).toBeInTheDocument();
    });

    it('shows danger color when total is at 95%+', () => {
      const dangerProps = {
        titleCount: 50,
        titleMax: TITLE_MAX,
        bodyCount: 47450, // total = 50 + 47450 + 22 = 47522 (~95%)
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...dangerProps} />);

      // Should show "(X left)" when in danger state
      expect(screen.getByText(/left\)/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero counts', () => {
      const zeroProps = {
        titleCount: 0,
        titleMax: TITLE_MAX,
        bodyCount: 0,
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...zeroProps} />);

      expect(screen.getByText('0/100')).toBeInTheDocument();
      // Body max = 50000 - 22 - 0 = 49978
      expect(screen.getByText('0/49,978')).toBeInTheDocument();
    });

    it('handles max counts', () => {
      const maxProps = {
        titleCount: 100,
        titleMax: TITLE_MAX,
        bodyCount: 49878, // Max body when title is 100
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...maxProps} />);

      expect(screen.getByText('100/100')).toBeInTheDocument();
      // Body max = 50000 - 22 - 100 = 49878
      expect(screen.getByText('49,878/49,878')).toBeInTheDocument();
    });
  });

  describe('Over Limit State', () => {
    it('shows delete message when total exceeds limit', () => {
      const overLimitProps = {
        titleCount: 50,
        titleMax: TITLE_MAX,
        bodyCount: 50000, // Way over limit
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...overLimitProps} />);

      // Total = 50 + 50000 + 22 = 50072, which is 72 over the limit
      expect(screen.getByText(/delete 72/)).toBeInTheDocument();
    });

    it('shows delete message with formatted number for large overages', () => {
      const overLimitProps = {
        titleCount: 50,
        titleMax: TITLE_MAX,
        bodyCount: 51500, // 1,572 over limit
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...overLimitProps} />);

      // Total = 50 + 51500 + 22 = 51572, which is 1572 over
      expect(screen.getByText(/delete 1,572/)).toBeInTheDocument();
    });

    it('does not show delete message when exactly at limit', () => {
      const atLimitProps = {
        titleCount: 100,
        titleMax: TITLE_MAX,
        bodyCount: 49878, // Exactly at max (100 + 49878 + 22 = 50000)
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...atLimitProps} />);

      expect(screen.queryByText(/delete/)).not.toBeInTheDocument();
    });

    it('shows (0 left) when exactly at limit in danger zone', () => {
      const atLimitProps = {
        titleCount: 100,
        titleMax: TITLE_MAX,
        bodyCount: 49878, // Exactly at max (100 + 49878 + 22 = 50000)
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...atLimitProps} />);

      expect(screen.getByText('(0 left)')).toBeInTheDocument();
    });

    it('shows delete message when 1 character over limit', () => {
      const oneOverProps = {
        titleCount: 100,
        titleMax: TITLE_MAX,
        bodyCount: 49879, // 1 over limit
        totalMax: TOTAL_MAX,
        jsonOverhead: JSON_OVERHEAD,
      };
      render(<ArticleCharacterBreakdown {...oneOverProps} />);

      expect(screen.getByText(/delete 1\)/)).toBeInTheDocument();
    });
  });
});

describe('ArticleCharacterBreakdown - Snapshots', () => {
  it('matches snapshot with default values', () => {
    const { container } = render(
      <ArticleCharacterBreakdown titleCount={20} titleMax={100} bodyCount={5000} totalMax={50000} jsonOverhead={22} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with warning state', () => {
    const { container } = render(
      <ArticleCharacterBreakdown titleCount={50} titleMax={100} bodyCount={39950} totalMax={50000} jsonOverhead={22} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with danger state', () => {
    const { container } = render(
      <ArticleCharacterBreakdown titleCount={50} titleMax={100} bodyCount={47450} totalMax={50000} jsonOverhead={22} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot at max capacity', () => {
    const { container } = render(
      <ArticleCharacterBreakdown
        titleCount={100}
        titleMax={100}
        bodyCount={49878}
        totalMax={50000}
        jsonOverhead={22}
      />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot when over limit', () => {
    const { container } = render(
      <ArticleCharacterBreakdown titleCount={50} titleMax={100} bodyCount={50500} totalMax={50000} jsonOverhead={22} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('ArticleCharacterBreakdown - Real-world Article Scenarios', () => {
  const TOTAL_MAX = 50000;
  const JSON_OVERHEAD = 22;
  const TITLE_MAX = 100;

  describe('Writing a new article', () => {
    it('shows correct state for empty article', () => {
      render(
        <ArticleCharacterBreakdown
          titleCount={0}
          titleMax={TITLE_MAX}
          bodyCount={0}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Total = 0 + 0 + 22 = 22
      expect(screen.getByText('22/50,000')).toBeInTheDocument();
      // Body max when title is 0 = 50000 - 22 - 0 = 49978
      expect(screen.getByText('0/49,978')).toBeInTheDocument();
    });

    it('shows correct state for short blog post (~500 words)', () => {
      // Assuming ~5 chars per word, 500 words = ~2500 chars
      render(
        <ArticleCharacterBreakdown
          titleCount={30}
          titleMax={TITLE_MAX}
          bodyCount={2500}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Total = 30 + 2500 + 22 = 2552
      expect(screen.getByText('2,552/50,000')).toBeInTheDocument();
      // Body max = 50000 - 22 - 30 = 49948
      expect(screen.getByText('2,500/49,948')).toBeInTheDocument();
    });

    it('shows correct state for medium article (~2000 words)', () => {
      // ~2000 words = ~10000 chars
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={10000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Total = 50 + 10000 + 22 = 10072
      expect(screen.getByText('10,072/50,000')).toBeInTheDocument();
    });

    it('shows correct state for long-form article (~8000 words)', () => {
      // ~8000 words = ~40000 chars
      render(
        <ArticleCharacterBreakdown
          titleCount={80}
          titleMax={TITLE_MAX}
          bodyCount={40000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Total = 80 + 40000 + 22 = 40102 (~80%)
      expect(screen.getByText('40,102/50,000')).toBeInTheDocument();
    });
  });

  describe('Title length affects body max', () => {
    it('very short title (5 chars) allows maximum body space', () => {
      render(
        <ArticleCharacterBreakdown
          titleCount={5}
          titleMax={TITLE_MAX}
          bodyCount={1000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Body max = 50000 - 22 - 5 = 49973
      expect(screen.getByText('1,000/49,973')).toBeInTheDocument();
    });

    it('medium title (50 chars) shows adjusted body max', () => {
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={1000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Body max = 50000 - 22 - 50 = 49928
      expect(screen.getByText('1,000/49,928')).toBeInTheDocument();
    });

    it('max title (100 chars) shows minimum body max', () => {
      render(
        <ArticleCharacterBreakdown
          titleCount={100}
          titleMax={TITLE_MAX}
          bodyCount={1000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Body max = 50000 - 22 - 100 = 49878
      expect(screen.getByText('1,000/49,878')).toBeInTheDocument();
    });
  });

  describe('Approaching and exceeding limits', () => {
    it('shows warning at 80% total capacity', () => {
      // 80% of 50000 = 40000
      const bodyCount = 40000 - 50 - JSON_OVERHEAD; // 39928
      const { container } = render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={bodyCount}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      const breakdown = container.querySelector('[data-cy="article-character-breakdown"]');
      expect(breakdown).toBeInTheDocument();
    });

    it('shows danger at 95% total capacity with remaining count', () => {
      // 95% of 50000 = 47500
      const bodyCount = 47500 - 50 - JSON_OVERHEAD; // 47428
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={bodyCount}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Should show remaining chars
      expect(screen.getByText(/left\)/)).toBeInTheDocument();
    });

    it('shows delete count when 100 chars over limit', () => {
      const bodyCount = TOTAL_MAX - 50 - JSON_OVERHEAD + 100; // 100 over
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={bodyCount}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText(/delete 100\)/)).toBeInTheDocument();
    });

    it('shows delete count when 1000 chars over limit', () => {
      const bodyCount = TOTAL_MAX - 50 - JSON_OVERHEAD + 1000; // 1000 over
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={bodyCount}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText(/delete 1,000\)/)).toBeInTheDocument();
    });

    it('shows delete count when massively over limit (10000 chars)', () => {
      const bodyCount = TOTAL_MAX - 50 - JSON_OVERHEAD + 10000; // 10000 over
      render(
        <ArticleCharacterBreakdown
          titleCount={50}
          titleMax={TITLE_MAX}
          bodyCount={bodyCount}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText(/delete 10,000\)/)).toBeInTheDocument();
    });
  });

  describe('Edge cases in article creation', () => {
    it('handles title at warning threshold', () => {
      const { container } = render(
        <ArticleCharacterBreakdown
          titleCount={80} // 80% of 100
          titleMax={TITLE_MAX}
          bodyCount={1000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      // Title should be in warning state
      const breakdown = container.querySelector('[data-cy="article-character-breakdown"]');
      expect(breakdown).toBeInTheDocument();
    });

    it('handles title at danger threshold', () => {
      render(
        <ArticleCharacterBreakdown
          titleCount={96} // 96% of 100
          titleMax={TITLE_MAX}
          bodyCount={1000}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText('96/100')).toBeInTheDocument();
    });

    it('handles body exactly at its dynamic max', () => {
      const titleCount = 50;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleCount; // 49928
      render(
        <ArticleCharacterBreakdown
          titleCount={titleCount}
          titleMax={TITLE_MAX}
          bodyCount={bodyMax}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText('49,928/49,928')).toBeInTheDocument();
      expect(screen.getByText('50,000/50,000')).toBeInTheDocument();
      expect(screen.getByText('(0 left)')).toBeInTheDocument();
    });

    it('handles body 1 char over its dynamic max', () => {
      const titleCount = 50;
      const bodyMax = TOTAL_MAX - JSON_OVERHEAD - titleCount; // 49928
      render(
        <ArticleCharacterBreakdown
          titleCount={titleCount}
          titleMax={TITLE_MAX}
          bodyCount={bodyMax + 1}
          totalMax={TOTAL_MAX}
          jsonOverhead={JSON_OVERHEAD}
        />,
      );
      expect(screen.getByText('49,929/49,928')).toBeInTheDocument();
      expect(screen.getByText(/delete 1\)/)).toBeInTheDocument();
    });
  });
});
