"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-16 py-6 max-md:px-8 max-sm:px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl font-semibold text-white flex items-center gap-2 hover:text-gray-200 transition-colors">
          <div>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24L16 8L24 24H8Z" fill="currentColor"></path>
            </svg>
          </div>
          VibeFlow
        </Link>
      </div>
      
      <nav className="flex items-center gap-8 max-sm:hidden" role="navigation" aria-label="Main navigation">
        <a href="#docs" className="text-base text-gray-300 cursor-pointer hover:text-white transition-colors">
          Docs
        </a>
        <a href="#components" className="text-base text-gray-300 cursor-pointer hover:text-white transition-colors">
          Components
        </a>
        <a href="#tools" className="text-base text-gray-300 cursor-pointer hover:text-white transition-colors">
          Tools
        </a>
        <Link href="/roadmap" className="text-base text-gray-300 cursor-pointer hover:text-white transition-colors">
          Roadmap
        </Link>
      </nav>
      
      <div className="flex items-center gap-4">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xl text-gray-300 cursor-pointer hover:text-white transition-colors max-sm:hidden"
          aria-label="GitHub repository"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <button className="bg-white text-black text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
          Build in Open
        </button>
        <button 
          className="text-2xl text-white hidden cursor-pointer max-sm:block"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
      
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black border-t border-gray-800 p-4 sm:hidden">
          <nav className="flex flex-col gap-4" role="navigation" aria-label="Mobile navigation">
            <a href="#docs" className="text-base text-gray-300 hover:text-white transition-colors">
              Docs
            </a>
            <a href="#components" className="text-base text-gray-300 hover:text-white transition-colors">
              Components
            </a>
            <a href="#tools" className="text-base text-gray-300 hover:text-white transition-colors">
              Tools
            </a>
            <Link href="/roadmap" className="text-base text-gray-300 hover:text-white transition-colors">
              Roadmap
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;