import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostContent } from './PostContent';

describe('PostContent', () => {
  it('renders text', () => {
    render(<PostContent text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <PostContent text="I have said it before: If you don’t believe me or don’t get it, I don’t have time to try to convince you." />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
