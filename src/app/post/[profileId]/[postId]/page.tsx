import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Templates from '@/templates';
import * as Organisms from '@/organisms';

export default async function PostPage({ params }: { params: Promise<{ profileId: Core.Pubky; postId: string }> }) {
  const { postId } = await params;
  return (
    <Atoms.Container className="flex flex-col">
      <Atoms.Container size="container" className="px-6 gap-4">
        <Templates.PostWide postId={postId} />
      </Atoms.Container>

      <Atoms.Container size="container" className="px-6 pb-8 mt-4">
        <Atoms.Container className="flex flex-col gap-4">
          <Organisms.PostReplies postId={postId} />
          <Organisms.PostReplyInput postId={postId} />
        </Atoms.Container>
      </Atoms.Container>
    </Atoms.Container>
  );
}
