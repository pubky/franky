import * as Atoms from '@/atoms';

export const PostDeleted = () => {
  return (
    <Atoms.CardContent className="py-2">
      <Atoms.Typography size="sm" className="text-center font-normal text-muted-foreground">
        This post has been deleted by its author.
      </Atoms.Typography>
    </Atoms.CardContent>
  );
};
