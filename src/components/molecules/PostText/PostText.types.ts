import { AnchorHTMLAttributes, ClassAttributes } from 'react';
import { ExtraProps } from 'react-markdown';

export interface PostTextProps {
  content: string;
  /** When true, enables article formatting: headings (h1-h6) and embedded links */
  isArticle?: boolean;
}

export type RemarkAnchorProps = ClassAttributes<HTMLAnchorElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { 'data-type'?: string };
