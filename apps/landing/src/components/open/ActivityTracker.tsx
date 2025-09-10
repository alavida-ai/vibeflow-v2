"use client";
import { useMemo } from 'react';
import { activityWeeks } from '@/lib/openData';

export default function ActivityTracker() {
  const weeks = useMemo(() => activityWeeks, []);

  const levelToClass: Record<string, string> = {
    none: 'bg-zinc-800',
    medium: 'bg-emerald-600',
    high: 'bg-emerald-400',
  };

  return (
    <section className="w-full space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">📅 Daily Content Activity</h2>
        <div className="text-sm text-zinc-400">Current streak: 4 days • Total posts: 47</div>
      </div>
      <div className="space-y-2">
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-2">
            {week.map((level, j) => (
              <div
                key={`${i}-${j}`}
                title={`Day ${(i * 7) + (j + 1)}: ${level}`}
                className={`h-6 rounded ${levelToClass[level]} transition-transform hover:scale-105`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-3 w-3 rounded bg-emerald-400" /> High (2+ posts)
        <div className="h-3 w-3 rounded bg-emerald-600" /> Medium (1 post)
        <div className="h-3 w-3 rounded bg-zinc-800" /> None
      </div>
    </section>
  );
}


