import { AnchorHTMLAttributes, ClassAttributes } from 'react';
import { ExtraProps } from 'react-markdown';

export type RemarkAnchorProps = ClassAttributes<HTMLAnchorElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { 'data-type'?: string };
