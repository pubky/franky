'use client';

import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header, Footer, MainLayout } from '@/components/layout';

export default function NotFound() {
  return (
    <>
      <Header />
      <MainLayout>
        <div className="items-center text-center">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="text-8xl md:text-9xl font-bold text-green-500 animate-pulse mb-4">404</div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="text-green-500">Oops!</span> The monster escaped!
              </h1>
              <p className="text-xl text-muted-foreground">Looks like this page vanished into thin air!</p>
              <p className="text-lg text-muted-foreground">Even Franky couldn&apos;t bring this one back to life.</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button size="lg" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back Home
                </Link>
              </Button>
              <Button variant="secondary" className="cursor-pointer" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Experiment
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
      <Footer />
    </>
  );
}
