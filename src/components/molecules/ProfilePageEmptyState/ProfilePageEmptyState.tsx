'use client';

import Image from 'next/image';
import { LucideIcon } from 'lucide-react';
import * as Atoms from '@/atoms';

interface ProfilePageEmptyStateProps {
  imageSrc: string;
  imageAlt: string;
  icon: LucideIcon;
  title: string;
  subtitle: string | React.ReactNode;
  children?: React.ReactNode;
}

export function ProfilePageEmptyState({
  imageSrc,
  imageAlt,
  icon: Icon,
  title,
  subtitle,
  children,
}: ProfilePageEmptyStateProps): React.ReactElement {
  return (
    <Atoms.Container className="relative flex flex-col items-center justify-center gap-6 p-6">
      {/* Background image */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="pointer-events-none object-contain object-center"
        aria-hidden="true"
      />

      {/* Icon */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex shrink-0 items-center justify-center rounded-full bg-brand/16 p-6"
      >
        <Icon className="size-12 text-brand" strokeWidth={1.5} />
      </Atoms.Container>

      {/* Title and subtitle */}
      <Atoms.Container
        overrideDefaults={true}
        className="relative z-10 flex w-full flex-col items-center justify-center"
      >
        <Atoms.Typography as="h3" size="lg" className="pb-6 text-center leading-8">
          {title}
        </Atoms.Typography>
        <Atoms.Typography as="p" className="text-center text-base leading-6 font-medium text-secondary-foreground">
          {subtitle}
        </Atoms.Typography>
      </Atoms.Container>

      {/* Optional children content */}
      {children && (
        <Atoms.Container className="relative z-10 flex items-center justify-center">{children}</Atoms.Container>
      )}
    </Atoms.Container>
  );
}
