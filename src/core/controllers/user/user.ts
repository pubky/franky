import * as Core from '@/core';
import { PubkyAppUser } from 'pubky-app-specs';
import { z } from 'zod';

export class UserController {
  private constructor() {} // Prevent instantiation

  // Upload avatar to homeserver and return the url
  static async uploadAvatar(avatarFile: File, publicKey: string): Promise<string> {
    const homeserver = Core.HomeserverService.getInstance();

    // 1. Upload Blob
    const fileContent = await avatarFile.arrayBuffer();
    const blobData = new Uint8Array(fileContent);
    const blobResult = await Core.FileNormalizer.toBlob(blobData, publicKey);

    // Push blob to homeserver
    await homeserver.fetch(blobResult.meta.url, {
      method: 'PUT',
      body: blobResult.blob.data,
    });

    // 2. Create File Record
    const fileResult = await Core.FileNormalizer.toFile(avatarFile, blobResult.meta.url, publicKey);

    // Push file to homeserver
    await homeserver.fetch(fileResult.meta.url, {
      method: 'PUT',
      body: JSON.stringify(fileResult.file.toJson()),
    });
    return fileResult.meta.url;
  }

  static async saveProfile(
    profile: z.infer<typeof Core.UiUserSchema>,
    image: string | null,
    publicKey: string,
  ): Promise<Response> {
    // validate user profile specs
    // Q: What does it happen if the profile is invalid?
    const { user, meta } = await Core.UserNormalizer.to(
      {
        name: profile.name,
        bio: profile.bio ?? '',
        image: image ?? '',
        links: (profile.links ?? []).map((link) => ({ title: link.label, url: link.url })),
        status: '', // default is blank
      },
      publicKey,
    );
    const userJson = user.toJson() as PubkyAppUser;

    // save user profile in the global store
    Core.useProfileStore.getState().setCurrentUserPubky(publicKey);

    // Write the user profile to the homeserver
    const homeserver = Core.HomeserverService.getInstance();
    const response = await homeserver.fetch(meta.url, {
      method: 'PUT',
      body: JSON.stringify(userJson),
    });
    // if response is OK, save user to global store
    // else, throw specific error for UI to handle
    if (response.ok) {
      Core.useProfileStore.getState().setCurrentUserPubky(publicKey);
      // TODO: Also user profile action creator to mutate user profile in the store
    }
    return response;
  }

  static async insert(userData: Core.NexusUser | Core.UserModelSchema): Promise<Core.UserModel> {
    return await Core.UserModel.insert(userData);
  }

  static async get(userPK: Core.UserModelPK): Promise<Core.UserModel> {
    return await Core.UserModel.findById(userPK);
  }

  static async getByIds(userPKs: Core.UserModelPK[]): Promise<Core.UserModel[]> {
    return await Core.UserModel.find(userPKs);
  }

  // userData can be NexusUser or UserModelSchema because it can come from the homeserver or the database
  static async save(userData: Core.NexusUser | Core.UserModelSchema): Promise<Core.UserModel> {
    try {
      const existingUser = await Core.UserModel.findById(userData.details.id);
      await existingUser.edit(userData);
      return existingUser;
    } catch {
      // User doesn't exist, create new one
      return this.insert(userData);
    }
  }

  static async delete(userPK: Core.UserModelPK): Promise<void> {
    const user = await this.get(userPK);
    return await user.delete();
  }

  static async bulkSave(usersData: Core.NexusUser[]): Promise<Core.UserModel[]> {
    return await Core.UserModel.bulkSave(usersData);
  }

  static async bulkDelete(userPKs: Core.UserModelPK[]): Promise<void> {
    return await Core.UserModel.bulkDelete(userPKs);
  }
}
