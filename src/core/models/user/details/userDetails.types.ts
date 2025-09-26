export enum UserStatus {
  AVAILABLE = 'available',
  AWAY = 'away',
  VACATIONING = 'vacationing',
  WORKING = 'working',
  TRAVELING = 'traveling',
  CELEBRATING = 'celebrating',
  SICK = 'sick',
  NO_STATUS = 'no-status',
}

export const USER_STATUS_LIST = [
  { id: UserStatus.AVAILABLE, label: 'Available', emoji: '👋' },
  { id: UserStatus.AWAY, label: 'Away', emoji: '🌙' },
  { id: UserStatus.VACATIONING, label: 'Vacationing', emoji: '🌴' },
  { id: UserStatus.WORKING, label: 'Working', emoji: '👩‍💻' },
  { id: UserStatus.TRAVELING, label: 'Traveling', emoji: '✈️' },
  { id: UserStatus.CELEBRATING, label: 'Celebrating', emoji: '🎉' },
  { id: UserStatus.SICK, label: 'Sick', emoji: '😷' },
  { id: UserStatus.NO_STATUS, label: 'No Status', emoji: '💭' },
];
