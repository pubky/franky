import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = 'w-auto h-auto', width = 78, height = 24 }: LogoProps) {
  return (
    <div className="h-9 flex items-center">
      <Image src="/pubky-logo.svg" alt="Pubky" width={width} height={height} className={className} />
    </div>
  );
}
