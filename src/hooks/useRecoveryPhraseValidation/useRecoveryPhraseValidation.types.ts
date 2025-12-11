export interface UseRecoveryPhraseValidationProps {
  recoveryWords: string[];
}

export interface UseRecoveryPhraseValidationReturn {
  userWords: string[];
  errors: boolean[];
  remainingWords: Array<{ word: string; index: number; isUsed: boolean }>;
  handleWordClick: (word: string) => void;
  validateWords: () => boolean;
  clearWord: (index: number) => void;
  isComplete: boolean;
}
