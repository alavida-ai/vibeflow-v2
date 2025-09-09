"use client";

import React, { useState, useEffect } from 'react';

const Terminal = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleInstallClick = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  return (
    <div className="bg-gray-900 max-w-[600px] mx-auto p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />
      </div>
      <div className="text-sm text-gray-300 font-mono">
        <div className="flex items-center">
          <span className="text-gray-500">$</span>
          <span className="ml-2">npm</span>
        </div>
        <div className="flex items-center">
          <span className="text-white">install vibeflow</span>
          {showCursor && <span className="text-gray-500 ml-1">|</span>}
        </div>
        {isTyping && (
          <div className="text-green-400 mt-2">
            <div>✓ Installing vibeflow...</div>
            <div>✓ Setting up dependencies...</div>
            <div>✓ Ready to build!</div>
          </div>
        )}
        <button 
          onClick={handleInstallClick}
          className="text-gray-500 ml-2 hover:text-gray-300 transition-colors cursor-pointer"
          aria-label="Run install command"
        >
          ⏎
        </button>
      </div>
    </div>
  );
};

export default Terminal;