interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <main>
      <div className="container mx-auto px-6 pt-12 pb-4 max-w-screen-xl">{children}</div>
    </main>
  );
}
