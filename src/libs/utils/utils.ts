import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const SocialLinks = {
  EMAIL: 'mailto:' + process.env.NEXT_PUBLIC_EMAIL_URL || 'hello@pubky.com',
  GITHUB: process.env.NEXT_PUBLIC_GITHUB_URL || 'https://github.com/pubky',
  TWITTER: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://x.com/getpubky',
  TELEGRAM: process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/pubky',
};

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
