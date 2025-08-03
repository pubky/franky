import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function DialogTerms({ linkText = 'Terms of Service' }: { linkText?: string }) {
  return (
    <Molecules.Dialog>
      <Molecules.DialogTrigger asChild>
        <Atoms.Link href="#" className="text-brand">
          {linkText}
        </Atoms.Link>
      </Molecules.DialogTrigger>
      <Molecules.DialogContent className="sm:max-w-xl">
        <Molecules.DialogHeader className="pr-6">
          <Molecules.DialogTitle>Terms of Service</Molecules.DialogTitle>
        </Molecules.DialogHeader>
        <Atoms.Container className="h-[320px] pr-4 overflow-y-auto">
          <Atoms.Container className="flex-col gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground">
              TERMS AND CONDITIONS
              <br />
              Effective Date: 15 May 2025
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="text-muted-foreground">
              Thank you for using the Pubky platform and the products, services and features we make available to you as
              part of the platform, including the Pubky App (collectively, the &quot;Platform&quot;). The terms and
              conditions set forth below (as updated and amended from time to time, and collectively with the Privacy
              Policy and any other materials explicitly incorporated by us, these &quot;Terms&quot;) govern your access
              to and use of the Platform.
            </Atoms.Typography>
            <Atoms.Typography size="sm" className="text-muted-foreground">
              PLEASE REVIEW THE ARBITRATION PROVISION SET FORTH BELOW CAREFULLY, AS IT WILL REQUIRE ALL PERSONS TO
              RESOLVE DISPUTES THROUGH FINAL AND BINDING ARBITRATION AND TO
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>
      </Molecules.DialogContent>
    </Molecules.Dialog>
  );
}
