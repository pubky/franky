'use client';

import { Button, Card, PasswordInput, PasswordConfirm } from '@/components/ui';
import { ArrowLeft, Download, Shield } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AuthController } from '@/core/controllers/auth';
import { useKeypairStore } from '@/core/stores';
import { useRouter } from 'next/navigation';

export default function RestoreAccount() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { publicKey, secretKey } = useKeypairStore();
  const router = useRouter();

  const handleDownload = () => {
    AuthController.createRecoveryFile(
      {
        publicKey,
        secretKey,
      },
      password,
    );
    router.push('/onboarding/homeserver');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-6xl font-bold text-foreground">
          Backup with <span className="text-green-500">encrypted file</span>.
        </h1>
        <p className="text-2xl text-muted-foreground">
          Create an encrypted backup file to secure your account and keys.
        </p>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="text-green-500 h-5 w-5" />
                Encrypted Backup
              </h3>
              <p className="text-base text-secondary-foreground opacity-80">
                Set a strong password to encrypt and download your backup file.
              </p>
            </div>

            <div className="bg-muted/50 border-l-4 border-l-green-500/30 rounded-lg p-4 flex items-start gap-3">
              <div className="text-green-600 mt-0.5">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Why use encrypted backups?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Protects your keys with military-grade encryption</li>
                  <li>• Works across all devices and platforms</li>
                  <li>• Only you can decrypt it with your password</li>
                  <li>• Safe to store in cloud services or email to yourself</li>
                </ul>
              </div>
            </div>

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

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="lg" className="rounded-full" asChild>
          <Link href="/onboarding/keys">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <Button size="lg" className="rounded-full" onClick={handleDownload} disabled={!password || !confirmPassword}>
          <Download className="mr-2 h-4 w-4" />
          Download backup file & continue
        </Button>
      </div>
    </div>
  );
}
