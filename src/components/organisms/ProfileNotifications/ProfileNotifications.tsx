import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export interface ProfileNotificationsProps {
  className?: string;
}

export function ProfileNotifications({ className }: ProfileNotificationsProps) {
  // TODO: Replace with actual data fetching
  const mockNotifications: string[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
        <Atoms.Card className="p-6 animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </Atoms.Card>
      </Atoms.Container>
    );
  }

  if (mockNotifications.length === 0) {
    return (
      <Molecules.ContentNotFound
        icon={<Libs.Bell size={48} className="text-brand" />}
        title="No notifications yet"
        description="When you get notifications, they'll show up here."
        className={className}
      />
    );
  }

  return (
    <Atoms.Container className={Libs.cn('flex flex-col gap-4', className)}>
      <Atoms.Card className="p-6">
        <Atoms.Heading level={2} size="lg" className="mb-4">
          Notifications
        </Atoms.Heading>
        <Atoms.Container className="flex flex-col gap-3">
          {mockNotifications.map((notificationId) => (
            <div key={notificationId} className="p-4 border rounded-lg">
              {/* TODO: Replace with actual notification component */}
              <p>Notification {notificationId}</p>
            </div>
          ))}
        </Atoms.Container>
      </Atoms.Card>
    </Atoms.Container>
  );
}
