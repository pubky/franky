'use client';

import { useState, useMemo, useCallback } from 'react';

export interface UseRecoveryPhraseValidationProps {
  recoveryWords: string[];
}

export interface UseRecoveryPhraseValidationReturn {
  userWords: string[];
  errors: boolean[];
  availableWords: string[];
  usedWordInstances: Set<number>;
  handleWordClick: (word: string, wordIndex: number) => void;
  validateWords: () => boolean;
  clearWord: (index: number) => void;
  isComplete: boolean;
  wordCountMap: Record<string, number>;
}

export function useRecoveryPhraseValidation({
  recoveryWords,
}: UseRecoveryPhraseValidationProps): UseRecoveryPhraseValidationReturn {
  const [userWords, setUserWords] = useState<string[]>(Array(12).fill(''));
  const [errors, setErrors] = useState<boolean[]>(Array(12).fill(false));
  const [availableWords] = useState<string[]>([...recoveryWords].sort());
  const [usedWordCounts, setUsedWordCounts] = useState<Record<string, number>>({});
  const [usedWordInstances, setUsedWordInstances] = useState<Set<number>>(new Set());
  const [slotToInstance, setSlotToInstance] = useState<(number | null)[]>(Array(12).fill(null));

  // Precompute word counts for better performance
  const wordCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of recoveryWords) {
      map[w] = (map[w] || 0) + 1;
    }
    return map;
  }, [recoveryWords]);

  const validateSingleWord = useCallback(
    (wordIndex: number, word: string) => {
      setErrors((prev) => {
        const newErrors = [...prev];
        // Check if this specific word is correct for its position
        const isError = word !== '' && word !== recoveryWords[wordIndex];
        newErrors[wordIndex] = isError;
        return newErrors;
      });
    },
    [recoveryWords],
  );

  const handleWordClick = useCallback(
    (word: string, wordIndex: number) => {
      const wordCountInPhrase = wordCountMap[word] ?? 0;
      const currentUsageCount = usedWordCounts[word] || 0;

      if (currentUsageCount >= wordCountInPhrase) {
        return;
      }

      // Check if this specific word instance is already used
      if (usedWordInstances.has(wordIndex)) {
        return;
      }

      const emptyIndex = userWords.findIndex((w) => w === '');
      if (emptyIndex !== -1) {
        const newUserWords = [...userWords];
        newUserWords[emptyIndex] = word;
        setUserWords(newUserWords);

        setUsedWordCounts((prev) => ({
          ...prev,
          [word]: currentUsageCount + 1,
        }));
        setUsedWordInstances((prev) => new Set([...prev, wordIndex]));

        // Track slot to instance mapping
        setSlotToInstance((prev) => {
          const next = [...prev];
          next[emptyIndex] = wordIndex;
          return next;
        });

        // Validate this specific word immediately
        validateSingleWord(emptyIndex, word);
      }
    },
    [userWords, wordCountMap, usedWordCounts, usedWordInstances, validateSingleWord],
  );

  const validateWords = useCallback(() => {
    // Validate all words first
    const newErrors = userWords.map((word, index) => {
      return word !== '' && word !== recoveryWords[index];
    });
    setErrors(newErrors);

    // Check if all words are correct and filled
    const allFilled = userWords.every((word) => word !== '');
    const allCorrect = newErrors.every((error) => !error);

    return allFilled && allCorrect;
  }, [userWords, recoveryWords]);

  const clearWord = useCallback(
    (index: number) => {
      const word = userWords[index];
      if (word) {
        const newUserWords = [...userWords];
        newUserWords[index] = '';
        setUserWords(newUserWords);
        setUsedWordCounts((prev) => ({
          ...prev,
          [word]: Math.max(0, (prev[word] || 0) - 1),
        }));

        // Use the exact instance that was used in this slot
        const instanceIndex = slotToInstance[index];
        if (instanceIndex !== null) {
          setUsedWordInstances((prev) => {
            const next = new Set(prev);
            next.delete(instanceIndex);
            return next;
          });
          setSlotToInstance((prev) => {
            const next = [...prev];
            next[index] = null;
            return next;
          });
        }

        // Clear error for this specific word
        setErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = false;
          return newErrors;
        });
      }
    },
    [userWords, slotToInstance],
  );

  const isComplete = userWords.every((word) => word !== '') && errors.every((error) => !error);

  return {
    userWords,
    errors,
    availableWords,
    usedWordInstances,
    handleWordClick,
    validateWords,
    clearWord,
    isComplete,
    wordCountMap,
  };
}
