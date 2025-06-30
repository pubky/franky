import { UserModelPK, UserModel, NexusUser, UserModelSchema } from '@/core';

export class UserController {
  private constructor() {} // Prevent instantiation

  static async insert(userData: NexusUser | UserModelSchema): Promise<UserModel> {
    return await UserModel.insert(userData);
  }

  static async get(userPK: UserModelPK): Promise<UserModel> {
    return await UserModel.findById(userPK);
  }

  static async getByIds(userPKs: UserModelPK[]): Promise<UserModel[]> {
    return await UserModel.find(userPKs);
  }

  // userData can be NexusUser or UserModelSchema because it can come from the homeserver or the database
  static async save(userData: NexusUser | UserModelSchema): Promise<UserModel> {
    try {
      const existingUser = await UserModel.findById(userData.details.id);
      await existingUser.edit(userData);
      return existingUser;
    } catch {
      // User doesn't exist, create new one
      return this.insert(userData);
    }
  }

  static async delete(userPK: UserModelPK): Promise<void> {
    const user = await this.get(userPK);
    return await user.delete();
  }

  static async bulkSave(usersData: NexusUser[]): Promise<UserModel[]> {
    return await UserModel.bulkSave(usersData);
  }

  static async bulkDelete(userPKs: UserModelPK[]): Promise<void> {
    return await UserModel.bulkDelete(userPKs);
  }
}
