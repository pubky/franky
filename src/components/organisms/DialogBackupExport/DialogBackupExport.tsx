'use client';

import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

import * as Atoms from '@/atoms';
import * as Config from '@/config';
import * as Libs from '@/libs';

interface DialogBackupExportProps {
  mnemonic?: string;
  children?: React.ReactNode;
}

const IMPORT_DESCRIPTION = (
  <>
    1. Open Pubky Ring, tap &apos;Add pubky&apos; <br />
    2. Choose &apos;Import pubky&apos; option <br />
    3. Tap &apos;Scan QR to import&apos; <br />
    4. Scan this QR code to import your recovery phrase
  </>
);

const EXPORT_DESCRIPTION = (
  <>
    1. Open Pubky Ring, tap &apos;Add pubky&apos; <br />
    2. Choose the &apos;Import pubky&apos; option
    <br />
    3. Scan this QR to import
  </>
);

const MOBILE_EXPORT_DESCRIPTION =
  'Tap the button below to export your pubky and import it into Pubky Ring for a safer and easier sign-in experience.';

const MOBILE_IMPORT_DESCRIPTION =
  'Tap the button below to import your recovery phrase into Pubky Ring for a safer and easier sign-in experience.';

export function DialogBackupExport({ mnemonic, children }: DialogBackupExportProps) {
  const qrValue = mnemonic ? Libs.generatePubkyRingDeeplink(mnemonic) : Config.PUBKY_CORE_URL;
  const descriptionContent = mnemonic ? IMPORT_DESCRIPTION : EXPORT_DESCRIPTION;
  const mobileDescription = mnemonic ? MOBILE_IMPORT_DESCRIPTION : MOBILE_EXPORT_DESCRIPTION;
  const dialogTitle = mnemonic ? 'Import recovery phrase' : 'Pubky Ring export';

  const handleMobileButtonClick = () => {
    if (typeof window !== 'undefined') {
      const url = mnemonic ? Libs.generatePubkyRingDeeplink(mnemonic) : Config.PUBKY_CORE_URL;
      window.open(url, '_blank');
    }
  };

  return (
    <Atoms.Dialog>
      {children ? (
        <Atoms.DialogTrigger asChild>{children}</Atoms.DialogTrigger>
      ) : (
        <Atoms.DialogTrigger asChild>
          <Atoms.Button>Continue</Atoms.Button>
        </Atoms.DialogTrigger>
      )}
      <Atoms.DialogContent className="max-w-md" hiddenTitle={dialogTitle}>
        {/* Desktop version - hidden on mobile, shown on desktop */}
        <div className="hidden lg:flex flex-col gap-6">
          <Atoms.DialogHeader>
            <Atoms.DialogTitle>{dialogTitle}</Atoms.DialogTitle>
            <Atoms.DialogDescription>{descriptionContent}</Atoms.DialogDescription>
          </Atoms.DialogHeader>

          <Atoms.Container className="justify-between items-start">
            <Atoms.Container className="flex-row gap-8">
              <Atoms.Container>
                <Image src="/images/pubky-ring-phone.png" alt="App preview" width={250} height={430} />
              </Atoms.Container>

              <Atoms.Container className="gap-6">
                <Atoms.Container className="mx-0 bg-foreground rounded-lg p-[9px] w-[192px] h-[192px] items-center">
                  <QRCodeSVG value={qrValue} size={174} />
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
        </div>

        {/* Mobile version - shown on mobile, hidden on desktop */}
        <div className="flex lg:hidden flex-col gap-6">
          <Atoms.DialogHeader>
            <Atoms.DialogTitle>{dialogTitle}</Atoms.DialogTitle>
            <Atoms.DialogDescription>{mobileDescription}</Atoms.DialogDescription>
          </Atoms.DialogHeader>

          <Atoms.Container className="gap-3">
            <Atoms.Button onClick={handleMobileButtonClick} className="w-full">
              Import to Pubky Ring
            </Atoms.Button>
          </Atoms.Container>
        </div>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
