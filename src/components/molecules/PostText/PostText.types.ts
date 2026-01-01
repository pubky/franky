import { AnchorHTMLAttributes, ClassAttributes } from 'react';
import { ExtraProps } from 'react-markdown';

export interface PostTextProps {
  content: string;
}

export type RemarkAnchorProps = ClassAttributes<HTMLAnchorElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { 'data-type'?: string };
