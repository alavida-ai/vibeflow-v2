import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Blocks, ChartPie, ChevronRight, Layout, Target } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const features = [
  {
    id: 1,
    header: "Task Coordination",
    excerpt:
      "Easily manage and organize tasks to improve your workflow efficiency.",
    icon: <Target className="h-auto w-5" />,
    title: "Master Task Coordination",
    description:
      "Learn to easily manage and organize tasks to improve workflow efficiency. Explore how this simplifies task coordination for better results.",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
  },
  {
    id: 2,
    header: "Team Collaboration",
    excerpt:
      "Boost teamwork with intuitive communication and collaboration tools.",
    icon: <Layout className="h-auto w-5" />,
    title: "Effective Team Collaboration",
    description:
      "Improve team collaboration and communication with intuitive tools. Learn how to streamline teamwork and achieve project success with ease.",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
  },
  {
    id: 3,
    header: "Resource Management",
    excerpt:
      "Maximize resource use for greater efficiency and project success.",
    icon: <Blocks className="h-auto w-5" />,
    title: "Efficient Resource Management",
    description:
      "Maximize resource management and efficiency. Discover how to effectively utilize resources for greater productivity and project outcomes.",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
  },
  {
    id: 4,
    header: "System Integration",
    excerpt:
      "Integrate your tools seamlessly for a smoother, more efficient workflow.",
    icon: <ChartPie className="h-auto w-5" />,
    title: "Streamlined System Integration",
    description:
      "Integrate systems and tools seamlessly for smoother workflows. Learn how to improve interoperability for more efficient processes.",
    image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
  },
];

const Features = () => {
  return (
    <section className="py-32">
      <div className="flex flex-row gap-4 items-end justify-center">
        <h2 className="text-4xl font-bold text-center mb-12">Why Vibeflow?</h2>
        <p className="text-lg text-center text-muted-foreground mb-12">Everything you need for your media infrastructure</p>
      </div>
      <div className="container">
        <Accordion
          type="multiple"
          className="flex flex-col gap-px overflow-hidden rounded-xl border bg-border lg:hidden"
        >
          {features.map((feature) => (
            <AccordionItem
              key={feature.id}
              value={feature.id.toString()}
              className="border-b-0 bg-muted px-7 py-4 data-[state=open]:bg-background"
            >
              <AccordionTrigger className="group relative items-start text-left hover:no-underline data-[state=active]:bg-background">
                <span className="absolute -top-4 bottom-0 -left-7 h-full w-[3px] bg-primary transition-opacity duration-300 group-data-[state=closed]:opacity-0"></span>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5">
                    {feature.icon}
                    <span className="text-sm font-medium">
                      {feature.header}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {feature.excerpt}
                  </p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-7 rounded-xl border bg-muted/50 p-5 data-[state=inactive]:hidden">
                <div>
                  <h2 className="mb-2 font-medium">{feature.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <img
                  src={feature.image}
                  alt="placeholder"
                  className="aspect-video max-h-[450px] rounded-xl border object-cover"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Tabs
          defaultValue="1"
          className="hidden grid-cols-3 gap-px overflow-hidden rounded-xl border bg-border lg:grid"
        >
          <TabsList className="flex flex-col gap-px bg-border">
            {features.map((feature) => (
              <TabsTrigger
                key={feature.id}
                value={feature.id.toString()}
                className="group relative flex flex-col gap-2.5 bg-muted px-6 py-9 transition-colors duration-300 data-[state=active]:bg-background xl:py-10"
              >
                <span className="absolute top-0 bottom-0 left-0 h-full w-[3px] bg-primary transition-opacity duration-300 group-data-[state=inactive]:opacity-0"></span>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {feature.icon}
                    <span className="font-medium">{feature.header}</span>
                  </div>
                  <ChevronRight className="h-auto w-4" />
                </div>
                <p className="text-left text-muted-foreground">
                  {feature.excerpt}
                </p>
              </TabsTrigger>
            ))}
          </TabsList>
          {features.map((feature) => (
            <TabsContent
              value={feature.id.toString()}
              key={feature.id}
              className="col-span-2 flex flex-col gap-7 bg-background p-10 data-[state=inactive]:hidden"
            >
              <div>
                <h2 className="mb-2 text-2xl font-medium">{feature.title}</h2>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <img
                src={feature.image}
                alt="placeholder"
                className="aspect-video max-h-[450px] rounded-xl object-cover"
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export { Features };
