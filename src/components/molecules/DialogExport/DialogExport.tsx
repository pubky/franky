import { Scan, X } from 'lucide-react';
import Image from 'next/image';

import * as Atoms from '@/atoms';
import { QRCodeSVG } from 'qrcode.react';

export function DialogExport() {
  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button className="gap-2">
          <Scan className="h-4 w-4" />
          <span>Export to Pubky Ring</span>
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="p-8 rounded-xl flex flex-col w-[430px]">
        <Atoms.Button variant="ghost" size="icon" className="absolute right-8 top-8 h-8 w-8 rounded-2xl opacity-70">
          <X className="h-4 w-4 text-secondary-foreground" />
        </Atoms.Button>

        <Atoms.DialogHeader className="space-y-1.5 pr-6">
          <Atoms.DialogTitle className="text-2xl font-bold leading-8">Pubky Ring export</Atoms.DialogTitle>
          <Atoms.DialogDescription className="text-sm font-medium leading-5">
            1. Open Pubky Ring, tap &apos;Add pubky&apos; <br />
            2. Choose the &apos;Import pubky&apos; option
            <br />
            3. Scan this QR to import
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>

        <Atoms.Container className="justify-between items-center mt-6">
          <Atoms.Container className="flex-row gap-6">
            <Atoms.Container className="w-[250px]">
              <Image src="/images/pubky-ring-phone.png" alt="App preview" width={250} height={430} />
            </Atoms.Container>

            <Atoms.Container className="gap-8 w-full mt-4">
              <Atoms.Container className="mx-0 bg-foreground rounded-lg p-4 w-[192px] h-[192px] items-center">
                <QRCodeSVG value="https://pubky.com" size={192} />
              </Atoms.Container>
              <Atoms.Container className="gap-4">
                <Atoms.Link href="https://apps.apple.com/app/pubky-ring/id6644244100" target="_blank">
                  <Image src="/images/badge-apple.png" alt="App Store" width={120} height={40} />
                </Atoms.Link>
                <Atoms.Link
                  href="https://play.google.com/store/apps/details?id=to.pubky.ring&pcampaignid=web_share"
                  target="_blank"
                >
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
