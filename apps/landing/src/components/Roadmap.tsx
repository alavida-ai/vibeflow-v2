'use client';

import { ClockFading, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaDiscord, FaGithub } from 'react-icons/fa6';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EXTERNAL_LINKS } from '@/constants/external-links';
import { cn } from '@/lib/utils';

type Status = 'All' | 'In Progress' | 'Planned' | 'Shipped';

const statuses: Status[] = ['All', 'In Progress', 'Planned', 'Shipped'];

type RoadmapItem = {
  status: Exclude<Status, 'All'>;
  title: string;
  description: string;
  date: string;
  team: {
    name: string;
    image: string;
  };
};

const roadmapItems: RoadmapItem[] = [
  {
    status: 'In Progress',
    title: 'Live preview editing',
    description:
      'Let content editors preview their changes in real-time within the CMS editor.',
    date: 'Beta by May 2025',
    team: {
      name: 'Core Team',
      image: '/layout/logo-icon.svg',
    },
  },
  {
    status: 'In Progress',
    title: 'SvelteKit plugin',
    description: 'First-class Scalar support for SvelteKit via a plugin.',
    date: 'Q2 2025',
    team: {
      name: 'Core Team',
      image: '/layout/logo-icon.svg',
    },
  },
  {
    status: 'Planned',
    title: 'API tokens with granular scopes',
    description:
      'Create multiple tokens with read/write/scope-level permissions for teams and external services.',
    date: 'Q3 2025',
    team: {
      name: 'Yassine Zaanouni',
      image: '/images/blog/authors/yassine-zaanouni.webp',
    },
  },
  {
    status: 'Planned',
    title: 'Image editor field type',
    description:
      'Add support for cropping, aspect ratios, alt-text, and focal point control in media uploads.',
    date: 'Q3 2025',
    team: {
      name: 'Fedir Davydov',
      image: '/images/blog/authors/fedir-davydov.webp',
    },
  },
  {
    status: 'Shipped',
    title: 'Code-first schema sync',
    description:
      'Use TypeScript or JSON schema files to define content structure, sync to the UI automatically.',
    date: 'April 2025',
    team: {
      name: 'Rob Austin',
      image: '/images/blog/authors/robert-austin.webp',
    },
  },
  {
    status: 'Shipped',
    title: 'GitHub integration (beta)',
    description:
      'Push/pull content and schema changes via GitHub. Ideal for content versioning and CI workflows.',
    date: 'March 2025',
    team: {
      name: 'Core Team',
      image: '/layout/logo-icon.svg',
    },
  },
  {
    status: 'Shipped',
    title: 'Full-text search API',
    description:
      'A robust, built-in full-text search endpoint for your content — supports filters, relevance scoring, and language-aware stemming.',
    date: 'February 2025',
    team: {
      name: 'Rob Austin',
      image: '/images/blog/authors/robert-austin.webp',
    },
  },
  {
    status: 'Shipped',
    title: 'Custom field components',
    description:
      'Support for embedding custom React/Vue/Svelte components as field editors — perfect for things like color pickers, map selectors, or signature pads.',
    date: 'January 2025',
    team: {
      name: 'Core Team',
      image: '/layout/logo-icon.svg',
    },
  },
];

export function RoadmapSection() {
  const [activeStatus, setActiveStatus] = useState<Status>('All');

  // Filter items based on active status
  const filteredItems =
    activeStatus === 'All'
      ? roadmapItems
      : roadmapItems.filter((item) => item.status === activeStatus);

  return (
    <section className="container">
      <div className="border-x">
        <div className="hidden p-7.5 md:block" />

        <div className="bordered-div-padding border-b">
          <h1 className="font-weight-display text-2xl leading-snug tracking-tighter md:text-3xl lg:text-5xl">
            Roadmap
          </h1>
          <div className="mt-6 block md:hidden">
            <Select
              value={activeStatus}
              onValueChange={(value) => setActiveStatus(value as Status)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>{activeStatus}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bordered-div-padding hidden border-b md:block">
          <Tabs
            value={activeStatus}
            onValueChange={(value) => setActiveStatus(value as Status)}
          >
            <TabsList className="flex gap-3">
              {statuses.map((status) => (
                <TabsTrigger key={status} value={status}>
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {filteredItems.map((item, index) => {
            // Determine if this is in the last row
            const isLastRow =
              index >=
              filteredItems.length - (filteredItems.length % 2 === 0 ? 2 : 1);
            // Is it the last item?
            const isLastItem = index === filteredItems.length - 1;
            // Is it odd and in an odd position? (left column)
            const isLeftColumn = index % 2 === 0;
            // Is it the last item in an odd-length list?
            const isLastSingleItem =
              isLastItem && filteredItems.length % 2 !== 0;

            return (
              <Item
                key={index}
                item={item}
                className={cn({
                  // No bottom border for last row items
                  'border-b-0': isLastRow,
                  // No right border for items in the right column
                  'md:border-r-0': !isLeftColumn,
                  // Full width and no borders for last item in odd-length list
                  'md:col-span-2': isLastSingleItem,
                  // Add right border only to left column items
                  'md:border-r': isLeftColumn && !isLastSingleItem,
                })}
              />
            );
          })}
        </div>

        <div className="bordered-div-padding space-y-6 border-t">
          <h3 className="font-weight-display leading-snug tracking-tighter md:text-xl">
            Community engagement
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            We build in public. Want to request something or upvote a feature?
            Join the conversation on:
          </p>
          <div className="flex gap-3 md:gap-6">
            <Link href="https://github.com/orgs/vibe-flow/discussions" className="">
              <Button size="sm" variant="default" className="">
                <FaGithub className="size-5" />
                Github Discussions
              </Button>
            </Link>
            <Link href={EXTERNAL_LINKS.DISCORD} className="">
              <Button size="sm" variant="outline" className="">
                <FaDiscord className="size-5" />
                Discord
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ item, className }: { item: RoadmapItem; className?: string }) {
  const statusColors: Record<RoadmapItem['status'], string> = {
    'In Progress': 'bg-chart-1/10',
    Planned: 'bg-chart-2/10 ',
    Shipped: 'bg-chart-3/10',
  };

  return (
    <div
      className={cn(
        'bordered-div-padding hover:bg-muted/30 group dark:hover:bg-muted border-b',
        className,
      )}
    >
      <div className="">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="default"
            className={cn(
              'text-foreground w-26.75',
              statusColors[item.status],
            )}
          >
            {item.status}
          </Badge>
          <div className="text-muted-foreground flex items-center gap-3">
            {item.status === 'Shipped' ? (
              <Package className="size-5" />
            ) : (
              <ClockFading className="size-5" />
            )}
            <span className="text-sm font-medium">{item.date}</span>
          </div>
        </div>
        <h2 className="font-weight-display mt-4 leading-snug tracking-tighter md:text-xl">
          {item.title}
        </h2>
        <p className="text-muted-foreground mt-6 text-sm leading-relaxed md:text-base">
          {item.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between md:mt-8 lg:mt-10">
        {item.team && (
          <div className="flex items-center gap-2">
            <Image
              src={item.team.image}
              alt={item.team.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-muted-foreground text-sm font-medium">
              {item.team.name}
            </span>
          </div>
        )}
        <Link href={EXTERNAL_LINKS.GITHUB}>
          <FaGithub className="size-5" />
        </Link>
      </div>
    </div>
  );
}