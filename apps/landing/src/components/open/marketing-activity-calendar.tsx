"use client"

import React from 'react';
import ActivityCalendar from 'react-activity-calendar';
import { cn } from '@/lib/utils';
import { generateActivityData } from '@/lib/openData';

interface MarketingActivityCalendarProps {
  className?: string;
}

export function MarketingActivityCalendar({ className }: MarketingActivityCalendarProps) {
  const activityData = generateActivityData();

  return (
    <div className={cn("w-full", className)}>
      <ActivityCalendar 
        data={activityData}
        theme={{
            light: ['hsl(0, 0%, 92%)', 'firebrick'],
            dark: ['#333', 'rgb(214, 16, 174)'],
          }}
        showWeekdayLabels={true}
        blockSize={12}
        blockMargin={2}
        fontSize={12}
      />
    </div>
  );
}
