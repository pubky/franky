import { CircleHelp } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

interface PopoverPublicKeyProps {
  className?: string;
}

export function PopoverPublicKey({ className = 'hover:bg-white/10' }: PopoverPublicKeyProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <CircleHelp className="h-4 w-4 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[327px]">
        <div className="flex flex-col gap-6 px-3 py-2">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold text-popover-foreground">Why not a normal user @handle?</h4>
            <p className="text-sm font-medium text-muted-foreground">
              This user handle is a cryptographic public key, making it unique and platform-independent. No need for a
              centralized username registry.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
