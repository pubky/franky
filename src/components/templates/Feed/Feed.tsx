'use client';

import { useRouter } from 'next/navigation';

import { Button, Heading, Typography, Card } from '@/components';
import { ContentLayout } from '@/organisms';
import { AUTH_ROUTES } from '@/app';

export function Feed() {
  const router = useRouter();

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  return (
    <ContentLayout>
      <Heading level={1} size="xl" className="text-2xl">
        Feed
      </Heading>

      <Typography size="md" className="text-muted-foreground">
        Welcome to your feed. This is where you&apos;ll see posts from people you follow.
      </Typography>

      {/* Placeholder content */}
      <div className="flex flex-col gap-4 mt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6">
            <Typography size="md" className="font-semibold mb-2">
              Post {i}
            </Typography>
            <Typography size="sm" className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </Typography>
            <Typography size="sm" className="text-muted-foreground mt-4">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
              laborum.
            </Typography>
          </Card>
        ))}
      </div>

      <Button id="feed-logout-btn" variant="secondary" size="lg" onClick={handleLogout} className="mt-6">
        Logout
      </Button>
    </ContentLayout>
  );
}
