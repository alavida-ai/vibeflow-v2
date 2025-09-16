import React from 'react';
import { feedItems } from '@/lib/openData';

export default function ContentPerformanceFeed() {
  return (
    <section className="w-full space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold">📈 Recent Content Performance</h2>
      <div className="space-y-3">
        {feedItems.map((item, idx) => (
          <article key={idx} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-zinc-400">{item.platform} • {item.ago}</div>
            <div className="mt-2 text-sm text-zinc-300">{item.metrics}</div>
            <div className="mt-3 flex gap-2">
              <a href={item.url} className="text-sm rounded border border-zinc-700 px-3 py-1 hover:bg-zinc-800">View Post</a>
              <button className="text-sm rounded border border-zinc-700 px-3 py-1 hover:bg-zinc-800">Screenshot</button>
            </div>
          </article>
        ))}
      </div>
      <div className="flex justify-center">
        <button className="text-sm rounded border border-zinc-700 px-3 py-1 hover:bg-zinc-800">Load More Content</button>
      </div>
    </section>
  );
}


