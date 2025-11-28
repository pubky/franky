import { Table, IndexableType } from 'dexie';
import * as Libs from '@/libs';
import { BaseStreamModelSchema } from './stream.type';

/**
 * Abstract base class for all stream models
 * Provides common functionality for database operations and item management
 * Follows the same pattern as RecordModelBase
 *
 * NOTE: It cannot apply baseModel because in some scenarios has to keep the order of the items in the stream.
 *
 * @template TId - The type of the stream ID
 * @template TItem - The type of items in the stream
 * @template TSchema - The schema type that extends BaseStreamModelSchema
 */
export abstract class BaseStreamModel<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>> {
  /** The unique identifier for this stream */
  id: TId;

  /** Array of items in this stream */
  stream: TItem[];

  /**
   * Creates a new stream model instance
   * @param streamData - The stream data containing id and stream items
   */
  protected constructor({ id, stream }: TSchema) {
    this.id = id;
    this.stream = stream || [];
  }

  /**
   * Creates a new stream in the database (strict insert).
   * Fails if a stream with the given id already exists.
   *
   * @param this - Context containing the table reference
   * @param id - The unique identifier for the stream
   * @param stream - Array of items to initialize the stream with (defaults to empty array)
   * @returns Promise that resolves to the created stream data
   * @throws {DatabaseError} When creation fails (including if the stream already exists)
   *
   * @example
   * ```typescript
   * const stream = await PostStreamModel.create('my-stream', ['post1', 'post2']);
   * ```
   */
  static async create<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema> },
    id: TId,
    stream: TItem[] = [],
  ): Promise<TSchema> {
    try {
      const streamData = { id, stream } as TSchema;
      await this.table.add(streamData);

      Libs.Logger.debug(`${this.table.name} row created successfully`, { streamId: id, stream });
      return streamData;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
        `Failed to create stream in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id, streamLength: stream?.length ?? 0 },
      );
    }
  }

  /**
   * Inserts or replaces a stream in the database (upsert operation).
   * If a stream with the given id already exists, it will be completely replaced.
   *
   * @param this - Context containing the table reference
   * @param id - The unique identifier for the stream
   * @param stream - Array of items to initialize the stream with (defaults to empty array)
   * @returns Promise that resolves to the upserted stream data
   * @throws {DatabaseError} When upsert fails
   *
   * @example
   * ```typescript
   * const stream = await PostStreamModel.upsert('my-stream', ['post1', 'post2']);
   * ```
   */
  static async upsert<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema> },
    id: TId,
    stream: TItem[] = [],
  ): Promise<TSchema> {
    try {
      const streamData = { id, stream } as TSchema;
      await this.table.put(streamData);

      Libs.Logger.debug(`${this.table.name} row upserted successfully`, { streamId: id, stream });
      return streamData;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPSERT_FAILED,
        `Failed to upsert stream in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id, streamLength: stream?.length ?? 0 },
      );
    }
  }

  /**
   * Finds a stream by its ID
   * @param this - Context containing the table reference and constructor
   * @param id - The unique identifier to search for
   * @returns Promise that resolves to the stream model instance or null if not found
   * @throws {DatabaseError} When the search fails
   *
   * @example
   * ```typescript
   * const stream = await PostStreamModel.findById('my-stream');
   * if (stream) {
   *   console.log(stream.stream.length);
   * }
   * ```
   */
  static async findById<
    TId,
    TItem,
    TSchema extends BaseStreamModelSchema<TId, TItem>,
    TModel extends BaseStreamModel<TId, TItem, TSchema>,
  >(this: { table: Table<TSchema>; new (data: TSchema): TModel }, id: TId): Promise<TModel | null> {
    try {
      const stream = await this.table.get(id);
      if (!stream) {
        return null;
      }
      return new this(stream);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.FIND_FAILED,
        `Failed to find stream in ${this.table.name}: ${String(id)}`,
        500,
        {
          error,
          streamId: id,
        },
      );
    }
  }

  /**
   * Deletes a stream by its ID
   * @param this - Context containing the table reference
   * @param id - The unique identifier of the stream to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {DatabaseError} When deletion fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.deleteById('my-stream');
   * ```
   */
  static async deleteById<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema> },
    id: TId,
  ): Promise<void> {
    try {
      await this.table.delete(id);
      Libs.Logger.debug(`${this.table.name} row deleted by ID`, { streamId: id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete stream in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id },
      );
    }
  }

  /**
   * Clears all streams from the table
   * @param this - Context containing the table reference
   * @returns Promise that resolves when all streams are cleared
   * @throws {DatabaseError} When clearing fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.clear();
   * ```
   */
  static async clear<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(this: {
    table: Table<TSchema>;
  }): Promise<void> {
    try {
      await this.table.clear();
      Libs.Logger.debug(`${this.table.name} cleared successfully`);
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to clear table ${this.table.name}`,
        500,
        { error },
      );
    }
  }

  static async getStreamHead<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema> },
    id: TId,
  ): Promise<TItem | null> {
    try {
      const stream = await this.table.get(id);

      // If no stream exists for this ID, there is no head
      if (!stream || !stream.stream || stream.stream.length === 0) {
        return null;
      }

      // Return the first element of the stream array (head)
      return stream.stream[0] ?? null;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.FIND_FAILED,
        `Failed to get stream head in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id },
      );
    }
  }

  /**
   * Adds items to the head of the stream array in the database (atomic operation)
   * Creates the stream if it doesn't exist, filters out duplicates before adding
   *
   * @param this - Context containing the table reference and static methods
   * @param id - The stream ID to update
   * @param items - Array of items to add to the head of the stream
   * @returns Promise that resolves when the operation completes
   * @throws {DatabaseError} When the update fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.prependItems('home-feed', ['item1', 'item2']);
   * ```
   */
  static async prependItems<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema>; upsert: (id: TId, stream: TItem[]) => Promise<TSchema> },
    id: TId,
    items: TItem[],
  ): Promise<void> {
    try {
      // Check if stream exists
      const existingStream = await this.table.get(id);

      if (existingStream) {
        // Update existing stream
        await this.table
          .where('id')
          .equals(id as IndexableType)
          .modify((stream) => {
            // Filter out items that already exist in the stream
            const newItems = items.filter((item) => !stream.stream.includes(item));

            if (newItems.length > 0) {
              // Add new items to the beginning of the stream
              stream.stream.unshift(...newItems);
            }
          });
      } else {
        // Create new stream with the items
        await this.upsert(id, items);
      }

      Libs.Logger.debug(`${this.table.name} items prepended to stream successfully`, {
        streamId: id,
        itemsAdded: items.length,
      });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPDATE_FAILED,
        `Failed to prepend items to stream in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id, itemsCount: items.length },
      );
    }
  }

  /**
   * Removes items from the stream array in the database (atomic operation)
   * Silently succeeds if stream doesn't exist
   *
   * @param this - Context containing the table reference
   * @param id - The stream ID to update
   * @param items - Array of items to remove from the stream
   * @returns Promise that resolves when the operation completes
   * @throws {DatabaseError} When the update fails
   *
   * @example
   * ```typescript
   * await PostStreamModel.removeItems('home-feed', ['item1', 'item2']);
   * ```
   */
  static async removeItems<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>>(
    this: { table: Table<TSchema> },
    id: TId,
    items: TItem[],
  ): Promise<void> {
    try {
      // Check if stream exists
      const existingStream = await this.table.get(id);

      if (existingStream) {
        // Only modify if stream exists
        await this.table
          .where('id')
          .equals(id as IndexableType)
          .modify((stream) => {
            // Filter out the items that need to be removed
            stream.stream = stream.stream.filter((item) => !items.includes(item));
          });

        Libs.Logger.debug(`${this.table.name} items removed from stream successfully`, {
          streamId: id,
          itemsRemoved: items.length,
        });
      } else {
        // Stream doesn't exist, nothing to remove - silently succeed
        Libs.Logger.debug(`${this.table.name} stream does not exist, skipping removal`, {
          streamId: id,
          itemsToRemove: items.length,
        });
      }
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.UPDATE_FAILED,
        `Failed to remove items from stream in ${this.table.name} with ID: ${String(id)}`,
        500,
        { error, streamId: id, itemsCount: items.length },
      );
    }
  }
}
