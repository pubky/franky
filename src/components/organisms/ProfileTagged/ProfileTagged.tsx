'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';

export function ProfileTagged() {
  const [inputValue, setInputValue] = React.useState('');

  const handleTagSubmit = (value: string) => {
    if (value.trim()) {
      // TODO: Add logic here (can be done at the same time as other Molecules.PostTagInput instances get hooked up for example https://github.com/pubky/franky/blob/29098a1fa782ff9abed710ec30ddf9913aef5d10/src/components/molecules/PostTagsList/PostTagsList.tsx#L60-L65)
      setInputValue('');
    }
  };

  const onEmojiClick = () => {
    // TODO: Add logic here (can be done at the same time as other Molecules.PostTagInput instances get hooked up)
  };

  // TODO: Replace with actual data fetching
  const mockTaggedPosts: string[] = [];
  const isLoading = false;

  if (isLoading) {
    return (
      <Atoms.Container>
        <Atoms.Card className="p-6 animate-pulse">
          <div className="h-20 bg-muted rounded" />
        </Atoms.Card>
      </Atoms.Container>
    );
  }

  if (mockTaggedPosts.length === 0) {
    return (
      <Atoms.Container className="items-center">
        <Molecules.ContentNotFound
          icon={<Libs.Tag size={48} className="text-brand" />}
          title="Discover who tagged you"
          description={
            <>
              <p>No one has tagged you yet.</p>
              <p>Tip: You can add tags to your own profile too.</p>
            </>
          }
          backgroundImage="/images/background-6.png"
          mobileBackgroundImage="/images/background-6.png"
          className="lg:mt-6"
        />

        <Molecules.PostTagInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleTagSubmit}
          showEmojiPicker={true}
          onEmojiClick={onEmojiClick}
          className="w-48"
        />
      </Atoms.Container>
    );
  }

  return (
    <Atoms.Container className="gap-y-4">
      {mockTaggedPosts.map((postId) => (
        <Organisms.SinglePost key={postId} postId={postId} clickable />
      ))}
    </Atoms.Container>
  );
}
