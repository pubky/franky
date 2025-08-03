import { CircleHelp } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function PopoverPublicKey({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Popover>
      <Atoms.PopoverTrigger asChild>
        <Atoms.Button variant="ghost" size="icon" className={Libs.cn('hover:bg-white/10', props.className)}>
          <CircleHelp className="h-4 w-4 text-white" data-testid="circle-help-icon" />
        </Atoms.Button>
      </Atoms.PopoverTrigger>
      <Atoms.PopoverContent className="w-[327px]">
        <Atoms.Container className="gap-6 px-3 py-2">
          <Atoms.Container className="gap-2">
            <Atoms.Heading level={4} size="sm" className="text-popover-foreground">
              Why not a normal user @handle?
            </Atoms.Heading>
            <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
              This user handle is a cryptographic public key, making it unique and platform-independent. No need for a
              centralized username registry.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
