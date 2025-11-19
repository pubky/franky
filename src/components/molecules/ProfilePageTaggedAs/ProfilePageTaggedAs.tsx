'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfilePageTaggedAsProps {
  tags?: Array<{ name: string; count?: number }>;
}

export const DEFAULT_TAGS = [
  { name: 'satoshi', count: 36 },
  { name: 'bitcoin', count: 21 },
  { name: 'og', count: 5 },
];

export function ProfilePageTaggedAs({ tags = DEFAULT_TAGS }: ProfilePageTaggedAsProps) {
  return (
    <Atoms.Container overrideDefaults={true} className="flex flex-col gap-2">
      <Atoms.Heading level={2} size="lg" className="font-light text-muted-foreground">
        Tagged as
      </Atoms.Heading>

      <Atoms.Container overrideDefaults={true} className="flex flex-col gap-2">
        {tags.map((tag, index) => (
          <Atoms.Container key={tag.name} overrideDefaults={true} className="flex items-center gap-2">
            <Atoms.Tag name={tag.name} count={tag.count} data-testid={`tag-${index}`} />
            <Atoms.Button variant="secondary" size="icon">
              <Libs.Search size={16} className="text-secondary-foreground" />
            </Atoms.Button>
          </Atoms.Container>
        ))}
      </Atoms.Container>

      <Atoms.Button variant="outline" size="sm" className="border border-border bg-foreground/5">
        <Libs.Tag size={16} className="text-foreground" />
        <Atoms.Typography as="span" className="text-sm font-bold">
          Add Tag
        </Atoms.Typography>
      </Atoms.Button>
    </Atoms.Container>
  );
}
