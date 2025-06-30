'use client';

import { Button, Card, InfoCard, PasswordInput, PasswordConfirm, PageHeader } from '@/components/ui';
import { ArrowLeft, Download, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { AuthController } from '@/core/controllers/auth';
import { useKeypairStore } from '@/core/stores';
import { useRouter } from 'next/navigation';

export default function RestoreAccount() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const { publicKey, secretKey } = useKeypairStore();
  const router = useRouter();

  // Computed values
  const buttonStates = useMemo(
    () => ({
      downloadDisabled: !password || !confirmPassword || isCreatingFile,
    }),
    [password, confirmPassword, isCreatingFile],
  );

  const displayTexts = useMemo(
    () => ({
      downloadButtonText: isCreatingFile ? 'Creating backup file...' : 'Download backup file & continue',
    }),
    [isCreatingFile],
  );

  // Event handlers
  const handleDownload = async () => {
    setIsCreatingFile(true);
    try {
      await AuthController.createRecoveryFile(
        {
          publicKey,
          secretKey,
        },
        password,
      );
      // Only navigate if the recovery file was created successfully
      router.push('/onboarding/homeserver');
    } finally {
      setIsCreatingFile(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <>
            Backup with <span className="text-green-500">encrypted file</span>.
          </>
        }
        subtitle="Create an encrypted backup file to secure your account and keys."
      />

      <div className="flex flex-col gap-4">
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="text-green-500 h-5 w-5" />
                Encrypted Backup
              </h3>
              <p className="text-sm sm:text-base text-secondary-foreground opacity-80">
                Set a strong password to encrypt and download your backup file.
              </p>
            </div>

            <InfoCard title="Why use encrypted backups?" icon={Shield} variant="success">
              <ul className="space-y-1 list-disc list-inside">
                <li>Protects your keys with military-grade encryption</li>
                <li>Works across all devices and platforms</li>
                <li>Only you can decrypt it with your password</li>
                <li>Safe to store in cloud services or email to yourself</li>
              </ul>
            </InfoCard>

            <div className="flex flex-col gap-4">
              <PasswordInput
                label="Create a strong password for your backup file"
                placeholder="Enter a strong password"
                value={password}
                onChange={setPassword}
                showStrengthMeter={true}
              />

              <PasswordConfirm value={confirmPassword} onChange={setConfirmPassword} originalPassword={password} />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
        <Button variant="secondary" size="lg" className="rounded-full w-full sm:w-auto" asChild>
          <Link href="/onboarding/keys">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button
          size="lg"
          className="rounded-full w-full sm:w-auto"
          onClick={handleDownload}
          disabled={buttonStates.downloadDisabled}
        >
          <Download className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{displayTexts.downloadButtonText}</span>
          <span className="sm:hidden">{isCreatingFile ? 'Creating file...' : 'Download & continue'}</span>
        </Button>
      </div>
    </div>
  );
}
