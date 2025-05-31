import { type UserPK, type Timestamp, type SyncStatus } from '@/database/types'
import { logger } from '@/lib/logger'
import {
  type NexusUser,
  type NexusUserDetails,
  type NexusUserCounts,
  type NexusUserRelationship,
} from '@/services/nexus/types'
import { Table } from 'dexie'
import { db } from '@/database'
import { SYNC_TTL } from '../config'
import { type User as UserSchema } from '../schemas/user'
import { Tag } from './shared/tag'
import { User as UserType } from '@/database/schemas/user'

import { BaseModel } from './base'

export class User
  extends BaseModel<UserSchema, NexusUser, UserPK>
  implements NexusUser
{
  public static table: Table<UserSchema> = db.table('users')
  public static modelName = 'User'

  id: UserPK
  details: NexusUserDetails
  counts: NexusUserCounts
  tags: Tag[]
  relationship: NexusUserRelationship
  following: UserPK[]
  followers: UserPK[]
  muted: UserPK[]
  indexed_at: Timestamp | null
  updated_at: Timestamp
  sync_status: SyncStatus
  sync_ttl: Timestamp

  constructor(user: UserSchema) {
    super()
    this.id = user.id
    this.details = user.details
    this.counts = user.counts
    this.tags = user.tags.map((t) => new Tag(t))
    this.relationship = user.relationship
    this.following = user.following
    this.followers = user.followers
    this.muted = user.muted
    this.indexed_at = user.indexed_at
    this.updated_at = user.updated_at
    this.sync_status = user.sync_status
    this.sync_ttl = user.sync_ttl
  }

  // TODO: Declare a “static abstract” method but Typescript does not allow
  // Find some way to force every subclass to have a static function
  public static toSchema(
    user: NexusUser,
    overrides: Partial<UserSchema> = {}
  ): UserSchema {
    const now = Date.now()
    return {
      id: user.details.id,
      details: user.details,
      counts: user.counts,
      tags: user.tags.map((t) => new Tag(t)),
      relationship: user.relationship,
      following: overrides.following ?? [],
      followers: overrides.followers ?? [],
      muted: overrides.muted ?? [],
      indexed_at: overrides.indexed_at ?? null,
      updated_at: overrides.updated_at ?? now,
      sync_status: overrides.sync_status ?? 'local',
      sync_ttl: overrides.sync_ttl ?? now + SYNC_TTL,
    }
  }

  protected getId(): UserPK {
    return this.details.id
  }

  public async edit(updates: Partial<UserType>): Promise<void> {
    try {
      const now = Date.now()

      if (updates.details) {
        this.details = { ...this.details, ...updates.details }
      }
      if (updates.counts) {
        this.counts = { ...this.counts, ...updates.counts }
      }
      if (updates.tags) {
        this.tags = updates.tags.map((t) => new Tag(t))
      }
      if (updates.relationship) {
        this.relationship = { ...this.relationship, ...updates.relationship }
      }
      if (updates.following) {
        this.following = updates.following
      }
      if (updates.followers) {
        this.followers = updates.followers
      }
      if (updates.muted) {
        this.muted = updates.muted
      }
      if (updates.indexed_at) {
        this.indexed_at = updates.indexed_at
      }

      this.updated_at = now
      this.sync_ttl = now + SYNC_TTL

      await this.save()

      logger.debug('Updated user:', {
        id: this.details.id,
        updates,
      })
    } catch (error) {
      logger.error('Failed to edit user:', error)
      throw error
    }
  }
}
