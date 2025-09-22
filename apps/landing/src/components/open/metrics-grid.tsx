import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Eye, Star } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, isPositive, icon }: MetricCardProps) => (
  <Card className="p-6 bg-card border-border hover:border-accent transition-colors duration-200">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{title}</p>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-light text-foreground">{value}</p>
        <p className={`text-sm ${isPositive ? "text-accent-green" : "text-muted-foreground"}`}>
          {change}
        </p>
      </div>
    </div>
  </Card>
);

export const MetricsGrid = ({ metrics }: { metrics: MetricCardProps[] }) => {

  return (
    <div className="flex flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {metrics?.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};