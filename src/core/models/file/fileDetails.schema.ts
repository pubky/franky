import * as Core from '@/core';

// File details schema based on Nexus file metadata
// The id is the file URI (Pubky)
export type FileDetailsModelSchema = Core.NexusFileDetails;

export const fileDetailsTableSchema = `
  &id
`;

