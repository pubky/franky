import * as Atoms from '@/atoms';

export function DialogPrivacy({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Link href="#" className="text-brand">
          {linkText}
        </Atoms.Link>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Privacy Policy</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-[320px] pr-4 overflow-y-auto">
          <Atoms.Container className="flex-col gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
              Effective Date: 15 May 2025
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="text-muted-foreground font-normal">
              SCOPE This Privacy Policy (“Policy”) describes how Synonym Software Ltd. treats personal information on
              the Pubky platform and the products, services and features made available as part of the platform
              (collectively, the “Platform”).
            </Atoms.Typography>
            <Atoms.Typography className="text-muted-foreground font-normal">
              POLICY SUMMARY This summary offers a concise overview of how Synonym Software Ltd. (“Synonym”) collects,
              uses, shares, and protects your personal information on the Pubky platform. For full details, please read
              the complete Privacy Policy.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
