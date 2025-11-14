'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface FeedbackCardProps {
  className?: string;
}

export function FeedbackCard({ className }: FeedbackCardProps) {
  return (
    <div data-testid="feedback-card" className={Libs.cn('flex flex-col gap-2', className)}>
      <h2 className="text-2xl font-light text-muted-foreground">Feedback</h2>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border/50 p-5">
        <div className="flex items-center gap-2">
          <Atoms.Avatar className="h-12 w-12">
            <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="User" />
            <Atoms.AvatarFallback>
              <Libs.User className="h-5 w-5" />
            </Atoms.AvatarFallback>
          </Atoms.Avatar>
          <div className="text-base font-bold text-foreground">Your Name</div>
        </div>

        <div className="cursor-pointer text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground">
          What do you think about Pubky?
        </div>
      </div>
    </div>
  );
}
