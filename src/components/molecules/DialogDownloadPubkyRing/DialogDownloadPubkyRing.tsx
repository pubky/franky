import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

import * as Atoms from '@/atoms';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/config';

interface DialogDownloadPubkyRingProps {
  store?: 'apple' | 'android';
}

export function DialogDownloadPubkyRing({ store = 'apple' }: DialogDownloadPubkyRingProps) {
  const imageBadge =
    store === 'apple'
      ? {
          src: '/images/badge-apple.png',
          alt: 'App Store',
          width: 120,
          height: 40,
          href: APP_STORE_URL,
        }
      : {
          src: '/images/badge-android.png',
          alt: 'Google Play',
          width: 135,
          height: 40,
          href: PLAY_STORE_URL,
        };

  return (
    <Atoms.Dialog>
      {store === 'apple' ? (
        <Atoms.Link href={imageBadge.href} target="_blank" className="block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={192} height={40} />
        </Atoms.Link>
      ) : (
        <Atoms.Link href={imageBadge.href} target="_blank" className="block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={210} height={40} />
        </Atoms.Link>
      )}
      <Atoms.DialogTrigger asChild className="cursor-pointer hidden sm:block">
        {store === 'apple' ? (
          <Image src="/images/badge-apple.png" alt="App Store" width={120} height={40} />
        ) : (
          <Image src="/images/badge-android.png" alt="Google Play" width={135} height={40} />
        )}
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="sm:max-w-[384px]">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle>Download Pubky Ring</Atoms.DialogTitle>
          <Atoms.DialogDescription className="text-sm font-medium">
            Scan the QR with your mobile camera to download Pubky Ring from the App Store.
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>
        <Atoms.Container className="mt-6">
          <Atoms.Container className="flex-row gap-8 items-center">
            <Image src="/images/pubky-ring-phone.png" alt="App preview" width={96} height={256} />
            <Atoms.Container className="space-y-6">
              <Atoms.Container className="bg-foreground rounded-lg p-4 w-[192px] h-[192px] flex items-center justify-center">
                <QRCodeSVG value={imageBadge.href} size={160} />
              </Atoms.Container>
              <Atoms.Container className="justify-between items-center">
                <Atoms.Link className="h-10 w-full" href={imageBadge.href} target="_blank">
                  <Image
                    src={imageBadge.src}
                    alt={imageBadge.alt}
                    width={imageBadge.width}
                    height={imageBadge.height}
                  />
                </Atoms.Link>
              </Atoms.Container>
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
