import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface AvatarWithFallbackProps {
  avatarUrl?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
  alt?: string;
}

export function AvatarWithFallback({ avatarUrl, name, className, fallbackClassName, alt }: AvatarWithFallbackProps) {
  return (
    <Atoms.Avatar className={className}>
      {avatarUrl ? (
        <Atoms.AvatarImage src={avatarUrl} alt={alt || name} />
      ) : (
        <Atoms.AvatarFallback className={fallbackClassName}>{Libs.extractInitials({ name })}</Atoms.AvatarFallback>
      )}
    </Atoms.Avatar>
  );
}
