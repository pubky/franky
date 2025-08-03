import Image from 'next/image';

import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

interface LogoProps {
  width?: number;
  height?: number;
}

export function Logo({ width = 109, height = 36, ...props }: LogoProps & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <Atoms.Link
      href="/"
      className={Libs.cn(`flex items-center min-w-[${width}px] min-h-[${height}px] -mt-1`, props.className)}
    >
      <Image
        src="/pubky-logo.svg"
        alt="Pubky"
        className={`w-[${width}px] h-[${height}px]`}
        width={width}
        height={height}
      />
    </Atoms.Link>
  );
}
