import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a public key by truncating it with ellipsis in the middle
 * @param key - The public key string to format
 * @param length - Total length of the formatted string (default: 12)
 * @returns Formatted string with prefix...suffix format
 */
export function formatPublicKey(key: string, length: number = 12): string {
  if (!key) return '';
  if (key.length <= length) return key;
  const prefix = key.slice(0, length / 2);
  const suffix = key.slice(-length / 2);
  return `${prefix}...${suffix}`;
}

/**
 * Copies text to clipboard
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported');
  }

  await navigator.clipboard.writeText(text);
}

/**
 * Extracts initials from a full name
 * @param name - The full name to extract initials from
 * @param maxLength - Maximum number of initials to return (default: 2)
 * @returns Uppercase initials string
 */
export function extractInitials(name: string, maxLength: number = 2): string {
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
