import Image from 'next/image';

import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

interface LogoProps {
  width?: number;
  height?: number;
  noLink?: boolean;
}

export function Logo({
  width = 109,
  height = 36,
  noLink = false,
  ...props
}: LogoProps & React.HTMLAttributes<HTMLAnchorElement>) {
  return !noLink ? (
    <Atoms.Link
      href="/"
      className={Libs.cn(`flex items-center min-w-[${width}px] min-h-[${height}px]`, props.className)}
    >
      <LogoImage width={width} height={height} />
    </Atoms.Link>
  ) : (
    <LogoImage width={width} height={height} />
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
