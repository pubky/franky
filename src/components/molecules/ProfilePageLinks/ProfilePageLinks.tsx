'use client';

import * as Atoms from '@/atoms';
import { LucideProps } from 'lucide-react';

export interface ProfilePageSidebarLink {
  icon: React.ComponentType<LucideProps>;
  url: string;
  label: string;
}

export interface ProfilePageLinksProps {
  links?: ProfilePageSidebarLink[];
}

export function ProfilePageLinks({ links }: ProfilePageLinksProps) {
  return (
    <Atoms.Container overrideDefaults={true} className="flex flex-col">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Links
      </Atoms.Heading>

      <Atoms.Container overrideDefaults={true} className="flex flex-col">
        {links?.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 py-1"
            >
              <Icon size={16} className="shrink-0 text-foreground" />
              <Atoms.Typography as="span" className="flex-1 text-base font-medium text-secondary-foreground">
                {link.label}
              </Atoms.Typography>
            </a>
          );
        })}
        {links?.length === 0 && (
          <Atoms.Container className="mt-2 flex flex-col">
            <Atoms.Typography as="span" className="text-base font-medium text-muted-foreground">
              No links added yet.
            </Atoms.Typography>
          </Atoms.Container>
        )}
      </Atoms.Container>
    </Atoms.Container>
  );
}
