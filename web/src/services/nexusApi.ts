import { 
  Bookmark, 
  FileDetails, 
  FilesByIdsBody, 
  Notification, 
  PostCounts, 
  PostDetails, 
  PostView, 
  ServerInfo, 
  TagDetails, 
  TagSearch, 
  TaggersInfoDTO, 
  UserCounts, 
  UserDetails, 
  UserView, 
  UserSearch, 
  Followers, 
  Following, 
  Friends, 
  Muted, 
  PostStream, 
  UserStream, 
  HotTags,
  Relationship,
  Vec 
} from '../types/api';

export class NexusApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // File endpoints
  async getFilesByIds(body: FilesByIdsBody): Promise<FileDetails[]> {
    const response = await fetch(`${this.baseUrl}/v0/files/by-ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  async getFileDetails(fileId: string): Promise<FileDetails> {
    const response = await fetch(`${this.baseUrl}/v0/files/file/${fileId}`);
    return response.json();
  }

  // Info endpoint
  async getServerInfo(): Promise<ServerInfo> {
    const response = await fetch(`${this.baseUrl}/v0/info`);
    return response.json();
  }

  // Post endpoints
  async getPostView(authorId: string, postId: string, viewerId?: string, limitTags?: number, limitTaggers?: number): Promise<PostView> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (limitTags) params.append('limit_tags', limitTags.toString());
    if (limitTaggers) params.append('limit_taggers', limitTaggers.toString());

    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}?${params}`);
    return response.json();
  }

  async getPostBookmark(authorId: string, postId: string, viewerId?: string): Promise<Bookmark> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);

    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}/bookmark?${params}`);
    return response.json();
  }

  async getPostCounts(authorId: string, postId: string): Promise<PostCounts> {
    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}/counts`);
    return response.json();
  }

  async getPostDetails(authorId: string, postId: string): Promise<PostDetails> {
    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}/details`);
    return response.json();
  }

  async getPostTaggers(authorId: string, postId: string, label: string, viewerId?: string, skip?: number, limit?: number): Promise<TaggersInfoDTO> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}/taggers/${label}?${params}`);
    return response.json();
  }

  async getPostTags(authorId: string, postId: string, viewerId?: string, skipTags?: number, limitTags?: number, limitTaggers?: number): Promise<TagDetails[]> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip_tags', (skipTags ?? 0).toString());
    params.append('limit_tags', (limitTags ?? 5).toString());
    params.append('limit_taggers', (limitTaggers ?? 5).toString());

    const response = await fetch(`${this.baseUrl}/v0/post/${authorId}/${postId}/tags?${params}`);
    return response.json();
  }

  // Search endpoints
  async searchTags(label: string, sorting?: string, start?: number, end?: number, skip?: number, limit?: number): Promise<TagSearch[]> {
    const params = new URLSearchParams();
    if (sorting) params.append('sorting', sorting);
    params.append('start', (start ?? 0).toString());
    params.append('end', (end ?? 100).toString());
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/search/tags/${label}?${params}`);
    return response.json();
  }

  async searchUsers(username?: string, skip?: number, limit?: number): Promise<UserSearch> {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/search/users?${params}`);
    return response.json();
  }

  // Stream endpoints
  async streamPosts(
    source?: string,
    viewerId?: string,
    observerId?: string,
    authorId?: string,
    postId?: string,
    sorting?: string,
    order?: string,
    tags?: string[],
    kind?: string,
    skip?: number,
    limit?: number,
    start?: number,
    end?: number
  ): Promise<PostStream> {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (viewerId) params.append('viewer_id', viewerId);
    if (observerId) params.append('observer_id', observerId);
    if (authorId) params.append('author_id', authorId);
    if (postId) params.append('post_id', postId);
    if (sorting) params.append('sorting', sorting);
    if (order) params.append('order', order);
    if (tags) params.append('tags', tags.join(','));
    if (kind) params.append('kind', kind);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    params.append('start', (start ?? 0).toString());
    params.append('end', (end ?? 100).toString());

    const response = await fetch(`${this.baseUrl}/v0/stream/posts?${params}`);
    return response.json();
  }

  async streamUsers(
    userId?: string,
    viewerId?: string,
    skip?: number,
    limit?: number,
    source?: string,
    reach?: string,
    timeframe?: string,
    preview?: boolean,
    authorId?: string,
    postId?: string,
    depth?: number
  ): Promise<UserStream> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    if (source) params.append('source', source);
    if (reach) params.append('reach', reach);
    if (timeframe) params.append('timeframe', timeframe);
    params.append('preview', (preview ?? false).toString());
    if (authorId) params.append('author_id', authorId);
    if (postId) params.append('post_id', postId);
    if (depth) params.append('depth', depth.toString());

    const response = await fetch(`${this.baseUrl}/v0/stream/users?${params}`);
    return response.json();
  }

  async streamUsersByIds(userIds: string[], viewerId?: string, depth?: number): Promise<UserStream> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    const response = await fetch(`${this.baseUrl}/v0/stream/users/by_ids?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    });
    return response.json();
  }

  async streamUsersByUsername(username: string, viewerId?: string, skip?: number, limit?: number): Promise<UserStream> {
    const params = new URLSearchParams();
    params.append('username', username);
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/stream/users/username?${params}`);
    return response.json();
  }

  // Tags endpoints
  async getHotTags(
    userId?: string,
    reach?: string,
    taggersLimit?: number,
    skip?: number,
    limit?: number,
    timeframe?: string
  ): Promise<HotTags> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (reach) params.append('reach', reach);
    if (taggersLimit) params.append('taggers_limit', taggersLimit.toString());
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    if (timeframe) params.append('timeframe', timeframe);

    const response = await fetch(`${this.baseUrl}/v0/tags/hot?${params}`);
    return response.json();
  }

  async getTagTaggers(
    label: string,
    reach: string,
    userId?: string,
    skip?: number,
    limit?: number,
    timeframe?: string
  ): Promise<Vec> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    if (timeframe) params.append('timeframe', timeframe);

    const response = await fetch(`${this.baseUrl}/v0/tags/taggers/${label}/${reach}?${params}`);
    return response.json();
  }

  // User endpoints
  async getUserView(userId: string, viewerId?: string, depth?: number): Promise<UserView> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}?${params}`);
    return response.json();
  }

  async getUserCounts(userId: string): Promise<UserCounts> {
    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/counts`);
    return response.json();
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/details`);
    return response.json();
  }

  async getUserFollowers(userId: string, skip?: number, limit?: number): Promise<Followers> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/followers?${params}`);
    return response.json();
  }

  async getUserFollowing(userId: string, skip?: number, limit?: number): Promise<Following> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/following?${params}`);
    return response.json();
  }

  async getUserFriends(userId: string, skip?: number, limit?: number): Promise<Friends> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/friends?${params}`);
    return response.json();
  }

  async getUserMuted(userId: string, skip?: number, limit?: number): Promise<Muted> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/muted?${params}`);
    return response.json();
  }

  async getUserNotifications(
    userId: string,
    skip?: number,
    limit?: number,
    start?: string,
    end?: string
  ): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/notifications?${params}`);
    return response.json();
  }

  async getUserRelationship(userId: string, viewerId: string): Promise<Relationship> {
    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/relationship/${viewerId}`);
    return response.json();
  }

  async getUserTaggers(
    userId: string,
    label: string,
    skip?: number,
    limit?: number,
    viewerId?: string,
    depth?: number
  ): Promise<TaggersInfoDTO> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/taggers/${label}?${params}`);
    return response.json();
  }

  async getUserTags(
    userId: string,
    skipTags?: number,
    limitTags?: number,
    limitTaggers?: number,
    viewerId?: string,
    depth?: number
  ): Promise<TagDetails> {
    const params = new URLSearchParams();
    params.append('skip_tags', (skipTags ?? 0).toString());
    params.append('limit_tags', (limitTags ?? 5).toString());
    params.append('limit_taggers', (limitTaggers ?? 5).toString());
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    const response = await fetch(`${this.baseUrl}/v0/user/${userId}/tags?${params}`);
    return response.json();
  }
} 