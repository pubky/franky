import { cn } from '@/libs';

export const ImageBackground = ({ image, ...props }: { image: string } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...props}
      className={cn('fixed inset-0 bg-cover bg-center bg-no-repeat -z-10', props.className)}
      style={{
        backgroundImage: `url(${image})`,
      }}
    />
  );
};
