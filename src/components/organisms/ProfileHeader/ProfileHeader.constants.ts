export interface StatusOption {
  emoji: string;
  label: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { emoji: '👋', label: 'Available' },
  { emoji: '🕓', label: 'Away' },
  { emoji: '🌴', label: 'Vacationing' },
  { emoji: '👨‍💻', label: 'Working' },
  { emoji: '✈️', label: 'Traveling' },
  { emoji: '🥂', label: 'Celebrating' },
  { emoji: '🤒', label: 'Sick' },
  { emoji: '💭', label: 'No Status' },
];

export const DEFAULT_STATUS = 'Vacationing';
export const DEFAULT_EMOJI = '😊';
export const MAX_CUSTOM_STATUS_LENGTH = 12;
