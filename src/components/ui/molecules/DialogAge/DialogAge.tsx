import {
  Container,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Link,
  Typography,
} from '@/components/ui';

export function DialogAge({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Link href="#" className="text-brand">
          {linkText}
        </Link>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Age minimum: 18</DialogTitle>
        </DialogHeader>
        <Container className="h-full pr-4 overflow-y-auto">
          <Container className="gap-4">
            <Typography size="sm" className="text-muted-foreground">
              You can only use Pubky if you are over 18 years old.
            </Typography>
          </Container>
        </Container>
      </DialogContent>
    </Dialog>
  );
}
