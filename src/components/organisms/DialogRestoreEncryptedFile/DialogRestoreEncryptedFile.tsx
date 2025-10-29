'use client';

import { useState, useRef } from 'react';
import { DialogClose } from '@radix-ui/react-dialog';

import * as Atoms from '@/atoms';
import * as Core from '@/core';
import * as Libs from '@/libs';
import * as Hooks from '@/hooks';

export function DialogRestoreEncryptedFile({ onRestore }: { onRestore: () => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.pkarr')) {
        setError('Please select a .pkarr file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleRestore = async () => {
    // Guard against double-submit race condition
    if (isRestoring) return;

    if (!selectedFile || !password) {
      setError('Please select a file and enter your password');
      return;
    }

    setIsRestoring(true);
    setError('');

    try {
      await Core.AuthController.loginWithEncryptedFile({ encryptedFile: selectedFile, password });
      onRestore?.();
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes('password') ||
          errorMessage.includes('decrypt') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('aead') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('cipher')
        ) {
          setError('Invalid password or corrupted file. Please check your password and try again.');
        } else if (
          error instanceof Libs.AppError &&
          Object.values(Libs.NexusErrorType).includes(error.type as Libs.NexusErrorType)
        ) {
          setError('Something went wrong with nexus. Please try again.');
        } else {
          setError('Failed to restore from file. Please check your file and try again.');
        }
      } else if (typeof error === 'string' && error.toLowerCase().includes('aead')) {
        setError('Invalid password or corrupted file. Please check your password and try again.');
      } else {
        setError('An unexpected error occurred');
      }
      setIsRestoring(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPassword('');
    setError('');
    setIsRestoring(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isFormValid = () => {
    return Boolean(selectedFile && password && !isRestoring);
  };

  const handleKeyDown = Hooks.useEnterSubmit(isFormValid, handleRestore);

  const selectedFileDisplayName = selectedFile ? Libs.formatFileName(selectedFile.name) : 'encryptedfile.pkarr';

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button id="restore-encrypted-file-btn" variant="outline" className="rounded-full w-auto md:flex-none">
          <Libs.FileUp className="mr-2 h-4 w-4" />
          <span>Use encrypted file</span>
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="gap-6 p-8 max-w-full overflow-hidden" hiddenTitle="Restore with encrypted file">
        <Atoms.DialogHeader className="space-y-1.5 pr-6">
          <Atoms.DialogTitle className="text-2xl font-bold leading-8 sm:text-xl sm:leading-7">
            Restore with encrypted file
          </Atoms.DialogTitle>
          <Atoms.DialogDescription className="text-sm leading-5">
            Use your encrypted backup file to restore your account and sign in.
          </Atoms.DialogDescription>
        </Atoms.DialogHeader>

        <Atoms.Container className="gap-6">
          {/* File Upload Section */}
          <Atoms.Container className="space-y-2">
            <Atoms.Label className="text-xs font-medium tracking-widest text-muted-foreground">
              UPLOAD ENCRYPTED FILE
            </Atoms.Label>

            <Atoms.Container
              className="relative border-2 border-dashed border-border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-card/80 transition-colors cursor-pointer flex-row w-full overflow-hidden gap-3"
              onClick={handleFileSelect}
            >
              <span
                className={`flex-1 min-w-0 block truncate font-medium ${
                  selectedFile?.name ? 'text-foreground' : 'text-muted-foreground'
                }`}
                title={selectedFile ? selectedFile.name : undefined}
              >
                {selectedFileDisplayName}
              </span>

              <Atoms.Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileSelect();
                }}
              >
                <Libs.FileText className="h-4 w-4" />
                Select file
              </Atoms.Button>
            </Atoms.Container>

            <input
              id="encrypted-file-input"
              ref={fileInputRef}
              type="file"
              accept=".pkarr"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Select encrypted backup file"
            />
          </Atoms.Container>

          {/* Password Section */}
          <Atoms.Container className="space-y-2">
            <Atoms.Label
              htmlFor="restore-password"
              className="text-xs font-medium tracking-widest text-muted-foreground"
            >
              ENTER PASSWORD
            </Atoms.Label>
            <Atoms.Input
              id="restore-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-14 rounded-md border-dashed border bg-opacity-90 shadow-sm p-4"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isRestoring}
            />
          </Atoms.Container>

          {/* Error Message */}
          {error && (
            <Atoms.Container className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <Atoms.Typography size="sm" className="text-destructive text-xs font-medium">
                {error}
              </Atoms.Typography>
            </Atoms.Container>
          )}
        </Atoms.Container>

        {/* Action Buttons */}
        <Atoms.Container className="gap-4 sm:gap-3 md:flex-row justify-between">
          <DialogClose asChild>
            <Atoms.Button
              variant="outline"
              className="order-2 md:order-0 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
              onClick={handleReset}
              disabled={isRestoring}
            >
              Cancel
            </Atoms.Button>
          </DialogClose>
          <Atoms.Button
            id="encrypted-file-restore-btn"
            className="order-1 flex-1 rounded-full h-10 px-4 py-2.5 md:px-12 md:py-6"
            onClick={handleRestore}
            disabled={!isFormValid()}
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
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
