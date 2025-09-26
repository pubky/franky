export interface TtlModelSchema<Id> {
  id: Id;
  ttl: number;
}

export const ttlTableSchema = `
    &id,
    ttl
`;
