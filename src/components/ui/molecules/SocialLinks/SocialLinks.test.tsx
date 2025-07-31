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
    expect(container).toHaveClass('hidden', 'md:flex', 'flex-row', 'justify-end', 'gap-6', 'mr-8');

    // Check all three default links are rendered
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  it('renders with default URLs', () => {
    render(<SocialLinks />);

    const githubLink = screen.getByTestId('github-icon').parentElement;
    const twitterLink = screen.getByTestId('twitter-icon').parentElement;
    const telegramLink = screen.getByTestId('send-icon').parentElement;

    expect(githubLink).toHaveAttribute('href', 'https://github.com/pubky');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/getpubky');
    expect(telegramLink).toHaveAttribute('href', 'https://t.me/pubky');
  });

  it('renders all social links by default', () => {
    render(<SocialLinks />);

    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
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
