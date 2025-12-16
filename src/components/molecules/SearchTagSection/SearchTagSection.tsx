import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { SearchTagSectionProps } from './SearchTagSection.types';

export function SearchTagSection({ title, tags, onTagClick }: SearchTagSectionProps) {
  if (tags.length === 0) return null;

  return (
    <Atoms.Container className="gap-2">
      <Atoms.Typography size="xs" className="font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </Atoms.Typography>
      <Atoms.Container className="flex flex-wrap gap-3" overrideDefaults>
        {tags.map((tag) => (
          <Molecules.PostTag
            key={tag.label}
            label={tag.label}
            color={tag.color}
            onClick={() => onTagClick(tag.label)}
          />
        ))}
      </Atoms.Container>
    </Atoms.Container>
  );
}
