import * as Templates from '@/templates';

interface PostPageProps {
  params: {
    profileId: string;
    postId: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { profileId, postId } = await params;
  return <Templates.PostDetail profileId={profileId} postId={postId} />;
}
