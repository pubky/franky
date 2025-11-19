import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFollowing } from '../Following/ProfilePageFollowing';

describe('ProfilePageFollowing', () => {
  it('renders without errors', () => {
    render(<ProfilePageFollowing />);
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageFollowing />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Following');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageFollowing />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFollowing />);
    expect(container).toMatchSnapshot();
  });
});
