import * as Core from '@/core';

export class LocalUserService {
    private constructor() {} // Prevent instantiation

    static async getDetails({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserDetails | null> {
        return await Core.UserDetailsModel.findById(userId);
    }

    static async getUserRelationships({ userId }: Core.TReadProfileParams): Promise<Core.NexusUserRelationship | null> {
        return await Core.UserRelationshipsModel.findById(userId);
    }
}