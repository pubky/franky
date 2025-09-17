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

export function formatInviteCode(code: string) {
  if (!code) return '';

  // Remove all non-alphanumeric characters
  const cleaned = code.replace(/[^a-zA-Z0-9]/g, '');

  // Convert to uppercase
  const uppercased = cleaned.toUpperCase();

  // If no valid characters, return empty string
  if (uppercased.length === 0) return '';

  // Handle different lengths
  if (uppercased.length <= 4) {
    return uppercased;
  } else if (uppercased.length <= 8) {
    return `${uppercased.slice(0, 4)}-${uppercased.slice(4)}`;
  } else {
    // Take only first 12 characters for longer codes
    const truncated = uppercased.slice(0, 12);
    return `${truncated.slice(0, 4)}-${truncated.slice(4, 8)}-${truncated.slice(8, 12)}`;
  }
}

export function clearCookies() {
  if (typeof document !== 'undefined') {
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }
}
