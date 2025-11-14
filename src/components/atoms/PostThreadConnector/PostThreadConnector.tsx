interface PostThreadConnectorProps {
  height: number;
  variant?: 'regular' | 'last' | 'gap-fix';
  'data-testid'?: string;
}

// Rounded corner SVG component (from Figma design)
const RoundedCorner = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="block size-full"
    preserveAspectRatio="none"
  >
    <path d="M1 0C1 6.07513 5.92487 11 12 11V12C5.37258 12 0 6.62742 0 0H1Z" fill="#303034" />
  </svg>
);

export const PostThreadConnector = ({
  height,
  variant = 'regular',
  'data-testid': dataTestId,
}: PostThreadConnectorProps) => {
  // Use a minimum height to prevent invisible render
  const effectiveHeight = height || 96;

  if (variant === 'last') {
    return (
      <div
        className="flex h-[96px] w-[12px] flex-col items-start"
        style={{ height: `${effectiveHeight}px` }}
        data-testid={dataTestId}
        data-variant="last"
      >
        <div className="relative flex min-h-px w-full min-w-px shrink-0 grow basis-0 flex-col items-start">
          <div className="min-h-px w-full min-w-px shrink-0 grow basis-0 border-l border-border" />
          <div className="relative size-[12px] shrink-0">
            <RoundedCorner />
          </div>
        </div>
        <div className="min-h-px w-[12px] min-w-px shrink-0 grow basis-0" />
      </div>
    );
  }

  if (variant === 'gap-fix') {
    return (
      <div
        className="flex h-[12px] w-[12px] flex-col items-start"
        style={{ height: `${effectiveHeight}px` }}
        data-testid={dataTestId}
        data-variant="gap-fix"
      >
        <div className="relative flex min-h-px w-full min-w-px shrink-0 grow basis-0 flex-col items-start">
          <div className="min-h-px w-full min-w-px shrink-0 grow basis-0 border-l border-border" />
        </div>
      </div>
    );
  }

  // Regular variant (default)
  return (
    <div
      className="flex h-[96px] w-[12px] flex-col items-start border-l border-border"
      style={{ height: `${effectiveHeight}px` }}
      data-testid={dataTestId}
      data-variant="regular"
    >
      <div className="relative flex min-h-px w-[12px] min-w-px shrink-0 grow basis-0 flex-col items-start">
        <div className="min-h-px w-full min-w-px shrink-0 grow basis-0" />
        <div className="relative size-[12px] shrink-0">
          <RoundedCorner />
        </div>
      </div>
      <div className="min-h-px w-[12px] min-w-px shrink-0 grow basis-0" />
    </div>
  );
};
