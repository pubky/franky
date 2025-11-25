import { describe, it, expect } from 'vitest';
import { UserValidator } from './user.validator';

describe('UserValidator', () => {
  const createMockImageFile = (name = 'avatar.png', type = 'image/png'): File => {
    return new File(['fake-image-content'], name, { type });
  };

  describe('check', () => {
    it('should validate valid user data', () => {
      const result = UserValidator.check(
        'John Doe',
        'Software developer',
        [{ label: 'Website', url: 'https://example.com' }],
        createMockImageFile(),
      );

      expect(result.error).toHaveLength(0);
      expect(result.data).toEqual({
        name: 'John Doe',
        bio: 'Software developer',
        links: [{ label: 'Website', url: 'https://example.com' }],
        avatar: expect.any(File),
      });
    });

    it('should handle minimal valid data', () => {
      const result = UserValidator.check('Alice', '', [], null);

      expect(result.error).toHaveLength(0);
      expect(result.data?.name).toBe('Alice');
      expect(result.data?.bio).toBe('');
      expect(result.data?.links).toBeUndefined();
      expect(result.data?.avatar).toBeNull();
    });

    it('should trim name and validate minimum length', () => {
      // Valid after trimming
      const valid = UserValidator.check('  Bob  ', '', [], null);
      expect(valid.error).toHaveLength(0);
      expect(valid.data?.name).toBe('Bob');

      // Invalid - too short
      const invalid = UserValidator.check('Jo', '', [], null);
      expect(invalid.error).toContainEqual({
        type: 'name',
        message: 'Name must be at least 3 characters',
      });

      // Invalid - empty after trim
      const empty = UserValidator.check('  ', '', [], null);
      expect(empty.error).toContainEqual({
        type: 'name',
        message: 'Name must be at least 3 characters',
      });
    });

    it('should filter empty URLs and trim link URLs', () => {
      const links = [
        { label: 'Site', url: '  https://example.com  ' },
        { label: 'Empty', url: '   ' },
        { label: 'Valid', url: 'https://test.com' },
        { label: 'Blank', url: '' },
      ];

      const result = UserValidator.check('ValidUser', '', links, null);

      expect(result.error).toHaveLength(0);
      expect(result.data?.links).toHaveLength(2);
      expect(result.data?.links?.[0].url).toBe('https://example.com');
      expect(result.data?.links?.[1].url).toBe('https://test.com');
    });

    it('should validate link URLs format', () => {
      const links = [
        { label: 'Invalid', url: 'not-a-url' },
        { label: 'Valid', url: 'https://example.com' },
        { label: 'Also Invalid', url: 'just-text' },
      ];

      const result = UserValidator.check('TestUser', '', links, null);

      expect(result.error).toContainEqual({
        type: 'link_0',
        message: 'Invalid URL',
      });
      expect(result.error).toContainEqual({
        type: 'link_2',
        message: 'Invalid URL',
      });
      expect(result.error).toHaveLength(2);
    });

    it('should validate avatar file type', () => {
      const validAvatar = createMockImageFile('photo.jpg', 'image/jpeg');
      const validResult = UserValidator.check('User', '', [], validAvatar);
      expect(validResult.error).toHaveLength(0);

      const invalidAvatar = new File(['content'], 'doc.pdf', { type: 'application/pdf' });
      const invalidResult = UserValidator.check('User', '', [], invalidAvatar);
      expect(invalidResult.error).toContainEqual({
        type: 'avatar',
        message: 'Avatar must be an image file',
      });
    });

    it('should handle multiple validation errors', () => {
      const result = UserValidator.check(
        'AB', // Too short
        'Some bio',
        [
          { label: 'Bad', url: 'invalid-url' },
          { label: 'Good', url: 'https://valid.com' },
          { label: 'Wrong', url: 'not-valid' },
        ],
        new File([''], 'video.mp4', { type: 'video/mp4' }),
      );

      expect(result.error.length).toBeGreaterThan(0);
      expect(result.error).toContainEqual({
        type: 'name',
        message: 'Name must be at least 3 characters',
      });
      expect(result.error).toContainEqual({
        type: 'link_0',
        message: 'Invalid URL',
      });
      expect(result.error).toContainEqual({
        type: 'link_2',
        message: 'Invalid URL',
      });
      expect(result.error).toContainEqual({
        type: 'avatar',
        message: 'Avatar must be an image file',
      });
    });

    it('should handle empty arrays and undefined values correctly', () => {
      const result = UserValidator.check('TestUser', '', [], null);

      expect(result.error).toHaveLength(0);
      expect(result.data?.links).toBeUndefined(); // Empty array becomes undefined
    });

    it('should handle various image types', () => {
      const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

      imageTypes.forEach((type) => {
        const file = createMockImageFile(`image.${type.split('/')[1]}`, type);
        const result = UserValidator.check('User', '', [], file);
        expect(result.error).toHaveLength(0);
      });
    });

    it('should trim bio field', () => {
      const result = UserValidator.check('ValidUser', '  Some bio text  ', [], null);

      expect(result.error).toHaveLength(0);
      expect(result.data?.bio).toBe('Some bio text');
    });

    it('should handle link label validation', () => {
      // Note: The current implementation only maps URL errors (line 22 checks field === 'url')
      // Empty labels will cause validation to fail but errors won't be mapped to errorList
      const links = [{ label: '', url: 'https://example.com' }];

      const result = UserValidator.check('TestUser', '', links, null);

      // The validation will fail but error won't be in errorList due to implementation
      expect(result.data).toBeUndefined();
    });

    it('should preserve link labels in output', () => {
      const links = [
        { label: 'GitHub', url: 'https://github.com/user' },
        { label: 'Blog', url: 'https://blog.example.com' },
      ];

      const result = UserValidator.check('TestUser', '', links, null);

      expect(result.error).toHaveLength(0);
      expect(result.data?.links?.[0].label).toBe('GitHub');
      expect(result.data?.links?.[1].label).toBe('Blog');
    });
  });
});
