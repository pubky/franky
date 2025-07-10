'use client';

import { Button, Card, PageHeader, InfoCard } from '@/components/ui';
import { AppWindow, Check, AlertTriangle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Starter() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <>
            Let&apos;s get <span className="text-green-500">started</span>.
          </>
        }
        subtitle="Let's get you onboarded and connected with your friends!"
        titleClassName="text-4xl md:text-6xl font-bold text-foreground"
        subtitleClassName="text-xl md:text-2xl text-muted-foreground"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pubky Ring Card */}
        <Card className="p-4 sm:p-6 md:col-span-2 lg:col-span-2">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div>
              <div className="flex items-start md:items-center gap-4 mb-3 flex-col md:flex-row">
                <h3 className="text-3xl font-bold">Recommended</h3>
                <Image src="/images/pubky-ring-logo.png" alt="Pubky Ring" width={142} height={30} />
              </div>
              <p className="text-lg text-muted-foreground">
                The most secure way to create your account. Your keys stay on your device.
              </p>
            </div>

            {/* Benefits */}
            <InfoCard title="Why choose Pubky Ring?" icon={Check} variant="success" collapsible defaultCollapsed>
              <ul className="space-y-1 list-disc list-inside">
                <li>Your keys never leave your device</li>
                <li>Works across all your devices and apps</li>
                <li>Industry-standard security protocols</li>
                <li>Easy backup and recovery options</li>
              </ul>
            </InfoCard>

            {/* Step-by-step flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">Download App</h4>
                  <p className="text-sm text-muted-foreground">Get Pubky Ring on your mobile device</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  Free & secure
                </div>
                <div className="flex flex-col gap-4 w-full max-w-36">
                  <Link href="#" className="h-12 w-full" target="_blank">
                    <Image
                      src="/images/download-apple.jpg"
                      alt="App Store"
                      width={288}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                  <Link href="#" className="h-12 w-full" target="_blank">
                    <Image
                      src="/images/download-android.jpg"
                      alt="Google Play"
                      width={288}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">Scan QR Code</h4>
                  <p className="text-sm text-muted-foreground">Open Pubky Ring and scan this code</p>
                </div>
                <div className="aspect-square bg-foreground rounded-lg w-48">
                  <Image
                    src="https://ui.shadcn.com/placeholder.svg"
                    alt="QR Code"
                    width={192}
                    height={192}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">You&apos;re Ready!</h4>
                  <p className="text-sm text-muted-foreground">Your account will be created securely</p>
                </div>
                <div className="aspect-square bg-muted rounded-lg w-48 overflow-hidden">
                  <Image
                    src="/images/pubky-ring-app.png"
                    alt="Pubky Ring App"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Alternative Method Card */}
        <Card className="p-4 sm:p-6 md:col-span-2 lg:col-span-1">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold">Alternative method</h3>
              <p className="text-secondary-foreground opacity-80">
                You can also choose to create your pubky and account in the browser. This method is quicker, but less
                secure.
              </p>
            </div>

            {/* Browser Method Benefits */}
            <InfoCard title="Browser method benefits" icon={Check} variant="amber" collapsible>
              <ul className="space-y-1 list-disc list-inside">
                <li>No app download needed</li>
                <li>Works on any browser</li>
                <li>Instant account creation</li>
                <li>Multiple backup options</li>
              </ul>
            </InfoCard>

            {/* Security Notice */}
            <InfoCard title="Security considerations" icon={AlertTriangle} variant="warning" collapsible>
              <ul className="space-y-1 list-disc list-inside">
                <li>Browser-based key generation</li>
                <li>Manual backup required</li>
                <li>Less secure than app</li>
              </ul>
            </InfoCard>

            <Button variant="secondary" className="rounded-full p-6" asChild>
              <Link href="/onboarding/keys">
                <AppWindow className="mr-2 h-4 w-4" />
                Create in browser
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
