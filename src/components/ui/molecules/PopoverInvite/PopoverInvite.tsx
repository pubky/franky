import { Gift, Mail, Twitter, Send } from 'lucide-react';
import { Button, Link, Popover, PopoverContent, PopoverTrigger, Heading, Container, Typography } from '@/components/ui';

interface PopoverInviteProps {
  className?: string;
}

// TODO: extract to env
const EMAIL_URL = 'mailto:hello@pubky.com';
const TWITTER_URL = 'https://x.com/pubky';
const TELEGRAM_URL = 'https://t.me/pubky';

export function PopoverInvite({ className = 'hover:bg-brand/10' }: PopoverInviteProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Gift className="h-4 w-4 text-brand" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[327px]">
        <Container className="flex-col gap-6 px-3 py-2">
          <Container className="flex-col gap-2">
            <Heading level={4} size="sm" className="text-popover-foreground">
              Don&apos;t have an invite yet?
            </Heading>
            <Typography size="sm" className="text-muted-foreground">
              Ask the Pubky team!
            </Typography>
          </Container>
          <Container className="flex-row gap-4">
            <Link href={EMAIL_URL}>
              <Mail className="h-6 w-6" />
            </Link>
            <Link href={TWITTER_URL}>
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href={TELEGRAM_URL}>
              <Send className="h-6 w-6" />
            </Link>
          </Container>
        </Container>
      </PopoverContent>
    </Popover>
  );
}
