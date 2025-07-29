'use client';

import { Button, ButtonsNavigation, Card, Input, PopoverPublicKey, useToast } from '@/components/ui';
import { Copy, Key } from 'lucide-react';
import Image from 'next/image';

interface PublicKeyContentProps {
  className?: string;
  pubky: string;
  onHandleBackButton?: () => void;
  onHandleContinueButton?: () => void;
}

export function PublicKeyContent({
  className = 'container mx-auto px-6 lg:px-10 lg:pt-8',
  pubky,
  onHandleBackButton,
  onHandleContinueButton,
}: PublicKeyContentProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(pubky);
    const toastInstance = toast({
      title: 'Pubky copied to clipboard',
      description: pubky,
      action: (
        <Button
          variant="outline"
          className="rounded-full h-10 px-4 bg-transparent border-brand text-white hover:bg-brand/20"
          onClick={() => toastInstance.dismiss()}
        >
          OK
        </Button>
      ),
    });
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl lg:text-[60px] font-bold leading-tight">
              Your unique <span className="text-brand block lg:inline">pubky.</span>
            </h1>
            <h5 className="text-xl lg:text-2xl font-light text-muted-foreground">
              Share your pubky with your friends so they can follow you.
            </h5>
          </div>

          <Card className="p-6 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Image */}
              <div className="w-full lg:w-[265px] hidden lg:flex">
                <Image src="/images/key.png" alt="Key" className="w-full h-auto" width={265} height={265} />
              </div>
              <div className="flex flex-col gap-6 justify-center w-full">
                <div className="flex items-center gap-1">
                  <h3 className="text-2xl font-bold">Your pubky</h3>
                  <PopoverPublicKey />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="w-full flex sm:max-w-[576px]">
                    <div className="flex items-center gap-3 rounded-md border border-dashed border-brand bg-transparent pl-4 w-full">
                      <Key className="h-4 w-4 text-brand" />
                      <Input
                        className="cursor-pointer text-base font-medium text-brand !bg-transparent w-full h-12 border-none"
                        value={pubky}
                        readOnly
                        onClick={handleCopyToClipboard}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" className="rounded-full" onClick={handleCopyToClipboard}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to clipboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <ButtonsNavigation onHandleBackButton={onHandleBackButton} onHandleContinueButton={onHandleContinueButton} />
        </div>
      </div>
    </div>
  );
}
