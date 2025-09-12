import React from 'react';
import { dashboardData } from '@/lib/openData';

export default function LiveMetricsDashboard() {
  return (
    <section className="w-full space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">📊 Campaign Progress • Week {dashboardData.week} of {dashboardData.totalWeeks}</h2>
        <span className="text-sm text-zinc-400">Manual update</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardData.cards.map((card) => (
          <div key={card.title} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{card.title}</h3>
              <span className={`text-xs ${card.delta.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {card.delta}
              </span>
            </div>
            <p className="mt-2 text-zinc-200">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="pt-2">
        <div className="flex items-center justify-between text-sm text-zinc-300">
          <span>Overall Progress</span>
          <span>{dashboardData.overallProgressPercent}% Complete</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded bg-zinc-800">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${dashboardData.overallProgressPercent}%` }} />
        </div>
      </div>
    </section>
  );
}


