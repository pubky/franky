import { Github, Twitter, Send } from 'lucide-react';
import { SocialLink } from '@/components/ui';

interface SocialLinksProps {
  className?: string;
  showGithub?: boolean;
  showTwitter?: boolean;
  showTelegram?: boolean;
  githubUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export function SocialLinks({
  className = 'hidden md:flex items-center gap-6',
  showGithub = true,
  showTwitter = true,
  showTelegram = true,
  githubUrl = '#',
  twitterUrl = '#',
  telegramUrl = '#',
}: SocialLinksProps) {
  return (
    <div className={className}>
      {showGithub && (
        <SocialLink href={githubUrl}>
          <Github className="w-6 h-6" />
        </SocialLink>
      )}
      {showTwitter && (
        <SocialLink href={twitterUrl}>
          <Twitter className="w-6 h-6" />
        </SocialLink>
      )}
      {showTelegram && (
        <SocialLink href={telegramUrl}>
          <Send className="w-6 h-6" />
        </SocialLink>
      )}
    </div>
  );
}
