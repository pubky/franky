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

const customCases = [
  { name: 'bitcoin', color: '#FF9900' },
  { name: 'synonym', color: '#FF6600' },
  { name: 'bitkit', color: '#FF4400' },
  { name: 'pubky', color: '#C8FF00' },
  { name: 'blocktank', color: '#FFAE00' },
  { name: 'tether', color: '#26A17B' },
];

/**
 * Generates a consistent color for a given string
 * @param str - The string to generate a color for
 * @returns Hex color string
 */
export function generateRandomColor(str: string): string {
  const lowerStr = str.toLowerCase();

  // Check for cases
  for (const special of customCases) {
    if (lowerStr === special.name) {
      return special.color;
    }
  }

  // Generate a hash value from the input string
  const hash = Array.from(str).reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash);
  }, 0);

  // Ensure the hash is non-negative
  const positiveHash = Math.abs(hash);

  // Convert hash to a 2-character hex value
  const randomByte = positiveHash & 0xff; // extract the lowest 8 bits
  const randomHex = randomByte.toString(16).padStart(2, '0');

  // Pick a random pattern
  const patterns = [
    `FF00${randomHex}`,
    `FF${randomHex}00`,
    `${randomHex}FF00`,
    `${randomHex}00FF`,
    `00${randomHex}FF`,
    `00FF${randomHex}`,
  ];

  // Select pattern based on the hash
  const pattern = patterns[positiveHash % patterns.length];

  return `#${pattern}`;
}

/**
 * Converts a hex color to rgba format
 * @param hex - Hex color string (e.g., '#FF9900')
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number) {
  const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
