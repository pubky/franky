import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { XTwitter, Github2, Telegram, UsersRound2, YouTube } from './icons';

describe('Custom Icons', () => {
  describe('XTwitter', () => {
    it('should render correctly with default props', () => {
      const { container } = render(<XTwitter />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should apply custom size', () => {
      const { container } = render(<XTwitter size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should apply custom className', () => {
      const { container } = render(<XTwitter className="custom-class" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('custom-class');
    });

    it('should apply additional props', () => {
      const { container } = render(<XTwitter data-testid="twitter-icon" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-testid', 'twitter-icon');
    });

    it('should render the correct SVG content', () => {
      const { container } = render(<XTwitter />);
      const path = container.querySelector('path');
      const g = container.querySelector('g');

      expect(g).toBeInTheDocument();
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('opacity', '0.8');
      expect(path).toHaveAttribute('fill', 'currentColor');
    });

    it('should have the correct clip path', () => {
      const { container } = render(<XTwitter />);
      const g = container.querySelector('g');
      const clipPath = container.querySelector('clipPath');

      expect(g).toHaveAttribute('clip-path', 'url(#clip0_18345_202114)');
      expect(clipPath).toHaveAttribute('id', 'clip0_18345_202114');
    });
  });

  describe('Telegram', () => {
    it('should render correctly with default props', () => {
      const { container } = render(<Telegram />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '4 4 16 16');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should apply custom size', () => {
      const { container } = render(<Telegram size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should apply custom className', () => {
      const { container } = render(<Telegram className="custom-class" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('custom-class');
    });

    it('should apply additional props', () => {
      const { container } = render(<Telegram data-testid="telegram-icon" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-testid', 'telegram-icon');
    });

    it('should render the correct SVG content', () => {
      const { container } = render(<Telegram />);
      const path = container.querySelector('path');

      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('Github', () => {
    it('should render correctly with default props', () => {
      const { container } = render(<Github2 />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should apply custom size', () => {
      const { container } = render(<Github2 size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should apply custom className', () => {
      const { container } = render(<Github2 className="custom-class" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('custom-class');
    });

    it('should apply additional props', () => {
      const { container } = render(<Github2 data-testid="github-icon" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-testid', 'github-icon');
    });

    it('should render the correct SVG content', () => {
      const { container } = render(<Github2 />);
      const path = container.querySelector('path');

      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-width', '1.5');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  describe('YouTube', () => {
    it('should render correctly with default props', () => {
      const { container } = render(<YouTube />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should apply custom size', () => {
      const { container } = render(<YouTube size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should apply custom className', () => {
      const { container } = render(<YouTube className="custom-class" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('custom-class');
    });

    it('should apply additional props', () => {
      const { container } = render(<YouTube data-testid="youtube-icon" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-testid', 'youtube-icon');
    });

    it('should render the correct SVG content', () => {
      const { container } = render(<YouTube />);
      const path = container.querySelector('path');

      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('UsersRound2', () => {
    it('should render correctly with default props', () => {
      const { container } = render(<UsersRound2 />);
      const svg = container.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('viewBox', '0 0 20 20');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should apply custom size', () => {
      const { container } = render(<UsersRound2 size={32} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should apply custom className', () => {
      const { container } = render(<UsersRound2 className="custom-class" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('custom-class');
    });

    it('should apply additional props', () => {
      const { container } = render(<UsersRound2 data-testid="users-icon" />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveAttribute('data-testid', 'users-icon');
    });

    it('should render the correct SVG content', () => {
      const { container } = render(<UsersRound2 />);
      const path = container.querySelector('path');

      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-width', '1.5');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });
});
