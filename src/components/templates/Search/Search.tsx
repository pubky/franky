'use client';

import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as App from '@/app';

export function Search() {
  const router = useRouter();

  const handleLogout = () => {
    router.push(App.AUTH_ROUTES.LOGOUT);
  };

  return (
    <>
      <Molecules.DialogWelcome isOpen={false} onOpenChange={() => {}} name="" pubky="" bio="" />
      <Organisms.ContentLayout>
        <div className="flex items-center justify-between gap-4">
          <Atoms.Heading level={1} size="xl" className="text-2xl">
            Search
          </Atoms.Heading>
          <Atoms.Button id="search-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
            Logout
          </Atoms.Button>
        </div>

        <Atoms.Typography size="md" className="text-muted-foreground">
          Welcome to the Search page. Search for posts, users, and tags.
        </Atoms.Typography>

        <div className="flex flex-col gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <Atoms.Card key={i} className="p-6">
              <Atoms.Typography size="md" className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </Atoms.Typography>
            </Atoms.Card>
          ))}
        </div>
      </Organisms.ContentLayout>
    </>
  );
}
