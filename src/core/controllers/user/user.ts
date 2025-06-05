import { UserPK, User, NexusUser } from '@/core';

export class UserController {
  private constructor() {} // Prevent instantiation

  static async get(userPK: UserPK): Promise<User> {
    return await User.findById(userPK);
  }

  static async getByIds(userPKs: UserPK[]): Promise<User[]> {
    return await User.find(userPKs);
  }

  static async save(userData: NexusUser): Promise<User> {
    try {
      const existingUser = await User.findById(userData.details.id);
      await existingUser.edit(userData);
      return existingUser;
    } catch {
      // User doesn't exist, create new one
      return await User.insert(userData);
    }
  }

  static async delete(userPK: UserPK): Promise<void> {
    const user = await this.get(userPK);
    return await user.delete();
  }

  static async bulkSave(usersData: NexusUser[]): Promise<User[]> {
    return await User.bulkSave(usersData);
  }

  static async bulkDelete(userPKs: UserPK[]): Promise<void> {
    return await User.bulkDelete(userPKs);
  }
}
