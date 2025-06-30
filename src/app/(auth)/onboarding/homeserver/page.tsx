'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function CreateAccount() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-[60px] font-bold leading-none text-foreground">You are invited.</h1>
        <p className="text-2xl leading-8">
          By creating an account, you agree to the Terms of Service, Privacy Policy, and you confirm you are over 18
          years old.
        </p>
      </div>

      <div className="flex gap-4">
        <Card className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold text-foreground">Invite code</h3>
            <p className="opacity-80">Please enter your invite code. Don&apos;t have one? Contact the Pubky team.</p>
          </div>
          <div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">INVITE CODE</label>
              <div className="flex items-center gap-1 rounded-md border border-brand bg-alpha-90 p-4">
                <span className="flex-1 text-brand">AXOP-MR7B-3CSQ</span>
                <Check className="h-6 w-6 text-brand" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-8">
          <div className="flex gap-20">
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-foreground">1GB storage for free</h3>
              <div className="flex flex-col gap-4">
                <p className="opacity-80 text-secondary-foreground">
                  You get 1GB of storage on the default Pubky homeserver, used for your posts, photos, videos, and
                  profile.
                </p>
                <p className="opacity-80 text-secondary-foreground">
                  Prefer hosting yourself? Switching to a different homeserver will be possible soon.
                </p>
              </div>
            </div>
            <Image
              src="https://ui.shadcn.com/placeholder.svg"
              alt="Storage illustration"
              width={336}
              height={336}
              className="rounded-md"
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="lg" className="rounded-full" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button size="lg" className="rounded-full" asChild>
          <Link href="/onboarding/profile">
            Sign up & Create account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
