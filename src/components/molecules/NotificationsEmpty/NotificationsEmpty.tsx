'use client';

import { Frown } from 'lucide-react';
import * as Molecules from '@/molecules';

export function NotificationsEmpty() {
  return (
    <Molecules.ProfilePageEmptyState
      imageSrc="/images/notifications-empty-state.png"
      imageAlt="Notifications - Empty state"
      icon={Frown}
      title="Nothing to see here yet"
      subtitle="Tags, follows, reposts and account information will be displayed here."
    />
  );
}
