import { FrameworkCard } from "./FrameworkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Framework } from "@/types/twitter-analyzer";

interface FrameworksListProps {
  frameworks: Framework[];
  isLoading: boolean;
}

export const FrameworksList = ({ frameworks, isLoading }: FrameworksListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-border pb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (frameworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-light">
          No frameworks to display
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {frameworks.map((framework) => (
        <FrameworkCard key={framework.id} framework={framework} />
      ))}
    </div>
  );
};