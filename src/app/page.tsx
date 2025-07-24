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
    <>
      {/* Full viewport background */}
      <div
        className={`opacity-10 lg:opacity-100 fixed inset-0 bg-cover bg-center bg-no-repeat -z-10`}
        style={{
          backgroundImage: 'url(/images/bg-home.svg)',
        }}
      />

      <div className="dark min-h-screen bg-transparent z-10">
        <Header onSignIn={handleSignIn} githubUrl="#" twitterUrl="#" telegramUrl="#" />

        <main className="relative">
          <HeroSection
            title={
              <>
                <span className="text-brand">Unlock</span>
                <br />
                the web.
              </>
            }
            subtitle="Pubky requires an invite code"
            onSignIn={handleSignIn}
            onCreateAccount={handleCreateAccount}
          />
        </main>
      </div>
    </>
  );
}
