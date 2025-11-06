'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Libs from '@/libs';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export interface DialogArticleInputProps {
  onSuccess?: () => void;
}

export function DialogArticleInput({ onSuccess }: DialogArticleInputProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Array<{ id: string; label: string }>>([]);

  const currentUserId = Core.useAuthStore((state) => state.selectCurrentUserPubky());

  const handleTagAdd = useCallback((tag: string) => {
    setTags((prev) => [...prev, { id: `${Date.now()}`, label: tag }]);
  }, []);

  const handleTagClose = useCallback((tag: Molecules.PostTagsListTag, index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handlePublish = useCallback(() => {
    // TODO: Implement article publishing logic
    // content contains HTML from react-quill
    const plainTextContent = content.replace(/<[^>]*>/g, '').trim();
    console.log('Publishing article:', { title, content, plainTextContent, tags });
    onSuccess?.();
  }, [title, content, tags, onSuccess]);

  const isPublishDisabled = !title.trim() || !content.trim();

  // Custom toolbar configuration matching Figma design
  // Formatting: Bold, Italic, Underline
  // Alignment: Left, Center, Justify, Right, List
  // Note: Link, Image, Folder, and Smile buttons are disabled per requirements
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ align: ['', 'center', 'right', 'justify'] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      },
    }),
    [],
  );

  const formats = ['bold', 'italic', 'underline', 'align', 'list', 'bullet'];

  return (
    <div className="flex flex-col gap-6 p-6 border border-dashed border-input rounded-md relative overflow-hidden">
      {/* Article Title */}
      <div className="flex gap-2 items-center w-full min-w-0">
        <input
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-6xl font-bold leading-none text-muted-foreground placeholder:text-muted-foreground focus:text-foreground transition-colors"
          style={{ maxWidth: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Post Header */}
      <div className="flex gap-3 items-start w-full">
        <Organisms.PostHeader postId={currentUserId} hideTime={true} />
      </div>

      {/* Add Image Section */}
      <div className="bg-card rounded-md flex flex-col gap-3 items-center justify-center px-0 py-6 w-full">
        <div className="bg-brand/16 rounded-full size-16 flex items-center justify-center">
          <Libs.Image className="size-8 text-brand" strokeWidth={2} />
        </div>
        <button className="bg-secondary h-8 px-3 py-2 rounded-full shadow-xs-dark flex items-center gap-2">
          <Libs.Plus className="size-4 text-secondary-foreground" strokeWidth={2} />
          <span className="text-xs font-bold text-secondary-foreground">Add image</span>
        </button>
      </div>

      {/* ReactQuill Editor */}
      <div className="min-h-32">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Start writing your masterpiece"
        />
      </div>

      {/* Tags and Publish Button */}
      <div className="flex justify-between items-center flex-wrap gap-4 w-full">
        <Molecules.PostTagsList
          tags={tags.map((tag) => ({ label: tag.label }))}
          showInput={false}
          showAddButton={true}
          addMode={true}
          showEmojiPicker={false}
          showTagClose={true}
          onTagAdd={handleTagAdd}
          onTagClose={handleTagClose}
        />

        <Atoms.Button
          variant="secondary"
          size="sm"
          onClick={handlePublish}
          disabled={isPublishDisabled}
          className={Libs.cn(
            'h-8 px-3 py-2 rounded-full border-none shadow-xs-dark',
            isPublishDisabled && 'opacity-40',
          )}
          aria-label="Publish"
        >
          <div className="flex items-center gap-2">
            <Libs.Send className="size-4 text-secondary-foreground" strokeWidth={2} />
            <span className="text-xs font-bold text-secondary-foreground">Publish</span>
          </div>
        </Atoms.Button>
      </div>
    </div>
  );
}
