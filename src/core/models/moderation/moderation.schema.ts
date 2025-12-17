export interface ModerationModelSchema {
  id: string;
  is_blurred: boolean;
  created_at: number;
}

export const moderationTableSchema = `
  &id,
  is_blurred,
  created_at
`;
