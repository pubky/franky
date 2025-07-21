import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialLinks } from './SocialLinks';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Github: ({ className }: { className?: string }) => (
    <div data-testid="github-icon" className={className}>
      Github
    </div>
  ),
  Twitter: ({ className }: { className?: string }) => (
    <div data-testid="twitter-icon" className={className}>
      Twitter
    </div>
  ),
  Send: ({ className }: { className?: string }) => (
    <div data-testid="send-icon" className={className}>
      Send
    </div>
  ),
}));

describe('SocialLinks', () => {
  it('renders with default props', () => {
    render(<SocialLinks />);

    const container = screen.getByTestId('github-icon').parentElement?.parentElement;
    expect(container).toHaveClass('hidden', 'md:flex', 'items-center', 'gap-6');

    // Check all three default links are rendered
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  it('renders with custom URLs', () => {
    render(
      <SocialLinks
        githubUrl="https://github.com/custom"
        twitterUrl="https://twitter.com/custom"
        telegramUrl="https://t.me/custom"
      />,
    );

    const githubLink = screen.getByTestId('github-icon').parentElement;
    const twitterLink = screen.getByTestId('twitter-icon').parentElement;
    const telegramLink = screen.getByTestId('send-icon').parentElement;

    expect(githubLink).toHaveAttribute('href', 'https://github.com/custom');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/custom');
    expect(telegramLink).toHaveAttribute('href', 'https://t.me/custom');
  });

  it('can hide individual social links', () => {
    render(<SocialLinks showGithub={false} showTwitter={true} showTelegram={false} />);

    expect(screen.queryByTestId('github-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('send-icon')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SocialLinks className="custom-social-class" />);

    const container = screen.getByTestId('github-icon').parentElement?.parentElement;
    expect(container).toHaveClass('custom-social-class');
  });

  it('renders all icons with proper classes', () => {
    render(<SocialLinks />);

    const githubIcon = screen.getByTestId('github-icon');
    const twitterIcon = screen.getByTestId('twitter-icon');
    const sendIcon = screen.getByTestId('send-icon');

    expect(githubIcon).toHaveClass('w-6', 'h-6');
    expect(twitterIcon).toHaveClass('w-6', 'h-6');
    expect(sendIcon).toHaveClass('w-6', 'h-6');
  });

  it('shows all links by default', () => {
    render(<SocialLinks />);

    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });
});
