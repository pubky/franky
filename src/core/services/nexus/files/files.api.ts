/**
 * Files API Endpoints
 *
 * All API endpoints related to files operations
 */

export enum FileVariant {
  SMALL = 'small',
  FEED = 'feed',
  MAIN = 'main',
}

export type TImageParams = {
  pubky: string;
  file_id: string;
  variant: FileVariant;
};

export const FILES_API = {
  GET_AVATAR: (pubky: string) => `avatar/${pubky}`,
  GET_IMAGE: ({ pubky, file_id, variant }: TImageParams) => `files/${pubky}/${file_id}/${variant}`,
};

export type FilesApiEndpoint = keyof typeof FILES_API;
