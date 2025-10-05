import { Table } from 'dexie';
import * as Libs from '@/libs';
import { BaseStreamModelSchema } from './stream.type';

/**
 * Abstract base class for all stream models
 * Provides common functionality for database operations and item management
 * Follows the same pattern as RecordModelBase
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
    protected constructor({ id, stream}: TSchema) {
        this.id = id;
        this.stream = stream || [];
    }

    /**
     * Creates a new stream in the database
     * @param this - Context containing the table reference
     * @param id - The unique identifier for the stream
     * @param stream - Array of items to initialize the stream with (defaults to empty array)
     * @returns Promise that resolves to the created stream data
     * @throws {DatabaseError} When creation fails
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
            await this.table.put(streamData);

            Libs.Logger.debug(`${this.table.name} row created successfully`, { streamId: id, stream });
            return streamData;
        } catch (error) {
            throw Libs.createDatabaseError(
                Libs.DatabaseErrorType.CREATE_FAILED,
                `Failed to create stream in ${this.table.name} with ID: ${String(id)}`,
                500,
                { error, streamId: id, stream },
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
    static async findById<TId, TItem, TSchema extends BaseStreamModelSchema<TId, TItem>, TModel extends BaseStreamModel<TId, TItem, TSchema>>(
        this: { table: Table<TSchema>; new(data: TSchema): TModel },
        id: TId,
    ): Promise<TModel | null> {
        try {
            const stream = await this.table.get(id);
            if (!stream) {
                return null;
            }
            Libs.Logger.debug('Found stream', { id });
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
}
