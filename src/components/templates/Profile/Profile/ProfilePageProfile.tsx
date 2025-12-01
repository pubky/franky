'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

export function ProfilePageProfile() {
  const { currentUserPubky } = Core.useAuthStore();
  // Note: useProfileHeader guarantees a non-null profile with default values during loading
  const { profile, actions, isLoading } = Hooks.useProfileHeader(currentUserPubky ?? '');

  return (
    <Atoms.Container overrideDefaults={true} className="mt-6 flex flex-col gap-4 lg:mt-0 lg:hidden">
      {!isLoading && <Organisms.ProfilePageHeader profile={profile} actions={actions} />}
      <Atoms.Container overrideDefaults={true} className="flex flex-col gap-4 text-base text-muted-foreground">
        <Atoms.Typography as="p" className="text-base font-normal">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
          aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
          dolores eos qui ratione voluptatem sequi nesciunt.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
          numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima
          veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
          consequatur.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel
          illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos
          ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi
          sint occaecati cupiditate non provident.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem
          rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
          impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
          repellendus.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates
          repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut
          reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
          aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
          dolores eos qui ratione voluptatem sequi nesciunt.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
          numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima
          veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
          consequatur.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel
          illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos
          ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi
          sint occaecati cupiditate non provident.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem
          rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
          impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
          repellendus.
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-base font-normal">
          Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates
          repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut
          reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
        </Atoms.Typography>
      </Atoms.Container>
    </Atoms.Container>
  );
}
