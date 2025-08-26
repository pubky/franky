'use client';

import { useState } from 'react';

import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';
import Image from 'next/image';
import { DialogClose } from '@radix-ui/react-dialog';
import { Identity } from '@/libs';
import { useOnboardingStore } from '@/core';

export function DialogBackupEncrypted() {
  const [step, setStep] = useState(1);

  const handleClose = () => {
    //delay 1 seconds
    setTimeout(() => {
      setStep(1);
    }, 1000);
  };

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="secondary" className="gap-2">
          <Libs.FileText className="h-4 w-4" />
          <span>Encrypted file</span>
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="gap-6 p-8 !max-w-[576px]">
        {step === 1 && <RecoveryStep1 setStep={setStep} />}
        {step === 2 && <RecoveryStep2 handleClose={handleClose} />}
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}

function RecoveryStep1({ setStep }: { setStep: (step: number) => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { secretKey, publicKey } = useOnboardingStore();

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    // Each check adds 1 point
    Object.values(checks).forEach((check) => {
      if (check) strength++;
    });

    return {
      strength,
      checks,
      percentage: (strength / 5) * 100,
    };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const getStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak password';
    if (strength <= 3) return 'Fair password';
    if (strength <= 4) return 'Good password';
    return 'Strong password!';
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'text-red-400';
    if (strength <= 3) return 'text-yellow-400';
    if (strength <= 4) return 'text-blue-400';
    return 'text-green-400';
  };

  const handleDownload = () => {
    Identity.createRecoveryFile(
      {
        publicKey: publicKey,
        secretKey: secretKey,
      },
      password,
    );
    setStep(2);
  };

  return (
    <>
      <Atoms.DialogHeader className="space-y-1.5 pr-6">
        <Atoms.DialogTitle className="text-2xl font-bold leading-8 sm:text-xl sm:leading-7">
          Backup as encrypted file
        </Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm leading-5">
          Encrypt your recovery file below with a secure password, download it, and save it to your computer or cloud
          provider. <span className="text-brand font-bold">Never share this file with anyone.</span>
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container className="gap-6">
        <Atoms.Container className="space-y-6">
          <Atoms.Container className="space-y-2">
            <Atoms.Label htmlFor="password" className="text-xs font-medium tracking-widest text-muted-foreground">
              PASSWORD
            </Atoms.Label>
            <Atoms.Container className="space-y-3">
              <Atoms.Container className="relative">
                <Atoms.Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-md border-dashed border bg-opacity-90 shadow-sm p-4"
                  placeholder="Enter a strong password"
                  autoComplete="new-password"
                />
              </Atoms.Container>
              <Atoms.Typography size="sm" className="text-muted-foreground text-xs font-medium leading-3">
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
                <span className={`text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}>
                  {getStrengthText(passwordStrength.strength)}
                </span>
              </Atoms.Container>
            )}
          </Atoms.Container>

          <Atoms.Container className="space-y-2">
            <Atoms.Label
              htmlFor="confirmPassword"
              className="text-xs font-medium tracking-widest text-muted-foreground"
            >
              REPEAT PASSWORD
            </Atoms.Label>
            <Atoms.Container className="space-y-3">
              <Atoms.Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`h-14 rounded-md border-dashed border bg-opacity-90 shadow-sm p-4 ${
                  confirmPassword && !passwordsMatch ? 'border-red-400' : ''
                }`}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
              {confirmPassword && !passwordsMatch && (
                <Atoms.Typography size="sm" className="text-red-400 text-xs font-medium leading-3">
                  Passwords do not match
                </Atoms.Typography>
              )}
            </Atoms.Container>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="gap-4 sm:gap-3 flex-row justify-between">
        <DialogClose asChild>
          <Atoms.Button
            variant="outline"
            className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6"
            onClick={() => {
              setStep(1);
            }}
          >
            <Libs.ArrowLeft className="mr-2 h-4 w-4 hidden" />
            Cancel
          </Atoms.Button>
        </DialogClose>
        <Atoms.Button
          className="h-[60px] flex-1 rounded-full sm:h-10 px-12 py-6"
          onClick={handleDownload}
          disabled={!password || !passwordsMatch}
        >
          <Libs.Download className="mr-2 h-4 w-4" />
          Download file
        </Atoms.Button>
      </Atoms.Container>
    </>
  );
}

function RecoveryStep2({ handleClose }: { handleClose: () => void }) {
  return (
    <>
      <Atoms.DialogHeader className="gap-1.5 pr-6">
        <Atoms.DialogTitle className="text-xl md:text-2xl font-bold">Backup complete</Atoms.DialogTitle>
        <Atoms.DialogDescription className="text-sm text-muted-foreground">
          You can use your backed up encrypted file to restore your account again later.
        </Atoms.DialogDescription>
      </Atoms.DialogHeader>

      <Atoms.Container>
        <Atoms.Container className="w-full bg-card rounded-md p-6 flex items-center justify-center">
          <Image src="/images/check.png" alt="Backup Complete" width={180} height={180} className="w-48 h-48" />
        </Atoms.Container>
      </Atoms.Container>

      <Atoms.Container className="flex-col-reverse sm:flex-row gap-3 lg:gap-4 sm:justify-end">
        <Atoms.DialogClose asChild>
          <Atoms.Button variant="outline" className="rounded-full lg:h-[60px] lg:px-8 flex-1" onClick={handleClose}>
            Cancel
          </Atoms.Button>
        </Atoms.DialogClose>
        <Atoms.DialogClose asChild>
          <Atoms.Button className="rounded-full lg:h-[60px] lg:px-8 flex-1" onClick={handleClose}>
            <Libs.ArrowRight className="mr-2 h-4 w-4" />
            Finish
          </Atoms.Button>
        </Atoms.DialogClose>
      </Atoms.Container>
    </>
  );
}
