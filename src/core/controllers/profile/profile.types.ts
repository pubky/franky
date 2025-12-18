import * as Core from '@/core';
import z from 'zod';

export type UserControllerNewData = Omit<Core.NexusUserDetails, 'id' | 'indexed_at' | 'status'>;

export type TReadProfileParams = {
  userId: Core.Pubky;
};

export type TDeleteAccountInput = {
  pubky: Core.Pubky;
  setProgress?: (progress: number) => void;
};

export type TDownloadDataInput = {
  pubky: Core.Pubky;
  setProgress?: (progress: number) => void;
};

export type TCommitSetDetailsParams = {
  profile: z.infer<typeof Core.UiUserSchema>;
  image: string | null;
  pubky: Core.Pubky;
};

export type TCommitUpdateDetailsParams = {
  name: string;
  bio: string | undefined;
  links: Core.UiLink[] | undefined | null;
  image: string | null;
  pubky: Core.Pubky;
};
