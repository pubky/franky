import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageFollowers } from '../Followers/ProfilePageFollowers';

describe('ProfilePageFollowers', () => {
  it('renders without errors', () => {
    render(<ProfilePageFollowers />);
    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageFollowers />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Followers');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageFollowers />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageFollowers />);
    expect(container).toMatchSnapshot();
  });
});
