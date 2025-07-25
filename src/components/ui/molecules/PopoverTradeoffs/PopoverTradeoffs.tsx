import { AlertTriangle } from 'lucide-react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

export function PopoverTradeoffs() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <AlertTriangle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col gap-2 px-3 py-2">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold text-popover-foreground">Be aware of these tradeoffs:</h4>
          </div>
          <div className="flex gap-4">
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              <li>Less secure than mobile keychain</li>
              <li>Browser-based key generation</li>
              <li>Suboptimal sign-in experience</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
