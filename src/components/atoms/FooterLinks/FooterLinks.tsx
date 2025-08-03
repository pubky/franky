import { cn } from '@/libs';
import { Typography } from '@/components';

export function FooterLinks({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <Typography
      className={cn('text-muted-foreground opacity-80 font-normal text-sm leading-none', className)}
      {...props}
    >
      {children}
    </Typography>
  );
}
