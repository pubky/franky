import { AnchorHTMLAttributes, ClassAttributes } from 'react';
import { ExtraProps } from 'react-markdown';

// ============================================================================
// Minimal MDAST Types - Pure TypeScript (no external type dependencies)
// These match the unist/mdast spec used by remark plugins
// ============================================================================

/** Base AST node - all nodes have a type */
export interface MdastNode {
  type: string;
  children?: MdastNode[];
  [key: string]: unknown;
}

/** Text node - inline text content */
export interface TextNode extends MdastNode {
  type: 'text';
  value: string;
}

/** Link node - hyperlink with children */
export interface LinkNode extends MdastNode {
  type: 'link';
  url: string;
  data?: { hProperties?: Record<string, string> };
  children: MdastNode[];
}

/** Code block node */
export interface CodeNode extends MdastNode {
  type: 'code';
  lang?: string;
  value: string;
}

/** Paragraph node - contains inline content */
export interface ParagraphNode extends MdastNode {
  type: 'paragraph';
  children: MdastNode[];
}

/** Root node - top level of the AST */
export interface RootNode extends MdastNode {
  type: 'root';
  children: MdastNode[];
}
export type RemarkAnchorProps = ClassAttributes<HTMLAnchorElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> &
  ExtraProps & { 'data-type'?: string };

/** Props for PostText component */
export interface PostTextProps {
  content: string;
}
