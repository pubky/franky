import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { LocalFileService } from './file';

describe('LocalFileService', () => {
  const testPubky: Core.Pubky = 'operrr8wsbpr3ue9d4qj41ge1kcc6r7fdiy6o3ugjrrhi4y77rd0';
  const testFileId1 = 'file-test-1';
  const testFileId2 = 'file-test-2';
  const compositeId1 = Core.buildCompositeId({ pubky: testPubky, id: testFileId1 });
  const compositeId2 = Core.buildCompositeId({ pubky: testPubky, id: testFileId2 });

  const createMockFile = (fileId: string, overrides?: Partial<Core.NexusFileDetails>): Core.NexusFileDetails => ({
    id: Core.buildCompositeId({ pubky: testPubky, id: fileId }),
    name: `test-file-${fileId}.jpg`,
    src: `https://example.com/files/${fileId}`,
    content_type: 'image/jpeg',
    size: 102400,
    created_at: 1234567890,
    indexed_at: 1234567890,
    metadata: {},
    owner_id: testPubky,
    uri: `pubky://${testPubky}/pub/pubky.app/files/${fileId}`,
    urls: {
      feed: `https://example.com/files/${fileId}-feed.jpg`,
      main: `https://example.com/files/${fileId}-main.jpg`,
      small: `https://example.com/files/${fileId}-small.jpg`,
    },
    ...overrides,
  });

  beforeEach(async () => {
    await Core.resetDatabase();
  });

  describe('persistFiles', () => {
    it('saves multiple files', async () => {
      const file1 = createMockFile(testFileId1);
      const file2 = createMockFile(testFileId2);
      await LocalFileService.persistFiles({ files: [file1, file2] });

      const [saved1, saved2] = await Promise.all([
        Core.FileDetailsModel.findById(compositeId1),
        Core.FileDetailsModel.findById(compositeId2),
      ]);

      expect(saved1?.name).toBe(file1.name);
      expect(saved2?.name).toBe(file2.name);
    });

    it('saves single file', async () => {
      const file = createMockFile(testFileId1);
      await LocalFileService.persistFiles({ files: [file] });

      const saved = await Core.FileDetailsModel.findById(compositeId1);
      expect(saved?.name).toBe(file.name);
      expect(saved?.content_type).toBe(file.content_type);
    });

    it('handles empty array', async () => {
      await expect(LocalFileService.persistFiles({ files: [] })).resolves.not.toThrow();
      expect(await Core.FileDetailsModel.table.toArray()).toHaveLength(0);
    });

    it('updates existing files', async () => {
      await LocalFileService.persistFiles({ files: [createMockFile(testFileId1, { name: 'original.jpg' })] });
      await LocalFileService.persistFiles({
        files: [createMockFile(testFileId1, { name: 'updated.jpg', size: 204800 })],
      });

      const saved = await Core.FileDetailsModel.findById(compositeId1);
      expect(saved?.name).toBe('updated.jpg');
      expect(saved?.size).toBe(204800);
    });

    it('saves all file properties', async () => {
      const file = createMockFile(testFileId1, {
        content_type: 'image/png',
        size: 204800,
        metadata: { width: '1920', height: '1080' },
      });
      await LocalFileService.persistFiles({ files: [file] });

      const saved = await Core.FileDetailsModel.findById(compositeId1);
      expect(saved?.content_type).toBe('image/png');
      expect(saved?.size).toBe(204800);
      expect(saved?.metadata).toEqual({ width: '1920', height: '1080' });
    });

    it('propagates database error when bulkSave fails', async () => {
      const file = createMockFile(testFileId1);
      const databaseError = Libs.createDatabaseError(
        Libs.DatabaseErrorType.BULK_OPERATION_FAILED,
        'Failed to bulk save records in file_details',
        500,
        { error: new Error('Database connection lost'), rowsCount: 1 },
      );

      vi.spyOn(Core.FileDetailsModel, 'bulkSave').mockRejectedValueOnce(databaseError);

      await expect(LocalFileService.persistFiles({ files: [file] })).rejects.toMatchObject({
        type: 'BULK_OPERATION_FAILED',
        message: 'Failed to bulk save records in file_details',
        statusCode: 500,
      });
    });

    it('propagates generic error when bulkSave throws', async () => {
      const file = createMockFile(testFileId1);
      const error = new Error('Unexpected database error');

      vi.spyOn(Core.FileDetailsModel, 'bulkSave').mockRejectedValueOnce(error);

      await expect(LocalFileService.persistFiles({ files: [file] })).rejects.toThrow('Unexpected database error');
    });
  });

  describe('findByIds', () => {
    it('returns files for valid IDs', async () => {
      const [file1, file2] = [createMockFile(testFileId1), createMockFile(testFileId2)];
      await LocalFileService.persistFiles({ files: [file1, file2] });

      const result = await LocalFileService.findByIds([compositeId1, compositeId2]);

      expect(result).toHaveLength(2);
      const ids = result.map((f) => f.id).sort();
      expect(ids).toEqual([compositeId1, compositeId2].sort());
      expect(result.find((f) => f.id === compositeId1)?.name).toBe(file1.name);
    });

    it('returns single file', async () => {
      const file = createMockFile(testFileId1);
      await LocalFileService.persistFiles({ files: [file] });

      const result = await LocalFileService.findByIds([compositeId1]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(compositeId1);
      expect(result[0].name).toBe(file.name);
    });

    it('returns empty array for non-existent IDs', async () => {
      const nonExistentId = Core.buildCompositeId({ pubky: testPubky, id: 'non-existent' });
      expect(await LocalFileService.findByIds([nonExistentId])).toEqual([]);
    });

    it('returns only existing files when some IDs are missing', async () => {
      await LocalFileService.persistFiles({ files: [createMockFile(testFileId1)] });

      const nonExistentId = Core.buildCompositeId({ pubky: testPubky, id: 'non-existent' });
      const result = await LocalFileService.findByIds([compositeId1, nonExistentId]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(compositeId1);
    });

    it('handles empty array', async () => {
      expect(await LocalFileService.findByIds([])).toEqual([]);
    });

    it('does not preserve order', async () => {
      await LocalFileService.persistFiles({ files: [createMockFile(testFileId1), createMockFile(testFileId2)] });

      const result = await LocalFileService.findByIds([compositeId2, compositeId1]);

      expect(result).toHaveLength(2);
      expect(result.map((f) => f.id).sort()).toEqual([compositeId1, compositeId2].sort());
    });

    it('returns all file properties', async () => {
      const file = createMockFile(testFileId1, {
        name: 'test-image.png',
        content_type: 'image/png',
        size: 512000,
        metadata: { custom: 'value' },
      });
      await LocalFileService.persistFiles({ files: [file] });

      const [found] = await LocalFileService.findByIds([compositeId1]);

      expect(found).toMatchObject({
        id: compositeId1,
        name: 'test-image.png',
        content_type: 'image/png',
        size: 512000,
        metadata: { custom: 'value' },
        owner_id: testPubky,
        uri: file.uri,
      });
    });
  });
});
