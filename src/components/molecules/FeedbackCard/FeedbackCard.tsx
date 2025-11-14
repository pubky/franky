'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function FeedbackCard() {
  return (
    <div data-testid="feedback-card" className="flex flex-col gap-2">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Feedback
      </Atoms.Heading>

      <div className="flex flex-col gap-4 rounded-lg border border-dashed border-input p-6">
        <div className="flex items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-md p-2 shadow-xs">
            <Atoms.Avatar className="h-12 w-12">
              <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="User" />
              <Atoms.AvatarFallback>
                <Libs.User className="h-5 w-5" />
              </Atoms.AvatarFallback>
            </Atoms.Avatar>
          </div>
          <div className="text-base font-bold text-foreground">Your Name</div>
        </div>

        <div className="cursor-pointer text-base leading-normal font-medium text-muted-foreground transition-colors hover:text-foreground">
          What do you think about Pubky?
        </div>
      </div>
    </div>
  );
}
