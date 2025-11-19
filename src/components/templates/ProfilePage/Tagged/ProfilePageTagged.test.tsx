import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageTagged } from '../Tagged/ProfilePageTagged';

describe('ProfilePageTagged', () => {
  it('renders without errors', () => {
    render(<ProfilePageTagged />);
    expect(screen.getByText('Tagged')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageTagged />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Tagged');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageTagged />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageTagged />);
    expect(container).toMatchSnapshot();
  });
});
