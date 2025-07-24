import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';

export function DialogPrivacy({ linkText = 'Privacy Policy' }: { linkText?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <a className="cursor-pointer text-brand">{linkText}</a>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-6">
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <div className="h-[320px] pr-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">Effective Date: 15 May 2025</p>
            <p className="text-muted-foreground">
              SCOPE This Privacy Policy (“Policy”) describes how Synonym Software Ltd. treats personal information on
              the Pubky platform and the products, services and features made available as part of the platform
              (collectively, the “Platform”).
            </p>
            <p className="text-muted-foreground">
              POLICY SUMMARY This summary offers a concise overview of how Synonym Software Ltd. (“Synonym”) collects,
              uses, shares, and protects your personal information on the Pubky platform. For full details, please read
              the complete Privacy Policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
