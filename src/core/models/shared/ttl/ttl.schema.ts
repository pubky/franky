export interface TtlModelSchema<Id> {
  id: Id;
  lastUpdatedAt: number;
}

export const ttlTableSchema = `
    &id,
    lastUpdatedAt
`;
