import { AlertTriangle } from 'lucide-react';
import { Button, Container, Heading, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';

export function PopoverTradeoffs() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <AlertTriangle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <Container className="gap-2 px-3 py-2">
          <Container className="gap-2">
            <Heading level={4} size="sm" className="text-popover-foreground">
              Be aware of these tradeoffs:
            </Heading>
          </Container>
          <Container className="flex gap-4">
            <ul className="list-disc list-inside text-muted-foreground text-sm">
              <li>Less secure than mobile keychain</li>
              <li>Browser-based key generation</li>
              <li>Suboptimal sign-in experience</li>
            </ul>
          </Container>
        </Container>
      </PopoverContent>
    </Popover>
  );
}
