'use client';

import { useState, type ForwardedRef } from 'react';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  headingsPlugin,
  InsertCodeBlock,
  InsertThematicBreak,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  quotePlugin,
  StrikeThroughSupSubToggles,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { oneDark } from '@codemirror/theme-one-dark';
import { languages } from '@codemirror/language-data';
// Note: maxLengthPlugin removed because body limit is dynamic based on title length
// Validation is handled in the UI (ArticleCharacterBreakdown) and on submit
import * as Icons from '@/libs/icons';
import * as Molecules from '@/molecules';

/**
 * Common programming languages for code blocks in the Markdown editor.
 * Keys are language identifiers used by CodeMirror, values are display names.
 */
const CODE_BLOCK_LANGUAGES: Record<string, string> = {
  plaintext: 'Plain Text',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  markdown: 'Markdown',
  python: 'Python',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  yaml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  graphql: 'GraphQL',
  docker: 'Dockerfile',
  diff: 'Diff',
};

/**
 * Preload all CodeMirror language support modules to prevent layout shift
 * when selecting a language for the first time in the code block dropdown.
 *
 * Without this, languages are lazy-loaded on first selection, causing a brief
 * flicker/resize of the parent dialog while the async import resolves.
 */
function preloadLanguages() {
  const languageKeys = Object.keys(CODE_BLOCK_LANGUAGES);

  languageKeys.forEach((langKey) => {
    // Find matching language description from @codemirror/language-data
    const langDesc = languages.find(
      (l) => l.name.toLowerCase() === langKey || l.alias?.some((alias) => alias.toLowerCase() === langKey),
    );

    // Trigger the async load - we don't need to await it, just start the import
    if (langDesc) {
      langDesc.load().catch(() => {
        // Silently ignore load failures - the editor will handle missing languages gracefully
      });
    }
  });
}

// Start preloading languages when this module is imported
preloadLanguages();

// Only import this to MarkdownEditor.tsx
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <>
      <MDXEditor
        placeholder="Start writing your masterpiece"
        className="dark-theme cursor-auto"
        contentEditableClassName="prose prose-neutral prose-invert prose-code:before:content-none prose-code:after:content-none max-w-none px-0! pb-0! pt-4!"
        plugins={[
          toolbarPlugin({
            toolbarClassName: 'bg-background! border rounded-md! flex-wrap',
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
                <StrikeThroughSupSubToggles options={['Strikethrough']} />
                <ListsToggle options={['bullet', 'number']} />
                <InsertThematicBreak />
                <CodeToggle />
                <InsertCodeBlock />
                <ButtonWithTooltip title="Emoji" onClick={() => setShowEmojiPicker(true)}>
                  <Icons.Smile className="size-6" />
                </ButtonWithTooltip>
              </>
            ),
          }),
          headingsPlugin(),
          quotePlugin(),
          listsPlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'plaintext' }),
          codeMirrorPlugin({
            codeBlockLanguages: CODE_BLOCK_LANGUAGES,
            codeMirrorExtensions: [oneDark],
          }),
        ]}
        {...props}
        ref={editorRef}
      />

      <Molecules.EmojiPickerDialog
        open={showEmojiPicker}
        onOpenChange={setShowEmojiPicker}
        onEmojiSelect={(emoji) => {
          if (editorRef && 'current' in editorRef) {
            editorRef.current?.focus();
            editorRef.current?.insertMarkdown(emoji.native);
            editorRef.current?.focus();
          }
        }}
      />
    </>
  );
}
