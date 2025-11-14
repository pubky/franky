import * as Atoms from '@/atoms';

interface PostThreadSpacerProps {
  'data-testid'?: string;
}

export const PostThreadSpacer = ({ 'data-testid': dataTestId }: PostThreadSpacerProps) => {
  return (
    <Atoms.Container overrideDefaults className="flex h-4" data-testid={dataTestId}>
      <Atoms.Container overrideDefaults className="w-3 border-l border-border" />
      <Atoms.Container overrideDefaults className="flex-1" />
    </Atoms.Container>
  );
};
