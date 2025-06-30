'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  copiedText?: string;
  normalText?: string;
}

export function CopyButton({
  text,
  variant = 'secondary',
  size = 'sm',
  className = '',
  children,
  copiedText = 'Copied to clipboard',
  normalText = 'Copy to clipboard',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`cursor-pointer w-46 rounded-full transition-colors ${copied ? 'border-green-300 text-green-500' : ''} ${className}`}
      onClick={handleCopy}
    >
      {children ? (
        children
      ) : copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          {copiedText}
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          {normalText}
        </>
      )}
    </Button>
  );
}
