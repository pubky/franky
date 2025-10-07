import { useLiveQuery } from 'dexie-react-hooks';
import * as Core from '@/core';
import * as Atoms from '@/atoms';

export function UserCardTags({ pubky }: { pubky: Core.Pubky }) {
  const userTagsCollection = useLiveQuery(() => Core.db.user_tags.get(pubky), [pubky]);

  if (!userTagsCollection || !userTagsCollection.tags || userTagsCollection.tags.length === 0) {
    return null;
  }

  const tags = userTagsCollection.tags;

  return (
    <div className="flex gap-1">
      {tags.slice(0, 3).map((tag: Core.NexusTag, index: number) => (
        <Atoms.Badge
          key={index}
          variant="outline"
          className={`text-xs bg-yellow-100 text-yellow-800 border-yellow-200`}
        >
          {tag.label}
        </Atoms.Badge>
      ))}
      {tags.length > 3 && (
        <Atoms.Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          +{tags.length - 3}
        </Atoms.Badge>
      )}
    </div>
  );
}
