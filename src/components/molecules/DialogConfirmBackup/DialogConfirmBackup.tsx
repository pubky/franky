import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function DialogConfirmBackup() {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="secondary" className="bg-card">
          Done
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-xl gap-0">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>All backed up?</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Container className="h-full pr-4 overflow-y-auto">
          <Atoms.Container className="gap-4">
            <Atoms.Typography size="sm" className="text-muted-foreground font-medium">
              Please confirm if you have completed your preferred backup methods. For your security, the secret seed
              will be be deleted from your browser. You can restore access to your account using your recovery phrase or
              encrypted file.
            </Atoms.Typography>
            <Atoms.Container className="bg-destructive/60 px-6 py-3 rounded-lg flex flex-row items-center gap-3">
              <Libs.TriangleAlert className="h-4 w-4 font-bold" />
              <Atoms.Typography size="sm" className="font-bold">
                After confirming, your seed will be deleted from the browser (!)
              </Atoms.Typography>
            </Atoms.Container>
            <Atoms.Container className="flex md:flex-row flex-col gap-4">
              <Atoms.Button size="lg" variant="outline">
                <Libs.ShieldCheck className="h-4 w-4" />
                Backup methods
              </Atoms.Button>
              <Atoms.Button size="lg">
                <Libs.Check className="h-4 w-4" />
                Confirm (delete seed)
              </Atoms.Button>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
