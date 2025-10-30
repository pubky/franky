export const homeserverUrl = {
  // TODO: Maybe use pubkyappspecs utils here?
  lastRead: (userId: string) => `pubky://${userId}/pub/pubky.app/last_read`,
};
