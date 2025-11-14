import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFriends } from './ProfilePageFriends';

describe('ProfilePageFriends', () => {
  it('renders without errors', () => {
    render(<ProfilePageFriends />);
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageFriends />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Friends');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageFriends />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFriends />);
    expect(container).toMatchSnapshot();
  });
});
