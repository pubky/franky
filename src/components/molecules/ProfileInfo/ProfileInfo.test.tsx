import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileInfo } from './ProfileInfo';

describe('ProfileInfo', () => {
  it('renders bio when provided', () => {
    const bio = 'This is my bio';
    render(<ProfileInfo bio={bio} />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText(bio)).toBeInTheDocument();
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
    expect(screen.getByText('Top Tags')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders nothing when no props provided', () => {
    const { container } = render(<ProfileInfo />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });
});

