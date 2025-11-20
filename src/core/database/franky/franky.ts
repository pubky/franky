import Dexie from 'dexie';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as Core from '@/core';

import { PostStreamModelSchema, postStreamTableSchema } from '@/core/models/stream/post/postStream.schema';
import { userDetailsTableSchema } from '@/core/models/user/details/userDetails.schema';
import { userCountsTableSchema } from '@/core/models/user/counts/userCounts.schema';
import { userRelationshipsTableSchema } from '@/core/models/user/relationships/userRelationships.schema';
import { userConnectionsTableSchema } from '@/core/models/user/connections/userConnections.schema';
import { userTtlTableSchema } from '@/core/models/user/ttl/userTtl.schema';
import { postCountsTableSchema } from '@/core/models/post/counts/postCounts.schema';
import { postDetailsTableSchema } from '@/core/models/post/details/postDetails.schema';
import { postRelationshipsTableSchema } from '@/core/models/post/relationships/postRelationships.schema';
import { postTtlTableSchema } from '@/core/models/post/ttl/postTtl.schema';
import { fileDetailsTableSchema } from '@/core/models/file/fileDetails.schema';
import { tagCollectionTableSchema } from '@/core/models/shared/tag/tag.schema';
import { UserStreamModelSchema, userStreamTableSchema } from '@/core/models/stream/user/userStream.schema';
import { TagStreamModelSchema, tagStreamTableSchema } from '@/core/models/stream/tag/tagStream.schema';
import { notificationTableSchema } from '@/core/models/notification/notification.schema';

export class AppDatabase extends Dexie {
  private static readonly DEXIE_VERSION_MULTIPLIER = 10;

