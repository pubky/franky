import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';

export function Profile() {
  return (
    <Atoms.Container
      size="container"
      className="min-h-dvh items-stretch gap-6 px-6 pb-6 pt-4 lg:gap-10 lg:min-h-0 lg:items-start"
    >
      <div data-testid="profile-content" className="flex w-full flex-1 flex-col gap-6 lg:gap-10 lg:flex-none">
        <Organisms.CreateProfileHeader />
        <Organisms.CreateProfileForm />
      </div>
    </Atoms.Container>
  );
}
