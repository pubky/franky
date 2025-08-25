import { CircleHelp } from '@/libs/icons';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function PopoverBackup({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Popover>
      <Atoms.PopoverTrigger asChild>
        <Atoms.Button variant="ghost" size="icon" className={Libs.cn('hover:bg-white/10', props.className)}>
          <CircleHelp className="h-4 w-4 text-white" data-testid="circle-help-icon" />
        </Atoms.Button>
      </Atoms.PopoverTrigger>
      <Atoms.PopoverContent className="w-[327px] p-6">
        <Atoms.Container className="gap-2">
          <Atoms.Heading level={4} size="sm" className="text-popover-foreground">
            Why is this important?
          </Atoms.Heading>
          <Atoms.Typography size="sm" className="text-sm text-muted-foreground font-medium leading-light">
            The secret seed for your pubky is like a master password. Anyone with access can take full control of your
            account. You are responsible for keeping your keys safe.
          </Atoms.Typography>
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
