import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function ProfilePageFriends() {
  const { connections, count } = Hooks.useProfileConnections(Hooks.CONNECTION_TYPE.FRIENDS);

  if (connections.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.UserConnectionsEmpty
          title="No friends yet"
          description={
            <>
              <Atoms.Typography
                as="p"
                className="mb-0 text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                Follow someone, and if they follow you back, you&apos;ll become friends!
              </Atoms.Typography>
              <Atoms.Typography
                as="p"
                className="text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                Start following Pubky users, you never know who might follow you back!
              </Atoms.Typography>
            </>
          }
          showActionButtons={true}
        />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Friends {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.UserConnectionsList connections={connections} />
    </Atoms.Container>
  );
}
