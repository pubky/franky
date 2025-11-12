import * as Core from '@/core';
import * as Libs from '@/libs';

/**
 * Nexus User Stream Service
 *
 * Handles fetching user stream data from Nexus API.
 */
export class NexusUserStreamService {
  /**
   * Fetches user stream data from Nexus API
   *
   * @param streamId - Composite stream identifier (e.g., 'user123:followers', 'influencers:today:all')
   * @param params - Pagination parameters (skip, limit)
   * @returns Array of NexusUser objects
   */
  static async fetch({ streamId, params }: Core.TFetchUserStreamParams): Promise<Core.NexusUser[]> {
    const { reach, apiParams } = Core.createNexusParams(streamId, params);

    // TEMPORARY: Mock data for followers/following
    if (reach === 'followers' || reach === 'following') {
      return this.generateMockUsers(100);
    }

    let url: string;

    // Type-safe dispatch - apiParams type is correctly mapped via UserStreamApiParamsMap
    switch (reach) {
      case 'friends':
        url = Core.userStreamApi.friends(apiParams as Core.TUserStreamWithUserIdParams);
        break;
      case 'muted':
        url = Core.userStreamApi.muted(apiParams as Core.TUserStreamWithUserIdParams);
        break;
      case 'recommended':
        url = Core.userStreamApi.recommended(apiParams as Core.TUserStreamWithUserIdParams);
        break;
      case 'influencers':
        url = Core.userStreamApi.influencers(apiParams as Core.TUserStreamInfluencersParams);
        break;
      case 'most_followed':
        url = Core.userStreamApi.mostFollowed(apiParams as Core.TUserStreamBase);
        break;
      default:
        throw new Error(`Invalid reach type: ${reach}`);
    }

    const users = await Core.queryNexus<Core.NexusUser[]>(url);
    return users || [];
  }

  /**
   * TEMPORARY: Generate mock users with real names
   */
  private static generateMockUsers(count: number): Core.NexusUser[] {
    const names = [
      'Emma Johnson',
      'Liam Smith',
      'Olivia Williams',
      'Noah Brown',
      'Ava Jones',
      'Ethan Garcia',
      'Sophia Martinez',
      'Mason Rodriguez',
      'Isabella Davis',
      'William Miller',
      'Mia Wilson',
      'James Moore',
      'Charlotte Taylor',
      'Benjamin Anderson',
      'Amelia Thomas',
      'Lucas Jackson',
      'Harper White',
      'Henry Harris',
      'Evelyn Martin',
      'Alexander Thompson',
      'Abigail Garcia',
      'Michael Martinez',
      'Emily Robinson',
      'Daniel Clark',
      'Elizabeth Rodriguez',
      'Matthew Lewis',
      'Sofia Lee',
      'David Walker',
      'Avery Hall',
      'Joseph Allen',
      'Ella Young',
      'Jackson Hernandez',
      'Scarlett King',
      'Sebastian Wright',
      'Victoria Lopez',
      'Jack Hill',
      'Grace Scott',
      'Aiden Green',
      'Chloe Adams',
      'Samuel Baker',
      'Zoey Gonzalez',
      'John Nelson',
      'Lily Carter',
      'Owen Mitchell',
      'Hannah Perez',
      'Luke Roberts',
      'Addison Turner',
      'Jayden Phillips',
      'Natalie Campbell',
      'Ryan Parker',
      'Lillian Evans',
      'Carter Edwards',
      'Aria Collins',
      'Wyatt Stewart',
      'Ellie Sanchez',
      'Julian Morris',
      'Nora Rogers',
      'Grayson Reed',
      'Penelope Cook',
      'Leo Morgan',
      'Riley Bell',
      'Jaxon Murphy',
      'Layla Bailey',
      'Lincoln Rivera',
      'Zoe Cooper',
      'Isaiah Richardson',
      'Stella Cox',
      'Thomas Howard',
      'Hazel Ward',
      'Charles Torres',
      'Aurora Peterson',
      'Christopher Gray',
      'Savannah Ramirez',
      'Josiah James',
      'Audrey Watson',
      'Andrew Brooks',
      'Brooklyn Kelly',
      'Ezra Sanders',
      'Bella Price',
      'Caleb Bennett',
      'Claire Wood',
      'Ryan Barnes',
      'Skylar Ross',
      'Nathan Henderson',
      'Lucy Coleman',
      'Isaac Jenkins',
      'Paisley Perry',
      'Gabriel Powell',
      'Sadie Long',
      'Christian Patterson',
      'Anna Hughes',
      'Jonathan Flores',
      'Caroline Washington',
      'Landon Butler',
      'Genesis Simmons',
      'Hunter Foster',
      'Naomi Gonzales',
      'Eli Bryant',
      'Aaliyah Alexander',
      'Colton Russell',
    ];

    return Array.from({ length: count }, (_, i) => {
      const name = names[i % names.length];
      const username =
        name.toLowerCase().replace(' ', '_') + (i >= names.length ? `_${Math.floor(i / names.length)}` : '');
      const userId = `mock_user_${i}_${username}` as Core.Pubky;

      return {
        details: {
          id: userId,
          name: name,
          bio: `Hi, I'm ${name}! This is a mock user for testing.`,
          image: null,
          links: null,
          status: null,
          indexed_at: Date.now(),
        },
        counts: {
          tagged: Math.floor(Math.random() * 50),
          tags: Math.floor(Math.random() * 20),
          unique_tags: Math.floor(Math.random() * 15),
          posts: Math.floor(Math.random() * 200),
          replies: Math.floor(Math.random() * 100),
          followers: Math.floor(Math.random() * 1000),
          following: Math.floor(Math.random() * 500),
          friends: Math.floor(Math.random() * 100),
          bookmarks: Math.floor(Math.random() * 50),
        },
        tags: [],
        relationship: {
          following: i % 3 === 0,
          followed_by: i % 4 === 0,
          muted: false,
        },
      };
    });
  }

  /**
   * Fetches user stream data from Nexus API by user IDs
   *
   * @param params - Parameters for fetching user stream data
   * @returns User stream data
   */
  static async fetchByIds(params: Core.TUserStreamUsersByIdsParams): Promise<Core.NexusUser[]> {
    if (params.user_ids.length === 0) {
      return [];
    }
    const url = Core.userStreamApi.usersByIds(params);
    let response = await Core.queryNexus<Core.NexusUser[]>(url.url, 'POST', JSON.stringify(url.body));
    if (!response) response = [];
    Libs.Logger.debug('Users fetched successfully', { response });

    return response;
  }
}
