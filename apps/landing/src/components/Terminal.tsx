"use client";

import React, { useState, useEffect } from 'react';

const Terminal = () => {
  const [copied, setCopied] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  const command = "npx create-vibeflow-app@latest";

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="bg-gray-900 max-w-[600px] mx-auto p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div className="w-3 h-3 bg-green-500 rounded-full" />
      </div>
      <div className="text-sm text-gray-300 font-mono">
        <div className="flex items-center justify-between group">
          <div className="flex items-center">
            <span className="text-gray-500">$</span>
            <span className="ml-2 text-white select-all">{command}</span>
            {showCursor && <span className="text-gray-500 ml-1">|</span>}
          </div>
          <button 
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all duration-200 cursor-pointer ml-4 px-2 py-1 rounded border border-gray-600 hover:border-gray-500"
            aria-label="Copy command"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
        {copied && (
          <div className="text-green-400 mt-2 text-xs">
            ✓ Command copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;