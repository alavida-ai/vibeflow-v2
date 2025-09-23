'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import Slash from '../slash';

interface LogoProps {
  iconClassName?: string;
  wordmarkClassName?: string;
  className?: string;
  href?: string;
}


export default function Logo({
  className,
  href = '/',
}: LogoProps) {
  const { theme } = useTheme();
  
  // Use white logo for dark theme, black logo for light theme
  const logoSrc = theme === 'dark' ? '/alavida-white.png' : '/alavida-black.png';
  
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
        <div className="flex flex-row items-center gap-1">
            <Image src={logoSrc} alt="VibeFlow" width={40} height={40} />
            {/* <span className="text-2xl font-bold text-foreground/50">/</span> */}
            <Slash height={22} width={22} thickness={1.5} className="text-foreground/50"/>
            <span className="text-2xl font-bold">VibeFlow</span>
        </div>
    </Link>
  );
}
