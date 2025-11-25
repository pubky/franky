'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function ProfilePageNotifications() {
  const { notifications, count, isLoading } = Hooks.useNotifications();

  if (isLoading) {
    return (
      <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-4 lg:mt-0">
        <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
          Notifications {count > 0 && `(${count})`}
        </Atoms.Heading>
        <Atoms.Container overrideDefaults={true} className="flex items-center justify-center py-8">
          <Atoms.Spinner size="lg" />
        </Atoms.Container>
      </Atoms.Container>
    );
  }

  if (notifications.length === 0) {
    return (
      <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-4 lg:mt-0">
        <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
          Notifications {count > 0 && `(${count})`}
        </Atoms.Heading>
        <Molecules.NotificationsEmpty />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Notifications {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.NotificationsList notifications={notifications} />
    </Atoms.Container>
  );
}
