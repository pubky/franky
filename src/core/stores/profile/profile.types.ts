export enum ProfileSection {
  NOTIFICATIONS = 'NOTIFICATIONS',
  POSTS = 'POSTS',
  REPLIES = 'REPLIES',
  FOLLOWERS = 'FOLLOWERS',
  FOLLOWING = 'FOLLOWING',
  FRIENDS = 'FRIENDS',
  TAGGED = 'TAGGED',
}

export interface ProfileState {
  section: ProfileSection;
}

export interface ProfileActions {
  setSection: (section: ProfileSection) => void;
  reset: () => void;
}

export interface ProfileSelectors {
  selectSection: () => ProfileSection;
}

export type ProfileStore = ProfileState & ProfileActions & ProfileSelectors;

export const profileInitialState: ProfileState = {
  section: ProfileSection.POSTS,
};

export enum ProfileActionTypes {
  SET_PROFILE_SECTION = 'SET_PROFILE_SECTION',
  RESET_PROFILE = 'RESET_PROFILE',
}
