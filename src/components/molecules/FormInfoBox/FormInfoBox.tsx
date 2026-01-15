import * as Atoms from '@/atoms';
import type { FormInfoBoxProps } from './FormInfoBox.types';

export function FormInfoBox({ children }: FormInfoBoxProps) {
  return (
    <Atoms.Container className="gap-6 rounded-lg bg-muted p-4">
      <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
        {children}
      </Atoms.Typography>
    </Atoms.Container>
  );
}
