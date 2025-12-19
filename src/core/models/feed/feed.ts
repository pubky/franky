import { Table } from 'dexie';
import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';
import { RecordModelBase } from '@/core/models/shared/base/record/baseRecord';

export class FeedModel extends RecordModelBase<number, Core.FeedModelSchema> implements Core.FeedModelSchema {
  static table: Table<Core.FeedModelSchema, number> = Core.db.table('feeds');

  name: string;
  tags: string[];
  reach: PubkyAppFeedReach;
  sort: PubkyAppFeedSort;
  content: PubkyAppPostKind | null;
  layout: PubkyAppFeedLayout;
  created_at: number;
  updated_at: number;

  constructor(feed: Core.FeedModelSchema) {
    super(feed);
    this.name = feed.name;
    this.tags = feed.tags;
    this.reach = feed.reach;
    this.sort = feed.sort;
    this.content = feed.content;
    this.layout = feed.layout;
    this.created_at = feed.created_at;
    this.updated_at = feed.updated_at;
  }

  static async createAndGet(feed: Core.FeedModelSchema): Promise<Core.FeedModelSchema | null> {
    const newId = await this.table.add(feed);
    return this.findById(newId);
  }

  static async findAll(): Promise<Core.FeedModelSchema[]> {
    return this.table.toArray();
  }

  static async findAllSorted(): Promise<Core.FeedModelSchema[]> {
    return this.table.orderBy('created_at').reverse().toArray();
  }

  static async findByName(name: string): Promise<Core.FeedModelSchema | undefined> {
    const lowerName = name.toLowerCase();
    return this.table.filter((f) => f.name.toLowerCase() === lowerName).first();
  }
}
