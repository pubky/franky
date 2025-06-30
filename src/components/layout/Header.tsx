'use client';

import { Button } from '@/components/ui/button';
import { LogIn, Twitter, Youtube, Github, Menu, X, BookOpen, HelpCircle, UserPlus } from 'lucide-react';
import { Logo } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 ">
      <div className="container mx-auto px-6 py-4 max-w-screen-xl">
        <div className="flex items-center justify-between">
          <Logo className="cursor-pointer" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link
                href="/docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Docs
              </Link>
              <Link
                href="/help"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a
                  href="https://twitter.com/getpubky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://www.youtube.com/channel/UCyNruUjynpzvQXNTxbJBLmg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  aria-label="Watch us on YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/pubky"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                  aria-label="View our code on GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>

              <div className="h-6 w-px bg-border" />

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="#">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/onboarding">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Get started
                  </Link>
                </Button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/docs"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </Link>

              <div className="h-px bg-border my-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Follow us</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://twitter.com/getpubky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    aria-label="Follow us on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UCyNruUjynpzvQXNTxbJBLmg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    aria-label="Watch us on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/pubky"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                    aria-label="View our code on GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex flex-col gap-3">
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <Link href="#" onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="justify-start" asChild>
                  <Link href="/onboarding" onClick={() => setIsMobileMenuOpen(false)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Get started
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
