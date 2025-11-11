'use client';

import { useRouter } from 'next/navigation';

import { AUTH_ROUTES } from '@/app';
import * as Organisms from '@/components/organisms';

export function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push(AUTH_ROUTES.LOGOUT);
  };

  return (
    <Organisms.ProfilePageHeader
      name="Satoshi Nakamoto"
      bio="Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared."
      publicKey="1QX7GKW3abcdef1234567890"
      emoji="🌴"
      status="Vacationing"
      onEdit={() => console.log('Edit clicked')}
      onCopyPublicKey={() => console.log('Copy public key clicked')}
      onLinkClick={() => console.log('Link clicked')}
      onSignOut={handleLogout}
      onStatusClick={() => console.log('Status clicked')}
    />
  );
}
