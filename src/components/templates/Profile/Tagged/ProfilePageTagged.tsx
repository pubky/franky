import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

/**
 * ProfilePageTagged Template
 *
 * Static layout template that renders the ProfileTagged organism.
 * Templates should only handle layout concerns, not data fetching.
 */
export function ProfilePageTagged(): React.ReactElement {
  return (
    <Atoms.Container className="mt-6 lg:mt-0">
      <Organisms.ProfileTagged />
    </Atoms.Container>
  );
}
