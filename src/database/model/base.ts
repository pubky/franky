import { IndexableType, Table } from 'dexie';
import { db } from '@/database';
import { logger } from '@/lib/logger';

/**
 * Any “model” class that wants to use BaseModel must fulfill this constructor‐side interface
 */
export interface ModelConstructor<
  SchemaType,
  InterfaceType,
  PKType extends IndexableType,
  ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
> {
  new (schema: SchemaType): ModelType;
  table: Table<SchemaType>;
  modelName: string;

  toSchema(input: InterfaceType, overrides?: Partial<SchemaType>): SchemaType;
}

/**
 * Abstract, generic base class for any “model” that lives in Dexie (IndexedDB)
 *
 * @template SchemaType - The exact shape stored in Dexie (the schema type)
 * @template InterfaceType - The “input” shape from your service layer (e.g., a nexus input)
 * @template PKType - The primary‐key type; must extend Dexie’s IndexableType
 */
export abstract class BaseModel<SchemaType, InterfaceType, PKType extends IndexableType> {
  // ────────────────────────────────────────────────────────────────────────────
  // INSTANCE METHODS
  // ────────────────────────────────────────────────────────────────────────────
  protected abstract getId(): PKType;

  /**
   * Save the current instance (coerce into SchemaType).
   */
  public async save(): Promise<void> {
    const ctor = this.constructor as ModelConstructor<
      SchemaType,
      InterfaceType,
      PKType,
      BaseModel<SchemaType, InterfaceType, PKType>
    >;

    try {
      await db.transaction('rw', ctor.table, async () => {
        // We cast `this` → `SchemaType` because TypeScript no longer “knows” the instance matches SchemaType.
        await ctor.table.put(this as unknown as SchemaType);
      });
      logger.debug(`Saved ${ctor.modelName} to database:`, { id: this.getId() });
    } catch (error) {
      logger.error(`Failed to save ${ctor.modelName}:`, error);
      throw error;
    }
  }

  public async delete(): Promise<void> {
    const ctor = this.constructor as ModelConstructor<
      SchemaType,
      InterfaceType,
      PKType,
      BaseModel<SchemaType, InterfaceType, PKType>
    >;

    try {
      await db.transaction('rw', ctor.table, async () => {
        await ctor.table.delete(this.getId());
      });
      logger.debug(`Deleted ${ctor.modelName} from database:`, { id: this.getId() });
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
    ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
  >(this: ModelConstructor<SchemaType, InterfaceType, PKType, ModelType>, input: InterfaceType): Promise<ModelType> {
    const schemaObj = this.toSchema(input);
    const instance = new this(schemaObj);
    await instance.save();
    logger.debug(`Created ${this.modelName}:`, { id: instance.getId() });
    return instance as ModelType;
  }

  public static async findById<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
  >(this: ModelConstructor<SchemaType, InterfaceType, PKType, ModelType>, id: PKType): Promise<ModelType> {
    const data = await this.table.get(id);
    if (!data) {
      throw new Error(`${this.modelName} not found: ${id}`);
    }
    return new this(data);
  }

  public static async find<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
  >(this: ModelConstructor<SchemaType, InterfaceType, PKType, ModelType>, ids: PKType[]): Promise<ModelType[]> {
    const rows: SchemaType[] = await this.table.where('id').anyOf(ids).toArray();
    if (rows.length !== ids.length) {
      throw new Error(`Failed to find all ${this.modelName}s: ${ids.length - rows.length} missing`);
    }
    return rows.map((r) => new this(r));
  }

  public static async bulkSave<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
  >(
    this: ModelConstructor<SchemaType, InterfaceType, PKType, ModelType>,
    inputs: InterfaceType[],
  ): Promise<ModelType[]> {
    const schemas: SchemaType[] = inputs.map((inp) => this.toSchema(inp));
    await db.transaction('rw', this.table, async () => {
      await this.table.bulkPut(schemas);
    });
    const instances = schemas.map((s) => new this(s) as ModelType);
    logger.debug(`Bulk saved ${this.modelName}s:`, {
      ids: instances.map((inst) => inst.getId()),
    });
    return instances;
  }

  public static async bulkDelete<
    SchemaType,
    InterfaceType,
    PKType extends IndexableType,
    ModelType extends BaseModel<SchemaType, InterfaceType, PKType>,
  >(this: ModelConstructor<SchemaType, InterfaceType, PKType, ModelType>, ids: PKType[]): Promise<void> {
    await db.transaction('rw', this.table, async () => {
      await this.table.bulkDelete(ids);
    });
    logger.debug(`Bulk deleted ${this.modelName}s:`, { ids });
  }
}
