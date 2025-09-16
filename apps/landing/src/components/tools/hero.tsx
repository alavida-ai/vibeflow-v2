import { ExternalLink, CheckCircle, Clock } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";

interface Tool {
  name: string;
  description: string;
  content: string;
  categories: string[];
  status: 'available' | 'coming-soon';
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

const Hero12 = () => {
  const tools: Tool[] = [
    {
      name: "X Scraper",
      description: "Gain a strategic advantage on X",
      content: "Scrape tweets from Twitter and save them to your database. Use the analytics Agent to perform analysis, and use through your MCP.",
      categories: ["Strategy", "Social Media", "Analytics"],
      status: "available",
      image: {
        src: "/annotated-profile.png",
        alt: "Twitter Scraper Tool Preview",
        width: 300,
        height: 300
      }
    },
    {
      name: "Content Optimizer",
      description: "AI-powered content enhancement",
      content: "Automatically optimize your content for maximum engagement across platforms. Analyze performance metrics and suggest improvements.",
      categories: ["Content", "AI", "Optimization"],
      status: "coming-soon"
    },
    {
      name: "Audience Insights",
      description: "Deep audience understanding",
      content: "Get detailed insights into your audience behavior, preferences, and engagement patterns. Make data-driven decisions.",
      categories: ["Analytics", "Strategy", "Insights"],
      status: "available"
    }
  ];

  return (
    <section className="container">
        <div className="border-x">
      <div className="hidden p-7.5 md:block" />
      {/* <div className="absolute inset-x-0 top-0 flex h-full w-full items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/patterns/square-alt-grid.svg"
          className="[mask-image:radial-gradient(75%_75%_at_center,white,transparent)] opacity-90"
        />
      </div> */}
      <div className="bordered-div-padding border-b">
      
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div>
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl">
                Scale faster with built-in{" "}
                <span className="text-primary">Tools</span>
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
              Optimised tools to integrate with your media infrastructure. Usage based pricing. No monthly fees.
              </p>
            </div>
          </div>
        </div>
        </div>
        <div className="container">
            <div className="flex flex-1 flex-col gap-4">
               {tools.map((tool, index) => (
                 <ToolDisplay key={index} tool={tool} />
               ))}
            </div>
        </div>

</div>
    </section>
  );
};

export const ToolDisplay = ({ tool }: { tool: Tool }) => {
    const StatusIcon = tool.status === 'available' ? CheckCircle : Clock;
    const statusText = tool.status === 'available' ? 'Available' : 'Coming Soon';

    return (
        <div className="bordered-div-padding border-b">
            <div className="flex justify-between">
                <div className="flex items-end justify-start gap-2 pb-4">
                    <h2 className="text-3xl font-bold">{tool.name}</h2>
                    <span className="text-muted-foreground">{tool.description}</span>
                </div>
                <div className="flex gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-muted-foreground/10 border border-muted-foreground/20 text-primary px-3 py-1.5 text-sm font-medium">
                        <span>{statusText}</span>
                    </div>
                </div>
            </div>
            <div className="flex border-t border-dashed my-8"/>
                    
            {/* Grid layout: content on left, image on right for larger screens; stacked for smaller screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content section */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 flex-wrap">
                            {tool.categories.map((category, index) => (
                                <div key={index} className="rounded-full bg-primary/10 text-primary px-2 py-1">
                                    <span>{category}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-muted-foreground">{tool.content}</p>
                        </div>
                    </div>
                </div>
                
                {/* Image section */}
                {tool.image && (
                    <div className="lg:col-span-1 order-1 lg:order-2 flex items-start justify-center">
                        <div className="w-full max-w-sm">
                            <Image
                                src={tool.image.src}
                                alt={tool.image.alt}
                                className="w-full h-auto rounded-lg border border-border shadow-sm"
                                width={tool.image.width || 300}
                                height={tool.image.height || 300}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export { Hero12 };
