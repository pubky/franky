import type { Metadata as NextMetadata } from 'next';
import { NEXUS_URL } from '@/config/nexus';
import type { ArticleJSON } from '@/hooks/usePostArticle/usePostArticle.types';
import * as Templates from '@/templates';
import * as Core from '@/core';
import { Metadata } from '@/molecules/Metadata/Metadata';

interface PostPageProps {
  params: Promise<{
    userId: string;
    postId: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<NextMetadata> {
  try {
    const { userId, postId } = await params;

    // fetch user and post information concurrently
    const [user, post]: [Core.NexusUserDetails, Core.NexusPostDetails] = await Promise.all([
      fetch(`${NEXUS_URL}/v0/user/${userId}/details`, { next: { revalidate: 3600 } }).then((res) => res.json()),
      fetch(`${NEXUS_URL}/v0/post/${userId}/${postId}/details`, { next: { revalidate: 3600 } }).then((res) =>
        res.json(),
      ),
    ]);

    const username = user.name;
    const { content, kind } = post;

    const isArticle = kind === 'long';
    const postPreview = isArticle ? (JSON.parse(content) as ArticleJSON).title : content;
    const postPreviewTruncated = postPreview.length > 100 ? `${postPreview.slice(0, 100)}...` : postPreview;

    const title = `${username} on Pubky`;
    const description = postPreviewTruncated;

    const { openGraph, twitter } = Metadata({
      title,
      description,
    });

    return username && postPreviewTruncated
      ? {
          title,
          description,
          openGraph,
          twitter,
        }
      : {};
  } catch {
    // Fallback to parent metadata
    return {};
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { userId, postId } = await params;
  const compositeId = Core.buildCompositeId({ pubky: userId, id: postId });

  return <Templates.SinglePost postId={compositeId} />;
}
