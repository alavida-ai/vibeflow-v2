'use client';
import {
  FileCode,
  Globe,
  LineChart,
  Lock,
  Server,
  Terminal,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

import { Diamonds } from '@/components/icons/diamonds';
import Logo from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { EXTERNAL_LINKS } from '@/constants/external-links';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    title: 'Open Source',
    description: '0$ / forever',
    features: [
      {
        name: 'Self-host on your own infrastructure',
        icon: <Server className="size-5" />,
      },
      {
        name: 'Full access to the Scalar CMS core',
        icon: <FileCode className="size-5" />,
      },
      {
        name: 'GitHub community support',
        icon: <FaGithub className="size-5" />,
      },
      {
        name: 'Ideal for developers and internal tools',
        icon: <Terminal className="size-5" />,
      },
    ],
    button: {
      text: 'View on GitHub',
      href: EXTERNAL_LINKS.GITHUB,
      className: 'bg-border hover:bg-border/80 text-foreground',
    },
  },
  {
    title: 'Cloud',
    description: 'From $29 / month',
    features: [
      {
        name: 'Fully managed infrastructure',
        icon: <Server className="size-5" />,
      },
      {
        name: 'Realtime collaboration & autosave',
        icon: <Users className="size-5" />,
      },
      {
        name: 'Role-based access & team permissions',
        icon: <Lock className="size-5" />,
      },
      {
        name: 'Built-in CDN for media delivery',
        icon: <Globe className="size-5" />,
      },
      {
        name: 'Email support & usage analytics',
        icon: <LineChart className="size-5" />,
      },
    ],
    button: {
      text: 'Start Free Trial',
      href: '/signup',
    },
  },
];

const Footer = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by using a consistent theme class until mounted
  const themeClass =
    mounted && theme === 'dark'
      ? 'light bg-foreground text-background [&_*]:border-border/30'
      : 'dark bg-background text-foreground';

  // Logo should be inverted when footer has light background (dark theme)
  // and not inverted when footer has dark background (light theme)
  const logoWordmarkClass = cn(
    'w-[min(100%,400px)] translate-y-1/4 md:translate-y-1/3 md:h-32 md:w-full lg:h-73 opacity-10',
    mounted && theme === 'dark' ? 'invert-0' : 'invert',
  );

  return (
    <footer className={cn('overflow-hidden', themeClass)}>
      {/* Social and Status Section */}
      <div className="flex flex-col justify-between border-x border-b md:flex-row">
        <div className="bordered-div-padding flex items-center space-x-3">
          <Link
            href={EXTERNAL_LINKS.DISCORD}
            className="px-3 py-2.5 transition-opacity hover:opacity-80"
            target="_blank"
            aria-label="Discord"
          >
            <FaDiscord className="size-5" />
          </Link>
          <Link
            href={EXTERNAL_LINKS.GITHUB}
            className="px-3 py-2.5 transition-opacity hover:opacity-80"
            target="_blank"
            aria-label="GitHub"
          >
            <FaGithub className="size-5" />
          </Link>
          <Link
            href={EXTERNAL_LINKS.TWITTER}
            className="px-3 py-2.5 transition-opacity hover:opacity-80"
            target="_blank"
            aria-label="Twitter"
          >
            <FaXTwitter className="size-5" />
          </Link>
        </div>
        <div className="bordered-div-padding flex items-center border-t text-[#00A656] md:border-t-0">
          <span
            className={cn(
              'me-3 h-2 w-2 animate-pulse rounded-full bg-[#00A656]',
            )}
          ></span>
          <span className="font-medium">Shipping in progress</span>
        </div>
      </div>

      {/* Legal Links Section */}
      <div className="bordered-div-padding text-muted-foreground flex items-center justify-center space-x-6 border-x border-b text-sm">
        <Link
          href="/privacy-policy"
          className="hover:text-foreground transition-opacity hover:opacity-80"
        >
          Privacy Policy
        </Link>
        <span className="text-border">•</span>
        <Link
          href="/terms-of-service"
          className="hover:text-foreground transition-opacity hover:opacity-80"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
