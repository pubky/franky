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

export function DialogPrivacy({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Link href="#" className="text-brand">
          {linkText}
        </Link>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <Container className="h-[320px] pr-4 overflow-y-auto">
          <Container className="flex-col gap-4">
            <Typography size="sm" className="text-muted-foreground font-normal">
              Effective Date: 15 May 2025
            </Typography>
            <Typography size="sm" className="text-muted-foreground font-normal">
              SCOPE This Privacy Policy (“Policy”) describes how Synonym Software Ltd. treats personal information on
              the Pubky platform and the products, services and features made available as part of the platform
              (collectively, the “Platform”).
            </Typography>
            <Typography className="text-muted-foreground font-normal">
              POLICY SUMMARY This summary offers a concise overview of how Synonym Software Ltd. (“Synonym”) collects,
              uses, shares, and protects your personal information on the Pubky platform. For full details, please read
              the complete Privacy Policy.
            </Typography>
          </Container>
        </Container>
      </DialogContent>
    </Dialog>
  );
}
