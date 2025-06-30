import { Button } from '@/components/ui/button';
import { LogIn, Twitter, Youtube, Github } from 'lucide-react';
import { Logo } from '@/components/ui';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-6 max-w-screen-xl">
        <div className="flex items-center justify-between">
          <Logo className="cursor-pointer" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6">
              <a
                href="https://twitter.com/getpubky"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCyNruUjynpzvQXNTxbJBLmg"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Youtube className="w-6 h-6" />
              </a>
              <a
                href="https://github.com/pubky"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
            <Button variant="secondary" size="default" className="rounded-full" asChild>
              <Link href="#">
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex flex-col gap-4">
              <Button variant="secondary" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
