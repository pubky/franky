import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export interface HumanHeaderProps {
  preTitle: string;
  highlightedTitle: string;
  subtitle: string;
}

export const HumanHeader = ({ preTitle, highlightedTitle, subtitle }: HumanHeaderProps) => {
  return (
    <Atoms.PageHeader className="gap-2 lg:gap-3" data-testid="human-header">
      <Molecules.PageTitle size="large" className="leading-none font-semibold tracking-tight">
        {preTitle} <span className="text-brand">{highlightedTitle}</span>
      </Molecules.PageTitle>
      <Atoms.PageSubtitle className="max-w-3xl text-muted-foreground">{subtitle}</Atoms.PageSubtitle>
    </Atoms.PageHeader>
  );
};
