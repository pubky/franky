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

// Helper function to normalize Radix UI IDs in container HTML for snapshot tests
export const normaliseRadixIds = (container: HTMLElement) => {
  const clonedContainer = container.cloneNode(true) as HTMLElement;
  const elementsWithAriaControls = clonedContainer.querySelectorAll('[aria-controls]');
  elementsWithAriaControls.forEach((el) => {
    const ariaControls = el.getAttribute('aria-controls');
    if (ariaControls && ariaControls.includes('radix-«r')) {
      el.setAttribute('aria-controls', 'radix-«r0»');
    }
  });
  return clonedContainer;
};

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
