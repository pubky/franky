/**
 * User API Endpoints
 *
 * All API endpoints related to user operations
 */
const PREFIX = 'user';

export enum RelationshipType {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following',
  FRIENDS = 'friends',
}

export type TUserRelationshipParams = {
  pubky: string;
  type: RelationshipType;
};

export const USER_API = {
  GET: (pubky: string) => `${PREFIX}/${pubky}`,
  GET_USERS_BY_RELATIONSHIP: ({ pubky, type }: TUserRelationshipParams) => `${PREFIX}/${pubky}/${type}`,
};

export type UserApiEndpoint = keyof typeof USER_API;
