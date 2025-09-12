"use client";
import { useState } from 'react';
import { phases } from '@/lib/openData';

const statusBadge: Record<'complete' | 'in_progress' | 'upcoming', string> = {
  complete: '✅ COMPLETE',
  in_progress: '🔄 IN PROGRESS',
  upcoming: '⏳ UPCOMING',
};

export default function StrategyTimeline() {
  const [expanded, setExpanded] = useState<string | null>('p2');
  return (
    <section className="w-full space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold">📋 Campaign Architecture & Strategy</h2>
      <div className="space-y-3">
        {phases.map((phase) => {
          const isOpen = expanded === phase.id;
          const progress = Math.round(
            (phase.items.filter((i) => i.done).length / phase.items.length) * 100
          );
          return (
            <div key={phase.id} className="rounded-lg border border-zinc-800 bg-zinc-900">
              <button
                onClick={() => setExpanded(isOpen ? null : phase.id)}
                className="w-full text-left px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{phase.title}</div>
                  <div className="text-xs text-zinc-400">{statusBadge[phase.status]}</div>
                </div>
                <div className="w-24">
                  <div className="h-1.5 w-full rounded bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <ul className="space-y-1 text-sm">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>{item.done ? '✅' : '□'}</span>
                        <span className={item.done ? 'text-zinc-400 line-through' : ''}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}


