'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface FeedbackCardProps {
  className?: string;
}

export function FeedbackCard({ className }: FeedbackCardProps) {
  return (
    <div data-testid="feedback-card" className={Libs.cn('flex flex-col gap-4', className)}>
      <h2 className="text-2xl font-light text-muted-foreground">Feedback</h2>

      <div className="flex flex-col gap-3 p-5 rounded-lg border-dashed border border-border/50">
        <div className="flex items-center gap-2">
          <Atoms.Avatar className="h-12 w-12">
            <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="User" />
            <Atoms.AvatarFallback>
              <Libs.User className="w-5 h-5" />
            </Atoms.AvatarFallback>
          </Atoms.Avatar>
          <div className="text-base font-bold text-foreground">Your Name</div>
        </div>

        <div className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-snug">
          What do you think about Pubky?
        </div>
      </div>
    </div>
  );
}
