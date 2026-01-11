import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { SearchTagSectionProps } from './SearchTagSection.types';

/**
 * SearchTagSection
 *
 * Displays a section of tags with a title.
 * Used in search suggestions to show autocomplete tag results or hot tags.
 */
export function SearchTagSection({ title, tags, onTagClick }: SearchTagSectionProps) {
  if (tags.length === 0) return null;

  return (
    <Atoms.Container overrideDefaults className="flex flex-col gap-2">
      <Atoms.Typography size="xs" className="tracking-widest text-muted-foreground uppercase">
        {title}
      </Atoms.Typography>
      <Atoms.Container overrideDefaults className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Molecules.PostTag key={tag.name} label={tag.name} onClick={() => onTagClick(tag.name)} />
        ))}
      </Atoms.Container>
    </Atoms.Container>
  );
}
