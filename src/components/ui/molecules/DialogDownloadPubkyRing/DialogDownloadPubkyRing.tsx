import {
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Link,
} from '@/components/ui';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';

export function DialogDownloadPubkyRing({ store = 'apple' }: { store?: 'apple' | 'android' }) {
  const imageBadge =
    store === 'apple'
      ? {
          src: '/images/badge-apple.png',
          alt: 'App Store',
          width: 120,
          height: 40,
          href: 'https://apps.apple.com/mx/app/pubky-ring/id6739356756',
        }
      : {
          src: '/images/badge-android.png',
          alt: 'Google Play',
          width: 120,
          height: 40,
          href: 'https://play.google.com/store/apps/details?id=to.pubky.ring&pcampaignid=web_share',
        };

  return (
    <Dialog>
      {store === 'apple' ? (
        <Link href={imageBadge.href} target="_blank" className="block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={192} height={40} />
        </Link>
      ) : (
        <Link href={imageBadge.href} target="_blank" className="block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={210} height={40} />
        </Link>
      )}
      <DialogTrigger asChild className="cursor-pointer hidden sm:block">
        {store === 'apple' ? (
          <Image src="/images/badge-apple.png" alt="App Store" width={120} height={40} />
        ) : (
          <Image src="/images/badge-android.png" alt="Google Play" width={120} height={40} />
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[384px]">
        <DialogHeader className="pr-6">
          <DialogTitle>Download Pubky Ring</DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Scan the QR with your mobile camera to download Pubky Ring from the App Store.
          </DialogDescription>
        </DialogHeader>
        <Container className="mt-6">
          <Container className="flex-row gap-8 items-center">
            <Image src="/images/pubky-ring-phone.png" alt="App preview" width={96} height={256} />
            <Container className="space-y-6">
              <Container className="bg-foreground rounded-lg p-4 w-[192px] h-[192px] flex items-center justify-center">
                <QRCodeSVG value={imageBadge.href} size={160} />
              </Container>
              <Container className="justify-between items-center">
                <Link className="h-10 w-full" href={imageBadge.href} target="_blank">
                  <Image
                    src={imageBadge.src}
                    alt={imageBadge.alt}
                    width={imageBadge.width}
                    height={imageBadge.height}
                  />
                </Link>
              </Container>
            </Container>
          </Container>
        </Container>
      </DialogContent>
    </Dialog>
  );
}