  // User
  user_counts!: Dexie.Table<Core.UserCountsModelSchema>;
  user_details!: Dexie.Table<Core.UserDetailsModelSchema>;
  user_relationships!: Dexie.Table<Core.UserRelationshipsModelSchema>;
  user_tags!: Dexie.Table<Core.TagCollectionModelSchema<Core.Pubky>>;
  user_connections!: Dexie.Table<Core.UserConnectionsModelSchema>;
  user_ttl!: Dexie.Table<Core.UserTtlModelSchema>;
  notifications!: Dexie.Table<Core.FlatNotification>;
  // Post
  post_counts!: Dexie.Table<Core.PostCountsModelSchema>;
  post_details!: Dexie.Table<Core.PostDetailsModelSchema>;
  post_relationships!: Dexie.Table<Core.PostRelationshipsModelSchema>;
  post_tags!: Dexie.Table<Core.TagCollectionModelSchema<string>>;
  post_ttl!: Dexie.Table<Core.PostTtlModelSchema>;
  // File
  file_details!: Dexie.Table<Core.FileDetailsModelSchema>;
  // Streams
  post_streams!: Dexie.Table<PostStreamModelSchema>;
  user_streams!: Dexie.Table<UserStreamModelSchema>;
  tag_streams!: Dexie.Table<TagStreamModelSchema>;
  constructor(databaseName: string = Config.DB_NAME) {
    super(databaseName);

    try {
      this.version(Config.DB_VERSION).stores({
        // User related tables
        user_counts: userCountsTableSchema,
        user_details: userDetailsTableSchema,
        user_relationships: userRelationshipsTableSchema,
        user_connections: userConnectionsTableSchema,
        user_ttl: userTtlTableSchema,
        user_tags: tagCollectionTableSchema,
        notifications: notificationTableSchema,
        // Post related tables
        post_counts: postCountsTableSchema,
        post_details: postDetailsTableSchema,
        post_relationships: postRelationshipsTableSchema,
        post_tags: tagCollectionTableSchema,
        post_ttl: postTtlTableSchema,
        // File related tables
        file_details: fileDetailsTableSchema,
        // Streams
        post_streams: postStreamTableSchema,
        user_streams: userStreamTableSchema,
        tag_streams: tagStreamTableSchema,
      });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DB_SCHEMA_ERROR,
        'Failed to initialize database schema',
        500,
        {
          error,
        },
      );
    }
  }

  private async getExistingDbVersion(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof indexedDB === 'undefined') {
          resolve(null);
          return;
        }

        const request = indexedDB.open(this.name);

        request.onerror = () => {
          if (request.error) {
            reject(request.error);
            return;
          }

          resolve(null);
        };

        request.onsuccess = () => {
          const version = request.result.version;
          request.result.close();
          resolve(typeof version === 'number' ? version : null);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private normalizeStoredVersion(version: number | null): number | null {
    if (version === null) {
      return null;
    }

    // Dexie always multiplies the version by 10 internally
    // If the version is >= 10, it's been multiplied by Dexie, so divide it back
    if (version >= AppDatabase.DEXIE_VERSION_MULTIPLIER) {
      return version / AppDatabase.DEXIE_VERSION_MULTIPLIER;
    }

    // If version is < 10, it's the raw user version (shouldn't happen in practice)
    return version;
  }

  private async recreateDatabase(currentVersion: number | null, rawVersion?: number | null) {
    try {
      this.close();

      if (typeof indexedDB !== 'undefined') {
        await new Promise<void>((resolve, reject) => {
          const deleteRequest = indexedDB.deleteDatabase(this.name);

          deleteRequest.onblocked = () => {
            Libs.Logger.warn(
              'Database deletion is blocked by open connections. Please close all other tabs/windows using this application.',
              {
                databaseName: this.name,
                hint: 'Close other browser tabs or windows that may be using this database',
              },
            );
          };

          deleteRequest.onsuccess = () => resolve();
          deleteRequest.onerror = () => reject(deleteRequest.error ?? new Error('Failed to delete database'));
        });
      } else {
        // Use Dexie.delete() which coordinates with other Dexie contexts
        await Dexie.delete(this.name);
      }
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DB_DELETE_FAILED,
        'Failed to delete outdated database',
        500,
        {
          error,
          currentVersion,
          rawVersion,
          expectedVersion: Config.DB_VERSION,
          databaseName: this.name,
        },
      );
    }

    try {
      await this.open();
      Libs.Logger.info('Database recreated with new schema');
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DB_OPEN_FAILED,
        'Failed to open database after recreation',
        500,
        {
          error,
          version: Config.DB_VERSION,
          rawVersion,
          databaseName: this.name,
        },
      );
    }
  }

  async initialize() {
    try {
      if (typeof indexedDB === 'undefined') {
        Libs.Logger.warn('IndexedDB is not available in this environment. Skipping database initialization.');
        return;
      }

      const dbExists = await Dexie.exists(this.name);

      if (!dbExists) {
        Libs.Logger.info('Creating new database...');
        await this.open();
        return;
      }

      let rawVersion: number | null = null;
      let currentVersion: number | null = null;

      try {
        rawVersion = await this.getExistingDbVersion();
        currentVersion = this.normalizeStoredVersion(rawVersion);
      } catch (error) {
        Libs.Logger.warn('Failed to determine current database version. Recreating database...', {
          error,
        });
      }

      if (currentVersion === null) {
        Libs.Logger.warn('Unable to determine current database version. Recreating database...');
        await this.recreateDatabase(currentVersion, rawVersion);
        return;
      }

      if (currentVersion !== Config.DB_VERSION) {
        Libs.Logger.info(`Database version mismatch. Current: ${currentVersion}, Expected: ${Config.DB_VERSION}`, {
          rawVersion,
          normalizedVersion: currentVersion,
          expectedVersion: Config.DB_VERSION,
          expectedInternalVersion: Config.DB_VERSION * AppDatabase.DEXIE_VERSION_MULTIPLIER,
        });
        await this.recreateDatabase(currentVersion, rawVersion);
      } else {
        Libs.Logger.debug('Database version is current');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AppError') throw error;

      throw Libs.createDatabaseError(Libs.DatabaseErrorType.DB_INIT_FAILED, 'Failed to initialize database', 500, {
        error,
      });
    }
  }
}

export const db = new AppDatabase();
