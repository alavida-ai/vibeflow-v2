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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const BuildInOpen = () => {
  const activityData = generateActivityData();

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
              light: ['var(--activity-calendar-low-activity)', 'var(--activity-calendar-high-activity)'],
              dark: ['var(--activity-calendar-low-activity)', 'var(--activity-calendar-high-activity)'],
            }}
            showWeekdayLabels={true}
            blockSize={13}
            blockMargin={4}
            fontSize={13}
            renderBlock={(block, activity) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  {block}
                </TooltipTrigger>
                 <TooltipContent className="p-3 max-w-xs">
                   <div className="space-y-2">
                     <p className="font-semibold text-sm">{new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                     <p className="text-xs text-muted-foreground">{activity.count} marketing activities</p>
                     
                     {activity.count > 0 && (
                       <div className="space-y-1 pt-2 border-t">
                         <div className="flex items-center justify-between text-xs">
                           <span className="flex items-center gap-1">
                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                             Tweets
                           </span>
                           <span className="text-muted-foreground">{Math.floor(Math.random() * 3) + 1}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs">
                           <span className="flex items-center gap-1">
                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             Blog Posts
                           </span>
                           <span className="text-muted-foreground">{Math.floor(Math.random() * 2)}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs">
                           <span className="flex items-center gap-1">
                             <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                             SEO Updates
                           </span>
                           <span className="text-muted-foreground">{Math.floor(Math.random() * 2)}</span>
                         </div>
                         
                         <div className="pt-2 border-t space-y-1">
                           <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Views:</span>
                             <span className="font-medium">{(Math.random() * 10000).toFixed(0)}</span>
                           </div>
                           <div className="flex justify-between text-xs">
                             <span className="text-muted-foreground">Engagements:</span>
                             <span className="font-medium">{(Math.random() * 500).toFixed(0)}</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 </TooltipContent>
              </Tooltip>
            )}
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