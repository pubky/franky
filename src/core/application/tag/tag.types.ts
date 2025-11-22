import * as Core from '@/core';

export interface TCreateTagInput extends Core.TTagEventParams {
  tagUrl: string;
  tagJson: Record<string, unknown>;
};

export interface TCreateTagListInput {
  tagList: Core.TCreateTagInput[];
}

export type TDeleteTagInput = Omit<Core.TCreateTagInput, 'tagJson'>;

export enum TagKind {
  USER = 'user',
  POST = 'post',
}
