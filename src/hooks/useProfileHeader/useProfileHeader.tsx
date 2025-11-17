'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/app';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

// Assuming the data structure will look similar to this
interface UserDetails {
  id: string;
  name: string;
  bio: string;
  publicKey: string;
  emoji: string;
  status: string;
  image: string | null;
  indexed_at: number;
  link: string;
}

export function useProfileHeader(userId: string) {
  const router = useRouter();
  const { copyToClipboard } = Hooks.useCopyToClipboard();

  const userDetails = useLiveQuery(
    // This will be substituted by a controller call in the future
    () =>
      Promise.resolve<UserDetails>({
        id: userId,
        name: 'Satoshi Nakamoto',
        bio: 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
        publicKey: 'pk:pcoitzaep9o3m6dh1km3ysi4ug9jno8smu4pbsc73mhy1h8krd1y',
        emoji: '🌴',
        status: 'Vacationing',
        image: null,
        indexed_at: Date.now(),
        link: 'https://staging.pubky.app/profile/pcoitzaep9o3m6dh1km3ysi4ug9jno8smu4pbsc73mhy1h8krd1y',
      }),
    [userId],
  );

  const avatarUrl = userDetails?.image ? Core.filesApi.getAvatar(userDetails.id) : undefined;

  const profileData = {
    name: userDetails?.name ?? 'Satoshi Nakamoto',
    bio: userDetails?.bio ?? 'Authored the Bitcoin white paper, developed Bitcoin, mined first block, disappeared.',
    publicKey: userDetails?.publicKey ?? 'pk:pcoitzaep9o3m6dh1km3ysi4ug9jno8smu4pbsc73mhy1h8krd1y',
    emoji: userDetails?.emoji ?? '🌴',
    status: userDetails?.status ?? 'Vacationing',
    avatarUrl,
    link: userDetails?.link ?? 'https://staging.pubky.app/profile/pcoitzaep9o3m6dh1km3ysi4ug9jno8smu4pbsc73mhy1h8krd1y',
  };

  const handlers = {
    onEdit: () => {
      console.log('Edit clicked');
    },
    onCopyPublicKey: () => {
      void copyToClipboard('Copy public key clicked');
    },
    onSignOut: () => {
      router.push(AUTH_ROUTES.LOGOUT);
    },
    onStatusClick: () => {
      console.log('Status clicked');
    },
  };

  return {
    profileData,
    handlers,
    isLoading: !userDetails,
  };
}
