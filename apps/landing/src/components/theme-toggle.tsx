'use client';

import { motion as m, type Variants } from 'motion/react';
import { useTheme } from 'next-themes';
import { useRef } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const iconVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotate: -90,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotate: 90,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const raysVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      transition: {
        staggerChildren: 0.02,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
      },
    },
  };

  const rayVariant: Variants = {
    hidden: {
      pathLength: 0,
      opacity: 0,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const toggleTheme = () => {
    if (document.startViewTransition) {
      // Remove page-transition class to avoid conflicts
      document.documentElement.classList.remove('page-transition');
      // Add theme-transition class
      document.documentElement.classList.add('theme-transition');

      document
        .startViewTransition(() => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
        })
        .finished.then(() => {
          // Clean up theme-transition class after all animations complete
          setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
          }, 50);
        })
        .catch(() => {
          // Fallback cleanup in case of error
          document.documentElement.classList.remove('theme-transition');
        });
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  return (
    <Button
      aria-label="Toggle theme"
      variant="ghost"
      onClick={toggleTheme}
      data-theme-toggle
      ref={buttonRef}
      className={cn('flex rounded-md px-4 py-0 lg:px-2', className)}
      size="sm"
    >
      <div className="relative size-4">
        {/* Sun Icon */}
        <m.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute inset-0"
          variants={iconVariants}
          initial="hidden"
          animate={theme === 'light' ? 'visible' : 'hidden'}
        >
          <circle cx="12" cy="12" r="4" />
          <m.g variants={raysVariants}>
            <m.path variants={rayVariant} d="M12 2v2" />
            <m.path variants={rayVariant} d="M12 20v2" />
            <m.path variants={rayVariant} d="M4.93 4.93l1.41 1.41" />
            <m.path variants={rayVariant} d="M17.66 17.66l1.41 1.41" />
            <m.path variants={rayVariant} d="M2 12h2" />
            <m.path variants={rayVariant} d="M20 12h2" />
            <m.path variants={rayVariant} d="M6.34 17.66l-1.41 1.41" />
            <m.path variants={rayVariant} d="M19.07 4.93l-1.41 1.41" />
          </m.g>
        </m.svg>

        {/* Moon Icon */}
        <m.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute inset-0"
          variants={iconVariants}
          initial="hidden"
          animate={theme === 'dark' ? 'visible' : 'hidden'}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </m.svg>
      </div>
    </Button>
  );
}
