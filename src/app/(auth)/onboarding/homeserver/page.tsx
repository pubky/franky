'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';

export default function CreateAccount() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="You are invited."
        subtitle="By creating an account, you agree to the Terms of Service, Privacy Policy, and you confirm you are over 18 years old."
        titleClassName="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-none text-foreground"
        subtitleClassName="text-lg sm:text-xl lg:text-2xl leading-8"
      />

      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Invite code</h3>
            <p className="text-sm sm:text-base opacity-80">
              Please enter your invite code. Don&apos;t have one? Contact the Pubky team.
            </p>
          </div>
          <div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">INVITE CODE</label>
              <div className="flex items-center gap-1 rounded-md border border-brand bg-alpha-90 p-3 sm:p-4">
                <span className="flex-1 text-sm sm:text-base text-brand">AXOP-MR7B-3CSQ</span>
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-20">
            <div className="flex flex-col gap-2 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">1GB storage for free</h3>
              <div className="flex flex-col gap-4">
                <p className="text-sm sm:text-base opacity-80 text-secondary-foreground">
                  You get 1GB of storage on the default Pubky homeserver, used for your posts, photos, videos, and
                  profile.
                </p>
                <p className="text-sm sm:text-base opacity-80 text-secondary-foreground">
                  Prefer hosting yourself? Switching to a different homeserver will be possible soon.
                </p>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Image
                src="https://ui.shadcn.com/placeholder.svg"
                alt="Storage illustration"
                width={336}
                height={336}
                className="rounded-md w-full max-w-[200px] sm:max-w-[250px] lg:max-w-[336px] h-auto"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full w-full sm:w-auto"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
          <Link href="/onboarding/profile">
            <span className="hidden sm:inline">Sign up & Create account</span>
            <span className="sm:hidden">Sign up & Create</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
