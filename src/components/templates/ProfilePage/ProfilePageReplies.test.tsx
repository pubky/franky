import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageReplies } from './ProfilePageReplies';

describe('ProfilePageReplies', () => {
  it('renders without errors', () => {
    render(<ProfilePageReplies />);
    expect(screen.getByText('Replies')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageReplies />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Replies');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageReplies />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageReplies />);
    expect(container).toMatchSnapshot();
  });
});
