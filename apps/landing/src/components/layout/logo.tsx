import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

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
  return (
    <Link href={href} className={cn('flex items-center gap-2.5', className)}>
        <div className="flex flex-row items-center gap-2">
            <Image src="/Alavida.png" alt="VibeFlow" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-800">/</span>
            <span className="text-2xl font-bold">VibeFlow</span>
        </div>
    </Link>
  );
}
