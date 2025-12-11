import { cn } from '@/libs';
import { Typography } from '@/components';

export function FooterLinks({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>): React.ReactElement {
  return (
    <Typography
      className={cn('leading-light text-sm font-medium text-muted-foreground opacity-80', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}
