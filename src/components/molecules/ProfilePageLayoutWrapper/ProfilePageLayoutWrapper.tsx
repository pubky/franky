export interface ProfilePageLayoutWrapperProps {
  children: React.ReactNode;
}

export function ProfilePageLayoutWrapper({ children }: ProfilePageLayoutWrapperProps) {
  return (
    <div className="mx-auto w-full max-w-sm px-6 pt-0 pb-12 sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl xl:px-0">
      {children}
    </div>
  );
}
