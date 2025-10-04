import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

import * as Atoms from '@/atoms';
import * as Config from '@/config';

interface DialogExportProps {
  mnemonic?: string;
  children?: React.ReactNode;
}

export function DialogExport({ mnemonic, children }: DialogExportProps) {
  const generateDeeplink = (mnemonicPhrase: string) => {
    // Encode the mnemonic for URL
    const encodedMnemonic = encodeURIComponent(mnemonicPhrase);
    return `pubkyring://${encodedMnemonic}`;
  };

  const qrValue = mnemonic ? generateDeeplink(mnemonic) : Config.PUBKY_CORE_URL;
  return (
    <Atoms.Dialog>
      {children ? (
        <Atoms.DialogTrigger asChild>{children}</Atoms.DialogTrigger>
      ) : (
        <Atoms.DialogTrigger asChild>
          <Atoms.Button className="gap-2">
            <span>Continue</span>
          </Atoms.Button>
        </Atoms.DialogTrigger>
      )}
      <Atoms.DialogContent className="p-8 rounded-xl flex flex-col w-[430px]">
        <Atoms.DialogHeader className="space-y-1.5 pr-6">
          <Atoms.DialogTitle className="text-2xl font-bold leading-8">
            {mnemonic ? 'Import recovery phrase' : 'Pubky Ring export'}
          </Atoms.DialogTitle>
          <Atoms.DialogDescription className="text-sm font-medium leading-5">
            {mnemonic ? (
              <>
                1. Open Pubky Ring, tap &apos;Add pubky&apos; <br />
                2. Choose &apos;Import pubky&apos; option <br />
                3. Tap &apos;Scan QR to import&apos; <br />
                4. Scan this QR code to import your recovery phrase
              </>
            ) : (
              <>
                1. Open Pubky Ring, tap &apos;Add pubky&apos; <br />
                2. Choose the &apos;Import pubky&apos; option
                <br />
                3. Scan this QR to import
              </>
            )}
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>

        <Atoms.Container className="justify-between items-center mt-6">
          <Atoms.Container className="flex-row gap-6">
            <Atoms.Container className="w-[250px]">
              <Image src="/images/pubky-ring-phone.png" alt="App preview" width={250} height={430} />
            </Atoms.Container>

            <Atoms.Container className="gap-8 w-full mt-4">
              <Atoms.Container className="mx-0 bg-foreground rounded-lg p-4 w-[192px] h-[192px] items-center">
                <QRCodeSVG value={qrValue} size={192} />
              </Atoms.Container>
              <Atoms.Container className="gap-4">
                <Atoms.Link href={Config.APP_STORE_URL} target="_blank">
                  <Image src="/images/badge-apple.png" alt="App Store" width={120} height={40} />
                </Atoms.Link>
                <Atoms.Link href={Config.PLAY_STORE_URL} target="_blank">
                  <Image src="/images/badge-android.png" alt="Google Play" width={135} height={40} />
                </Atoms.Link>
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
