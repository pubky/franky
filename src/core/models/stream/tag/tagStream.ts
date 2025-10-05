import { Table } from 'dexie';
import { TagStreamTypes } from './tagStream.types';
import { db } from '@/core/database/franky/franky';
import { TagStreamModelSchema } from './tagStream.schema';
import * as Core from '@/core';
import * as Libs from '@/libs';
import { createDefaultTagStream } from './tagStream.helper';

export class TagStreamModel implements TagStreamModelSchema {
  private static table: Table<TagStreamModelSchema> = db.table('tag_streams');

  id: TagStreamTypes;
  tags: Core.NexusHotTag[];

  constructor(stream: TagStreamModelSchema) {
    this.id = stream.id;
    this.tags = stream.tags;
  }

  // Database operations
  async save(): Promise<void> {
    try {
      await TagStreamModel.table.put(this);
      Libs.Logger.debug('TagStream saved successfully', { streamId: this.id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.SAVE_FAILED,
        `Failed to save tag stream with ID: ${this.id}`,
        500,
        { error, streamId: this.id },
      );
    }
  }

  async delete(): Promise<void> {
    try {
      await TagStreamModel.table.delete(this.id);
      Libs.Logger.debug('TagStream deleted successfully', { streamId: this.id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete tag stream with ID: ${this.id}`,
        500,
        { error, streamId: this.id },
      );
    }
  }

  // Instance methods
  addTags(tags: Core.NexusHotTag[]): void {
    // Filter out tags that already exist and add new ones to beginning
    const newTags = tags.filter((tag) => !this.tags.includes(tag));
    this.tags.unshift(...newTags); // Add to beginning for chronological order
  }

  // Static methods
  static async findById(id: TagStreamTypes): Promise<TagStreamModel | null> {
    try {
      const stream = await TagStreamModel.table.get(id);
      return stream ? new TagStreamModel(stream) : null;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.FIND_FAILED,
        `Failed to find tag stream with ID: ${id}`,
        500,
        {
          error,
          streamId: id,
        },
      );
    }
  }

  static async create(id: TagStreamTypes, tags: Core.NexusHotTag[]): Promise<TagStreamModel> {
    try {
      const streamData = createDefaultTagStream(id, tags);
      const stream = new TagStreamModel(streamData);
      await stream.save();

      Libs.Logger.debug('TagStream created successfully', { streamId: id, tags });
      return stream;
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.CREATE_FAILED,
        `Failed to create tag stream with ID: ${id}`,
        500,
        { error, streamId: id, tags },
      );
    }
  }

  static async deleteById(id: TagStreamTypes): Promise<void> {
    try {
      await TagStreamModel.table.delete(id);
      Libs.Logger.debug('TagStream deleted by ID', { streamId: id });
    } catch (error) {
      throw Libs.createDatabaseError(
        Libs.DatabaseErrorType.DELETE_FAILED,
        `Failed to delete tag stream with ID: ${id}`,
        500,
        { error, streamId: id },
      );
    }
  }
}
