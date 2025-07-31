import { CircleHelp } from 'lucide-react';
import { Button, Container, Heading, Popover, PopoverContent, PopoverTrigger, Typography } from '@/components/ui';

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
        <Container className="gap-6 px-3 py-2">
          <Container className="gap-2">
            <Heading level={4} size="sm" className="text-popover-foreground">
              Why not a normal user @handle?
            </Heading>
            <Typography size="sm" className="text-muted-foreground">
              This user handle is a cryptographic public key, making it unique and platform-independent. No need for a
              centralized username registry.
            </Typography>
          </Container>
        </Container>
      </PopoverContent>
    </Popover>
  );
}
