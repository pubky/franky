'use client';

import { Gift, Mail, Twitter, Send } from 'lucide-react';
import { Button, SocialLink, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

interface InvitePopoverProps {
  className?: string;
  emailUrl?: string;
  twitterUrl?: string;
  telegramUrl?: string;
}

export function InvitePopover({
  className = 'hover:bg-brand/10',
  emailUrl = 'mailto:hello@pubky.com',
  twitterUrl = 'https://x.com/pubky',
  telegramUrl = 'https://t.me/pubky',
}: InvitePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Gift className="h-4 w-4 text-brand" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[327px]">
        <div className="flex flex-col gap-6 px-3 py-2">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold text-popover-foreground">Don&apos;t have an invite yet?</h4>
            <p className="text-sm font-medium text-muted-foreground">Ask the Pubky team!</p>
          </div>
          <div className="flex gap-4">
            <SocialLink href={emailUrl} className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-6 w-6" />
            </SocialLink>
            <SocialLink href={twitterUrl} className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-6 w-6" />
            </SocialLink>
            <SocialLink href={telegramUrl} className="text-muted-foreground hover:text-foreground transition-colors">
              <Send className="h-6 w-6" />
            </SocialLink>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
