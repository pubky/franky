'use client';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface KeyDisplayProps {
  text: string;
  className?: string;
  dotCount?: number;
  isSecret?: boolean;
}

export function KeyDisplay({ text, className = '', dotCount = 40, isSecret = false }: KeyDisplayProps) {
  const [isVisible, setIsVisible] = useState(!isSecret);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const dots = '•'.repeat(dotCount);

  return (
    <div className={`relative border rounded-lg bg-muted/30 p-4 ${isSecret ? 'pr-12' : ''} ${className}`}>
      <p className="text-2xl text-brand opacity-80 break-all font-mono">{isVisible ? text : dots}</p>
      {isSecret && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 h-8 w-8 hover:bg-background/80"
          onClick={toggleVisibility}
          title={isVisible ? 'Hide secret key' : 'Show secret key'}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </Button>
      )}
    </div>
  );
}
