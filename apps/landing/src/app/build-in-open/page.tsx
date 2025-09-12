"use client"

import { MetricsGrid } from '@/components/open/metrics-grid';
import { MarketingActivityCalendar } from '@/components/open/marketing-activity-calendar';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { Eye, Star, Users } from 'lucide-react';
import React from 'react';
import { StrategyTabs } from '@/components/open/strategy-tabs';
import ActivityCalendar from 'react-activity-calendar';
import { generateActivityData } from '@/lib/openData';
import { useMediaQuery } from '@/hooks/use-media-query';

const BuildInOpen = () => {
  const activityData = generateActivityData();
  const { isAtLeast } = useMediaQuery();  

  const metrics = [
    {
      title: "X Followers",
      value: "12.4K",
      change: "+2.1%",
      isPositive: true,
      icon: <Users size={16} className="text-muted-foreground" /> 
    },
    {
      title: "Landing Page Visits",
      value: "45.2K",
      change: "+15.3%",
      isPositive: true,
      icon: <Eye size={16} className="text-muted-foreground" />
    },
    {
      title: "GitHub Stars",
      value: "1.8K",
      change: "+8.7%",
      isPositive: true,
      icon: <Star size={16} className="text-muted-foreground" />
    },
  ];
  return (
    <section className="container">
    <div className="border-x">
      <div className="p-4 sm:p-6 md:p-7.5" />

      <div className="bordered-div-padding border-b">
        <h1 className="font-weight-display text-2xl leading-snug tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
          Build in Open
        </h1>
        <p className="text-muted-foreground leading-relaxed text-sm sm:text-base max-w-4xl">
          We strongly believe in having the most aggressive and transparent build in public strategy. We will constantly be testing new ways to engage the community with our initiatives.
          This page will be updated with the latest metrics and progress of our initiatives, as well as our thoughts on which marketing strategies are working and which are not.
        </p>
      </div>

      <div className="bordered-div-padding border-b">
        <div className="flex flex-col sm:flex-row sm:items-end justify-start gap-2 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold">Metrics</h2>
          <span className="text-muted-foreground text-sm sm:text-base">Metrics of our initiatives</span>
        </div>
        <div className="flex flex-grow justify-center p-4 sm:p-8 w-full">
          <MetricsGrid metrics={metrics} />
        </div>
      </div>
      <div className="bordered-div-padding border-b">
        <div className="flex flex-col sm:flex-row sm:items-end justify-start gap-2 pb-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Marketing Activity Overview</h2>
          <span className="text-muted-foreground text-sm sm:text-base">Activity tracker of our initiatives</span>
        </div>
        <div className="flex flex-grow justify-center p-4 sm:p-8 w-full overflow-x-auto">
          <ActivityCalendar 
            data={activityData}
            theme={{
              light: ['hsl(0, 0%, 92%)', 'firebrick'],
              dark: ['#333', 'rgb(214, 16, 174)'],
            }}
            showWeekdayLabels={isAtLeast('sm')}
            blockSize={isAtLeast('sm') ? 13 : 10}
            blockMargin={isAtLeast('sm') ? 4 : 2}
            fontSize={isAtLeast('sm') ? 13 : 11}
          />
        </div>
      </div>

      <div className="bordered-div-padding border-b">
        <div className="flex flex-col sm:flex-row sm:items-end justify-start gap-2 pb-4">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Marketing Strategy</h2>
          <span className="text-muted-foreground text-sm sm:text-base">Strategy of our marketing initiatives</span>
        </div>
        <div className="flex flex-grow justify-center p-4 sm:p-8">
          <Image 
            className="w-full h-auto rounded-lg border border-border shadow-sm max-w-4xl" 
            src="/marketing-strategy.png" 
            alt="Marketing Strategy" 
            width={1000} 
            height={1000} 
            priority
          />
        </div>
        <div className="flex border-t border-dashed my-4 sm:my-8"/>
        <div className="flex flex-grow justify-center">
          <StrategyTabs />
        </div>
      </div>
    </div>
  </section>
  );
};

export default BuildInOpen;