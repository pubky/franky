import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Molecules.PageContainer>
      <Atoms.Container>{children}</Atoms.Container>
    </Molecules.PageContainer>
  );
};
