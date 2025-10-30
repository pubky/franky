'use client';

import { useState } from 'react';

import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';
import Image from 'next/image';
import { Identity, calculatePasswordStrength, getStrengthText, getStrengthColor } from '@/libs';
import { useOnboardingStore } from '@/core';

interface DialogBackupEncryptedProps {
  children?: React.ReactNode;
}

function RecoveryStep1({ setStep }: { setStep: (step: number) => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { secretKey, pubky } = useOnboardingStore();

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleDownload = () => {
    void Identity.createRecoveryFile(
      {
        pubky,
        secretKey: secretKey,
      },
      password,
    );
    setStep(2);
  };

  const isFormValid = () => {
    return Boolean(password && passwordsMatch);
  };

  const handleKeyDown = Hooks.useEnterSubmit(isFormValid, handleDownload);

  return (
    <>
      <Atoms.DialogHeader>
        <Atoms.DialogTitle>Backup as encrypted file</Atoms.DialogTitle>
        <Atoms.DialogDescription>
          Encrypt your recovery file below with a secure password, download it, and save it to your computer or cloud
          provider. <span className="text-foreground font-bold">Never share this file with anyone.</span>
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className="gap-3">
        <Atoms.Container>
          <Atoms.Label htmlFor="password" className="text-xs font-medium tracking-widest text-muted-foreground pb-4">
            PASSWORD
          </Atoms.Label>
          <Atoms.Container>
            <Atoms.Container className="relative pb-3">
              <Atoms.Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-14 rounded-md border-dashed border bg-opacity-90 shadow-sm p-4"
                placeholder="Enter a strong password"
                autoComplete="new-password"
                aria-describedby="password-help"
              />
            </Atoms.Container>
            <Atoms.Typography
              id="password-help"
              size="sm"
              className="text-muted-foreground text-xs font-medium leading-3"
            >
              We recommend to use 8 characters or more with uppercase, lowercase, numbers, and symbols.
            </Atoms.Typography>
          </Atoms.Container>
        </Atoms.Container>

        <Atoms.Container className="items-start">
          {password && (
            <Atoms.Container className="flex-row items-center gap-3 justify-start">
              {[1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`h-3 w-6 rounded-lg ${index <= passwordStrength.strength ? 'bg-brand' : 'bg-muted'}`}
                ></div>
              ))}
              <span
                className={`text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}
                role="status"
                aria-live="polite"
              >
                {getStrengthText(passwordStrength.strength)}
              </span>
            </Atoms.Container>
          )}
        </Atoms.Container>

        <Atoms.Container>
          <Atoms.Label
            htmlFor="confirmPassword"
            className="text-xs font-medium tracking-widest text-muted-foreground pb-4"
          >
            REPEAT PASSWORD
          </Atoms.Label>
          <Atoms.Container className="pb-3">
            <Atoms.Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`h-14 rounded-md border-dashed border bg-opacity-90 shadow-sm p-4 ${
                confirmPassword && !passwordsMatch ? 'border-destructive' : ''
              }`}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={Boolean(confirmPassword && !passwordsMatch)}
              aria-describedby={confirmPassword && !passwordsMatch ? 'confirm-password-error' : undefined}
            />
            {confirmPassword && !passwordsMatch && (
              <Atoms.Typography
                id="confirm-password-error"
                size="sm"
                className="text-destructive text-xs font-medium leading-3 pt-3"
              >
                Passwords do not match
              </Atoms.Typography>
            )}
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.DialogFooter>
        <Atoms.DialogClose asChild>
          <Atoms.Button
            variant="outline"
            size="lg"
            onClick={() => {
              setStep(1);
            }}
          >
            Cancel
          </Atoms.Button>
        </Atoms.DialogClose>
        <Atoms.Button id="download-file-btn" size="lg" onClick={handleDownload} disabled={!isFormValid()}>
          <Libs.Download className="h-4 w-4" />
          Download file
        </Atoms.Button>
      </Atoms.DialogFooter>
    </>
  );
}

function RecoveryStep2({ handleClose }: { handleClose: () => void }) {
  return (
    <>
      <Atoms.DialogHeader>
        <Atoms.DialogTitle>Backup complete</Atoms.DialogTitle>
        <Atoms.DialogDescription>
          You can use your backed up encrypted file to restore your account again later.
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container>
        <Atoms.Container className="w-full bg-card rounded-md p-6 flex items-center justify-center">
          <Image src="/images/check.png" alt="Backup Complete" width={180} height={180} className="w-48 h-48" />
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.DialogFooter>
        <Atoms.DialogClose asChild>
          <Atoms.Button variant="outline" size="lg" onClick={handleClose}>
            Cancel
          </Atoms.Button>
        </Atoms.DialogClose>
        <Atoms.DialogClose asChild>
          <Atoms.Button id="backup-successful-ok-btn" size="lg" onClick={handleClose}>
            <Libs.ArrowRight className="h-4 w-4" />
            Finish
          </Atoms.Button>
        </Atoms.DialogClose>
      </Atoms.DialogFooter>
    </>
  );
}

export function DialogBackupEncrypted({ children }: DialogBackupEncryptedProps) {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    //delay 1 second
    setTimeout(() => {
      setStep(1);
    }, 1000);
  };

  return (
    <Atoms.Dialog
      onOpenChange={(open) => {
        if (!open) setStep(1);
      }}
    >
      {children ? (
        <Atoms.DialogTrigger asChild>{children}</Atoms.DialogTrigger>
      ) : (
        <Atoms.DialogTrigger asChild>
          <Atoms.Button id="backup-encrypted-file-btn">Continue</Atoms.Button>
        </Atoms.DialogTrigger>
      )}
      <Atoms.DialogContent className="max-w-md sm:max-w-lg" hiddenTitle="Backup as encrypted file">
        {step === 1 && <RecoveryStep1 setStep={setStep} />}
        {step === 2 && <RecoveryStep2 handleClose={handleClose} />}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
