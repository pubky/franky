import Link from 'next/link';

interface LogoProps {
  className?: string;
  textColor?: 'white' | 'default';
}

export function Logo({ className = '', textColor = 'default' }: LogoProps) {
  const colorClass = textColor === 'white' ? 'text-white' : 'text-foreground';

  return (
    <Link href="/" className={`font-bold text-2xl hover:text-green-400 transition-colors ${colorClass} ${className}`}>
      Franky
    </Link>
  );
}
