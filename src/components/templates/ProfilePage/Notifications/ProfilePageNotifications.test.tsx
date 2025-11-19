import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfilePageNotifications } from '../Notifications/ProfilePageNotifications';

describe('ProfilePageNotifications', () => {
  it('renders without errors', () => {
    render(<ProfilePageNotifications />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('displays the correct heading', () => {
    render(<ProfilePageNotifications />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Notifications');
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('displays lorem ipsum text', () => {
    render(<ProfilePageNotifications />);
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<ProfilePageNotifications />);
    expect(container).toMatchSnapshot();
  });
});
