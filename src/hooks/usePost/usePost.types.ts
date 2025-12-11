export interface UsePostReplyOptions {
  postId: string;
  onSuccess?: (createdPostId: string) => void;
}

export interface UsePostPostOptions {
  onSuccess?: (createdPostId: string) => void;
}
