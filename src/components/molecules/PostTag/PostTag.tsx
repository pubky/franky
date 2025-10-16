import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface PostTagProps {
  /** Tag label text */
  label: string;
  /** Number of posts with this tag (optional) */
  count?: number;
  /** Show the close/remove button */
  showClose?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Callback when tag is clicked */
  onClick?: () => void;
  /** Callback when close button is clicked */
  onClose?: (e: React.MouseEvent) => void;
  /** Custom color (hex) for the tag - if not provided, generates from label */
  color?: string;
  /** Additional className */
  className?: string;
}

export function PostTag({
  label,
  count,
  showClose = false,
  selected = false,
  onClick,
  onClose,
  color,
  className,
}: PostTagProps) {
  const tagColor = color || Libs.generateRandomColor(label);
  const backgroundGradient = `linear-gradient(90deg, ${Libs.hexToRgba('#05050A', 0.7)} 0%, ${Libs.hexToRgba('#05050A', 0.7)} 100%), linear-gradient(90deg, ${tagColor} 0%, ${tagColor} 100%)`;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.(e);
  };

  return (
    <Atoms.Toggle
      pressed={selected}
      onClick={onClick}
      className={Libs.cn(
        'group relative h-8 gap-1 rounded-lg px-3 backdrop-blur-lg',
        'border-0 text-sm font-bold leading-5 text-white',
        'transition-all duration-200',
        // Override Toggle default hover styles - keep text white
        'hover:bg-transparent hover:text-white',
        // Selected state - add border
        'data-[state=on]:border data-[state=on]:border-solid data-[state=on]:bg-transparent data-[state=on]:text-white',
        className,
      )}
      style={{
        backgroundImage: backgroundGradient,
        boxShadow: selected ? `inset 0 0 0 1px ${tagColor}` : undefined,
      }}
      aria-label={count !== undefined ? `${label} tag (${count} posts)` : `${label} tag`}
    >
      {/* Tag content */}
      <span className="flex items-center gap-1.5 text-sm leading-5">
        <span className="font-bold">{label}</span>
        {count !== undefined && <span className="font-medium opacity-50">{count}</span>}
      </span>

      {/* Close button */}
      {showClose && (
        <span
          onClick={handleClose}
          className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded opacity-70 transition-opacity hover:opacity-100"
          aria-label={`Remove ${label} tag`}
          role="button"
        >
          <Libs.X className="size-3" strokeWidth={2} />
        </span>
      )}

      {/* Hover shadow overlay - exactly as Figma */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          boxShadow: `inset 0px 0px 8px 0px ${tagColor}`,
        }}
        aria-hidden="true"
      />

      {/* Selected border overlay */}
      {selected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-lg border border-solid"
          style={{ borderColor: tagColor }}
          aria-hidden="true"
        />
      )}
    </Atoms.Toggle>
  );
}
