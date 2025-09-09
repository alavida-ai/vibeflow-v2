import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Framework {
  id: string;
  title: string;
  description: string;
  structure: string;
  prompt: string;
  metrics: {
    avgViews: number;
    avgLikes: number;
    successRate: number;
  };
}

interface FrameworkCardProps {
  framework: Framework;
}

export const FrameworkCard = ({ framework }: FrameworkCardProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(framework.prompt);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Framework prompt copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="border-b border-border pb-6 mb-6 last:border-b-0">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">{framework.title}</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              {framework.description}
            </p>
          </div>
          <div className="ml-4 text-right">
            <p className="text-sm font-medium text-accent">{framework.metrics.successRate}%</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-medium">{formatNumber(framework.metrics.avgViews)}</span>
            <span className="text-muted-foreground ml-1">views</span>
          </div>
          <div>
            <span className="font-medium">{formatNumber(framework.metrics.avgLikes)}</span>
            <span className="text-muted-foreground ml-1">likes</span>
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded border text-xs font-mono text-muted-foreground">
          {framework.structure}
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          disabled={copied}
        >
          {copied ? (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Copied
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Copy className="w-3 h-3" />
              Copy Prompt
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};