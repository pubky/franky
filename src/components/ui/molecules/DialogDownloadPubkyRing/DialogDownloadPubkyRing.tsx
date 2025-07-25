import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui';
import Image from 'next/image';

export function DialogDownloadPubkyRing({ store = 'apple' }: { store?: 'apple' | 'android' }) {
  const imageBadge =
    store === 'apple'
      ? {
          src: '/images/badge-apple.png',
          alt: 'App Store',
          width: 120,
          height: 40,
          href: 'https://apps.apple.com/us/app/pubky-ring/id6749690000',
        }
      : {
          src: '/images/badge-android.png',
          alt: 'Google Play',
          width: 120,
          height: 40,
          href: 'https://play.google.com/store/apps/details?id=com.pubky.ring',
        };

  return (
    <Dialog>
      {store === 'apple' ? (
        <a href={imageBadge.href} target="_blank" className="cursor-pointer block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={192} height={40} />
        </a>
      ) : (
        <a href={imageBadge.href} target="_blank" className="cursor-pointer block sm:hidden">
          <Image src={imageBadge.src} alt={imageBadge.alt} width={210} height={40} />
        </a>
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
        <div className="flex flex-colmt-6">
          <div className="flex gap-8 items-center">
            <Image src="/images/pubky-ring-phone.png" alt="App preview" width={96} height={256} />
            <div className="flex flex-col space-y-6">
              <div className="bg-foreground rounded-lg p-4 w-[192px] h-[192px]">QRCODE</div>
              <div className="flex justify-between items-center w-full">
                <a className="h-10 w-full" href="https://www.pubkyring.to/" target="_blank">
                  <Image
                    src={imageBadge.src}
                    alt={imageBadge.alt}
                    width={imageBadge.width}
                    height={imageBadge.height}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
