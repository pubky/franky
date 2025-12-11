import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { POST_THREAD_CONNECTOR_VARIANTS, DEFAULT_HEIGHT } from './PostThreadConnector.constants';
import type { PostThreadConnectorVariant } from './PostThreadConnector.types';

interface PostThreadConnectorProps {
  height?: number;
  variant?: PostThreadConnectorVariant;
  'data-testid'?: string;
}

/**
 * Encapsulates the vertical thread line functionality
 * Used as a building block for thread connectors
 */
const ThreadLine = (): React.ReactElement => {
  return (
    <Atoms.Container
      className="min-h-px w-full min-w-px shrink-0 grow basis-0 border-l border-border"
      overrideDefaults
    />
  );
};

// Base container props shared by height-based variants
const getBaseContainerProps = (
  effectiveHeight: number,
  variant: PostThreadConnectorVariant,
  dataTestId?: string,
): {
  className: string;
  style: React.CSSProperties;
  overrideDefaults: true;
  'data-testid': string | undefined;
  'data-variant': PostThreadConnectorVariant;
} => ({
  className: 'flex w-3 flex-col items-start',
  style: { height: `${effectiveHeight}px` } as React.CSSProperties,
  overrideDefaults: true as const,
  'data-testid': dataTestId,
  'data-variant': variant,
});

// Common inner container structure
const InnerContainer = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement => (
  <Atoms.Container
    className={Libs.cn('relative flex min-h-px w-full min-w-px shrink-0 grow basis-0 flex-col items-start', className)}
    overrideDefaults
  >
    {children}
  </Atoms.Container>
);

// Spacer container
const Spacer = (): React.ReactElement => (
  <Atoms.Container className="min-h-px w-3 min-w-px shrink-0 grow basis-0" overrideDefaults />
);

// Dialog reply variant - completely different structure, doesn't need height
const DialogReplyVariant = ({ dataTestId }: { dataTestId?: string }): React.ReactElement => (
  <Atoms.Container overrideDefaults data-testid={dataTestId} data-variant={POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY}>
    {/* Vertical line - 35px long from the post-card edge to the horizontal connector */}
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

export const PostThreadConnector = ({
  height,
  variant = POST_THREAD_CONNECTOR_VARIANTS.REGULAR,
  'data-testid': dataTestId,
}: PostThreadConnectorProps): React.ReactElement => {
  // Dialog reply is special - doesn't need height calculation
  if (variant === POST_THREAD_CONNECTOR_VARIANTS.DIALOG_REPLY) {
    return <DialogReplyVariant dataTestId={dataTestId} />;
  }

  // Calculate effective height for variants that need it
  const effectiveHeight = height || DEFAULT_HEIGHT;
  const baseProps = getBaseContainerProps(effectiveHeight, variant, dataTestId);

  switch (variant) {
    case POST_THREAD_CONNECTOR_VARIANTS.LAST:
      // Last variant - shows a rounded corner at the end
      return (
        <Atoms.Container {...baseProps}>
          <InnerContainer>
            <ThreadLine />
            <Atoms.Container className="relative size-3 shrink-0" overrideDefaults>
              <Libs.RoundedCorner />
            </Atoms.Container>
          </InnerContainer>
          <Spacer />
        </Atoms.Container>
      );

    case POST_THREAD_CONNECTOR_VARIANTS.REGULAR:
    default:
      // Regular variant (default) - shows a rounded corner in the middle
      return (
        <Atoms.Container {...baseProps} className={Libs.cn(baseProps.className, 'border-l border-border')}>
          <InnerContainer className="min-w-3">
            <Atoms.Container className="min-h-px w-full min-w-px shrink-0 grow basis-0" overrideDefaults />
            <Atoms.Container className="relative size-3 shrink-0" overrideDefaults>
              <Libs.RoundedCorner />
            </Atoms.Container>
          </InnerContainer>
          <Spacer />
        </Atoms.Container>
      );
  }
};
