'use client';

import { useState, useCallback } from 'react';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

interface DialogRestoreRecoveryPhraseProps {
  onRestore?: () => void;
}

export function DialogRestoreRecoveryPhrase({ onRestore }: DialogRestoreRecoveryPhraseProps) {
  const [userWords, setUserWords] = useState<string[]>(Array(12).fill(''));
  const [isRestoring, setIsRestoring] = useState(false);
  const [errors, setErrors] = useState<boolean[]>(Array(12).fill(false));
  const [touched, setTouched] = useState<boolean[]>(Array(12).fill(false));
  const { toast } = Molecules.useToast();

  const handleRestore = async () => {
    setIsRestoring(true);

    try {
      // Mark all fields as touched when trying to restore
      setTouched(Array(12).fill(true));

      // Basic validation
      const newErrors = userWords.map((word) => {
        return word === '' || !/^[a-z]+$/.test(word);
      });
      setErrors(newErrors);

      const hasErrors = newErrors.some((error) => error);
      const allFilled = userWords.every((word) => word !== '');

      const mnemonic = userWords.join(' ');
      await Core.AuthController.loginWithMnemonic(mnemonic);

      if (!hasErrors && allFilled) {
        onRestore?.();
      }
    } catch (error) {
      console.error('Error logging in with mnemonic', error);
      // TODO: handle error based on the error type
      // show error toast
      toast({
        title: 'Error logging in with mnemonic',
        description: 'Please try again.',
      });
      setIsRestoring(false);
    }
  };

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="outline" className="rounded-full w-auto md:flex-none">
          <Libs.FileText className="mr-2 h-4 w-4" />
          Use recovery phrase
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="gap-6 p-8">
        <RestoreForm
          userWords={userWords}
          errors={errors}
          touched={touched}
          isRestoring={isRestoring}
          onWordChange={setUserWords}
          onErrorsChange={setErrors}
          onTouchedChange={setTouched}
          onRestore={handleRestore}
        />
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}

type WordSlotProps = {
  index: number;
  word: string;
  isError: boolean;
  showError: boolean;
  isRestoring: boolean;
  onChange: (index: number, value: string) => void;
  onValidate: (index: number, word: string) => void;
};

const WordSlot = ({ index, word, isError, showError, isRestoring, onChange, onValidate }: WordSlotProps) => {
  const hasError = isError && showError;

  const containerClasses = Libs.cn(
    'flex-row px-4 py-2 rounded-md border overflow-hidden',
    'inline-flex justify-start items-center gap-2 bg-transparent transition-colors',
    hasError && 'border-red-500 bg-red-500/10',
    !hasError && 'border-border hover:bg-secondary/50',
  );

  const badgeClasses = Libs.cn(
    'z-10 h-6 rounded-full w-6',
    hasError && 'bg-red-500 text-white',
    !hasError && 'bg-muted text-muted-foreground',
  );

  const inputColor = Libs.cn('!border-none !bg-transparent flex-row', hasError && '!text-red-500');

  return (
    <Atoms.Container className="relative">
      <Atoms.Container className={containerClasses}>
        <Atoms.Badge variant="outline" className={badgeClasses}>
          {index + 1}
        </Atoms.Badge>
        <Atoms.Input
          value={word}
          placeholder="word"
          className={inputColor}
          onChange={(e) => onChange(index, e.target.value.toLowerCase().trim())}
          onBlur={() => onValidate(index, word)}
          disabled={isRestoring}
        />
      </Atoms.Container>
    </Atoms.Container>
  );
};

function RestoreForm({
  userWords,
  errors,
  touched,
  isRestoring,
  onWordChange,
  onErrorsChange,
  onTouchedChange,
  onRestore,
}: {
  userWords: string[];
  errors: boolean[];
  touched: boolean[];
  isRestoring: boolean;
  onWordChange: (words: string[]) => void;
  onErrorsChange: (errors: boolean[]) => void;
  onTouchedChange: (touched: boolean[]) => void;
  onRestore: () => void;
}) {
  const handleWordChange = useCallback(
    (index: number, value: string) => {
      const newUserWords = [...userWords];
      newUserWords[index] = value;
      onWordChange(newUserWords);

      // Mark field as touched
      if (!touched[index]) {
        const newTouched = [...touched];
        newTouched[index] = true;
        onTouchedChange(newTouched);
      }

      // Clear error when user starts typing
      if (errors[index] && value !== '') {
        const newErrors = [...errors];
        newErrors[index] = false;
        onErrorsChange(newErrors);
      }
    },
    [userWords, errors, touched, onWordChange, onErrorsChange, onTouchedChange],
  );

  const handleWordValidate = useCallback(
    (index: number, word: string) => {
      // Mark as touched when blurred
      if (!touched[index]) {
        const newTouched = [...touched];
        newTouched[index] = true;
        onTouchedChange(newTouched);
      }

      // Validate word format (basic validation)
      const newErrors = [...errors];
      newErrors[index] = word !== '' && !/^[a-z]+$/.test(word);
      onErrorsChange(newErrors);
    },
    [errors, touched, onErrorsChange, onTouchedChange],
  );

  return (
    <>
      <Atoms.DialogHeader className="space-y-1.5 pr-6">
        <Atoms.DialogTitle className="text-2xl sm:text-[24px] font-bold">
          Restore with recovery phrase
        </Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm text-muted-foreground">
          Use your 12 words (recovery phrase) to restore your account and sign in.
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className="space-y-6">
        <Atoms.Container display="grid" className="grid-cols-2 sm:grid-cols-3 gap-3">
          {userWords.map((word, i) => {
            const isError = errors[i];
            const showError = touched[i];
            return (
              <WordSlot
                key={i}
                index={i}
                word={word}
                isError={isError}
                showError={showError}
                isRestoring={isRestoring}
                onChange={handleWordChange}
                onValidate={handleWordValidate}
              />
            );
          })}
        </Atoms.Container>

        {errors.some((error, index) => error && touched[index]) && (
          <Atoms.Container className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <div className="flex items-center gap-2 text-red-500">
              <Libs.AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Invalid words detected</span>
            </div>
            <p className="text-sm text-red-500/80 mt-1">
              Please check that all words are valid and contain only lowercase letters.
            </p>
          </Atoms.Container>
        )}
      </Atoms.Container>

      <Atoms.Container className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
        <Atoms.DialogClose asChild>
          <Atoms.Button variant="outline" className="rounded-full flex-1" size="lg">
            Cancel
          </Atoms.Button>
        </Atoms.DialogClose>
        <Atoms.Button
          size="lg"
          className="rounded-full flex-1"
          onClick={onRestore}
          disabled={userWords.some((word) => word === '') || errors.some((error) => error) || isRestoring}
        >
          {isRestoring ? (
            <>
              <Libs.Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restoring...
            </>
          ) : (
            <>
              <Libs.RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </>
          )}
        </Atoms.Button>
      </Atoms.Container>
    </>
  );
}
