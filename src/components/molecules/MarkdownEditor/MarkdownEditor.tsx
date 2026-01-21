'use client';

import dynamic from 'next/dynamic';
import { forwardRef } from 'react';
import { type MDXEditorMethods, type MDXEditorProps } from '@mdxeditor/editor';
import * as Atoms from '@/atoms';

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(() => import('./InitializedMDXEditor'), {
  // Make sure we turn SSR off
  ssr: false,
  loading: () => <Atoms.Container className="h-22 animate-pulse rounded-md bg-card" />,
});

// This is what is imported by other components. Pre-initialized with plugins & styling, and ready
// to accept other props, including a ref.
export const MarkdownEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
));

MarkdownEditor.displayName = 'MarkdownEditor';
