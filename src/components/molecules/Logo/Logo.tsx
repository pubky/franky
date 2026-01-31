'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

interface LogoProps {
  width?: number;
  height?: number;
  noLink?: boolean;
}

// 🥚 Easter egg messages - click the logo 7 times to discover!
const EASTER_EGG_MESSAGES = [
  '🩷 Pink is the new green! 🩷',
  '✨ You found the secret! Pubky loves you! ✨',
  '🧌 Franky was here... beep boop! 🤖',
  '🚀 To the moon! (but make it decentralized)',
  '💾 Your data belongs to YOU! 💪',
];

export function Logo({
  width = 109,
  height = 36,
  noLink = false,
  ...props
}: LogoProps & React.HTMLAttributes<HTMLAnchorElement>) {
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEasterEgg = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 7) {
      const message = EASTER_EGG_MESSAGES[Math.floor(Math.random() * EASTER_EGG_MESSAGES.length)];
      console.log('%c' + message, 'font-size: 24px; color: #FF69B4; font-weight: bold;');
      setClickCount(0);
    } else {
      // Reset counter after 2 seconds of no clicks
      timeoutRef.current = setTimeout(() => setClickCount(0), 2000);
    }
  }, [clickCount]);

  return !noLink ? (
    <Atoms.Link
      href="/home"
      className={Libs.cn(`flex items-center min-w-[${width}px] min-h-[${height}px]`, props.className)}
      onClick={handleEasterEgg}
    >
      <LogoImage width={width} height={height} />
    </Atoms.Link>
  ) : (
    <div onClick={handleEasterEgg} style={{ cursor: 'pointer' }}>
      <LogoImage width={width} height={height} />
    </div>
  );
}

const LogoImage = ({ width, height, className }: { width: number; height: number; className?: string }) => {
  return (
    <Image
      src="/pubky-logo.svg"
      alt="Pubky"
      className={Libs.cn(`w-[${width}px] h-[${height}px] -mt-1`, className)}
      width={width}
      height={height}
    />
  );
};
