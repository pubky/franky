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
import { ErrorHandler } from '../utils/errorHandler';

export class NexusApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchAndParse<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await ErrorHandler.handleFetch(url, options, {
      baseUrl: this.baseUrl,
      endpoint: url.replace(this.baseUrl, '')
    });
    return response.json();
  }

  // File endpoints
  async getFilesByIds(body: FilesByIdsBody): Promise<FileDetails[]> {
    return this.fetchAndParse(`${this.baseUrl}/v0/files/by-ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async getFileDetails(fileId: string): Promise<FileDetails> {
    return this.fetchAndParse(`${this.baseUrl}/v0/files/file/${fileId}`);
  }

  // Info endpoint
  async getServerInfo(): Promise<ServerInfo> {
    return this.fetchAndParse(`${this.baseUrl}/v0/info`);
  }

  // Post endpoints
  async getPostView(authorId: string, postId: string, viewerId?: string, limitTags?: number, limitTaggers?: number): Promise<PostView> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (limitTags) params.append('limit_tags', limitTags.toString());
    if (limitTaggers) params.append('limit_taggers', limitTaggers.toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}?${params}`);
  }

  async getPostBookmark(authorId: string, postId: string, viewerId?: string): Promise<Bookmark> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);

    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}/bookmark?${params}`);
  }

  async getPostCounts(authorId: string, postId: string): Promise<PostCounts> {
    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}/counts`);
  }

  async getPostDetails(authorId: string, postId: string): Promise<PostDetails> {
    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}/details`);
  }

  async getPostTaggers(authorId: string, postId: string, label: string, viewerId?: string, skip?: number, limit?: number): Promise<TaggersInfoDTO> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}/taggers/${label}?${params}`);
  }

  async getPostTags(authorId: string, postId: string, viewerId?: string, skipTags?: number, limitTags?: number, limitTaggers?: number): Promise<TagDetails[]> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip_tags', (skipTags ?? 0).toString());
    params.append('limit_tags', (limitTags ?? 5).toString());
    params.append('limit_taggers', (limitTaggers ?? 5).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/post/${authorId}/${postId}/tags?${params}`);
  }

  // Search endpoints
  async searchTags(label: string, sorting?: string, start?: number, end?: number, skip?: number, limit?: number): Promise<TagSearch[]> {
    const params = new URLSearchParams();
    if (sorting) params.append('sorting', sorting);
    params.append('start', (start ?? 0).toString());
    params.append('end', (end ?? 100).toString());
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/search/tags/${label}?${params}`);
  }

  async searchUsers(username?: string, skip?: number, limit?: number): Promise<UserSearch> {
    const params = new URLSearchParams();
    if (username) params.append('username', username);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/search/users?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/stream/posts?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/stream/users?${params}`);
  }

  async streamUsersByIds(userIds: string[], viewerId?: string, depth?: number): Promise<UserStream> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/stream/users/by_ids?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  async streamUsersByUsername(username: string, viewerId?: string, skip?: number, limit?: number): Promise<UserStream> {
    const params = new URLSearchParams();
    params.append('username', username);
    if (viewerId) params.append('viewer_id', viewerId);
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/stream/users/username?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/tags/hot?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/tags/taggers/${label}/${reach}?${params}`);
  }

  // User endpoints
  async getUserView(userId: string, viewerId?: string, depth?: number): Promise<UserView> {
    const params = new URLSearchParams();
    if (viewerId) params.append('viewer_id', viewerId);
    if (depth) params.append('depth', depth.toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}?${params}`);
  }

  async getUserCounts(userId: string): Promise<UserCounts> {
    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/counts`);
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/details`);
  }

  async getUserFollowers(userId: string, skip?: number, limit?: number): Promise<Followers> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/followers?${params}`);
  }

  async getUserFollowing(userId: string, skip?: number, limit?: number): Promise<Following> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/following?${params}`);
  }

  async getUserFriends(userId: string, skip?: number, limit?: number): Promise<Friends> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/friends?${params}`);
  }

  async getUserMuted(userId: string, skip?: number, limit?: number): Promise<Muted> {
    const params = new URLSearchParams();
    params.append('skip', (skip ?? 0).toString());
    params.append('limit', (limit ?? 10).toString());

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/muted?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/notifications?${params}`);
  }

  async getUserRelationship(userId: string, viewerId: string): Promise<Relationship> {
    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/relationship/${viewerId}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/taggers/${label}?${params}`);
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

    return this.fetchAndParse(`${this.baseUrl}/v0/user/${userId}/tags?${params}`);
  }
} 