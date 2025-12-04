import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { ThreadLine } from './ThreadLine';
import { cn } from '@/libs';
import { POST_THREAD_CONNECTOR_VARIANTS, type PostThreadConnectorVariant } from './PostThreadConnector.constants';

interface PostThreadConnectorProps {
  height: number;
  variant?: PostThreadConnectorVariant;
  'data-testid'?: string;
}

const DEFAULT_HEIGHT = 96; // Default height in pixels (6rem = 96px)

export const PostThreadConnector = ({
  height,
  variant = POST_THREAD_CONNECTOR_VARIANTS.REGULAR,
  'data-testid': dataTestId,
}: PostThreadConnectorProps) => {
  // Use a minimum height to prevent invisible render
  const effectiveHeight = height || DEFAULT_HEIGHT;

  // Dialog reply variant - used in dialog reply input
  if (variant === POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY) {
    return (
      <Atoms.Container
        overrideDefaults
        data-testid={dataTestId}
        data-variant={POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY}
      >
        {/* Vertical line - 35px long from the post card edge to horizontal connector */}
        <Atoms.Container
          className="absolute top-[-13px] -left-3 h-[35px] w-px border-l border-secondary"
          overrideDefaults
        />
        {/* Horizontal connector at avatar level */}
        <Atoms.Container className="absolute top-[22px] -left-3" overrideDefaults>
          <Libs.LineHorizontal />
        </Atoms.Container>
      </Atoms.Container>
    );
  }

  // Last variant - shows rounded corner at the end
  if (variant === POST_THREAD_CONNECTOR_VARIANTS.LAST) {
    return (
      <Atoms.Container
        className="flex h-24 w-3 flex-col items-start"
        style={{ height: `${effectiveHeight}px` }}
        overrideDefaults
        data-testid={dataTestId}
        data-variant={POST_THREAD_CONNECTOR_VARIANTS.LAST}
      >
        <Atoms.Container
          className="relative flex min-h-px w-full min-w-px shrink-0 grow basis-0 flex-col items-start"
          overrideDefaults
        >
          <ThreadLine />
          <Atoms.Container className="relative size-3 shrink-0" overrideDefaults>
            <Libs.RoundedCorner />
          </Atoms.Container>
        </Atoms.Container>
        <Atoms.Container className="min-h-px w-3 min-w-px shrink-0 grow basis-0" overrideDefaults />
      </Atoms.Container>
    );
  }

  // Gap-fix variant - minimal connector
  if (variant === POST_THREAD_CONNECTOR_VARIANTS.GAP_FIX) {
    return (
      <Atoms.Container
        className="flex h-3 w-3 flex-col items-start"
        style={{ height: `${effectiveHeight}px` }}
        overrideDefaults
        data-testid={dataTestId}
        data-variant={POST_THREAD_CONNECTOR_VARIANTS.GAP_FIX}
      >
        <Atoms.Container
          className="relative flex min-h-px w-full min-w-px shrink-0 grow basis-0 flex-col items-start"
          overrideDefaults
        >
          <ThreadLine />
        </Atoms.Container>
      </Atoms.Container>
    );
  }

  // Regular variant (default) - shows rounded corner in the middle
  return (
    <Atoms.Container
      className={cn('flex h-24 w-3 flex-col items-start border-l border-border')}
      style={{ height: `${effectiveHeight}px` }}
      overrideDefaults
      data-testid={dataTestId}
      data-variant={POST_THREAD_CONNECTOR_VARIANTS.REGULAR}
    >
      <Atoms.Container
        className="relative flex min-h-px w-3 min-w-px shrink-0 grow basis-0 flex-col items-start"
        overrideDefaults
      >
        <Atoms.Container className="min-h-px w-full min-w-px shrink-0 grow basis-0" overrideDefaults />
        <Atoms.Container className="relative size-3 shrink-0" overrideDefaults>
          <Libs.RoundedCorner />
        </Atoms.Container>
      </Atoms.Container>
      <Atoms.Container className="min-h-px w-3 min-w-px shrink-0 grow basis-0" overrideDefaults />
    </Atoms.Container>
  );
};
