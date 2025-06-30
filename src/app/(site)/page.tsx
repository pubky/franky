import { Button } from '@/components/ui/button';
import { UserRoundPlus, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-[72px] md:text-[128px] font-bold leading-[72px] md:leading-[128px]">
          <span className="text-base-brand font-bold text-green-500">Unlock</span>
          <br /> the web.
        </h1>
        <h2 className="text-3xl font-bold leading-9 text-foreground pb-2">Your keys, your content, your rules.</h2>
      </div>

      <div className="py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="w-full sm:w-[160px] rounded-full" asChild>
            <Link href="/onboarding">
              <UserRoundPlus className="mr-2 h-4 w-4" />
              Create account
            </Link>
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-[160px] rounded-full" asChild>
            <Link href="#">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
