'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface FeedbackCardProps {
  className?: string;
}

export function FeedbackCard({ className }: FeedbackCardProps) {
  return (
    <div data-testid="feedback-card" className={Libs.cn('flex flex-col gap-1', className)}>
      <h2 className="text-2xl font-light text-muted-foreground">Feedback</h2>

      <div className="flex flex-col gap-4 p-6 rounded-md border-dashed border border-input">
        <div className="flex items-center justify-center size-12 p-2 rounded-md shadow-xs">
          <Atoms.Avatar className="h-12 w-12">
            <Atoms.AvatarImage src="https://i.pravatar.cc/150?img=68" alt="User" />
            <Atoms.AvatarFallback>
              <Libs.User className="w-5 h-5" />
            </Atoms.AvatarFallback>
          </Atoms.Avatar>
        </div>

        <div className="text-xl font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors leading-6">
          What do you think about Pubky?
        </div>
      </div>
    </div>
  );
}
