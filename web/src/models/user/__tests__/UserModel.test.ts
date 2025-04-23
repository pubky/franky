import { UserModel } from '../UserModel';
import { mockUserModel, mockTagDetails } from '../__mocks__/userModel.mocks';
import { db } from '../../database';

// Mock do IndexedDB
jest.mock('../../database', () => ({
  db: {
    users: {
      get: jest.fn()
    }
  }
}));

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a new UserModel instance', () => {
      const user = new UserModel(mockUserModel);
      expect(user).toBeInstanceOf(UserModel);
      expect(user.id).toBe(mockUserModel.id);
      expect(user.details).toEqual(mockUserModel.details);
      expect(user.counts).toEqual(mockUserModel.counts);
      expect(user.relationship).toEqual(mockUserModel.relationship);
      expect(user.followers).toEqual(mockUserModel.followers);
      expect(user.following).toEqual(mockUserModel.following);
      expect(user.tags).toEqual(mockUserModel.tags);
      expect(user.mutes).toEqual(mockUserModel.mutes);
      expect(user.indexed_at).toBe(mockUserModel.indexed_at);
      expect(user.updated_at).toBe(mockUserModel.updated_at);
      expect(user.sync_status).toBe(mockUserModel.sync_status);
      expect(user.sync_ttl).toBe(mockUserModel.sync_ttl);
    });
  });

  describe('get_tags', () => {
    it('should return user tags with pagination', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const tags = await UserModel.get_tags('user1', 0, 1);
      expect(tags).toEqual([mockTagDetails]);
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_tags('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_taggers', () => {
    it('should return taggers for a specific tag', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const taggers = await UserModel.get_taggers('user1', 'test');
      expect(taggers).toEqual(mockTagDetails.taggers);
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_taggers('user1', 'test')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when tag is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      await expect(UserModel.get_taggers('user1', 'nonexistent')).rejects.toThrow('Tag "nonexistent" not found for user user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_following', () => {
    it('should return list of users being followed', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const following = await UserModel.get_following('user1');
      expect(following).toEqual(mockUserModel.following);
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_following('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_followers', () => {
    it('should return list of followers', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const followers = await UserModel.get_followers('user1');
      expect(followers).toEqual(mockUserModel.followers);
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_followers('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_preview', () => {
    it('should return user preview', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const preview = await UserModel.get_preview('user1');
      expect(preview).toEqual({
        id: mockUserModel.id,
        name: mockUserModel.details.name,
        image: mockUserModel.details.image,
        status: mockUserModel.details.status
      });
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_preview('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_name', () => {
    it('should return user name', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const name = await UserModel.get_name('user1');
      expect(name).toBe(mockUserModel.details.name);
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_name('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });

  describe('get_user', () => {
    it('should return complete user model', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(mockUserModel);

      const user = await UserModel.get_user('user1');
      expect(user).toBeInstanceOf(UserModel);
      expect(user).toEqual(new UserModel(mockUserModel));
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });

    it('should throw error when user is not found', async () => {
      (db.users.get as jest.Mock).mockResolvedValueOnce(null);

      await expect(UserModel.get_user('user1')).rejects.toThrow('User not found with ID: user1');
      expect(db.users.get).toHaveBeenCalledWith('user1');
    });
  });
}); 