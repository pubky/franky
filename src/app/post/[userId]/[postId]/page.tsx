import * as Templates from '@/templates';
import * as Core from '@/core';

interface PostPageProps {
  params: Promise<{
    userId: string;
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { userId, postId } = await params;
  const compositeId = Core.buildCompositeId({ pubky: userId, id: postId });

  return <Templates.SinglePost postId={compositeId} />;
}
