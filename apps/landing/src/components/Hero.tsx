import React from 'react';
import Terminal from './Terminal';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center px-16 py-[120px] max-md:px-8 max-md:py-20 max-sm:px-4 max-sm:py-[60px]">
      <div className="text-center max-w-[800px]">
        <h1 className="text-[56px] font-bold leading-[64px] mb-6 max-md:text-5xl max-md:leading-[56px] max-sm:text-4xl max-sm:leading-[44px]">
          The Agentic Framework for Marketing
        </h1>
        <p className="text-xl text-muted-foreground leading-7 mb-12 max-md:text-lg max-md:leading-[26px] max-sm:text-base max-sm:leading-6">
          Used by technical founders, and marketers to build scalable media
          infrastructure with composable workflows and owned distribution.
        </p>
        <div className="flex items-center justify-center gap-4 mb-16 max-sm:flex-col max-sm:gap-3">
          <Button variant="default" className="hover:cursor-pointer">
            Get Started
          </Button>
          <Button variant="outline" className="hover:cursor-pointer">
            Learn VibeFlow
          </Button>
        </div>
        <Terminal />
      </div>
    </section>
  );
};

export default Hero;