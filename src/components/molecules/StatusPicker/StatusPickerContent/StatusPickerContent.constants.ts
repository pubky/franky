import * as Libs from '@/libs';

/**
 * Predefined status options available in the status picker
 */
export const STATUS_OPTIONS = [
  { value: 'available', label: Libs.STATUS_LABELS.available, emoji: Libs.STATUS_EMOJIS.available },
  { value: 'away', label: Libs.STATUS_LABELS.away, emoji: Libs.STATUS_EMOJIS.away },
  { value: 'vacationing', label: Libs.STATUS_LABELS.vacationing, emoji: Libs.STATUS_EMOJIS.vacationing },
  { value: 'working', label: Libs.STATUS_LABELS.working, emoji: Libs.STATUS_EMOJIS.working },
  { value: 'traveling', label: Libs.STATUS_LABELS.traveling, emoji: Libs.STATUS_EMOJIS.traveling },
  { value: 'celebrating', label: Libs.STATUS_LABELS.celebrating, emoji: Libs.STATUS_EMOJIS.celebrating },
  { value: 'sick', label: Libs.STATUS_LABELS.sick, emoji: Libs.STATUS_EMOJIS.sick },
  { value: 'noStatus', label: Libs.STATUS_LABELS.noStatus, emoji: Libs.STATUS_EMOJIS.noStatus },
] as const;
