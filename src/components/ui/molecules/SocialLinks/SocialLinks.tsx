import { Github, Twitter, Send } from 'lucide-react';
import { Link, Container } from '@/components/ui';
import { cn } from '@/libs';

export function SocialLinks({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Container className={cn('hidden md:flex flex-row justify-end gap-6 mr-8', props.className)}>
      <Link href="https://github.com/pubky" variant="muted" size="default">
        <Github className="w-6 h-6" />
      </Link>
      <Link href="https://twitter.com/getpubky" variant="muted" size="default">
        <Twitter className="w-6 h-6" />
      </Link>
      <Link href="https://t.me/pubky" variant="muted" size="default">
        <Send className="w-6 h-6" />
      </Link>
    </Container>
  );
}
