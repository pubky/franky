import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow } from 'date-fns';

type ExtractInitialsProps = { name: string; maxLength?: number };
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
  if (typeof navigator === 'undefined') {
    throw new Error('Clipboard API not supported');
  }

  let clipboardError: Error | null = null;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      clipboardError = error as Error;
    }
  }

  if (typeof document === 'undefined') {
    throw clipboardError ?? new Error('Clipboard API not supported');
  }

  const execCommand = typeof document.execCommand === 'function' ? document.execCommand.bind(document) : null;

  if (!execCommand) {
    throw clipboardError ?? new Error('Clipboard API not supported');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();

    const successful = execCommand('copy');

    if (!successful) {
      throw new Error('Fallback copy command was unsuccessful');
    }
  } catch (error) {
    throw clipboardError ?? (error as Error);
  } finally {
    document.body.removeChild(textarea);
  }
}

// Helper function to normalise Radix UI IDs in container HTML for snapshot tests
// This is to ensure that the IDs are consistent across test runs
export const normaliseRadixIds = (container: HTMLElement) => {
  const clonedContainer = container.cloneNode(true) as HTMLElement;
  const normalizedId = 'radix-«r0»';
  const radixIdPattern = /^radix-«r\w+»/;

  // Normalise all radix IDs to a consistent value
  const elementsWithIds = clonedContainer.querySelectorAll('[id]');
  elementsWithIds.forEach((el) => {
    const id = el.getAttribute('id');
    if (id && radixIdPattern.test(id)) {
      el.setAttribute('id', normalizedId);
    }
  });

  // Normalise aria-controls attributes
  const elementsWithAriaControls = clonedContainer.querySelectorAll('[aria-controls]');
  elementsWithAriaControls.forEach((el) => {
    const ariaControls = el.getAttribute('aria-controls');
    if (ariaControls && radixIdPattern.test(ariaControls)) {
      el.setAttribute('aria-controls', normalizedId);
    }
  });

  // Normalise aria-labelledby attributes
  const elementsWithAriaLabelledBy = clonedContainer.querySelectorAll('[aria-labelledby]');
  elementsWithAriaLabelledBy.forEach((el) => {
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy && radixIdPattern.test(ariaLabelledBy)) {
      el.setAttribute('aria-labelledby', normalizedId);
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

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;

  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Formats a filename by truncating it if it exceeds the max length,
 * preserving the file extension
 * @param filename - The filename to format
 * @param maxLength - Maximum length for the filename (default: 18)
 * @returns Formatted filename with ellipsis if truncated
 */
export function formatFileName(filename: string, maxLength = 18): string {
  if (filename.length <= maxLength) {
    return filename;
  }

  const extensionIndex = filename.lastIndexOf('.');
  if (extensionIndex <= 0) {
    return `${filename.slice(0, maxLength - 1)}…`;
  }

  const extension = filename.slice(extensionIndex);
  const baseLength = maxLength - extension.length - 1;

  if (baseLength <= 0) {
    return `${filename.slice(0, maxLength - 1)}…`;
  }

  return `${filename.slice(0, baseLength)}…${extension}`;
}
