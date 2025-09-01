import * as Atoms from '@/atoms';
import { EMAIL_URL, TWITTER_URL, TELEGRAM_URL } from '@/config';
import * as Libs from '@/libs';

interface PopoverInviteProps {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
}

export function PopoverInvite({ className = 'hover:bg-brand/10' }: PopoverInviteProps) {
  return (
    <Atoms.Popover>
      <Atoms.PopoverTrigger asChild>
        <Atoms.Button variant="ghost" size="icon" className={className}>
          <Libs.Gift className="h-4 w-4 text-brand" />
        </Atoms.Button>
      </Atoms.PopoverTrigger>
      <Atoms.PopoverContent className="w-[327px]">
        <Atoms.Container className="flex-col gap-6 px-3 py-2">
          <Atoms.Container className="flex-col gap-2">
            <Atoms.Heading level={4} size="sm" className="text-popover-foreground">
              Don&apos;t have an invite yet?
            </Atoms.Heading>
            <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
              Ask the Pubky team!
            </Atoms.Typography>
          </Atoms.Container>
          <Atoms.Container className="flex-row gap-4">
            <Atoms.Link href={EMAIL_URL} className="text-muted-foreground hover:text-brand">
              <Libs.Mail className="h-6 w-6" />
            </Atoms.Link>
            <Atoms.Link href={TWITTER_URL} className="text-muted-foreground hover:text-brand">
              <Libs.XTwitter className="h-6 w-6" />
            </Atoms.Link>
            <Atoms.Link href={TELEGRAM_URL} className="text-muted-foreground hover:text-brand">
              <Libs.Telegram className="h-6 w-6" />
            </Atoms.Link>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
