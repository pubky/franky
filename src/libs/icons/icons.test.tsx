import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { XTwitter, Github2, Telegram, UsersRound2, YouTube } from './icons';

describe('Custom Icons', () => {
  it('XTwitter renders SVG in document', () => {
    const { container } = render(<XTwitter />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('Telegram renders SVG in document', () => {
    const { container } = render(<Telegram />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('Github renders SVG in document', () => {
    const { container } = render(<Github2 />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('YouTube renders SVG in document', () => {
    const { container } = render(<YouTube />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('UsersRound renders SVG in document', () => {
    const { container } = render(<UsersRound2 />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

describe('Custom Icons - Snapshots', () => {
  describe('XTwitter', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<XTwitter />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom size', () => {
      const { container } = render(<XTwitter size={32} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<XTwitter className="custom-class" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Telegram', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<Telegram />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom size', () => {
      const { container } = render(<Telegram size={32} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<Telegram className="custom-class" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Github', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<Github2 />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom size', () => {
      const { container } = render(<Github2 size={32} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<Github2 className="custom-class" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('YouTube', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<YouTube />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom size', () => {
      const { container } = render(<YouTube size={32} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<YouTube className="custom-class" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('UsersRound', () => {
    it('matches snapshot with default props', () => {
      const { container } = render(<UsersRound2 />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom size', () => {
      const { container } = render(<UsersRound2 size={32} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(<UsersRound2 className="custom-class" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
