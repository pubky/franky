import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

interface DialogWelcomeProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  publicKey: string;
  image?: string;
  bio?: string;
}

export function DialogWelcome({ isOpen, onOpenChange, name, image, publicKey, bio }: DialogWelcomeProps) {
  const displayPublicKey = Libs.formatPublicKey(publicKey, 10);

  // Extract the first two initials of the name
  const initials = name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCopyToClipboard = async () => {
    try {
      await Libs.copyToClipboard(publicKey);
      const toastInstance = Molecules.toast({
        title: 'Pubky copied to clipboard',
        description: publicKey,
        action: (
          <Atoms.Button
            variant="outline"
            className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
            onClick={() => toastInstance.dismiss()}
          >
            OK
          </Atoms.Button>
        ),
      });
    } catch {
      Molecules.toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
      });
    }
  };

  const handleExplorePubky = () => {
    onOpenChange(false);
  };

  return (
    <Atoms.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Atoms.DialogContent className="sm:max-w-xl">
        <Atoms.DialogHeader className="text-left pr-6 gap-0">
          <Atoms.DialogTitle>Welcome to Pubky!</Atoms.DialogTitle>
          <Atoms.DialogDescription className="font-medium">
            Your keys, your content, your rules.
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="max-h-[420px] overflow-y-auto">
          <Atoms.Container className="flex flex-col gap-6">
            <Atoms.Card className="self-stretch p-6 bg-card rounded-lg flex flex-col sm:flex-row justify-center sm:justify-start items-center sm:items-start gap-6 overflow-hidden">
              <Atoms.Avatar className="w-24 h-24">
                <Atoms.AvatarImage src={image} />
                <Atoms.AvatarFallback className="text-4xl">{initials}</Atoms.AvatarFallback>
              </Atoms.Avatar>
              <Atoms.Container className="flex flex-col justify-center sm:justify-start items-center sm:items-start">
                <Atoms.Typography size="lg">{name}</Atoms.Typography>
                <Atoms.Typography size="sm" className="text-center sm:text-left text-muted-foreground font-medium">
                  {bio}
                </Atoms.Typography>
                <Atoms.Button
                  variant="secondary"
                  className="rounded-full gap-2 w-fit h-8 mt-2"
                  onClick={handleCopyToClipboard}
                >
                  <Libs.Key className="w-4 h-4" />
                  {displayPublicKey || '...'}
                </Atoms.Button>
              </Atoms.Container>
            </Atoms.Card>
            <Atoms.Button className="w-auto" size="lg" onClick={handleExplorePubky}>
              <Libs.ArrowRight className="mr-2 h-4 w-4" />
              Explore Pubky
            </Atoms.Button>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
