import { IndexableType, Table } from 'dexie';
import { db } from '@/database';
import { logger } from '@/lib/logger';

/**
 * An abstract, generic base class for any “model” that lives in Dexie
 *
 * Type parameters:
 *   - SchemaType     = the exact shape stored in Dexie (IndexDB)
 *   - InterfaceType  = the “input” shape from your service layer (e.g. NexusUser)
 *   - PKType         = the primary‐key type
 */
export abstract class BaseModel<
  /* eslint-disable @typescript-eslint/no-unused-vars */
  SchemaType,
  /* eslint-disable @typescript-eslint/no-unused-vars */
  InterfaceType,
  PKType extends IndexableType
> {
  // Every subclass **must** define:
  protected static table: Table<unknown>;
  
  protected static modelName: string;
  
  // Every subclass **must** implement
  protected abstract getId(): PKType;

  // ────────────────────────────────────────────────────────────────────────────
  // INSTANCE METHODS
  // ────────────────────────────────────────────────────────────────────────────
  public async save(): Promise<void> {
    const ctor = this.constructor as typeof BaseModel;
    try {
      await db.transaction('rw', ctor.table, async () => {
        await ctor.table.put(this);
      });
      logger.debug(`Saved ${ctor.modelName} to database:`, { id: this.getId() });
    } catch (error) {
      logger.error(`Failed to save ${ctor.modelName}:`, error);
      throw error;
    }
  }

  public async delete(): Promise<void> {
    const ctor = this.constructor as typeof BaseModel;
    try {
      await db.transaction('rw', ctor.table, async () => {
        await ctor.table.delete(this.getId());
      });
      logger.debug(`Deleted ${ctor.modelName} from database:`, {
        id: this.getId(),
      });
    } catch (error) {
      logger.error(`Failed to delete ${ctor.modelName}:`, error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STATIC METHODS
  // ────────────────────────────────────────────────────────────────────────────
  public static async insert<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    Sub extends BaseModel<SchemaType, InterfaceType, PKType>
  >(
    this: {
      new (schema: SchemaType): Sub;
      table: Table<SchemaType>;
      modelName: string;
      toSchema(input: InterfaceType): SchemaType;
    },
    input: InterfaceType
  ): Promise<Sub> {
    try {
      const schemaObj = this.toSchema(input);
      const instance = new this(schemaObj);
      await instance.save();
      logger.debug(`Created ${this.modelName}:`, { id: instance.getId() });
      return instance;
    } catch (error) {
      logger.error(`Failed to create ${this.modelName}:`, error);
      throw error;
    }
  }
  
  public static async findById<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    Sub extends BaseModel<SchemaType, InterfaceType, PKType>
  >(
    this: {
      new (schema: SchemaType): Sub;
      table: Table<SchemaType>;
      modelName: string;
    },
    id: PKType
  ): Promise<Sub> {
    try {
      const data = await this.table.get(id);
      if (!data) {
        throw new Error(`${this.modelName} not found: ${id}`);
      }
      logger.debug(`Found ${this.modelName}:`, { id });
      return new this(data);
    } catch (error) {
      logger.error(`Failed to find ${this.modelName}:`, error);
      throw error;
    }
  }
  
  public static async find<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    Sub extends BaseModel<SchemaType, InterfaceType, PKType>
  >(
    this: {
      new (schema: SchemaType): Sub;
      table: Table<SchemaType>;
      modelName: string;
    },
    ids: PKType[]
  ): Promise<Sub[]> {
    try {
      const rows: SchemaType[] = await this.table.where('id').anyOf(ids).toArray();
      logger.debug(`Found ${this.modelName}s:`, rows);
      if (rows.length !== ids.length) {
        throw new Error(
          `Failed to find all ${this.modelName}s: ${ids.length - rows.length} not found`
        );
      }
      return rows.map((r) => new this(r));
    } catch (error) {
      logger.error(`Failed to find ${this.modelName}s:`, error);
      throw error;
    }
  }
  
  public static async bulkSave<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    Sub extends BaseModel<SchemaType, InterfaceType, PKType>
  >(
    this: {
      new (schema: SchemaType): Sub;
      table: Table<SchemaType>;
      modelName: string;
      toSchema(input: InterfaceType): SchemaType;
    },
    inputs: InterfaceType[]
  ): Promise<Sub[]> {
    try {
      const schemas: SchemaType[] = inputs.map((inp) => this.toSchema(inp));
      await db.transaction('rw', this.table, async () => {
        await this.table.bulkPut(schemas);
      });
      const instances: Sub[] = schemas.map((s) => new this(s));
      logger.debug(`Bulk saved ${this.modelName}s:`, {
        ids: instances.map((inst) => inst.getId()),
      });
      return instances;
    } catch (error) {
      logger.error(`Failed to bulk save ${this.modelName}s:`, error);
      throw error;
    }
  }
  
  public static async bulkDelete<
    SchemaType,
    PKType extends IndexableType
  >(
    this: {
      table: Table<SchemaType>;
      modelName: string;
    },
    ids: PKType[]
  ): Promise<void> {
    try {
      await db.transaction('rw', this.table, async () => {
        await this.table.bulkDelete(ids);
      });
      logger.debug(`Bulk deleted ${this.modelName}s:`, { ids });
    } catch (error) {
      logger.error(`Failed to bulk delete ${this.modelName}s:`, error);
      throw error;
    }
  }
}