"use client"

import React from 'react';
import ActivityCalendar from 'react-activity-calendar';
import { cn } from '@/lib/utils';
import { generateActivityData } from '@/lib/openData';

interface MarketingActivityCalendarProps {
  className?: string;
  lowActivityColor?: string;
  highActivityColor?: string;
}

export function MarketingActivityCalendar({ 
  className,
  lowActivityColor = 'var(--muted)',
  highActivityColor = 'var(--chart-1)'
}: MarketingActivityCalendarProps) {
  const activityData = generateActivityData();

  return (
    <div className={cn("w-full", className)}>
      <ActivityCalendar 
        data={activityData}
        theme={{
          light: [lowActivityColor, highActivityColor],
          dark: [lowActivityColor, highActivityColor],
        }}
        showWeekdayLabels={true}
        blockSize={12}
        blockMargin={2}
        fontSize={12}
      />
    </div>
  );
}
