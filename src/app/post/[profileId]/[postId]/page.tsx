import * as Templates from '@/templates';

interface PostPageProps {
  params: Promise<{
    profileId: string;
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  return <Templates.PostDetail postId={postId} />;
}
