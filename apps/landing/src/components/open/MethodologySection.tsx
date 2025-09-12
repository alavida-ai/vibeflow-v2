"use client";
import { useState } from 'react';
import { methodology } from '@/lib/openData';

export default function MethodologySection() {
  const [open, setOpen] = useState(false);
  return (
    <section className="w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">❓ Why Build in the Open?</h2>
          <span className="text-sm text-zinc-400">{open ? 'Collapse' : 'Expand'}</span>
        </div>
        {open && (
          <div className="mt-3 text-sm text-zinc-200 space-y-2">
            <p>{methodology.intro}</p>
            <ul className="list-disc pl-5 space-y-1">
              {methodology.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p>{methodology.outro}</p>
          </div>
        )}
      </button>
    </section>
  );
}


