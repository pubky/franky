import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePagePosts } from '../Posts/ProfilePagePosts';

describe('ProfilePagePosts', () => {
  it('renders without errors', () => {
    render(<ProfilePagePosts />);
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePagePosts />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Posts');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays multiple paragraphs of lorem ipsum text', () => {
    render(<ProfilePagePosts />);
    const paragraphs = screen.getAllByText(/Lorem ipsum dolor sit amet/);
    expect(paragraphs.length).toBeGreaterThan(1);
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePagePosts />);
    expect(container).toMatchSnapshot();
  });
});
