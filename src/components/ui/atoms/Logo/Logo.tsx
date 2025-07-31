import Image from 'next/image';
import { Link } from '@/components/ui';
import { cn } from '@/libs';

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 109, height = 36, ...props }: LogoProps & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href="/" className={cn(`flex items-center min-w-[${width}px] min-h-[${height}px]`, props.className)}>
      <Image
        src="/pubky-logo.svg"
        alt="Pubky"
        className={`w-[${width}px] h-[${height}px]`}
        width={width}
        height={height}
      />
    </Link>
  );
}
