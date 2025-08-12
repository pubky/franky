'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, FileText } from 'lucide-react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import Image from 'next/image';

export function DialogBackupPhrase() {
  const [isHidden, setIsHidden] = useState(true);
  const [step, setStep] = useState(1);
  const recoveryWords = [
    'negative',
    'inquiry',
    'swamp',
    'purity',
    'carbon',
    'actual',
    'march',
    'enemy',
    'clinic',
    'armed',
    'exact',
    'fog',
  ];

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="secondary">
          <FileText className="h-4 w-4" />
          <span>Recovery phrase</span>
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="gap-6 p-8 sm:p-6">
        {step === 1 && (
          <RecoveryStep1
            recoveryWords={recoveryWords}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            setStep={setStep}
          />
        )}
        {step === 2 && <RecoveryStep2 recoveryWords={recoveryWords} setStep={setStep} />}
        {step === 3 && <RecoveryStep3 setStep={setStep} />}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}

export function RecoveryStep1({
  recoveryWords,
  isHidden,
  setIsHidden,
  setStep,
}: {
  recoveryWords: string[];
  isHidden: boolean;
  setIsHidden: (isHidden: boolean) => void;
  setStep: (step: number) => void;
}) {
  return (
    <>
      <Atoms.DialogHeader className="space-y-1.5 pr-6">
        <Atoms.DialogTitle className="text-2xl font-bold leading-8 sm:text-xl sm:leading-7">
          Backup recovery phrase
        </Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm leading-5 max-w-[530px]">
          Use the recovery phrase below to recover your account at a later date. Write down these 12 words in the
          correct order and store them in a safe place.{' '}
          <span className="text-brand font-bold">Never share this recovery phrase with anyone.</span>
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className={Libs.cn(isHidden && 'blur-xs')}>
        <Atoms.Container display="grid" className="grid-cols-2 md:grid-cols-3 gap-3">
          {recoveryWords.map((word, index) => (
            <Atoms.Container key={index} className="items-center gap-3 rounded-md bg-secondary p-4 flex-row">
              <Atoms.Badge variant="outline" className="h-5 min-w-[20px] rounded-full px-1 font-semibold">
                {index + 1}
              </Atoms.Badge>
              <span className="text-base font-medium">{word}</span>
            </Atoms.Container>
          ))}
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="gap-4 sm:gap-3 flex-row justify-between">
        {isHidden ? (
          <>
            <Atoms.DialogClose asChild>
              <Atoms.Button variant="outline" className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6">
                Cancel
              </Atoms.Button>
            </Atoms.DialogClose>
            <Atoms.Button
              className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6"
              onClick={() => {
                setIsHidden(!isHidden);
                setStep(1);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Reveal recovery phrase
            </Atoms.Button>
          </>
        ) : (
          <>
            <Atoms.Button
              variant="outline"
              className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6"
              onClick={() => {
                setIsHidden(!isHidden);
                setStep(1);
              }}
            >
              <EyeOff className="mr-2 h-4 w-4" />
              Hide recovery phrase
            </Atoms.Button>
            <Atoms.Button className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6" onClick={() => setStep(2)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Confirm recovery phrase
            </Atoms.Button>
          </>
        )}
      </Atoms.Container>
    </>
  );
}

export default function RecoveryStep2({
  recoveryWords,
  setStep,
}: {
  recoveryWords: string[];
  setStep: (step: number) => void;
}) {
  const [userWords, setUserWords] = useState<string[]>(Array(12).fill(''));
  const [errors, setErrors] = useState<boolean[]>(Array(12).fill(false));
  const [availableWords] = useState<string[]>([...recoveryWords].sort());
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 640);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const validateSingleWord = (wordIndex: number, word: string) => {
    const newErrors = [...errors];
    // Check if this specific word is correct for its position
    const isError = word !== '' && word !== recoveryWords[wordIndex];
    newErrors[wordIndex] = isError;
    setErrors(newErrors);

    // Debug log
    console.log(`Word "${word}" at position ${wordIndex + 1}:`, {
      expected: recoveryWords[wordIndex],
      isError,
      isEmpty: word === '',
    });
  };

  const handleWordClick = (word: string) => {
    // Check if word is already used
    const isWordAlreadyUsed = userWords.includes(word);

    if (isWordAlreadyUsed) {
      console.log(`Word "${word}" is already used, ignoring click`);
      return;
    }

    const emptyIndex = userWords.findIndex((w) => w === '');
    if (emptyIndex !== -1) {
      const newUserWords = [...userWords];
      newUserWords[emptyIndex] = word;
      setUserWords(newUserWords);

      // Validate this specific word immediately
      validateSingleWord(emptyIndex, word);
    }
  };

  const validateWords = () => {
    // Validate all words first
    const newErrors = userWords.map((word, index) => {
      return word !== '' && word !== recoveryWords[index];
    });
    setErrors(newErrors);

    // Check if all words are correct and filled
    const allFilled = userWords.every((word) => word !== '');
    const allCorrect = newErrors.every((error) => !error);

    // Only advance if all words are filled and correct
    if (allFilled && allCorrect) {
      setStep(3);
    }
  };

  const clearWord = (index: number) => {
    const word = userWords[index];
    if (word) {
      const newUserWords = [...userWords];
      newUserWords[index] = '';
      setUserWords(newUserWords);

      // Clear error for this specific word
      const newErrors = [...errors];
      newErrors[index] = false;
      setErrors(newErrors);
    }
  };

  return (
    <>
      <Atoms.DialogHeader className="space-y-1.5 pr-6">
        <Atoms.DialogTitle className="text-2xl sm:text-[24px] font-bold">Confirm recovery phrase</Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm text-muted-foreground">
          Click or tap the 12 words in the correct order. Click on filled fields to remove words.
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className="space-y-6">
        <Atoms.Container className="flex-wrap gap-2 flex-row">
          {availableWords.map((word, index) => {
            const isUsed = userWords.includes(word);
            return (
              <Atoms.Button
                key={`${word}-${index}`}
                variant={isUsed ? 'secondary' : 'outline'}
                size="sm"
                className={`rounded-full ${
                  isUsed
                    ? 'opacity-40 bg-muted text-muted-foreground cursor-not-allowed'
                    : 'hover:bg-primary hover:text-primary-foreground cursor-pointer'
                }`}
                onClick={() => !isUsed && handleWordClick(word)}
                disabled={isUsed}
              >
                {word}
              </Atoms.Button>
            );
          })}
        </Atoms.Container>

        <Atoms.Container display="grid" className="grid-cols-1 sm:grid-cols-3 gap-3">
          {userWords.map((word, i) => {
            const isCorrect = word !== '' && word === recoveryWords[i];
            const isError = errors[i];

            if (isCorrect) {
              // Use Figma design for correct words with fallback colors - clickable to clear if user wants to change
              return (
                <div
                  key={i}
                  className="self-stretch px-5 py-4 bg-transparent rounded-lg shadow-[0px_1px_2px_0px_rgba(5,5,10,0.20)] border-brand border-dashed border inline-flex justify-start items-center gap-3 overflow-hidden cursor-pointer hover:bg-brand/10 transition-colors"
                  onClick={() => clearWord(i)}
                  title="Click to remove this word if you want to change it"
                >
                  <div className="w-5 h-5 min-w-5 px-1 bg-brand text-black rounded-full shadow-[0px_1px_2px_0px_rgba(5,5,10,0.25)] flex justify-center items-center gap-1 overflow-hidden">
                    <div className="justify-start text-xs font-semibold font-['Inter_Tight'] leading-none">{i + 1}</div>
                  </div>
                  <div className="flex-1 justify-start text-brand text-base font-medium font-['Inter_Tight'] leading-normal">
                    {word}
                  </div>
                </div>
              );
            }

            if (isError) {
              // Use Figma design for error words with fallback colors - clickable to clear
              return (
                <div
                  key={i}
                  className="self-stretch px-5 py-4 bg-transparent rounded-lg shadow-[0px_1px_2px_0px_rgba(5,5,10,0.20)]  border-red-500 border-dashed border inline-flex justify-start items-center gap-3 overflow-hidden cursor-pointer hover:bg-red-500/20 transition-colors"
                  onClick={() => clearWord(i)}
                  title="Click to remove this incorrect word"
                >
                  <div className="h-5 min-w-5 px-1 bg-red-500 rounded-full shadow-[0px_1px_2px_0px_rgba(5,5,10,0.25)] flex justify-center items-center gap-1">
                    <div className="justify-start text-xs font-semibold font-['Inter_Tight'] leading-none">{i + 1}</div>
                  </div>
                  <div className="flex-1 justify-start text-red-700 text-base font-medium font-['Inter_Tight'] leading-normal">
                    {word}
                  </div>
                </div>
              );
            }

            // Default state for empty or neutral words
            return (
              <Atoms.Container
                key={i}
                className={`relative flex-row items-center gap-2 bg-transparent p-4 rounded-md border border-dashed ${
                  word !== '' ? 'cursor-pointer hover:bg-secondary/80 transition-colors' : ''
                }`}
                onClick={() => word !== '' && clearWord(i)}
                title={word !== '' ? 'Click to remove this word' : ''}
              >
                <Atoms.Badge variant="outline" className="absolute left-5 top-4 z-10 h-5 min-w-[20px]">
                  {i + 1}
                </Atoms.Badge>
                <Atoms.Input
                  value={word}
                  placeholder="word"
                  className="pl-12 cursor-pointer w-full"
                  readOnly
                  onClick={(e) => {
                    e.stopPropagation();
                    if (word !== '') clearWord(i);
                  }}
                />
              </Atoms.Container>
            );
          })}
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
        <Atoms.Button
          variant="outline"
          className="rounded-full flex-1"
          size={isLargeScreen ? 'lg' : 'default'}
          onClick={() => setStep(1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Atoms.Button>
        <Atoms.Button
          className="rounded-full flex-1"
          size={isLargeScreen ? 'lg' : 'default'}
          onClick={validateWords}
          disabled={userWords.some((word) => word === '') || errors.some((error) => error)}
        >
          <Check className="mr-2 h-4 w-4" />
          Validate
        </Atoms.Button>
      </Atoms.Container>
    </>
  );
}

export function RecoveryStep3({ setStep }: { setStep: (step: number) => void }) {
  return (
    <>
      <Atoms.DialogHeader className="pr-6 space-y-1.5">
        <Atoms.DialogTitle className="text-xl lg:text-2xl font-bold leading-7 lg:leading-8">
          Backup complete
        </Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm font-medium text-muted-foreground leading-5">
          You can use your backed up recovery phrase to restore your account later.
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container>
        <Atoms.Container className="w-full bg-card rounded-md p-6 flex items-center justify-center">
          <Image src="/images/check.png" alt="Backup Complete" width={180} height={180} className="w-48 h-48" />
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="flex-col-reverse sm:flex-row gap-3 lg:gap-4 sm:justify-end">
        <Atoms.DialogClose asChild>
          <Atoms.Button
            variant="outline"
            className="rounded-full lg:h-[60px] lg:px-8 flex-1"
            onClick={() => setStep(1)}
          >
            Cancel
          </Atoms.Button>
        </Atoms.DialogClose>
        <Atoms.DialogClose asChild>
          <Atoms.Button className="rounded-full lg:h-[60px] lg:px-8 flex-1" onClick={() => setStep(1)}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Finish
          </Atoms.Button>
        </Atoms.DialogClose>
      </Atoms.Container>
    </>
  );
}
