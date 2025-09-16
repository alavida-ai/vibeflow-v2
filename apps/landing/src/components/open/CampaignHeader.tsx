"use client";
import { useState } from 'react';
import { campaignHeaderData } from '@/lib/openData';

export default function CampaignHeader() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      const headerText = `${campaignHeaderData.title}\n${campaignHeaderData.subtitle}\n\nGoal: ${campaignHeaderData.goal}\nTarget: ${campaignHeaderData.target}`;
      await navigator.clipboard.writeText(headerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <section className="w-full text-center space-y-4">
      <h1 className="text-2xl md:text-4xl font-semibold leading-tight whitespace-pre-wrap">
        {campaignHeaderData.title}
      </h1>
      <p className="text-base md:text-lg text-zinc-300">{campaignHeaderData.subtitle}</p>
      <div className="mx-auto max-w-3xl text-sm md:text-base text-zinc-200 whitespace-pre-wrap">
        <p>
          <strong>Goal:</strong> {campaignHeaderData.goal}
        </p>
        <p>
          <strong>Target:</strong> {campaignHeaderData.target}
        </p>
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onCopy}
          className="rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-sm"
        >
          {copied ? 'Copied' : 'Copy summary'}
        </button>
      </div>
    </section>
  );
}


