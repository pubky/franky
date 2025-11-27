import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function ProfilePageFollowing() {
  const { connections, count } = Hooks.useProfileConnections(Hooks.CONNECTION_TYPE.FOLLOWING);

  if (connections.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.UserConnectionsEmpty
          title="You are the algorithm"
          description={
            <>
              <Atoms.Typography
                as="p"
                className="mb-0 text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                Following account is a simple way to curate your timeline.
              </Atoms.Typography>
              <Atoms.Typography
                as="p"
                className="text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                Stay updated on the topics and people that interest you.
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
        Following {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.UserConnectionsList connections={connections} />
    </Atoms.Container>
  );
}
