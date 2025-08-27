'use client';

import * as Atoms from '@/components/atoms';
import * as Molecules from '@/components/molecules';
import * as Libs from '@/libs';
import { useState } from 'react';
import { z } from 'zod';

const labelSchema = z
  .string()
  .trim()
  .min(1, 'Label is required')
  .max(30, 'Max 30 characters')
  .regex(/^[a-zA-Z0-9]+$/, 'Alphanumeric only');

const urlSchema = z.string().trim().url('Invalid URL');

export function DialogAddLink({ onSave }: { onSave: (label: string, url: string) => void }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [labelError, setLabelError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateLabel = (value: string) => {
    const result = labelSchema.safeParse(value);
    setLabelError(result.success ? null : (result.error.issues[0]?.message ?? 'Invalid label'));
  };

  const validateUrl = (value: string) => {
    const result = urlSchema.safeParse(value);
    setUrlError(result.success ? null : (result.error.issues[0]?.message ?? 'Invalid URL'));
  };

  const handleSave = () => {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();

    const isLabelValid = labelSchema.safeParse(trimmedLabel).success;
    const isUrlValid = urlSchema.safeParse(trimmedUrl).success;

    if (!isLabelValid) {
      validateLabel(trimmedLabel);
    }
    if (!isUrlValid) {
      validateUrl(trimmedUrl);
    }
    if (!isLabelValid || !isUrlValid) return;

    onSave(trimmedLabel, trimmedUrl);
    setLabel('');
    setUrl('');
    setLabelError(null);
    setUrlError(null);
  };

  const isValid =
    !labelError &&
    !urlError &&
    label.trim().length > 0 &&
    url.trim().length > 0 &&
    labelSchema.safeParse(label.trim()).success &&
    urlSchema.safeParse(url.trim()).success;

  return (
    <Atoms.Dialog>
      <Atoms.DialogTrigger asChild>
        <Atoms.Button variant="secondary" size="sm" className="w-fit rounded-full">
          <Libs.Link className="h-4 w-4" />
          <span>Add link</span>
        </Atoms.Button>
      </Atoms.DialogTrigger>
      <Atoms.DialogContent className="p-8 rounded-xl border bg-popover max-w-xl sm:p-6 sm:rounded-lg">
        <Atoms.DialogHeader className="pr-6">
          <Atoms.DialogTitle className="text-2xl font-bold text-foreground sm:text-xl">Add link</Atoms.DialogTitle>
        </Atoms.DialogHeader>

        <Atoms.Container className="gap-6">
          <Atoms.Container className="gap-2">
            <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground">LABEL</Atoms.Label>
            <Molecules.InputField
              placeholder="Twitter"
              variant="dashed"
              value={label}
              onChange={(e) => {
                const value = e.target.value;
                setLabel(value);
                validateLabel(value);
              }}
              size="lg"
              maxLength={30}
              status={labelError ? 'error' : 'default'}
              message={labelError ?? undefined}
              messageType={labelError ? 'error' : 'default'}
            />
          </Atoms.Container>

          <Atoms.Container className="gap-2">
            <Atoms.Label className="text-xs font-medium tracking-wide text-muted-foreground">URL</Atoms.Label>
            <Molecules.InputField
              placeholder="https://twitter.com/satoshi"
              variant="dashed"
              value={url}
              onChange={(e) => {
                const value = e.target.value;
                setUrl(value);
                validateUrl(value);
              }}
              size="lg"
              icon={<Libs.Clipboard className="h-4 w-4" />}
              iconPosition="right"
              onClickIcon={async () => {
                try {
                  await Libs.copyToClipboard(url);
                } catch {}
              }}
              status={urlError ? 'error' : 'default'}
              message={urlError ?? undefined}
              messageType={urlError ? 'error' : 'default'}
            />
          </Atoms.Container>
        </Atoms.Container>

        <Atoms.DialogFooter className="flex-row gap-4">
          <Atoms.DialogClose asChild>
            <Atoms.Button
              variant="outline"
              size="lg"
              className="rounded-full border border-border bg-background sm:size-default flex-1"
            >
              Cancel
            </Atoms.Button>
          </Atoms.DialogClose>
          <Atoms.DialogClose asChild>
            <Atoms.Button
              size="lg"
              className="rounded-full text-brand border-brand sm:size-default flex-1"
              onClick={handleSave}
              disabled={!isValid}
            >
              Save link
            </Atoms.Button>
          </Atoms.DialogClose>
        </Atoms.DialogFooter>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
