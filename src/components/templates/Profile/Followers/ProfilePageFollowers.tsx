import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Hooks from '@/hooks';

export function ProfilePageFollowers() {
  const { connections, count } = Hooks.useProfileConnections(Hooks.CONNECTION_TYPE.FOLLOWERS);

  if (connections.length === 0) {
    return (
      <Atoms.Container className="mt-6 lg:mt-0">
        <Molecules.UserConnectionsEmpty
          title="Looking for followers?"
          description={
            <>
              <Atoms.Typography
                as="p"
                className="mb-0 text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                When someone follows this account, their profile will appear here.
              </Atoms.Typography>
              <Atoms.Typography
                as="p"
                className="text-center text-base leading-6 font-medium text-secondary-foreground"
              >
                Start posting and engaging with others to grow your followers!
              </Atoms.Typography>
            </>
          }
        />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="mt-6 gap-4 lg:mt-0">
      <Atoms.Heading level={5} size="lg" className="leading-normal font-light text-muted-foreground lg:hidden">
        Followers {count > 0 && `(${count})`}
      </Atoms.Heading>
      <Molecules.UserConnectionsList connections={connections} />
    </Atoms.Container>
  );
}
