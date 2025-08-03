import { Gift, Mail, Twitter, Send } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

interface PopoverInviteProps {
  className?: string;
}

// TODO: extract to env
const EMAIL_URL = 'mailto:hello@pubky.com';
const TWITTER_URL = 'https://x.com/pubky';
const TELEGRAM_URL = 'https://t.me/pubky';

export function PopoverInvite({ className = 'hover:bg-brand/10' }: PopoverInviteProps) {
  return (
    <Molecules.Popover>
      <Molecules.PopoverTrigger asChild>
        <Atoms.Button variant="ghost" size="icon" className={className}>
          <Gift className="h-4 w-4 text-brand" />
        </Atoms.Button>
      </Molecules.PopoverTrigger>
      <Molecules.PopoverContent className="w-[327px]">
        <Atoms.Container className="flex-col gap-6 px-3 py-2">
          <Atoms.Container className="flex-col gap-2">
            <Atoms.Heading level={4} size="sm" className="text-popover-foreground">
              Don&apos;t have an invite yet?
            </Atoms.Heading>
            <Atoms.Typography size="sm" className="text-muted-foreground">
              Ask the Pubky team!
            </Atoms.Typography>
          </Atoms.Container>
          <Atoms.Container className="flex-row gap-4">
            <Atoms.Link href={EMAIL_URL}>
              <Mail className="h-6 w-6" />
            </Atoms.Link>
            <Atoms.Link href={TWITTER_URL}>
              <Twitter className="h-6 w-6" />
            </Atoms.Link>
            <Atoms.Link href={TELEGRAM_URL}>
              <Send className="h-6 w-6" />
            </Atoms.Link>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.PopoverContent>
    </Molecules.Popover>
  );
}
