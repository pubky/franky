export interface AvatarEmojiBadgeProps {
  emoji: string;
}

export function AvatarEmojiBadge({ emoji }: AvatarEmojiBadgeProps) {
  return (
    <div className="absolute -bottom-1 -right-1 size-10 lg:size-16 flex items-center justify-center text-3xl lg:text-5xl leading-none">
      {emoji}
    </div>
  );
}
