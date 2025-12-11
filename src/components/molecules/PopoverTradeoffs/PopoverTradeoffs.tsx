import * as Atoms from '@/components/atoms';
import * as Libs from '@/libs';

export function PopoverTradeoffs({ ...props }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <Atoms.Popover hover>
      <Atoms.PopoverTrigger asChild>
        <Atoms.Button variant="ghost" size="icon" className={Libs.cn('rounded-full', props.className)}>
          <Libs.AlertTriangle className="h-4 w-4" data-testid="alert-triangle-icon" />
        </Atoms.Button>
      </Atoms.PopoverTrigger>
      <Atoms.PopoverContent>
        <Atoms.Container className="gap-2 px-3 py-2">
          <Atoms.Container className="gap-2">
            <Atoms.Heading level={4} size="sm" className="text-popover-foreground">
              Be aware of these tradeoffs:
            </Atoms.Heading>
          </Atoms.Container>
          <Atoms.Container className="flex gap-4">
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>Less secure than mobile keychain</li>
              <li>Browser-based key generation</li>
              <li>Suboptimal sign-in experience</li>
            </ul>
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.PopoverContent>
    </Atoms.Popover>
  );
}
