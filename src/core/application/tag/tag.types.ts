import * as Core from '@/core';

export type TCreateTagInput = Core.TTagEventParams &{
  tagUrl: string;
  tagJson: Record<string, unknown>;
};

export type TDeleteTagInput = Omit<Core.TCreateTagInput, 'tagJson'>;

export enum TagKind {
  USER = 'user',
  POST = 'post',
}
