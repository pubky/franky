import Dexie from 'dexie';
import * as Libs from '@/libs';
import * as Config from '@/config';
import * as Core from '@/core';

import { PostModelSchema, postTableSchema } from '@/core/models/post/posts.schema';
import { StreamModelSchema, streamTableSchema } from '@/core/models/stream/stream.schema';
import { userDetailsTableSchema } from '@/core/models/user/details/userDetails.schema';
import { userCountsTableSchema } from '@/core/models/user/counts/userCounts.schema';
import { userRelationshipsTableSchema } from '@/core/models/user/relationships/userRelationships.schema';
import { userConnectionsTableSchema } from '@/core/models/user/connections/userConnections.schema';
import { userTtlTableSchema } from '@/core/models/user/ttl/userTtl.schema';
import { tagCollectionTableSchema } from '@/core/models/abstract/tag.shema';

class AppDatabase extends Dexie {
  user_counts!: Dexie.Table<Core.UserCountsModelSchema>;
  user_details!: Dexie.Table<Core.UserDetailsModelSchema>;
  user_relationships!: Dexie.Table<Core.UserRelationshipsModelSchema>;
  user_tags!: Dexie.Table<Core.TagCollectionModelSchema<Core.Pubky>>;
  user_connections!: Dexie.Table<Core.UserConnectionsModelSchema>;
  user_ttl!: Dexie.Table<Core.UserTtlModelSchema>;

  streams!: Dexie.Table<StreamModelSchema>;

  posts!: Dexie.Table<PostModelSchema>;
  // post_tags!: Dexie.Table<Core.TagCollectionModelSchema<Core.PostModelPK>>;

  constructor() {
    super(Config.DB_NAME);

    try {
      this.version(Config.DB_VERSION).stores({
        user_counts: userCountsTableSchema,
        user_details: userDetailsTableSchema,
        user_relationships: userRelationshipsTableSchema,
        user_connections: userConnectionsTableSchema,
        user_ttl: userTtlTableSchema,
        user_tags: tagCollectionTableSchema,
        streams: streamTableSchema,
        // users: userTableSchema,
        posts: postTableSchema,
        // post_tags: tagCollectionTableSchema,
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

  async initialize() {
    try {
      const db = await Dexie.exists(Config.DB_NAME);

      if (!db) {
        Libs.Logger.info('Creating new database...');
        await this.open();
        return;
      }

      const currentVersion = this.verno;

      if (currentVersion !== Config.DB_VERSION) {
        Libs.Logger.info(`Database version mismatch. Current: ${currentVersion}, Expected: ${Config.DB_VERSION}`);
        try {
          await this.delete();
        } catch (error) {
          throw Libs.createDatabaseError(
            Libs.DatabaseErrorType.DB_DELETE_FAILED,
            'Failed to delete outdated database',
            500,
            {
              error,
              currentVersion,
              expectedVersion: Config.DB_VERSION,
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
            },
          );
        }
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
