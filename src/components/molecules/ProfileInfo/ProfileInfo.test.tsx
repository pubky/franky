import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileInfo } from './ProfileInfo';

describe('ProfileInfo', () => {
  it('renders FeedbackCard always', () => {
    render(<ProfileInfo />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });

  it('renders links when provided', () => {
    const links = [
      { label: 'Website', url: 'https://example.com' },
      { label: 'GitHub', url: 'https://github.com/example' },
    ];
    render(<ProfileInfo links={links} />);
    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('renders tags when provided', () => {
    const tags = [
      { label: 'JavaScript', count: 10 },
      { label: 'React', count: 5 },
    ];
    render(<ProfileInfo tags={tags} />);
    expect(screen.getByText('Tagged as')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders FeedbackCard when no props provided', () => {
    render(<ProfileInfo />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
  });
});
