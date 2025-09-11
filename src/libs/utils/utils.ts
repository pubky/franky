import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

type ExtractInitialsProps = { name: string; maxLength: number };
type CopyToClipboardProps = { text: string };
type FormatPublicKeyProps = { key: string; length: number };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPublicKey({ key, length = 12 }: FormatPublicKeyProps) {
  if (!key) return '';
  if (key.length <= length) return key;
  const prefix = key.slice(0, length / 2);
  const suffix = key.slice(-length / 2);
  return `${prefix}...${suffix}`;
}

export async function copyToClipboard({ text }: CopyToClipboardProps) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported');
  }

  await navigator.clipboard.writeText(text);
}

export function extractInitials({ name, maxLength = 2 }: ExtractInitialsProps) {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
}
