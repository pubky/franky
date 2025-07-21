'use client';

import { Header, HeroSection } from '@/components/ui';

export default function Home() {
  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
  };

  return (
    <div className="dark min-h-screen bg-background">
      <Header onSignIn={handleSignIn} githubUrl="#" twitterUrl="#" telegramUrl="#" />

      <main className="relative">
        <HeroSection
          title="Unlock
the web."
          subtitle="Pubky requires an invite code"
          onSignIn={handleSignIn}
          onCreateAccount={handleCreateAccount}
        />
      </main>
    </div>
  );
}
