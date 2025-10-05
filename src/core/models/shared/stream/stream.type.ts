/**
 * Generic stream schema interface that all stream models must implement
 *
 * @template TId - The type of the stream ID (can be string, number, enum, etc.)
 * @template TItem - The type of items stored in the stream array
 *
 * @example
 * ```typescript
 * // For a post stream
 * type PostStreamSchema = BaseStreamModelSchema<PostStreamTypes, string>;
 *
 * // For a tag stream
 * type TagStreamSchema = BaseStreamModelSchema<TagStreamTypes, NexusHotTag>;
 * ```
 */
export type BaseStreamModelSchema<TId, TItem> = {
  /** The unique identifier for this stream */
  id: TId;
  /** Array of items in this stream */
  stream: TItem[];
};
