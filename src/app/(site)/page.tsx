'use client';

import { Button } from '@/components/ui/button';
import { SessionGuard } from '@/components/ui';
import { UserRoundPlus, LogIn, Shield, Key, Globe, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Convert to percentage
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;

      // Update CSS custom properties for the blur effect
      hero.style.setProperty('--mouse-x', `${xPercent}%`);
      hero.style.setProperty('--mouse-y', `${yPercent}%`);
    };

    hero.addEventListener('mousemove', handleMouseMove);

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <SessionGuard>
      <div className="flex flex-col justify-center">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className="relative overflow-hidden rounded-3xl"
          style={
            {
              '--mouse-x': '50%',
              '--mouse-y': '50%',
            } as React.CSSProperties
          }
        >
          {/* Animated background blur that follows mouse */}
          <div className="absolute inset-0 opacity-25">
            <div
              className="absolute w-80 h-80 bg-gradient-to-r from-green-500/20 to-green-500/15 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{
                left: 'var(--mouse-x)',
                top: 'var(--mouse-y)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="absolute w-60 h-60 bg-gradient-to-r from-green-500/10 to-green-500/8 rounded-full blur-2xl transition-all duration-1500 ease-out"
              style={{
                left: 'calc(var(--mouse-x) + 5%)',
                top: 'calc(var(--mouse-y) + 8%)',
                transform: 'translate(-50%, -50%)',
              }}
            />
            <div
              className="absolute w-48 h-48 bg-gradient-to-r from-green-500/8 to-green-500/6 rounded-full blur-xl transition-all duration-2000 ease-out"
              style={{
                left: 'calc(var(--mouse-x) - 3%)',
                top: 'calc(var(--mouse-y) - 5%)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>

          {/* Static background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/3" />

          <div className="relative flex flex-col items-center text-center gap-8 py-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm font-medium text-green-600">
              <Sparkles className="w-4 h-4" />
              Decentralized. Private. Yours.
            </div>

            {/* Main Heading */}
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="text-green-500 relative">
                  Unlock
                  <div className="absolute -inset-1 bg-green-500/20 blur-xl rounded-lg" />
                </span>
                <br />
                <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  the web
                </span>
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground max-w-2xl mx-auto">
                Your keys, your content, your rules.
                <br />
                <span className="text-green-500">Take control of your digital identity.</span>
              </h2>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="group w-[180px] px-8 py-6 text-lg rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/onboarding">
                  <UserRoundPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-[180px] px-8 py-6 text-lg rounded-full border-2 hover:bg-muted/50 transition-all duration-300"
                asChild
              >
                <Link href="#">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign in
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="group p-6 rounded-2xl border bg-card hover:bg-muted/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Key className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">Own Your Keys</h3>
            </div>
            <p className="text-muted-foreground">
              Generate and control your cryptographic keys. No central authority, no compromises.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border bg-card hover:bg-muted/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">Secure Backup</h3>
            </div>
            <p className="text-muted-foreground">
              Multiple backup options to keep your keys safe. Encrypted files and seed phrases you control.
            </p>
          </div>

          <div className="group p-6 rounded-2xl border bg-card hover:bg-muted/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Globe className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg">Control Your Data</h3>
            </div>
            <p className="text-muted-foreground">
              Choose your homeserver and connect to the growing Pubky network. More options coming soon.
            </p>
          </div>
        </div>
      </div>
    </SessionGuard>
  );
}
